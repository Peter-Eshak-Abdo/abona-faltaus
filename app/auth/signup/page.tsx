"use client";
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

  const debugSupabase = async () => {
    console.log("🔍 Testing Supabase Connection...");
    console.log("🔗 URL:", process.env.NEXT_PUBLIC_SUPABASE_URL_NEW);

    // محاولة قراءة أي بيانات من جدول البروفايل للتأكد من وجوده
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
      console.error("❌ Table Access Error:", error.message);
      console.error("❌ Full Error Object:", error);
    } else {
      console.log("✅ Connection Successful! Profiles table found.");
    }
  };

  useEffect(() => {
    debugSupabase();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🚀 Starting Sign Up Process...");
    console.log("1️⃣ Step: Registering user in Supabase Auth...");

    try {
      // 1. إنشاء المستخدم في Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name } },
      });

      if (authError) {
        console.error("❌ Auth Error:", authError.message);
        throw authError;
      }

      console.log("✅ Auth Success! User ID:", authData.user?.id);

      if (authData.user) {
        console.log("2️⃣ Step: Inserting into 'profiles' table...");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles") // تأكد من الاسم هنا بالحرف
          .insert([{
            id: authData.user.id,
            name: name,
            email: email.trim()
          }]);

        if (profileError) {
          console.error("❌ Profile Table Error:", profileError.message);
          console.error("❌ Error Code:", profileError.code);
          console.error("❌ Hint:", profileError.hint);
          throw profileError;
        }

        console.log("✅ Profile Created Successfully!");
        router.push("/auth/profile");
      }
    } catch (err: any) {
      console.error("💥 Global Catch Error:", err);
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
      console.log("🏁 Process Finished.");
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
function useEffect(arg0: () => void, arg1: never[]) {
  throw new Error("Function not implemented.");
}

