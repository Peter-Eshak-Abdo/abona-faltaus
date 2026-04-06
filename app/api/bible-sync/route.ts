import { NextResponse } from "next/server";
import { loadBible } from "@/lib/bible-utils";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("bible_verses") // اسم الجدول عندك
    .select("*")
    .order("id", { ascending: true }); // التأكد من الترتيب حسب الـ ID الأصلي

  if (error) return Response.json({ error: error.message });

  // const books: loadBible[] = [];
  const books = await loadBible();
  let currentBookName = "";
  let currentChapterNum = -1;

  data.forEach((row: { book_name: string; book_display_name: any; chapter_number: number; verse_number: any; text_plain: any; text_vocalized: any; }) => {
    // 1. فحص هل السفر تغير؟ (هنا بنعتمد على الاسم الكامل لضمان فصل 19-1 عن 19-2)
    if (row.book_name !== currentBookName) {
      currentBookName = row.book_name;
      books.push({
        abbrev: row.book_name, // أو الـ abbrev لو عندك
        name: row.book_display_name || row.book_name, // الاسم اللي بيظهر للمستخدم
        chapters: [],
      });
      currentChapterNum = -1; // إعادة تصغير العداد للسفر الجديد
    }

    const lastBook = books[books.length - 1];

    // 2. فحص هل الأصحاح تغير؟
    // ملحوظة: بنستخدم رقم الأصحاح الفعلي من الداتا مش الـ Index
    if (row.chapter_number !== currentChapterNum) {
      currentChapterNum = row.chapter_number;
      lastBook.chapters.push([]); // إضافة مصفوفة جديدة للأصحاح الجديد
    }

    const lastChapter = lastBook.chapters[lastBook.chapters.length - 1];

    // 3. إضافة الآية للأصحاح
    lastChapter.push({
      verse: row.verse_number,
      text_plain: row.text_plain,
      text_vocalized: row.text_vocalized,
    });
  });

  return Response.json(books);
}
