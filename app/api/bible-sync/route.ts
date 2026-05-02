// app/api/bible-sync/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. جلب كافة الآيات مرتبة لضمان بناء الهيكل بشكل صحيح
    const { data, error } = await supabase
      .from("bible_verses")
      .select(
        "book_name, book_display_name, chapter_number, verse_number, text_plain, text_vocalized",
      )
      .order("id", { ascending: true }); // أو الترتيب حسب ترتيب الأسفار إذا كان لديك عمود لذلك

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 });
    }

    // 2. معالجة البيانات لتحويلها من "صفوف" إلى "هيكل أسفار وإصحاحات"
    const books: any[] = [];
    let currentBookName = "";
    let currentChapterNum = -1;

    data.forEach((row: { book_name: string; book_display_name: any; chapter_number: number; verse_number: any; text_plain: any; text_vocalized: any; }) => {
      // إذا تغير السفر، ننشئ كائن سفر جديد
      if (row.book_name !== currentBookName) {
        currentBookName = row.book_name;
        books.push({
          abbrev: row.book_name,
          name: row.book_display_name || row.book_name,
          chapters: [],
        });
        currentChapterNum = -1; // إعادة تعيين العداد للسفر الجديد
      }

      const lastBook = books[books.length - 1];

      // إذا تغير الإصحاح داخل السفر، ننشئ مصفوفة إصحاح جديدة
      if (row.chapter_number !== currentChapterNum) {
        currentChapterNum = row.chapter_number;
        lastBook.chapters.push([]);
      }

      const lastChapter = lastBook.chapters[lastBook.chapters.length - 1];

      // إضافة الآية للإصحاح الحالي
      lastChapter.push({
        verse: row.verse_number,
        text_plain: row.text_plain,
        text_vocalized: row.text_vocalized,
      });
    });

    // 3. إرسال البيانات النهائية المرتبة
    // استخدمنا NextResponse لضبط الرؤوس (Headers) بشكل أفضل
    return NextResponse.json(books, {
      headers: {
        "Cache-Control": "public, max-age=86400", // تخزين مؤقت على السيرفر لمدة يوم
      },
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
