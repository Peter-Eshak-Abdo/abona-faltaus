import { NextResponse } from "next/server";
import { loadBible } from "@/lib/bible-utils";

export async function GET() {
  try {
    // هنستدعي الدالة اللي لسه معدلينها واللي بتجيب البيانات من Supabase
    const bibleData = await loadBible();

    // هنبعت البيانات كـ JSON للاستجابة
    return NextResponse.json(bibleData);
  } catch (error) {
    return NextResponse.json({ error: "فشل جلب البيانات" }, { status: 500 });
  }
}
