"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const href = user ? "/auth/profile" : "/auth/login";
  const subText = user
    ? `اهلا ، ${user.displayName || "اهلا بك"}`
    : "بعد إذنك تسجل دخول";

  return (
    <Link href={href} className="relative block text-center">
      <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center shadow-lg border border-white/20 w-75 z-30">
        <p className="text-black text-lg font-semibold fs-3">{subText}</p>
      </div>
      <br /> <br /><br /><br />
    </Link>
  );
}
