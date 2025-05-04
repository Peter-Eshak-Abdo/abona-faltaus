"use client";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
      // const result = await signInWithPopup(auth, provider);
      router.push("/mkalat");
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const loginWithNameOnly = async () => {
    try {
      await signInAnonymously(auth);
      // const result = await signInAnonymously(auth);
      router.push("/profile-setup"); // هنعمله لاحقًا
    } catch (error) {
      console.error("Anonymous Login Error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <button
        onClick={loginWithGoogle}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        تسجيل الدخول بحساب جوجل
      </button>
      <button
        onClick={loginWithNameOnly}
        className="bg-gray-500 text-white px-4 py-2 rounded-lg"
      >
        دخول باسم فقط (بدون حساب)
      </button>
    </div>
  );
}
