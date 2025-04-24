import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames } from "@/lib/books";
import ChapterContent from "./ChapterContent";

export default async function ChapterPage({ params }) {
  const { abbrev, chapter } = await params;

  // تحميل بيانات الكتاب المقدس
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  // إيجاد السفر والإصحاح
  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;
  const book = bible.find((b) => b.abbrev === abbrev);
  if (!book) return <div>❌ لم يتم العثور على السفر</div>;

  const chapterIndex = parseInt(chapter, 10) - 1;
  const verses = book.chapters[chapterIndex];
  if (!verses) return <div>❌ لم يتم العثور على الإصحاح</div>;

  return (
    <div className="p-5">
      <div className="mb-4 text-sm text-gray-500">
        <Link href="/bible" className="hover:underline">
          الكتاب المقدس
        </Link>{" "}
        /{" "}
        <Link href={`/bible/${abbrev}`} className="hover:underline">
          {bookName}
        </Link>{" "}
        / <span>إصحاح {chapter}</span>
      </div>

      <h1 className="text-xl font-bold mb-4">
        {bookName} - إصحاح {chapter}
      </h1>

      {/* تمرير الآيات كـ props للمكون Client Component */}
      <ChapterContent verses={verses} chapter={chapter} abbrev={abbrev} />
    </div>
  );
}
