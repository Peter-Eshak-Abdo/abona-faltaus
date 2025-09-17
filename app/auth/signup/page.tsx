"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !name) {
      setError("جميع الحقول مطلوبة.");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور قصيرة جدًا. يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        createdAt: serverTimestamp(),
      });

      router.push("/auth/profile");
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        switch ((err as { code: string }).code) {
          case "auth/email-already-in-use":
            setError("هذا البريد الإلكتروني مسجّل بالفعل. حاول تسجيل الدخول.");
            break;
          case "auth/invalid-email":
            setError("تنسيق البريد الإلكتروني غير صالح.");
            break;
          case "auth/weak-password":
            setError("كلمة المرور ضعيفة جدًا. يجب أن تحتوي على 6 أحرف على الأقل.");
            break;
          case "auth/operation-not-allowed":
            setError("تسجيل البريد/كلمة المرور غير مفعل في الإعدادات.");
            break;
          default:
            setError("حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.");
        }
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.");
      }
    }
  };

  return (
    <>
      <LogoHeader />
      <div className="max-w-4xl mx-auto my-5">
        <h2 className="mb-4">إنشاء حساب جديد</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        <form onSubmit={handleSignUp} className="bg-white p-4 rounded-lg shadow-md">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">الاسم</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="اسمك الكامل"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <small className="text-gray-500">يجب أن تكون كلمة المرور 6 أحرف على الأقل.</small>
          </div>

          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full py-2 px-4 rounded">
            إنشاء حساب
          </button>

          <p className="mt-3 text-center">
            لديك حساب بالفعل؟{' '}
            <Link href="/auth/signin" className="underline">
              سجل الدخول
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
