import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const results = {
    supabase_connection: false,
    bible_table_count: 0,
    error: null as any,
  };

  try {
    // اختبار الاتصال بجدول الكتاب المقدس
    const { count, error } = await supabase
      .from("bible_verses")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    results.supabase_connection = true;
    results.bible_table_count = count || 0;
  } catch (err: any) {
    results.error = err.message;
  }

  return NextResponse.json(results);
}
