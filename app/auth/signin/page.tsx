"use client";
import { useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  // const handleGoogleSignIn = async () => {
  //   await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: { redirectTo: `${window.location.origin}/auth/callback` }
  //   });
  // };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consensus',
        },
      }
    });
  };
  
  return (
    <>
      <LogoHeader />
      <div className="max-w-md mx-auto my-1 px-1">
        <Card className="bg-white shadow-lg">
          <CardHeader><CardTitle className="text-center">تسجيل الدخول</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {error && <div className="bg-red-50 text-red-600 p-1 rounded text-sm border border-red-200">{error}</div>}

            <form onSubmit={handleEmailSignIn} className="space-y-1">
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>كلمة المرور</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول بالبريد الإلكتروني"}
              </Button>
            </form>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-1 text-gray-500">أو</span></div>
            </div>

            <Button variant="outline" onClick={handleGoogleSignIn} className="w-full border-red-600 text-red-600 hover:bg-red-50">
              الدخول باستخدام Google
            </Button>

            <p className="text-center text-sm">ليس لديك حساب؟ <Link href="/auth/signup" className="underline">أنشئ حساب جديد</Link></p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
