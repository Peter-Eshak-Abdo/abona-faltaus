// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPhoneNumber,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier
} from "firebase/auth";
import { auth, db, getRecaptchaVerifier } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [isPhoneVerification, setIsPhoneVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        getRecaptchaVerifier("recaptcha-container");
      }, 500); // تأخير بسيط علشان DOM يجهز
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) router.push("/");
  }, [router]);

  const handleSocialLogin = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    try {
      setIsLoading(true);
      const res = await signInWithPopup(auth, provider);
      await saveUser(res.user.uid, res.user.displayName, res.user.photoURL);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+2${phoneNumber}`;

      // استخدم المثيل اللي خزّنّاه في window
      const appVerifier = getRecaptchaVerifier("recaptcha-container");
      if (!appVerifier) {
        setError("تعذر تهيئة reCAPTCHA. حاول مرة أخرى.");
        setIsLoading(false);
        return;
      }
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setVerificationId(confirmationResult.verificationId);
      setIsPhoneVerification(true);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إرسال رمز التحقق");
      // لو فشل، أعد تحميل الـ reCAPTCHA
      // getRecaptchaVerifier("recaptcha-container");
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear(); // هذه مهمة
        } catch { }
        window.recaptchaVerifier = undefined;
      }
      getRecaptchaVerifier("recaptcha-container");

    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setIsLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const res = await signInWithCredential(auth, credential);
      await saveUser(res.user.uid, name || "مستخدم");
      router.push("/");
    } catch (err) {
      console.error(err);
      setError("رمز التحقق غير صحيح");
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (uid: string, name?: string | null, photoURL?: string | null) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: name || "مستخدم",
        photoURL: photoURL || null,
        createdAt: serverTimestamp(),
      });
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card shadow p-4 w-100"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">تسجيل الدخول</h2>

        <div className="d-grid gap-2">
          <button
            className="btn btn-danger"
            onClick={() => handleSocialLogin(new GoogleAuthProvider())}
            disabled={isLoading}
          >
            <i className="bi bi-google me-2"></i>
            الدخول بحساب Google
          </button>

          <button
            className="btn btn-dark"
            onClick={() => handleSocialLogin(new GithubAuthProvider())}
            disabled={isLoading}
          >
            <i className="bi bi-github me-2"></i>
            الدخول بحساب GitHub
          </button>
        </div>

        <div className="border-top pt-3 mt-3">
          <p className="text-muted text-center mb-2">أو سجل دخول برقم هاتفك</p>

          {!isPhoneVerification ? (
            <>
              <div className="mb-3">
                <input
                  type="tel"
                  className="form-control"
                  placeholder="رقم الهاتف (مثال: 01234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={handlePhoneLogin}
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="رمز التحقق"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="اسمك (اختياري)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button
                className="btn btn-success w-100"
                onClick={verifyCode}
                disabled={isLoading || !verificationCode}
              >
                {isLoading ? "جاري التحقق..." : "تحقق من الرمز"}
              </button>
              <button
                className="btn btn-link w-100 mt-2"
                onClick={() => {
                  setIsPhoneVerification(false);
                  setVerificationCode("");
                }}
              >
                تغيير رقم الهاتف
              </button>
            </>
          )}
        </div>
        <div id="recaptcha-container" />

        {error && (
          <div className="alert alert-danger mt-3 text-center py-2">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
