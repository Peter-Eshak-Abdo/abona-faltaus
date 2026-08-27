// components/AccountInfo.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { Copy, LogOut, X, Loader2, Camera, UserCircle, Calendar, Hash, ArrowRight, KeyRound, CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  updated_at: string;
}

export default function AccountInfo() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In-app password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z\u0621-\u064A]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = isMinLength && hasLetter && hasNumber;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        router.push("/auth/signin");
      }
    };
    const timeout = setTimeout(checkUser, 500);
    return () => clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setError(sessionError?.message || "لا يوجد جلسة");
        setLoading(false);
        router.push('/auth/signin');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, updated_at')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        setUser({
          id: profile.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          email: session.user.email || '',
          updated_at: profile.updated_at
        });
      }
      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    setError(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser((prevUser) => prevUser ? { ...prevUser, avatar_url: publicUrl } : null);
      setSuccessMsg("تم تحديث الصورة الشخصية بنجاح!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الرفع');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!isPasswordValid) {
      setPasswordError("يرجى التأكد من استيفاء جميع شروط كلمة المرور.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setUpdatingPassword(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message || "فشل تغيير كلمة المرور.");
      } else {
        setSuccessMsg("تم تغيير كلمة المرور بنجاح!");
        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch {
      setPasswordError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  if (loading) return <div className="flex justify-center items-center h-12"><Loader2 className="w-4 h-4 text-amber-700 animate-spin" /></div>;
  if (error && !user) return <div className="p-1 text-center text-red-600 bg-red-50 rounded-xl m-2 text-sm">{error}</div>;
  if (!user) return null;

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg rounded-2xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between px-1 py-0.5 border-b border-stone-100 dark:border-zinc-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
        >
          <ArrowRight className="w-2.5 h-2.5" />
          <span>رجوع</span>
        </button>
        <span className="text-xs font-bold text-stone-400">الملف الشخصي</span>
      </div>

      {successMsg && (
        <div className="mx-0.5 mt-0.5 bg-green-50 border border-green-200 text-green-700 px-0.5 py-0.5 rounded-xl flex justify-between items-center text-xs font-medium">
          <span>{successMsg}</span>
          <X className="w-2.5 h-2.5 cursor-pointer hover:text-green-900" onClick={() => setSuccessMsg("")} />
        </div>
      )}

      <CardContent className="p-1 space-y-0.5">
        <div className="flex flex-col items-center relative">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full p-1 bg-linear-to-tr from-amber-700 to-amber-400 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative flex items-center justify-center">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" sizes="80px" />
                ) : (
                  <UserCircle className="w-16 h-16 text-stone-300" />
                )}
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-stone-900 text-white p-0.5 rounded-full shadow border-2 border-white hover:bg-stone-800 transition-colors disabled:opacity-50"
              title="تغيير الصورة"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          <div className="text-center mt-0.5">
            <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">{user.full_name || "مستخدم أرثوذكسي"}</h2>
            <p className="text-stone-500 dark:text-zinc-400 text-xs font-medium">{user.email}</p>
          </div>
        </div>

        {error && <p className="text-xs text-red-600 text-center bg-red-50 p-0.5 rounded-lg">{error}</p>}

        <div className="bg-stone-50 dark:bg-zinc-800/50 p-1 rounded-xl space-y-0.5 border border-stone-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between text-stone-700 dark:text-zinc-300">
            <div className="flex items-center gap-0.5"><Hash className="w-3.5 h-3.5 text-amber-700" /> <span className="font-semibold">رقم الحساب</span></div>
            <span className="font-mono text-[11px] text-stone-500 dark:text-zinc-400 bg-stone-200/70 dark:bg-zinc-700 px-1 py-0.5 rounded">{user.id.substring(0, 10)}...</span>
          </div>
          <div className="flex items-center justify-between text-stone-700 dark:text-zinc-300">
            <div className="flex items-center gap-0.5"><Calendar className="w-3.5 h-3.5 text-amber-700" /> <span className="font-semibold">تاريخ الانضمام</span></div>
            <span className="text-[11px] font-medium text-stone-600 dark:text-zinc-400">{new Date(user.updated_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Change Password Collapsible Section / Modal Trigger */}
        <div className="pt-1">
          {showPasswordModal ? (
            <form onSubmit={handleChangePassword} className="bg-stone-50 dark:bg-zinc-800/60 p-1 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-0.5">
              <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-zinc-700 pb-1">
                <span className="text-xs font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  تغيير كلمة المرور
                </span>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {passwordError && (
                <p className="text-[11px] text-red-600 bg-red-50 dark:bg-red-950/40 p-0.5 rounded-lg border border-red-200">
                  {passwordError}
                </p>
              )}

              <div className="space-y-0.5">
                <Label className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    type={showPasswordText ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-3 text-xs ps-1 pe-2 bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    tabIndex={-1}
                  >
                    {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="bg-white/80 dark:bg-zinc-900/80 p-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 space-y-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      {isMinLength ? <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" /> : <Circle className="w-3 h-3 text-stone-400 shrink-0" />}
                      <span className={isMinLength ? "text-green-700 font-medium" : "text-stone-500"}>6 خانات على الأقل</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasLetter ? <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" /> : <Circle className="w-3 h-3 text-stone-400 shrink-0" />}
                      <span className={hasLetter ? "text-green-700 font-medium" : "text-stone-500"}>تحتوي على حروف</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasNumber ? <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" /> : <Circle className="w-3 h-3 text-stone-400 shrink-0" />}
                      <span className={hasNumber ? "text-green-700 font-medium" : "text-stone-500"}>تحتوي على أرقام</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-stone-700 dark:text-zinc-300">تأكيد كلمة المرور</Label>
                <Input
                  type={showPasswordText ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-3 text-xs bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700"
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[10px] text-red-500">كلمتا المرور غير متطابقتين</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-0.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-3 text-xs rounded-lg"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={updatingPassword || !isPasswordValid || !passwordsMatch}
                  className="h-3 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold"
                >
                  {updatingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "حفظ التغيير"}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-0.5 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold h-3"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              تغيير كلمة المرور
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-0.5 pt-1">
          <Button
            onClick={() => { navigator.clipboard.writeText(user.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            variant="outline"
            className="flex gap-1 items-center justify-center border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-bold h-3"
          >
            {copied ? <span className="text-green-600">تم النسخ</span> : <><Copy className="w-3.5 h-3.5" /> نسخ المعرف</>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex gap-1 items-center justify-center bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold h-3"
          >
            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
