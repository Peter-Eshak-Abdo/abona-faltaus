"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookSelect from "../../components/BookSelect";



export default function BibleIndex() {
  const [bible, setBible] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/ar_svd.json")
      .then((res) => res.json())
      .then(setBible);
  }, []);

  return (
    <div>
      <h1 className="text-center mb-4">الكتاب المقدس</h1>
      <BookSelect
        bible={bible}
        onSelect={(idx) => router.push(`/bible/${idx}`)}
      />
    </div>
  );
}
