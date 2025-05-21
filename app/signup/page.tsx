"use client";

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

    // Client-side validation
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

      // Update display name
      await updateProfile(user, { displayName: name });

      // Save to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        createdAt: serverTimestamp(),
      });

      router.push("/profile");
    } catch (err: unknown) {
      console.error(err);
      // Handle specific Firebase auth errors
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
      <div className="container my-5">
        <h2 className="mb-4">إنشاء حساب جديد</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSignUp} className="card p-4 shadow-sm">
          <div className="mb-3">
            <label className="form-label">الاسم</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="اسمك الكامل"
            />
          </div>

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
            <small className="form-text text-muted">يجب أن تكون كلمة المرور 6 أحرف على الأقل.</small>
          </div>

          <button type="submit" className="btn btn-success w-100">
            إنشاء حساب
          </button>

          <p className="mt-3 text-center">
            لديك حساب بالفعل؟{' '}
            <Link href="/signin" className="text-decoration-underline">
              سجل الدخول
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
