import fs from "fs/promises";
import path from "path";
import Link from "next/link";

export default async function ChapterPage({ params }) {
  const { abbrev, chapter } = await params;

  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));
  // const bible = JSON.parse(fileData);

  const book = bible.find((b) => b.abbrev === abbrev);
  if (!book) return <div>❌ لم يتم العثور على السفر</div>;

  const chapterIndex = parseInt(chapter, 10) - 1;
  const verses = book.chapters[chapterIndex];
  if (!verses) return <div>❌ لم يتم العثور على الإصحاح</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        سفر {abbrev.toUpperCase()} - إصحاح {chapter}
      </h1>

      <div className="space-y-2">
        {verses.map((verse, idx) => (
          <p key={idx} className="leading-relaxed">
            <strong>{idx + 1}</strong> - {verse}
          </p>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        {chapterIndex > 0 && (
          <Link
            href={`/bible/${abbrev}/${parseInt(chapter) - 1}`}
            className="text-blue-600 underline"
          >
            ← الإصحاح السابق
          </Link>
        )}
        {chapterIndex < book.chapters.length - 1 && (
          <Link
            href={`/bible/${abbrev}/${parseInt(chapter) + 1}`}
            className="text-blue-600 underline"
          >
            الإصحاح التالي →
          </Link>
        )}
      </div>
    </div>
  );
}
