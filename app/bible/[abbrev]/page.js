import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames } from "@/lib/books";

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  return bible.map((book) => ({
    abbrev: book.abbrev,
  }));
}

export async function generateMetadata({ params }) {
  const { abbrev } = params;
  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;
  return {
    title: `${bookName} - الكتاب المقدس`,
    description: `قراءة ${bookName} من الكتاب المقدس مع تقسيم الإصحاحات.`,
    keywords: [bookName, "الكتاب المقدس", "أسفار", "قراءة الإنجيل"],
  };
}

export default async function BookPage({ params }) {
  const { abbrev } = await params;
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileContent.replace(/^\uFEFF/, ""));
  const book = bible.find((b) => b.abbrev === abbrev);
  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;

  if (!book)
    return <div className="p-6 text-red-600">❌ لم يتم العثور على السفر</div>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">{bookName}</h1>
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
