"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"

interface UserHeaderProps {
  user?: any;
}

export default function UserHeader({ user }: UserHeaderProps) {
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (isMounted && data?.full_name) {
          setCustomDisplayName(data.full_name);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const href = user ? "/auth/profile" : "/auth/signin";
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
