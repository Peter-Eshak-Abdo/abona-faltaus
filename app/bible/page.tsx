import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames, oldTestament, newTestament } from "@/lib/books";

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
    <div className="m-1">
      <h1 className="text-4xl font-bold text-center text-gray-800">الكتاب المقدس</h1>
      <div className="mb-1">
        <h2 className="text-2xl font-semibold mb-1">العهد القديم</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
          {oldBooks.map((book, index) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className=" bg-white/10 backdrop-blur-md text-white p-1 rounded-lg shadow-xl/30 inset-shadow-sm hover:shadow-xl/0 transition-all duration-300 transform hover:scale-105 text-center font-bold"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {book.name}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-1">العهد الجديد</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
          {newBooks.map((book, index) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-white/10 backdrop-blur-md text-white p-1 rounded-lg shadow-xl/30 inset-shadow-sm hover:shadow-xl/0 transition-all duration-300 transform hover:scale-105 text-center font-bold"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {book.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
