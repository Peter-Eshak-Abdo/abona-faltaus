"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChapterSelect from "../../../components/ChapterSelect";

export default function ChaptersPage({ params }) {
  const { book } = params;
  const [bible, setBible] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/ar_svd.json")
      .then((res) => res.json())
      .then(setBible);
  }, []);

  if (!bible.length) return null;

  const bookData = bible[book];
  return (
    <div>
      <h2 className="mb-3">{bookData.name}</h2>
      <ChapterSelect
        count={bookData.chapters.length}
        onSelect={(ch) => router.push(`/bible/${book}/${ch}`)}
      />
    </div>
  );
}
