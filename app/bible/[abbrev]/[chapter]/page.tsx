import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames, oldTestament, newTestament } from "@/lib/books";

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

export async function generateMetadata({ params }: { params: Promise<{ abbrev: string; chapter: string }> }) {
  const { abbrev, chapter } = await params;
  const bookName = (bookNames as Record<string, string>)[abbrev] || `سفر ${abbrev.toUpperCase()}`;
  return {
    title: `${bookName} - إصحاح ${chapter} | الكتاب المقدس تفاحة`,
    description: `قراءة ${bookName} - إصحاح ${chapter} من الكتاب المقدس مع إمكانية تكبير الخط.`,
    keywords: [bookName, `إصحاح ${chapter}`, "الكتاب المقدس", "قراءة الإنجيل"],
  };
}

export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ abbrev: string; chapter: string }>;
  searchParams?: Promise<Record<string, string>>;
}) {
  const { abbrev, chapter } = await params;
  const awaitedSearchParams = await searchParams; // Await the searchParams
  const font = awaitedSearchParams?.font || "base";
  // const font = searchParams?.font || "base";

  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));
  // const bible = JSON.parse(fileData);
  const bookName = bookNames[abbrev as keyof typeof bookNames] || `سفر ${abbrev.toUpperCase()}`;

  const book = bible.find((b: { abbrev: string; }) => b.abbrev === abbrev);
  if (!book) return <div>❌ لم يتم العثور على السفر</div>;

  const chapterIndex = parseInt(chapter, 10) - 1;
  const verses = book.chapters[chapterIndex];
  if (!verses) return <div>❌ لم يتم العثور على الإصحاح</div>;


  const fontSizeClass = { sm: "fs-6", base: "fs-3", lg: "fs-1" }[font] || "fs-4";

  const oldBooks = oldTestament.map((abbr) => ({
    abbrev,
    name: bookNames[abbr as keyof typeof bookNames] || abbr,
  }));
  const newBooks = newTestament.map((abbr) => ({
    abbrev,
    name: bookNames[abbr as keyof typeof bookNames] || abbr,
  }));

  return (
    <div className="flex min-h-screen animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 md:w-72 bg-white bg-opacity-70 shadow-lg p-3 overflow-y-auto">
        {/* Chapters */}
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-gray-700 text-sm">الإصحاحات</h3>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {book.chapters.map((_chapter: string[], idx: number) => (
              <Link
                key={idx}
                href={`/bible/${abbrev}/${idx + 1}?font=${font}`}
                className={`px-2 py-1 text-xs border rounded shadow-sm transition-all duration-300 text-center ${
                  parseInt(chapter) === idx + 1
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {idx + 1}
              </Link>
            ))}
          </div>
        </div>

        {/* Books */}
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-gray-700 text-sm">الكتب</h3>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {oldBooks.map((bookItem) => (
              <Link
                key={bookItem.abbrev + " " + bookItem.name}
                href={`/bible/${bookItem.abbrev}/1?font=${font}`}
                className={`px-2 py-1 text-xs border rounded shadow-sm transition-all duration-300 text-center ${
                  bookItem.abbrev === abbrev
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {bookItem.name}
              </Link>
            ))}
            <hr className="my-1 border-gray-300" />
            {newBooks.map((bookItem) => (
              <Link
                key={bookItem.abbrev + " " + bookItem.name}
                href={`/bible/${bookItem.abbrev}/1?font=${font}`}
                className={`px-2 py-1 text-xs border rounded shadow-sm transition-all duration-300 text-center ${
                  bookItem.abbrev === abbrev
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {bookItem.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-4 md:mb-6 text-xs md:text-sm text-gray-500 flex items-center gap-2">
          <Link href="/bible" className="hover:text-blue-600 transition-colors">
            الكتاب المقدس
          </Link>
          /
          <Link href={`/bible/${abbrev}`} className="hover:text-blue-600 transition-colors">
            {bookName}
          </Link>
          / <span className="text-gray-700">إصحاح {chapter}</span>
        </div>

        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 text-center text-gray-800">
          {bookName} - إصحاح {chapter}
        </h1>

        {/* Font Size */}
        <div className="flex gap-2 md:gap-3 text-xs md:text-sm justify-center mb-4 md:mb-6">
          <span className="font-medium">حجم الخط:</span>
          <Link
            href={`?font=sm`}
            className={`px-2 md:px-3 py-1 border rounded-lg shadow-sm transition-all duration-300 ${
              font === "sm"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white hover:bg-gray-100 border-gray-300"
            }`}
          >
            A-
          </Link>
          <Link
            href={`?font=base`}
            className={`px-2 md:px-3 py-1 border rounded-lg shadow-sm transition-all duration-300 ${
              font === "base"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white hover:bg-gray-100 border-gray-300"
            }`}
          >
            A
          </Link>
          <Link
            href={`?font=lg`}
            className={`px-2 md:px-3 py-1 border rounded-lg shadow-sm transition-all duration-300 ${
              font === "lg"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white hover:bg-gray-100 border-gray-300"
            }`}
          >
            A+
          </Link>
        </div>

        {/* الآيات */}
        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
          {verses.map((verse: string, idx: number) => (
            <p key={idx} className={`${fontSizeClass} leading-relaxed text-gray-800`}>
              <strong className="text-blue-600 text-base md:text-lg">{idx + 1}</strong> - {verse}
            </p>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 md:mt-8 flex justify-between items-center">
          {chapterIndex > 0 && (
            <Link
              href={`/bible/${abbrev}/${chapterIndex}?font=${font}`}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm md:text-base"
            >
              ← السابق
            </Link>
          )}
          <div></div> {/* Spacer */}
          {chapterIndex < book.chapters.length - 1 && (
            <Link
              href={`/bible/${abbrev}/${chapterIndex + 2}?font=${font}`}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-sm md:text-base"
            >
              التالي →
            </Link>
          )}
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
      <div className="background-blur"></div>
    </div>
  );
}
