"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // الاشتراك في تغيرات حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // نحدد الوجهة بناءً على وجود مستخدم
  const href = user ? "/profile" : "/login";
  // الرسالة التي ستظهر تحت العنوان
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
