// app/auth/login/page.tsx
"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    console.log(`🌐 Redirecting to ${provider} login...`);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error(`❌ ${provider} Login Error:`, error.message);
      alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
  };

  const handleEmailAuth = async (mode: 'login' | 'signup') => {
    setLoading(true);
    const { error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
    } else {
      router.push("/auth/profile");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">تسجيل الدخول</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-1">
            <Button onClick={() => handleEmailAuth('login')} disabled={loading}>دخول</Button>
            <Button variant="outline" onClick={() => handleEmailAuth('signup')} disabled={loading}>حساب جديد</Button>
          </div>

          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-1 text-gray-500">أو عبر</span></div>
          </div>

          <div className="flex flex-col gap-1">
            <Button variant="destructive" onClick={() => handleOAuthLogin('google')} disabled={loading}>
              {loading ? "جاري التحويل..." : "Google"}
            </Button>
            <Button variant="secondary" onClick={() => handleOAuthLogin('github')} disabled={loading}>
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
