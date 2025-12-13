"use client";

import { useEffect, useState } from "react";
import { getFirebaseServices } from "@/lib/firebase";
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
  Firestore,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseStorage,
} from "firebase/storage";
import { Copy, Share2, LogOut, X } from "lucide-react";
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
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const { auth, db, storage } = getFirebaseServices();
    setAuth(auth);
    setDb(db);
    setStorage(storage);

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        if (!db) return;
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData({ ...(snap.data() as UserData), uid: user.uid });
        }
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router, db]);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !firebaseUser || !storage || !db) return;
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
    if (!auth) return;
    await signOut(auth);
    router.push("/auth/login");
  };

  if (loading)
    return (
      <div className="text-center my-1">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-1 flex items-center justify-center min-h-screen">
      {successMsg && (
        <div
          className="fixed top-4 right-4 bg-green-500 text-white p-1 rounded-md shadow-lg z-50"
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

      <div className="max-w-md mx-auto p-1 shadow rounded-lg border border-border bg-card text-card-foreground">
        <div className="text-center mb-1">
          <Image
            key={userData?.photoURL}
            src={userData?.photoURL || "/images/logo.webp"}
            alt="الصورة الشخصية"
            width={100}
            height={100}
            className="rounded-full mb-1 mx-auto"
            style={{ objectFit: "cover" }}
          />
          <p className="text-xl font-bold">{userData?.name}</p>
          <small className="text-muted-foreground">{userData?.email}</small>
        </div>

        <div className="mb-1">
          <label htmlFor="upload" className="block text-sm font-medium mb-1">
            تغيير الصورة الشخصية
          </label>
          <input
            type="file"
            id="upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full rounded-md border border-input bg-background p-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            disabled={uploading}
          />
        </div>

        <ul className="space-y-1 mb-1">
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

        <div className="flex justify-center gap-1 mt-1">
          <button onClick={handleCopy} className="inline-flex items-center rounded-md bg-primary p-1 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none text-sm" type="button">
            <Copy size={16} className="mr-1" />
            {copied ? "تم النسخ!" : "نسخ UID"}
          </button>
          <button onClick={handleShare} className="inline-flex items-center rounded-md bg-green-600 p-1 text-primary-foreground hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none text-sm" type="button">
            <Share2 size={16} className="mr-1" />
            مشاركة
          </button>
          <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-destructive p-1 text-primary-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:pointer-events-none text-sm" type="button">
            <LogOut size={16} className="mr-1" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
