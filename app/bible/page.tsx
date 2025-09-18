import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames, oldTestament, newTestament } from "@/lib/books";

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://abona-faltaus.vercel.app";

export const metadata = {
  title: "الكتاب المقدس تفاحة",
  description: "الكتاب المقدس - العهد القديم والعهد الجديد",
  keywords:
    "الكتاب المقدس, العهد القديم, العهد الجديد تكوين, سفر التكوين, سفر الخروج, سفر اللاويين, سفر العدد, سفر التثنية, سفر يشوع, سفر القضاة, سفر راعوث, سفر صموئيل الأول, سفر صموئيل الثاني, سفر الملوك الأول, سفر الملوك الثاني, سفر أخبار الأيام الأول, سفر أخبار الأيام الثاني, سفر عزرا, سفر نحميا, سفر استير, سفر أيوب, سفر المزامير, سفر الأمثال, سفر الجامعة, نشيد الأنشاد, سفر إشعياء, سفر إرميا, مراثي إرميا, سفر حزقيال, سفر دانيال, هوشع, يوئيل, عاموس, عوبديا, يونان, ميخا, ناحوم, حبقوق, صفنيا, حجي, زكريا, ملاخي متى, مرقس, لوقا, يوحنا, أعمال الرسل, رومية, كورنثوس الأولى, كورنثوس الثانية, غلاطية, أفسس, فيلبي, كولوسي, تسالونيكي الأولى, تسالونيكي الثانية, تيموثاوس الأولى, تيموثاوس الثانية, تيطس, فليمون, عبرانيين, يعقوب, بطرس الأولى, بطرس الثانية, يوحنا الأولى, يوحنا الثانية, يوحنا الثالثة, يهوذا",
};

export default async function BibleHomePage() {
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible: { abbrev: string }[] = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  const getBooks = (abbrevs: string[]) =>
    abbrevs
      .map((abbr) => {
        const book = bible.find((b) => b.abbrev === abbr);
        if (!book) {
          console.warn(`Book ${abbr} not found in JSON file`);
          return null;
        }
        return { abbrev: abbr, name: (bookNames as Record<string, string>)[abbr] || abbr };
      })
      .filter((book): book is { abbrev: string, name: string } => book !== null);

  const oldBooks = getBooks(oldTestament);
  const newBooks = getBooks(newTestament);

  return (
    <div className="space-y-8 m-4 animate-fade-in">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">الكتاب المقدس</h1>
      <section className="animate-slide-up">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">العهد القديم</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {oldBooks.map((book, index) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center font-medium text-right block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-2xl font-semibold mb-4 text-green-700">العهد الجديد</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newBooks.map((book, index) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center font-medium text-right block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
      <div className="background-blur"></div>
    </div>
  );
}
