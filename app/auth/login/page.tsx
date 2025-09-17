"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) router.push("/");
  }, [router]);

  const saveUser = async (
    uid: string,
    displayName?: string | null
  ) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        email,
        name: displayName || name || "مستخدم",
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleSocialLogin = async (
    provider: GoogleAuthProvider | GithubAuthProvider
  ) => {
    try {
      setIsLoading(true);
      const res = await signInWithPopup(auth, provider);
      await saveUser(res.user.uid, res.user.displayName);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("حدث خطأ أثناء تسجيل الدخول الاجتماعي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("كلمة المرور قصيرة جدًا. يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    try {
      setIsLoading(true);
      if (mode === "login") {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        await saveUser(res.user.uid, res.user.displayName);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(res.user, { displayName: name });
        await saveUser(res.user.uid, name);
      }
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        const code = (err as { code: string }).code;
        switch (code) {
          case "auth/user-not-found":
            setError("هذا المستخدم غير موجود. سجل أولاً.");
            break;
          case "auth/wrong-password":
            setError("كلمة المرور غير صحيحة.");
            break;
          case "auth/email-already-in-use":
            setError("هذا البريد مسجل بالفعل. سجل الدخول.");
            break;
          case "auth/invalid-email":
            setError("تنسيق البريد الإلكتروني غير صالح.");
            break;
          case "auth/weak-password":
            setError("كلمة المرور ضعيفة. 6 أحرف على الأقل.");
            break;
          default:
            setError(mode === "login" ? "فشل تسجيل الدخول. حاول مرة أخرى." : "فشل إنشاء الحساب. حاول مرة أخرى.");
        }
      } else {
        setError(mode === "login" ? "فشل تسجيل الدخول. حاول مرة أخرى." : "فشل إنشاء الحساب. حاول مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg p-4 w-full"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>

        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded mr-2 ${mode === "login" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
            onClick={() => setMode("login")}
            disabled={isLoading}
          >
            دخول
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === "signup" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"}`}
            onClick={() => setMode("signup")}
            disabled={isLoading}
          >
            حساب جديد
          </button>
        </div>

        {mode === "signup" && (
          <div className="mb-3">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="mb-3">
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <small className="text-gray-500">
            يجب أن تكون كلمة المرور 6 أحرف على الأقل.
          </small>
        </div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white w-full py-2 px-4 rounded mb-3"
          onClick={handleEmailAuth}
          disabled={isLoading}
        >
          {isLoading
            ? mode === "login"
              ? "جاري الدخول..."
              : "جاري الإنشاء..."
            : mode === "login"
              ? "تسجيل الدخول"
              : "إنشاء حساب"}
        </button>

        <div className="grid gap-2 mb-3">
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            onClick={() => handleSocialLogin(new GoogleAuthProvider())}
            disabled={isLoading}
          >
            Google
          </button>
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
            onClick={() => handleSocialLogin(new GithubAuthProvider())}
            disabled={isLoading}
          >
            GitHub
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2 text-center">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
