"use client";

import { useEffect, useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Copy, Share2, LogOut } from "lucide-react";
import LogoHeader from "./LogoHeader";
// import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserData = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: import("firebase/firestore").Timestamp; // Firestore Timestamp type
};

export default function AccountInfo() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData({ ...(snap.data() as UserData), uid: user.uid });
        }
      } else {
        router.push("/signin");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !firebaseUser) return;
    setUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `users/${firebaseUser.uid}/photoUrl`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "users", firebaseUser.uid), {
      photoURL: downloadURL,
      updatedAt: serverTimestamp(),
    });

    const updatedSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (updatedSnap.exists()) {
      const data = updatedSnap.data();
      setUserData({
        uid: firebaseUser.uid,
        name: data.name,
        email: data.email,
        photoURL: data.photoURL + `?t=${Date.now()}`,
        createdAt: data.createdAt,
      });
    }

    setUploading(false);
    setSuccessMsg("تم رفع الصورة بنجاح");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleCopy = () => {
    if (!firebaseUser) return;
    navigator.clipboard.writeText(firebaseUser.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!firebaseUser) return;
    const msg = `رقم حسابي في الموقع هو: ${firebaseUser.uid}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/signin");
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  return (
    <>
      <LogoHeader />
      <div className="container py-4">
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
              alt="الصورة الشخصية"
              width={100}
              height={100}
              className="rounded-circle mb-2"
              style={{ objectFit: "cover" }}
            />
            <h4>{userData?.name}</h4>
            <small className="text-muted">{userData?.email}</small>
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

          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item">
              <strong>الاسم:</strong> {userData?.name}
            </li>
            <li className="list-group-item">
              <strong>البريد:</strong> {userData?.email}
            </li>
            <li className="list-group-item">
              <strong>رقم الحساب:</strong> {firebaseUser?.uid}
            </li>
            <li className="list-group-item">
              <strong>تاريخ الإنشاء:</strong>{" "}
              {userData?.createdAt
                ? userData.createdAt.toDate().toLocaleString()
                : ""}
            </li>
          </ul>

          <div className="d-flex justify-content-center gap-2 mt-2">
            <button onClick={handleCopy} className="btn btn-sm btn-primary">
              <Copy size={16} className="me-1" />
              {copied ? "تم النسخ!" : "نسخ UID"}
            </button>
            <button onClick={handleShare} className="btn btn-sm btn-success">
              <Share2 size={16} className="me-1" />
              مشاركة
            </button>
            <button onClick={handleLogout} className="btn btn-sm btn-danger">
              <LogOut size={16} className="me-1" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
