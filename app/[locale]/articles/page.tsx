import { Metadata } from "next";
import ArticlesClient from "./ArticlesClient";

export const metadata: Metadata = {
  title: "المقالات الروحية والكنسية - أبونا فلتاؤس تفاحة",
  description: "مقالات ودراسات روحية وطقسية وعقائدية في الإيمان المسيحي الأرثوذكسي وتاريخ الكنيسة.",
  keywords: ["مقالات مسيحية", "دراسات أرثوذكسية", "طقوس الكنيسة", "أبونا فلتاؤس", "عقيدة وتاريخ"],
};

export default function ArticlesPage() {
  return (
    <main className="min-h-screen py-1 px-0.5 md:px-1 max-w-6xl mx-auto">
      <div className="text-center mb-0.5">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-600 via-orange-500 to-yellow-600 mb-0.5 drop-shadow-sm">
          المقالات الروحية والكنسية
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          تأملات، دراسات عقائدية، وسير آبائية لإثراء المعرفة الروحية والكنسية
        </p>
      </div>

      <ArticlesClient />
    </main>
  );
}
