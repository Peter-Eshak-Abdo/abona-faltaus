"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { motion } from "framer-motion";

export default function VerifyPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = getAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = window.localStorage.getItem("emailForSignIn");

          if (!email) {
            email = window.prompt("الرجاء إدخال بريدك الإلكتروني للتحقق");
          }

          if (email) {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            router.push("/");
          }
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [auth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في التحقق</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              العودة لصفحة تسجيل الدخول
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
