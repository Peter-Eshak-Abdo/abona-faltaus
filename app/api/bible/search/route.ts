import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withErrorHandling, apiError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!q.trim()) {
      return NextResponse.json({ verses: [], total: 0 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return apiError("Supabase configuration missing", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // استدعاء دالة البحث في الكتاب المقدس
    const { data, error } = await supabase.rpc("search_bible_verses", {
      search_query: q.trim(),
      match_limit: limit,
      match_offset: offset,
    });

    if (error) {
      // Fallback في حالة عدم وجود الـ RPC
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("bible_verses")
        .select("id, book_name, chapter_number, verse_number, vocalized_text")
        .ilike("vocalized_text", `%${q.trim()}%`)
        .range(offset, offset + limit - 1);

      if (fallbackError) {
        return apiError("Failed to search Bible verses", 500);
      }

      return NextResponse.json({ verses: fallbackData || [] });
    }

    return NextResponse.json({ verses: data || [] });
  });
}
