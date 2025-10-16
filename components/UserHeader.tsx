"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCustomName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCustomDisplayName(userData.name || null);
          }
        } catch (error) {
          console.error("Error loading custom name:", error);
        }
      }
    };
    loadCustomName();
  }, [user]);

  const href = user ? "/auth/profile" : "/auth/login";
  const displayName = customDisplayName || user?.displayName || "اهلا بك";
  const subText = user
    ? `اهلا ، ${displayName}`
    : "بعد إذنك تسجل دخول";

  return (
    <Link href={href} className="relative block text-center">
      <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center border-white/20 w-25 z-30 shadow-xl/30 inset-shadow-sm">
        <p className="text-black text-2xl font-semibold p-1">{subText}</p>
      </div>
    </Link>
  );
}
