"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // جلب المستخدم الحالي
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // جلب الاسم المخصص من جدول profiles
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        if (data?.name) {
          setCustomDisplayName(data.name);
        }
      }
    };

    fetchUserAndProfile();
    const timeout = setTimeout(fetchUserAndProfile, 500);

    // الاستماع لتغييرات تسجيل الدخول/الخروج
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setCustomDisplayName(null);
      } else {
        fetchUserAndProfile(); // إعادة جلب البيانات لو دخل بحساب تاني
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const href = user ? "/auth/profile" : "/auth/signin";
  // جلب الاسم سواء المخصص، أو من حساب جوجل (user_metadata)، أو كلمة ترحيبية
  const displayName = customDisplayName || user?.user_metadata?.full_name || "اهلا بك";
  const subText = user
    ? `اهلا ، ${displayName}`
    : "بعد إذنك تسجل دخول";

  return (
    <Link href={href} className="relative block text-center">
      <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center border-white/20 w-3/4 md:w-25 z-30 shadow-xl/30 inset-shadow-sm">
        <p className="text-black text-2xl font-semibold p-1">{subText}</p>
      </div>
    </Link>
  );
}
