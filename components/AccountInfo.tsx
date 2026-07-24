// components/AccountInfo.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { Copy, LogOut, X, Loader2, Camera, UserCircle, Calendar, Hash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!user || error) {
        router.push("/auth/signin");
      }
    };
    const timeout = setTimeout(checkUser, 500);
    return () => clearTimeout(timeout);
  }, [router, supabase.auth]);

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
  }, [supabase, router]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/signin");
  };

  if (loading) return <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 text-amber-700 animate-spin" /></div>;
  if (error && !user) return <div className="p-1 text-center text-red-600 bg-red-50 rounded-lg m-1">{error}</div>;
  if (!user) return null;

  return (
    <Card className="max-w-md mx-auto p-1 shadow-xl rounded-2xl border-amber-900/10 overflow-hidden mt-6" dir="rtl">
      {successMsg && (
        <div className="mb-1 bg-green-50 border border-green-200 text-green-700 p-1 rounded-lg flex justify-between items-center text-sm font-medium">
          <span>{successMsg}</span>
          <X className="w-4 h-4 cursor-pointer hover:text-green-900" onClick={() => setSuccessMsg("")} />
        </div>
      )}

      <CardContent className="p-1 space-y-1">
        <div className="flex flex-col items-center relative">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-linear-to-tr from-amber-700 to-amber-300 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-white relative flex items-center justify-center">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" sizes="auto" />
                ) : (
                  <UserCircle className="w-12 h-12 text-stone-300" />
                )}
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-stone-900 text-white p-1 rounded-full shadow-lg border-2 border-white hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          <div className="text-center mt-1">
            <h2 className="text-xl font-bold text-stone-900">{user.full_name || "مستخدم أرثوذكسي"}</h2>
            <p className="text-stone-500 text-sm font-medium">{user.email}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-1 rounded-md">{error}</p>}

        <div className="bg-stone-50 p-1 rounded-xl space-y-1 mt-1 border border-stone-100">
          <div className="flex items-center justify-between text-sm text-stone-700">
            <div className="flex items-center gap-1"><Hash className="w-4 h-4 text-amber-700" /> <span className="font-semibold">رقم الحساب</span></div>
            <span className="font-mono text-xs text-stone-500 bg-stone-200 p-1 rounded">{user.id.substring(0, 12)}...</span>
          </div>
          <div className="flex items-center justify-between text-sm text-stone-700">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-amber-700" /> <span className="font-semibold">تاريخ الانضمام</span></div>
            <span className="text-xs font-medium text-stone-600">{new Date(user.updated_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 mt-1">
          <Button
            onClick={() => { navigator.clipboard.writeText(user.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            variant="outline"
            className="flex gap-1 items-center justify-center border-stone-200 text-stone-700 hover:bg-stone-100 rounded-lg text-sm font-bold"
          >
            {copied ? <span className="text-green-600">تم النسخ</span> : <><Copy className="w-4 h-4" /> نسخ المعرف</>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex gap-1 items-center justify-center bg-red-700 hover:bg-red-800 text-white rounded-lg text-sm font-bold"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
