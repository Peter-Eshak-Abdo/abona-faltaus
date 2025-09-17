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
import { Copy, Share2, LogOut, X } from "lucide-react";
import LogoHeader from "./LogoHeader";
import Image from "next/image";
import { useRouter } from "next/navigation";

type UserData = {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: import("firebase/firestore").Timestamp;
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
        router.push("/auth/login");
        // router.push("/auth/signin");
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
    router.push("/auth/login");
    // router.push("/auth/signin");
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );

  return (
    <>
      <LogoHeader />
      <div className="max-w-7xl mx-auto px-4 py-4">
        {successMsg && (
          <div
            className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50"
            role="alert"
          >
            <div className="flex justify-between items-center">
              <strong>نظام الموقع</strong>
              <button
                type="button"
                className="text-white hover:text-gray-200"
                onClick={() => setSuccessMsg("")}
                title="إغلاق"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-2">{successMsg}</div>
          </div>
        )}

        <div className="max-w-md mx-auto p-4 shadow rounded-lg border border-border bg-card text-card-foreground">
          <div className="text-center mb-3">
            <Image
              key={userData?.photoURL}
              src={userData?.photoURL || "/images/logo.jpg"}
              alt="الصورة الشخصية"
              width={100}
              height={100}
              className="rounded-full mb-2 mx-auto"
              style={{ objectFit: "cover" }}
            />
            <h4>{userData?.name}</h4>
            <small className="text-muted-foreground">{userData?.email}</small>
          </div>

          <div className="mb-3">
            <label htmlFor="upload" className="block text-sm font-medium mb-1">
              تغيير الصورة الشخصية
            </label>
            <input
              type="file"
              id="upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={uploading}
            />
          </div>

          <ul className="space-y-2 mb-3">
            <li className="flex justify-between">
              <strong>الاسم:</strong> {userData?.name}
            </li>
            <li className="flex justify-between">
              <strong>البريد:</strong> {userData?.email}
            </li>
            <li className="flex justify-between">
              <strong>رقم الحساب:</strong> {firebaseUser?.uid}
            </li>
            <li className="flex justify-between">
              <strong>تاريخ الإنشاء:</strong>{" "}
              {userData?.createdAt
                ? userData.createdAt.toDate().toLocaleString()
                : ""}
            </li>
          </ul>

          <div className="flex justify-center gap-2 mt-2">
            <button onClick={handleCopy} className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none text-sm">
              <Copy size={16} className="mr-1" />
              {copied ? "تم النسخ!" : "نسخ UID"}
            </button>
            <button onClick={handleShare} className="inline-flex items-center rounded-md bg-green-600 px-3 py-1 text-primary-foreground hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none text-sm">
              <Share2 size={16} className="mr-1" />
              مشاركة
            </button>
            <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-destructive px-3 py-1 text-primary-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none text-sm">
              <LogOut size={16} className="mr-1" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
