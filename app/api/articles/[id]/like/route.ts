import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    requireAuth(user);

    // التحقق من وجود إعجاب سابق (Toggle Like)
    const { data: existing, error: checkError } = await supabase
      .from("article_likes")
      .select("article_id")
      .eq("article_id", id)
      .eq("user_id", user!.id)
      .maybeSingle();

    if (checkError) {
      throw new Error(checkError.message);
    }

    if (existing) {
      // إزالة الإعجاب
      await supabase
        .from("article_likes")
        .delete()
        .eq("article_id", id)
        .eq("user_id", user!.id);

      await supabase.rpc("decrement_article_likes", { article_id: id });
      return NextResponse.json({ liked: false });
    } else {
      // إضافة الإعجاب
      await supabase
        .from("article_likes")
        .insert({ article_id: id, user_id: user!.id });

      await supabase.rpc("increment_article_likes", { article_id: id });
      return NextResponse.json({ liked: true });
    }
  });
}
