import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bIdx = searchParams.get("bIdx");
  const cIdx = searchParams.get("cIdx");
  const vNum = searchParams.get("vNum");

  // لو البيانات ناقصة، يرجعه للصفحة الرئيسية
  if (!bIdx || !cIdx || !vNum) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // التحقق من المستخدم المسجل دخول (بما إننا في الـ Server Side)
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // لو مش مسجل دخول، هنوديه لصفحة تسجيل الدخول
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // لو مسجل دخول، نحفظ الآية في جدول bible_favorites
  // بنستخدم upsert عشان لو داس مرتين ماتعملش error
  await supabase.from("bible_favorites").upsert(
    {
      user_id: session.user.id,
      book_idx: parseInt(bIdx),
      chapter_idx: parseInt(cIdx),
      verse_num: parseInt(vNum),
    },
    { onConflict: "user_id, book_idx, chapter_idx, verse_num" },
  ); // تأكد إنك عامل Unique Constraint على العواميد دي في الجدول

  // بعد ما يحفظها بنجاح، نحوله أوتوماتيك لصفحة المفضلة اللي أنت عاملها عشان يشوفها هناك
  return NextResponse.redirect(new URL("/bible/favorites", request.url));
}
