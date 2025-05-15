"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Copy, Share2 } from "lucide-react";
import LogoHeader from "./LogoHeader";
import Link from "next/link";
import Image from "next/image";

export default function AccountInfo() {
  interface UserData {
    name?: string;
    uid: string;
    photoURL?: string;
    createdAt?: { toDate: () => Date };
  }

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 1) تابع حالة المصادقة
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserData({ ...(snap.data() as UserData), uid: user.uid });
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2) الدالة اللي ترفع الصورة وتحدّث الحالة
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !firebaseUser) return;
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${firebaseUser.uid}/photoUrl`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // حدّث الـ Firestore
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    });

    // 3) أعد جلب الداتا بعد التحديث
    const updatedSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (updatedSnap.exists()) {
      const data = updatedSnap.data() as UserData;
      setUserData({
        uid: firebaseUser.uid,
        name: data.name,
        photoURL: data.photoURL + `?t=${Date.now()}`, // نضيف timestamp لكسر الكاش
        createdAt: data.createdAt,
      });
    }
    setUploading(false);
    setSuccessMsg("تم رفع الصورة بنجاح");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // نسخ UID
  const handleCopy = () => {
    if (!firebaseUser) return;
    navigator.clipboard.writeText(firebaseUser.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // مشاركة عبر واتساب
  const handleShare = () => {
    if (!firebaseUser) return;
    const msg = `رقم حسابي في الموقع هو: ${firebaseUser.uid}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );

  if (!firebaseUser)
    return (
      <div className="alert alert-warning text-center my-5">
        لم يتم تسجيل الدخول
      </div>
    );

  return (
    <>
      <LogoHeader />
      <div className="mt-5 mb-3 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          الصفحة الرئيسية
        </Link>
        /بروفيلي
        <Link href="/profile" className="hover:underline">
        </Link>
      </div>
      <div className="container">
        {/* Toast عند النجاح */}
        {successMsg && (
          <div
            className="toast show position-fixed top-0 end-0 m-3"
            role="alert"
          >
            <div className="toast-header">
              <strong className="me-auto">نظام الموقع</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMsg("")}
                title="إغلاق"
              ></button>
            </div>
            <div className="toast-body">{successMsg}</div>
          </div>
        )}

        <div className="card mx-auto p-4 shadow account-card-maxwidth">
          <div className="text-center mb-3">
            <Image
              key={userData?.photoURL}
              src={userData?.photoURL || "/images/logo.jpg"}
              // src={userData?.photoURL || "https://via.placeholder.com/100x100.png?text=Avatar"}
              alt="الصورة الشخصية"
              width={100}
              height={100}
              className="rounded-circle mb-2"
              style={{ objectFit: "cover" }}
            />
            <h4 className="mb-1">{userData?.name || "مستخدم"}</h4>
            <small className="text-muted">{firebaseUser.uid}</small>
          </div>

          <div className="mb-3">
            <label htmlFor="upload" className="form-label">
              تغيير الصورة الشخصية
            </label>
            <input
              type="file"
              id="upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-control"
              disabled={uploading}
            />
          </div>

          <ul className="list-group list-group-flush mb-4">
            <li className="list-group-item">
              <strong>الاسم:</strong> {userData?.name || "غير متوفر"}
            </li>
            <li className="list-group-item">
              <strong>رقم الحساب:</strong> {firebaseUser.uid}
            </li>
            <li className="list-group-item">
              <strong>تاريخ الإنشاء:</strong>{" "}
              {userData?.createdAt
                ? userData.createdAt.toDate().toLocaleString()
                : "غير متوفر"}
            </li>
          </ul>

          <h2 className="h5 mb-2">🔐 رقم حسابك</h2>
          <p className="break-all">{firebaseUser.uid}</p>

          <div className="d-flex justify-content-center gap-2 mt-3">
            <button onClick={handleCopy} className="btn btn-sm btn-primary">
              <Copy size={16} className="me-1" />
              {copied ? "تم النسخ!" : "نسخ"}
            </button>
            <button onClick={handleShare} className="btn btn-sm btn-success">
              <Share2 size={16} className="me-1" />
              مشاركة
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
