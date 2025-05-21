// app/login/page.tsx
"use client";

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
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card shadow p-4 w-100"
        style={{ maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
        </h2>

        <div className="d-flex justify-content-center mb-4">
          <button
            className={`btn ${mode === "login" ? "btn-primary" : "btn-outline-primary"} me-2`}
            onClick={() => setMode("login")}
            disabled={isLoading}
          >
            دخول
          </button>
          <button
            className={`btn ${mode === "signup" ? "btn-primary" : "btn-outline-primary"}`}
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
              className="form-control"
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
            className="form-control"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <small className="form-text text-muted">
            يجب أن تكون كلمة المرور 6 أحرف على الأقل.
          </small>
        </div>

        <button
          className="btn btn-success w-100 mb-3"
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

        <div className="d-grid gap-2 mb-3">
          <button
            className="btn btn-danger"
            onClick={() => handleSocialLogin(new GoogleAuthProvider())}
            disabled={isLoading}
          >
            <i className="bi bi-google me-2"></i> Google
          </button>
          <button
            className="btn btn-dark"
            onClick={() => handleSocialLogin(new GithubAuthProvider())}
            disabled={isLoading}
          >
            <i className="bi bi-github me-2"></i> GitHub
          </button>
        </div>

        {error && (
          <div className="alert alert-danger mt-2 text-center">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
