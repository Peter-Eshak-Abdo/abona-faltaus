"use client";

import { useState } from "react";
import { db, auth, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CreateMkal() {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    setLoading(true);

    let imageUrl = "";
    if (image) {
      const storageRef = ref(
        storage,
        `mkalat/${Date.now()}_${image.name}`
      );
      await uploadBytes(storageRef, image);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "mkalat"), {
      authorId: auth.currentUser?.uid,
      authorName: auth.currentUser?.displayName || "مستخدم",
      content: text,
      imageUrl,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      comments: [],
    });

    setText("");
    setImage(null);
    setLoading(false);
  };

  return (
    <div className="card mb-4 shadow">
      <div className="card-body">
        <h5 className="card-title">اكتب مقالك</h5>

        <form onSubmit={handleSubmit}>
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="ما الذي يدور بذهنك؟"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="form-control mb-2"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            title="اختر صورة"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "جاري النشر..." : "نشر"}
          </button>
        </form>
      </div>
    </div>
  );
}
