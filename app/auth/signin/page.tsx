"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/auth/profile");
    } catch  {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch {
      setError("فشل تسجيل الدخول باستخدام Google");
    }
  };

  const handlePhoneSignIn = async () => {
    const phoneNumber = prompt("ادخل رقم هاتفك (مثال: +201234567890)");
    if (!phoneNumber) return;

    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );

      const code = prompt("ادخل كود التحقق المرسل إليك");
      if (code) {
        await confirmation.confirm(code);
        router.push("/auth/profile");
      }
    } catch {
      setError("فشل تسجيل الدخول برقم الهاتف");
    }
  };

  return (
    <>
      <LogoHeader />
      <div className="max-w-4xl mx-auto my-5">
        <h2 className="mb-4">تسجيل الدخول</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <form onSubmit={handleEmailSignIn} className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">كلمة المرور</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 px-4 rounded mb-2">
            دخول بالبريد الإلكتروني
          </button>
        </form>

        <div className="text-center my-3">
          <span>أو</span>
        </div>

        <div className="grid gap-2">
          <button
            onClick={handleGoogleSignIn}
            className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white py-2 px-4 rounded"
          >
            الدخول باستخدام Google
          </button>

          <button
            onClick={handlePhoneSignIn}
            className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-2 px-4 rounded"
          >
            الدخول برقم الهاتف
          </button>
        </div>

        <div id="recaptcha-container"></div>

        <p className="mt-3 text-center">
          ليس لديك حساب؟{" "}
          <Link href="/auth/signup" className="underline">
            أنشئ حساب جديد
          </Link>
        </p>
      </div>
    </>
  );
}
