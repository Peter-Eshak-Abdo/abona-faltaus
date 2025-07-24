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
      <div className="container my-5">
        <h2 className="mb-4">تسجيل الدخول</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleEmailSignIn} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">كلمة المرور</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-2">
            دخول بالبريد الإلكتروني
          </button>
        </form>

        <div className="text-center my-3">
          <span>أو</span>
        </div>

        <div className="d-grid gap-2">
          <button
            onClick={handleGoogleSignIn}
            className="btn btn-outline-danger"
          >
            الدخول باستخدام Google
          </button>

          <button
            onClick={handlePhoneSignIn}
            className="btn btn-outline-success"
          >
            الدخول برقم الهاتف
          </button>
        </div>

        <div id="recaptcha-container"></div>

        <p className="mt-3 text-center">
          ليس لديك حساب؟{" "}
          <Link href="/auth/signup" className="text-decoration-underline">
            أنشئ حساب جديد
          </Link>
        </p>
      </div>
    </>
  );
}
