// app/[locale]/auth/reset-password/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import LogoHeader from "@/components/home/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { isRtlLocale } from "@/i18n/routing";

export default function ResetPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password requirements
  const isMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z\u0621-\u064A]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isMinLength && hasLetter && hasNumber;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  useEffect(() => {
    let mounted = true;

    const checkCurrentAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            setSessionActive(true);
          }
          setCheckingSession(false);
        }
      } catch {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (mounted) {
          setSessionActive(true);
          setCheckingSession(false);
        }
      }
    });

    checkCurrentAuth();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("يرجى التأكد من استيفاء جميع شروط كلمة المرور.");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "حدث خطأ أثناء تحديث كلمة المرور.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/profile");
        }, 2500);
      }
    } catch {
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen text-stone-800 dark:text-zinc-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
        <p className="mt-2 text-sm text-stone-500">جاري التحقق من الرابط...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-800 dark:text-zinc-100 flex flex-col items-center" dir={isRtl ? "rtl" : "ltr"}>
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-0.25 px-0.5 mt-1 pt-5">
        <Card className="shadow-xl border-amber-900/10 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-stone-100 dark:border-zinc-800 pb-0.5">
            <CardTitle className="text-center text-amber-900 dark:text-amber-500 font-bold text-lg">
              تعيين كلمة مرور جديدة
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {success ? (
              <div className="space-y-4 text-center py-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">تم تغيير كلمة المرور بنجاح!</h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400">
                    تم تحديث كلمة المرور الخاصة بحسابك، جاري نقلك لملفك الشخصي...
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/auth/profile")}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold"
                >
                  الانتقال للحساب الآن
                </Button>
              </div>
            ) : !sessionActive ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">رابط غير صالح أو منتهي الصلاحية</h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400">
                    يبدو أن جلسة إعادة تعيين كلمة المرور غير نشطة أو انتهت صلاحية الرابط المستخدم. يرجى طلب رابط جديد.
                  </p>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="w-full block bg-amber-700 hover:bg-amber-800 text-white text-center py-2 rounded-xl text-xs font-bold transition"
                >
                  طلب رابط استعادة جديد
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-xs text-stone-500 hover:underline block"
                >
                  الرجوع لتسجيل الدخول
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-600 dark:text-zinc-400 text-center leading-relaxed">
                  أدخل كلمة المرور الجديدة لحسابك وتأكد من مطابقتها لكافة معايير الأمان.
                </p>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-2.5 rounded-xl text-xs border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="ps-9 pl-9 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* متطلبات كلمة المرور */}
                    {password.length > 0 && (
                      <div className="bg-stone-50 dark:bg-zinc-800/60 p-2 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 space-y-1 text-xs mt-1">
                        <p className="font-semibold text-stone-600 dark:text-zinc-400 text-[11px]">متطلبات كلمة المرور:</p>
                        <div className="flex items-center gap-1.5">
                          {isMinLength ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className={isMinLength ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                            6 خانات على الأقل
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasLetter ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className={hasLetter ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                            تحتوي على حروف
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {hasNumber ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className={hasNumber ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                            تحتوي على أرقام
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="ps-9 pl-9 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-[11px] text-red-500">كلمتا المرور غير متطابقتين</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold py-2 h-10 text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={loading || !isPasswordValid || !passwordsMatch}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
