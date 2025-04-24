import { useEffect, useState } from "react";
import Link from "next/link";

export default function SavedVerses() {
  const [savedVerses, setSavedVerses] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedVerses") || "[]");
    setSavedVerses(saved);
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">الآيات المحفوظة</h1>
      {savedVerses.length === 0 ? (
        <p>لا توجد آيات محفوظة بعد.</p>
      ) : (
        <div className="space-y-2">
          {savedVerses.map((verse, idx) => (
            <p key={idx} className="text-base">{verse}</p>
          ))}
        </div>
      )}
      <Link href="/bible" className="text-blue-600 hover:underline mt-4">الرجوع إلى الكتاب المقدس</Link>
    </div>
  );
}
