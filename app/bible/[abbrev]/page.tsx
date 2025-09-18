import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames } from "@/lib/books";

interface Book {
  abbrev: string;
  chapters: string[][];
}

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible: Book[] = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  return bible.map((book) => ({
    abbrev: book.abbrev,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ abbrev: string }> }) {
  const { abbrev } = await params;
  const bookName = bookNames[abbrev as keyof typeof bookNames] || `سفر ${abbrev.toUpperCase()}`;
  return {
    title: `${bookName} - الكتاب المقدس تفاحة`,
    description: `قراءة ${bookName} من الكتاب المقدس مع تقسيم الإصحاحات.`,
    keywords: [bookName, "الكتاب المقدس", "أسفار", "قراءة الإنجيل"],
  };
}

export default async function BookPage({ params }: { params: Promise<{ abbrev: string }> }) {
  const { abbrev } = await params;
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  const bible: { abbrev: string; chapters: string[][] }[] = JSON.parse(fileContent.replace(/^\uFEFF/, ""));
  const book = bible.find((b) => b.abbrev === abbrev);
  const bookName = bookNames[abbrev as keyof typeof bookNames] || `سفر ${abbrev.toUpperCase()}`;

  if (!book)
    return <div className="p-6 text-red-600">❌ لم يتم العثور على السفر</div>;

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{bookName}</h1>
      <p className="mb-6 text-center text-lg text-gray-600">عدد الإصحاحات: {book.chapters.length}</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
        {book.chapters.map((_, idx) => (
          <Link
            key={idx}
            href={`/bible/${abbrev}/${idx + 1}`}
            className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-indigo-400 hover:to-indigo-500 text-gray-800 hover:text-white text-center rounded-lg px-4 py-3 border border-gray-300 hover:border-indigo-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
          >
            إصحاح {idx + 1}
          </Link>
        ))}
      </div>
      <div className="background-blur"></div>
    </div>
  );
}
