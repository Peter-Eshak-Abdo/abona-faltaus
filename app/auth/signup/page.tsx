"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
        console.log("✅ Session captured, redirecting...");
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
      // بنبعت الـ full_name جوه الـ user_metadata
      // الـ Database Trigger هيسحب الاسم من هنا ويحطه في جدول البروفايلات
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name
          }
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        console.log("✅ Auth Success! Database Trigger will handle profile creation.");
        // إذا كان التسجيل يتطلب تأكيد إيميل، يفضل إظهار رسالة للمستخدم
        // أما إذا كان الدخول مباشر، الـ useEffect فوق هيعمل الـ redirect
        alert("تم إنشاء الحساب بنجاح! افحص بريدك الإلكتروني إذا تطلب الأمر.");
      }
    } catch (err: any) {
      console.error("💥 Error:", err.message);
      setError(err.message || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LogoHeader />
      <div className="max-w-md mx-auto my-1 p-1">
        <h2 className="text-2xl font-bold mb-1 text-center">إنشاء حساب جديد</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 p-1 rounded mb-1 text-sm">{error}</div>}

        <form onSubmit={handleSignUp} className="bg-white p-1 rounded-lg shadow-md space-y-1">
          <div>
            <label className="block text-sm font-medium text-gray-700">الاسم</label>
            <input type="text" className="w-full p-1 border rounded-md" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input type="email" className="w-full p-1 border rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
            <input type="password" className="w-full p-1 border rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-1 rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
          <p className="text-center text-sm">لديك حساب؟ <Link href="/auth/signin" className="underline">سجل الدخول</Link></p>
        </form>
      </div>
    </>
  );
}
