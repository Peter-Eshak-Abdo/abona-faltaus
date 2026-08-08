"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);

  useEffect(() => {
    // جلب المستخدم الحالي
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // جلب الاسم المخصص من جدول profiles
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data?.full_name) {
          setCustomDisplayName(data.full_name);
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
    <Link href={href} className="absolute top-5 left-1/2 -translate-x-1/2 z-30 block text-center max-w-[80%] w-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 px-1 py-0.5 shadow-xl/30 inset-shadow-sm">
        <p className="text-black dark:text-white text-sm sm:text-sm md:text-base font-semibold whitespace-nowrap">
          {subText}
        </p>
      </div>
    </Link>
  );
}
