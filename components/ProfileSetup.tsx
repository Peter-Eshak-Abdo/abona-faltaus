"use client";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";

export default function ProfileSetup() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, {
      displayName: name,
    });
    router.push("/mkalat");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <input
        type="text"
        placeholder="ادخل اسمك"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        متابعة
      </button>
    </div>
  );
}
