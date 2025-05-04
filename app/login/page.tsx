"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      router.push("/");
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await saveUser(res.user.uid, res.user.displayName, res.user.photoURL);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  const handleNameSubmit = async () => {
    if (name.trim().length < 2) {
      setError("من فضلك أدخل اسم صحيح");
      return;
    }
    try {
      const res = await signInAnonymously(auth);
      await updateProfile(res.user, { displayName: name });
      await saveUser(res.user.uid, name);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      setError("فشل إنشاء الحساب");
    }
  };

  const saveUser = async (
    uid: string,
    name?: string | null,
    photoURL?: string | null
  ) => {
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
      <div className="card shadow p-4 w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">تسجيل الدخول</h2>
        <button
          className="btn btn-primary w-100 mb-3"
          onClick={handleGoogleLogin}
        >
          الدخول بحساب Google
        </button>

        <div className="border-top pt-3">
          <p className="text-muted text-center mb-2">
            أو أنشئ حساب بالاسم فقط
          </p>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="btn btn-success w-100"
            onClick={handleNameSubmit}
          >
            إنشاء حساب
          </button>
        </div>

        {error && (
          <div className="alert alert-danger mt-3 text-center py-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
