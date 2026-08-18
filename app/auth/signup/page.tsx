// app/auth/signup/page.tsx
"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Mail, Lock, CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaArrowRight } from "react-icons/fa";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // قواعد التحقق من كلمة المرور
  const isMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z\u0621-\u064A]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = isMinLength && hasLetter && hasNumber;

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/auth/profile");
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const translateError = (errMessage: string): string => {
    const msg = errMessage.toLowerCase();
    if (msg.includes("password should be at least")) {
      return "كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.";
    }
    if (msg.includes("user already registered") || msg.includes("already registered")) {
      return "هذا البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول بدلاً من ذلك.";
    }
    if (msg.includes("invalid email") || msg.includes("email address is invalid")) {
      return "صيغة البريد الإلكتروني غير صحيحة.";
    }
    if (msg.includes("signup rate limit")) {
      return "تم إرسال طلبات كثيرة، يرجى المحاولة بعد قليل.";
    }
    return errMessage || "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.";
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isMinLength) {
      setError("كلمة المرور قصيرة جداً (يجب أن تكون 6 خانات على الأقل)");
      return;
    }
    if (!hasLetter) {
      setError("كلمة المرور يجب أن تحتوي على حروف");
      return;
    }
    if (!hasNumber) {
      setError("كلمة المرور يجب أن تحتوي على أرقام");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });

      if (signUpError) throw signUpError;
      if (data.user) {
        if (data.session === null) {
          alert("تم إنشاء الحساب بنجاح! افحص بريدك الإلكتروني لتفعيل الحساب.");
        }
      }
    } catch (err: any) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-800 flex flex-col items-center" dir="rtl">
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-0.5 px-0.5 mt-1 pt-5">
        <Card className="shadow-xl border-amber-900/10 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-stone-100 dark:border-zinc-800 pb-0.5">
            <CardTitle className="text-center text-amber-900 flex-row dark:text-amber-500 font-bold text-lg">
              <div className="flex flex-row justify-between">
                <Link href="/" prefetch={true} className="p-0.5 m-0.5 flex flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline" title="الرجوع للصفحة الرئيسية">
                  <FaArrowRight size={18} />
                </Link>
                <p className="flex flex-11 items-center align-center">إنشاء حساب جديد</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5 p-0.5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-1 rounded-xl text-xs sm:text-sm border border-red-200 dark:border-red-900/50 flex items-start gap-0.25">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-0.5">
              <div className="space-y-0.5">
                <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input
                    type="text"
                    placeholder="مثال: يوسف ماهر"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="ps-3 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="ps-3 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ps-3 pl-1 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
                  </button>
                </div>

                {/* مؤشرات شروط كلمة المرور */}
                {password.length > 0 && (
                  <div className="bg-stone-50 dark:bg-zinc-800/60 p-0.5 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 space-y-0.5 text-xs mt-0.5">
                    <p className="font-semibold text-stone-600 dark:text-zinc-400 mb-0.5">متطلبات كلمة المرور:</p>
                    <div className="flex items-center gap-0.5">
                      {isMinLength ? (
                        <CheckCircle2 className="w-1.5 h-1.5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 text-stone-400 shrink-0" />
                      )}
                      <span className={isMinLength ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                        6 خانات على الأقل
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {hasLetter ? (
                        <CheckCircle2 className="w-1.5 h-1.5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 text-stone-400 shrink-0" />
                      )}
                      <span className={hasLetter ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                        تحتوي على حروف
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {hasNumber ? (
                        <CheckCircle2 className="w-1.5 h-1.5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="w-1.5 h-1.5 text-stone-400 shrink-0" />
                      )}
                      <span className={hasNumber ? "text-green-700 dark:text-green-400 font-medium" : "text-stone-500 dark:text-zinc-400"}>
                        تحتوي على أرقام
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading || (password.length > 0 && !isPasswordValid)}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold py-0.5 h-2 text-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              </Button>
            </form>

            <p className="text-center text-lg sm:text-lg text-stone-600 dark:text-zinc-400 font-medium pt-1 border-t border-stone-100 dark:border-zinc-800">
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/signin" className="text-amber-700 dark:text-amber-500 hover:underline font-bold">
                سجل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
