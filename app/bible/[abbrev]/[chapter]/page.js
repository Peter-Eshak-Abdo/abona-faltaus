import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames } from "@/lib/books";

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  const params = [];
  for (const book of bible) {
    for (let i = 0; i < book.chapters.length; i++) {
      params.push({
        abbrev: book.abbrev,
        chapter: `${i + 1}`,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { abbrev, chapter } = params;
  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;
  return {
    title: `${bookName} - إصحاح ${chapter} | الكتاب المقدس تفاحة`,
    description: `قراءة ${bookName} - إصحاح ${chapter} من الكتاب المقدس مع إمكانية تكبير الخط.`,
    keywords: [bookName, `إصحاح ${chapter}`, "الكتاب المقدس", "قراءة الإنجيل"],
  };
}

export default async function ChapterPage({ params, searchParams }) {
  const { abbrev, chapter } = await params;
  const awaitedSearchParams = await searchParams; // Await the searchParams
  const font = awaitedSearchParams?.font || "base";
  // const font = searchParams?.font || "base";

  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));
  // const bible = JSON.parse(fileData);
  const bookName = bookNames[abbrev] || `سفر ${abbrev.toUpperCase()}`;

  const book = bible.find((b) => b.abbrev === abbrev);
  if (!book) return <div>❌ لم يتم العثور على السفر</div>;

  const chapterIndex = parseInt(chapter, 10) - 1;
  const verses = book.chapters[chapterIndex];
  if (!verses) return <div>❌ لم يتم العثور على الإصحاح</div>;


  const fontSizeClass = {sm: "fs-6", base: "fs-3", lg: "fs-1" }[font] || "fs-4";
  // const fontSizeClass = { sm: "text-sm", base: "text-base", lg: "text-lg" }[font] || "text-base";
  return (
    <>
      <div className="mb-4 text-sm text-gray-500 mx-3 my-3">

        <Link href="/bible" className="hover:underline">
          الكتاب المقدس
        </Link>
        /
        <Link href={`/bible/${abbrev}`} className="hover:underline">
          {bookName}
        </Link>
        / <span>إصحاح {chapter}</span>
      </div>

      <h1 className="text-xl font-bold mb-4">
        {bookName} - إصحاح {chapter}
      </h1>

      {/* حجم الخط */}
      <div className="flex gap-2 text-sm">
        <span>حجم الخط:</span>
        <Link
          href={`?font=sm`}
          className={`px-2 border rounded ${
            font === "sm" ? "bg-gray-200" : ""
          }`}
        >
          A-
        </Link>
        <Link
          href={`?font=base`}
          className={`px-2 border rounded ${
            font === "base" ? "bg-gray-200" : ""
          }`}
        >
          A
        </Link>
        <Link
          href={`?font=lg`}
          className={`px-2 border rounded ${
            font === "lg" ? "bg-gray-200" : ""
          }`}
        >
          A+
        </Link>
      </div>

      {/* الآيات */}
      <div className="space-y-2">
        {verses.map((verse, idx) => (
          <p key={idx} className={`${fontSizeClass}`}>
            <strong>{idx + 1}</strong> - {verse}
          </p>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between">
        {chapterIndex > 0 && (
          <Link
            href={`/bible/${abbrev}/${chapterIndex}?font=${font}`}
            className="text-blue-600 hover:underline"
          >
            ← السابق
          </Link>
        )}
        {chapterIndex < book.chapters.length - 1 && (
          <Link
            href={`/bible/${abbrev}/${chapterIndex + 2}?font=${font}`}
            className="text-blue-600 hover:underline"
          >
            التالي →
          </Link>
        )}
      </div>

      {/* قائمة الإصحاحات للتنقل السريع */}
      <div className="mt-8">
        <h2 className="font-bold mb-2">جميع الإصحاحات</h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {book.chapters.map((_, idx) => (
            <Link
              key={idx}
              href={`/bible/${abbrev}/${idx + 1}?font=${font}`}
              className={`px-2 py-1 text-center border rounded ${
                parseInt(chapter) === idx + 1
                  ? "bg-blue-200 font-bold"
                  : "hover:bg-gray-100"
              }`}
            >
              {idx + 1}
            </Link>
          ))}
        </div>
      </div>

      {/* Script لحفظ font في localStorage */}
      <script
        dangerouslySetInnerHTML={{
          __html: ` const url = new URL(window.location.href); const hasFont = url.searchParams.has("font"); const storedFont = localStorage.getItem("fontSize"); if (!hasFont && storedFont) { url.searchParams.set("font", storedFont); window.location.replace(url.toString()); } if (hasFont) { localStorage.setItem("fontSize", url.searchParams.get("font")); } `,
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
      const font = new URLSearchParams(window.location.search).get("font");
      if (font) localStorage.setItem("fontSize", font);
      const saved = localStorage.getItem("fontSize");
      if (saved && !window.location.search.includes("font=")) {
        const url = new URL(window.location.href);
        url.searchParams.set("font", saved);
        window.location.href = url.toString();
      }
    `,
        }}
      />

    </>
  );
}
