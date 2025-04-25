import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames } from "@/lib/books";

export default async function BookPage({ params }) {
  const { abbrev } = await params;

  // const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/ar_svd.json`);
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileContent = await fs.readFile(filePath, "utf-8");

  // const data = JSON.parse(fileContent);
  const bible = JSON.parse(fileContent.replace(/^\uFEFF/, ""));
  // const bible = await data.json();

  const book = bible.find((b) => b.abbrev === abbrev);
  if (!book) {
    return <div className="p-6 text-red-600">❌ لم يتم العثور على السفر</div>;
  }

  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;

  return (
    <>
      {" "}
      <h1 className="text-2xl font-bold mb-4">{bookName}</h1>{" "}
      <p className="mb-4">عدد الإصحاحات: {book.chapters.length}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {book.chapters.map((_, idx) => (
          <Link
            key={idx}
            href={`/bible/${abbrev}/${idx + 1}`}
            className="bg-gray-100 hover:bg-indigo-100 text-center rounded px-3 py-1 border border-gray-300 visited:bg-green-200 visited:text-green-900"
          >
            إصحاح {idx + 1}
          </Link>
        ))}
      </div>
    </>
  );
}
