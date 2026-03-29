"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
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

  // const debugSupabase = async () => {
  //   console.log("🔍 Testing Supabase Connection...");
  //   console.log("🔗 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  //   // محاولة قراءة أي بيانات من جدول البروفايل للتأكد من وجوده
  //   const { data, error } = await supabase.from('profiles').select('*').limit(1);

  //   if (error) {
  //     console.error("❌ Table Access Error:", error.message);
  //     console.error("❌ Full Error Object:", error);
  //   } else {
  //     console.log("✅ Connection Successful! Profiles table found.");
  //   }
  // };

  // useEffect(() => {
  //   debugSupabase();
  // }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Step 1: Starting SignUp with:", email);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        console.error("❌ Auth SignUp Error:", signUpError.message);
        throw signUpError;
      }

      console.log("Step 2: Auth Success. User ID:", data.user?.id);

      if (data.user) {
        console.log("Step 3: Attempting to Insert/Upsert into 'profiles'...");
        // const { error: profileError } = await supabase
        //   .from("profiles")
        //   .upsert({
        //     id: data.user.id,
        //     full_name: name,
        //     email: email.trim(),
        //     updated_at: new Date(),
        //   });

        // if (profileError) {
        //   console.error("❌ Profile Table Error (RLS or Schema):", profileError);
        //   throw profileError;
        // }

        console.log("✅ All Steps Completed Successfully!");
        router.push("/auth/profile");
      }
    } catch (err: any) {
      console.error("💥 Global Catch:", err);
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
// function useEffect(arg0: () => void, arg1: never[]) {
//   throw new Error("Function not implemented.");
// }
