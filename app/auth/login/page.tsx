"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { sendSignInLinkToEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
// import { getAuth, signInWithEmailAndPassword, sendSignInLinkToEmail } from "firebase/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordless, setIsPasswordless] = useState(false);
  const router = useRouter();
  const authe = auth;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(authe, email, password);
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("خطأ في تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور." );
      } else {
        setError("خطأ غير متوقع في تسجيل الدخول.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordlessLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(authe, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      alert("تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!isPasswordless && (
              <div>
                <label htmlFor="password" className="sr-only">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              onClick={isPasswordless ? handlePasswordlessLogin : handleEmailPasswordLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? "جاري التحميل..." : "تسجيل الدخول"}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsPasswordless(!isPasswordless)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isPasswordless
                ? "تسجيل الدخول بكلمة المرور"
                : "تسجيل الدخول بدون كلمة مرور"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
