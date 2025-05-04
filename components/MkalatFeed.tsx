"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  getDoc
  // DocumentData,
  // DocumentReference
} from "firebase/firestore";

interface Mkalat {
  id: string;
  userName: string;
  content: string;
  imageUrl?: string;
  likes?: number;
  comments?: {
    text: string;
    userId: string | null;
    name: string;
    createdAt: string;
  }[];
  createdAt?: {
    seconds: number;
  };
}

export default function MkalatFeed() {

  const [mkalat, setMkalat] = useState<Mkalat[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "articles"), (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const mkal = { id: doc.id, ...doc.data() } as Mkalat;
        return mkal;
      });
      setMkalat(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return () => unsub();
  }, []);

  const handleLike = async (mkalId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "mkalat", mkalId);
    const snapshot = await getDoc(ref);
    const data = snapshot.data();

    if (!data) return;
    if ((data.likedBy || []).includes(user.uid)) return; // 🛑 بالفعل عمل لايك

    await updateDoc(ref, {
      likedBy: arrayUnion(user.uid),
      likes: (data.likes || 0) + 1,
    });
  };

  // const handleLike = async (id: string) => {
  //   const ref = doc(db, "mkalat", id);
  //   await updateDoc(ref, {
  //     likes: Math.floor(Math.random() * 100) // ممكن later نستخدم array contains لضمان كل يوزر يعمل لايك مرة
  //   });
  // };

  const handleComment = async (id: string, commentText: string) => {
    const ref = doc(db, "mkalat", id);
    await updateDoc(ref, {
      comments: arrayUnion({
        text: commentText,
        userId: auth.currentUser?.uid,
        name: auth.currentUser?.displayName || "مستخدم",
        createdAt: new Date().toISOString()
      })
    });
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      {mkalat.map(mkal => (
        <div key={mkal.id} className="border p-4 rounded shadow">
          <p><strong>{mkal.userName}</strong></p>
          <p className="my-2">{mkal.content}</p>
          {mkal.imageUrl && (
            <img src={mkal.imageUrl} alt="article" className="max-h-60 object-cover rounded" />
          )}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleLike(mkal.id)}
              className="text-blue-600"
            >
              👍 موافق ({mkal.likes || 0})
            </button>
          </div>
          <div className="mt-2">
            <CommentSection mkal={mkal} onComment={handleComment} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentSection({ mkal, onComment }: { mkal: Mkalat; onComment: (id: string, commentText: string) => void }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onComment(mkal.id, text);
    setText("");
  };

  return (
    <div className="mt-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب تعليق..."
        className="border p-1 rounded w-full"
      />
      <button onClick={submit} className="text-sm text-green-600 mt-1">
        إرسال
      </button>
      <div className="mt-2 space-y-1 text-sm">
        {(mkal.comments || []).map((c: { text: string; userId: string | null; name: string; createdAt: string }, i: number) => (
          <div key={i} className="border-b pb-1">
            <strong>{c.name}</strong>: {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}

