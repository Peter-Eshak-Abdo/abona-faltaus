import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import { bookNames, oldTestament, newTestament } from "@/lib/books";

export const metadata = {
  metadataBase: new URL("https://abona-faltaus.vercel.app"),
  title: "الكتاب المقدس تفاحة",
  description: "الكتاب المقدس - العهد القديم والعهد الجديد",
  keywords:
    "الكتاب المقدس, العهد القديم, العهد الجديد تكوين, سفر التكوين, سفر الخروج, سفر اللاويين, سفر العدد, سفر التثنية, سفر يشوع, سفر القضاة, سفر راعوث, سفر صموئيل الأول, سفر صموئيل الثاني, سفر الملوك الأول, سفر الملوك الثاني, سفر أخبار الأيام الأول, سفر أخبار الأيام الثاني, سفر عزرا, سفر نحميا, سفر استير, سفر أيوب, سفر المزامير, سفر الأمثال, سفر الجامعة, نشيد الأنشاد, سفر إشعياء, سفر إرميا, مراثي إرميا, سفر حزقيال, سفر دانيال, هوشع, يوئيل, عاموس, عوبديا, يونان, ميخا, ناحوم, حبقوق, صفنيا, حجي, زكريا, ملاخي متى, مرقس, لوقا, يوحنا, أعمال الرسل, رومية, كورنثوس الأولى, كورنثوس الثانية, غلاطية, أفسس, فيلبي, كولوسي, تسالونيكي الأولى, تسالونيكي الثانية, تيموثاوس الأولى, تيموثاوس الثانية, تيطس, فليمون, عبرانيين, يعقوب, بطرس الأولى, بطرس الثانية, يوحنا الأولى, يوحنا الثانية, يوحنا الثالثة, يهوذا",
};

export default async function BibleHomePage() {
  const filePath = path.join(process.cwd(), "public", "ar_svd.json");
  const fileData = await fs.readFile(filePath, "utf-8");
  const bible = JSON.parse(fileData.replace(/^\uFEFF/, ""));

  const getBooks = (abbrevs) =>
    abbrevs
      .map((abbr) => {
        const book = bible.find((b) => b.abbrev === abbr);
        if (!book) return console.warn(`Book ${abbr} not found in JSON file`);
        return { abbrev: abbr, name: bookNames[abbr] || abbr };
      })
      .filter(Boolean);

  const oldBooks = getBooks(oldTestament);
  const newBooks = getBooks(newTestament);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">الكتاب المقدس</h1>
      <section>
        <h2 className="text-xl font-semibold mb-2">العهد القديم</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {oldBooks.map((book) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-800 text-right"
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">العهد الجديد</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {newBooks.map((book) => (
            <Link
              key={book.abbrev}
              href={`/bible/${book.abbrev}`}
              className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-green-800 text-right"
            >
              {book.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
