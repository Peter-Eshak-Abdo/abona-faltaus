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
    <div className="mb-4 shadow rounded-lg border border-border bg-card text-card-foreground">
      <div className="p-4">
        <h5 className="text-lg font-semibold mb-4">اكتب مقالك</h5>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full resize-none rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-2"
            rows={3}
            placeholder="ما الذي يدور بذهنك؟"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            className="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-2"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            title="اختر صورة"
          />

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            disabled={loading}
          >
            {loading ? "جاري النشر..." : "نشر"}
          </button>
        </form>
      </div>
    </div>
  );
}
