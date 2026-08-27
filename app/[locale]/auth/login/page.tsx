// app/auth/login/page.tsx
"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/auth/profile");
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { access_type: 'offline', prompt: 'consent' } }
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleEmailAuth = async (mode: 'login' | 'signup') => {
    setLoading(true);
    const { error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else router.push("/auth/profile");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-stone-50 text-stone-800 pt-1" dir="rtl">
      <Card className="w-full max-w-md shadow-xl border-amber-900/10 rounded-2xl overflow-hidden mx-auto my-1 px-1">
        <CardHeader className="bg-stone-100 border-b border-stone-200 pb-1">
          <CardTitle className="text-center text-amber-900 font-bold text-lg">بوابة الدخول</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-1 mt-1">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute right-1 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-2 bg-stone-50 border-stone-200 focus:border-amber-700 rounded-lg" />
            </div>
            <div className="relative">
              <Lock className="absolute right-1 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-2 bg-stone-50 border-stone-200 focus:border-amber-700 rounded-lg" />
            </div>
            <div className="text-left pt-1">
              <Link href="/auth/forgot-password" className="text-xs text-amber-700 hover:underline font-semibold">
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 mt-1">
            <Button onClick={() => handleEmailAuth('login')} disabled={loading} className="bg-amber-700 hover:bg-amber-800 text-white rounded-lg">دخول</Button>
            <Button variant="outline" onClick={() => handleEmailAuth('signup')} disabled={loading} className="border-amber-700 text-amber-800 hover:bg-amber-50 rounded-lg">حساب جديد</Button>
          </div>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200"></span></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-1 text-stone-500 font-medium">أو عبر</span></div>
          </div>

          <div className="flex flex-col gap-1">
            <Button variant="outline" onClick={() => handleOAuthLogin('google')} disabled={loading} className="w-full border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg flex gap-1 items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuthLogin('github')} disabled={loading} className="w-full bg-stone-900 text-white hover:bg-stone-800 rounded-lg flex gap-1 items-center justify-center border-transparent">
              {/* <Github className="w-4 h-4" /> */} GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
