// app/auth/signin/page.tsx
"use client";
import { useEffect, useState } from "react";
import LogoHeader from "@/components/home/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/auth/profile");
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        } else if (msg.includes("email not confirmed")) {
          setError("يرجى تأكيد بريدك الإلكتروني أولاً قبل تسجيل الدخول.");
        } else {
          setError(error.message || "حدث خطأ أثناء تسجيل الدخول");
        }
        setLoading(false);
      } else {
        router.push("/auth/profile");
      }
    } catch {
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
          skipBrowserRedirect: false,
        }
      });
    } catch (err: any) {
      setError("تعذر الاتصال بخدمة Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-800 flex flex-col items-center" dir="rtl">
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-0.25 px-0.5 mt-1 pt-5">
        <Card className="shadow-xl border-amber-900/10 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-stone-100 dark:border-zinc-800 pb-0.5">
            <CardTitle className="text-center flex flex-row text-amber-900 dark:text-amber-500 font-bold text-lg">
              <div className="flex flex-row justify-between">
                <Link href="/" prefetch={true} className="p-0.5 m-0.5 flex flex-1 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline" title="الرجوع للصفحة الرئيسية">
                  <FaArrowRight size={18} />
                </Link>
                <p className="flex flex-11 items-center align-center">تسجيل الدخول</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0.5 p-0.5">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-0.5 rounded-xl text-xs sm:text-sm border border-red-200 dark:border-red-900/50 flex items-start gap-0.25">
                <span className="shrink-0 text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-0.5">
              <div className="space-y-0.25">
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
                <div className="flex items-center justify-between">
                  <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">كلمة المرور</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-amber-700 dark:text-amber-500 hover:underline font-semibold"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
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
                    className="absolute left-1 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-2 h-2" /> : <Eye className="w-2 h-2" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold py-0.25 h-3 text-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-0.25"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>

            <div className="relative my-0.25">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200 dark:border-zinc-800"></span></div>
              <div className="relative flex justify-center text-xs"><span className="px-0.25 bg-white dark:bg-zinc-900 text-stone-500 font-medium">أو</span></div>
            </div>

            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-xl flex gap-0.25 items-center justify-center h-3 text-sm font-semibold transition"
            >
              {googleLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <svg className="w-3 h-3" viewBox="0 -2 28 28">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>متابعة باستخدام Google</span>
            </Button>

            <p className="text-center text-lg sm:text-lg text-stone-600 dark:text-zinc-400 font-medium pt-1 border-t border-stone-100 dark:border-zinc-800">
              ليس لديك حساب؟{" "}
              <Link href="/auth/signup" className="text-amber-700 shadow-xl dark:text-amber-500 hover:underline font-bold">
                أنشئ حساب جديد
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
