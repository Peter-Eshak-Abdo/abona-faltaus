// app/auth/signup/page.tsx
"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User, Mail, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) throw signUpError;
      if (data.user) {
        alert("تم إنشاء الحساب بنجاح! افحص بريدك الإلكتروني إذا تطلب الأمر.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col items-center" dir="rtl">
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-1 px-1 mt-8">
        <Card className="bg-white shadow-xl border-amber-900/10 rounded-2xl overflow-hidden">
          <CardHeader className="bg-stone-100 border-b border-stone-200 pb-1">
            <CardTitle className="text-center text-amber-900 font-bold text-lg">
              إنشاء حساب جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-1 mt-1">
            {error && (
              <div className="bg-red-50 text-red-700 p-1 rounded-lg text-sm border border-red-200 flex items-center gap-1">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-1">
              <div className="space-y-1">
                <Label className="text-stone-700 font-semibold text-sm">الاسم</Label>
                <div className="relative">
                  <User className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="pr-3 bg-stone-50 border-stone-200 focus:border-amber-700 focus:ring-amber-700 rounded-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-stone-700 font-semibold text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pr-3 bg-stone-50 border-stone-200 focus:border-amber-700 focus:ring-amber-700 rounded-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-stone-700 font-semibold text-sm">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-2 h-2" />
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-3 bg-stone-50 border-stone-200 focus:border-amber-700 focus:ring-amber-700 rounded-lg" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold">
                {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
              </Button>
            </form>

            <p className="text-center text-sm text-stone-600 font-medium mt-1">
              لديك حساب؟ <Link href="/auth/signin" className="text-amber-700 hover:text-amber-800 font-bold underline decoration-amber-300 underline-offset-4">سجل الدخول</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
