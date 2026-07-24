// app/auth/signin/page.tsx
"use client";
import { useEffect, useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/auth/profile");
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: false,
      }
    });
  };

  return (
    <div className="min-h-screen  text-stone-800 flex flex-col items-center" dir="rtl">
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-1 px-1 mt-8">
        <Card className="shadow-xl border-amber-900/10 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-stone-200 pb-1">
            <CardTitle className="text-center text-amber-900 font-bold text-lg">
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-1 mt-1">
            {error && (
              <div className="bg-red-50 text-red-700 p-1 rounded-lg text-sm border border-red-200 flex items-center gap-1">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-1">
              <div className="space-y-1">
                <Label className="text-stone-700 font-semibold text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pr-3 bg-stone-50 border-stone-200 focus:border-amber-700 focus:ring-amber-700 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-stone-700 font-semibold text-sm">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-3 bg-stone-50 border-stone-200 focus:border-amber-700 focus:ring-amber-700 rounded-lg"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200"></span></div>
              <div className="relative flex justify-center text-xs"><span className="px-1 text-stone-500 font-bold">أو</span></div>
            </div>

            <Button variant="outline" onClick={handleGoogleSignIn} className="w-full border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg flex gap-1 items-center justify-center">
              <svg className="w-3 h-3" viewBox="0 -2 28 28"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </Button>

            <p className="text-center text-sm text-stone-600 font-medium">
              ليس لديك حساب؟ <Link href="/auth/signup" className="text-amber-700 hover:text-amber-800 font-bold underline decoration-amber-300 underline-offset-4">أنشئ حساب جديد</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
