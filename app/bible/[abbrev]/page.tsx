import { loadBible } from "@/lib/bible-utils";
import Link from "next/link";
import { bookNames } from "@/lib/books";
export async function generateStaticParams() {
  const bible = await loadBible();
  return bible.map((book) => ({
    abbrev: book.abbrev,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ abbrev: string }> }) {
  const { abbrev } = await params;
  const bookName = bookNames[abbrev as keyof typeof bookNames] || `سفر ${abbrev.toUpperCase()}`;
  return {
    title: `${bookName} - الكتاب المقدس تفاحة `,
    description: `قراءة ${bookName} من الكتاب المقدس مع تقسيم الإصحاحات.`,
    keywords: [bookName, "الكتاب المقدس", "أسفار", "قراءة الإنجيل"],
  };
}

export default async function BookPage({ params }: { params: Promise<{ abbrev: string }> }) {
  const { abbrev } = await params;
  const bible = await loadBible();
  const book = bible.find((b) => b.abbrev === abbrev);
  const bookName = bookNames[abbrev as keyof typeof bookNames] || book?.name || `سفر ${abbrev.toUpperCase()}`;

  if (!book) return <div className="p-1 text-red-600">❌ لم يتم العثور على السفر</div>;

  return (
    <div className="p-1">
      <h1 className="text-3xl font-bold mb-1 text-center text-gray-800">{bookName}</h1>
      <p className="mb-1 text-center text-lg text-gray-600">عدد الإصحاحات: {book.chapters.length}</p>
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1">
        {book.chapters.map((_, idx) => (
          <Link
            key={idx}
            href={`/bible/${abbrev}/${idx + 1}`}
            className="bg-white/10 backdrop-blur-md text-white text-center p-1 rounded-lg shadow-xl/30 inset-shadow-sm border-gray-300 hover:border-indigo-500 shadow-md hover:shadow-xl/10 transition-all duration-300 transform hover:scale-105 font-bold"
          >
            إصحاح {idx + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
