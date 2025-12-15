import { loadBible } from "@/lib/bible-utils";
import ClientChapterViewer from "@/components/ChapterViewerClient";
import { bookNames, oldTestament, newTestament } from "@/lib/books";

export async function generateStaticParams() {
  const bible = await loadBible();
  const params: { abbrev: string; chapter: string }[] = [];
  for (const book of bible) {
    for (let i = 0; i < (book.chapters || []).length; i++) {
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
    title: `${bookName} - إصحاح ${chapter} | الكتاب المقدس تفاحة `,
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
  const awaitedSearchParams = await searchParams;
  const font = awaitedSearchParams?.font || "base";

  const bible = await loadBible();
  const book = bible.find((b) => b.abbrev === abbrev);
  if (!book) return <div>❌ لم يتم العثور على السفر</div>;

  const chapterIndex = parseInt(chapter, 10) - 1;
  const verses = book.chapters[chapterIndex];
  if (!verses) return <div>❌ لم يتم العثور على الإصحاح</div>;

  const bookName = bookNames[abbrev as keyof typeof bookNames] || book.name || `سفر ${abbrev.toUpperCase()}`;

  return (
    <div className="min-h-screen flex animate-fade-in">
      <ClientChapterViewer
        abbrev={abbrev}
        bookName={bookName}
        chapter={parseInt(chapter, 10)}
        verses={verses}
        font={font}
        oldTestament={oldTestament}
        newTestament={newTestament}
        bookNames={bookNames}
        chaptersCount={book.chapters.length}
      />
    </div>
  );
}
