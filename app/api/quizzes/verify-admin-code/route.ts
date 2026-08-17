import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api-helpers";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const quizId = searchParams.get("quizId");

    if (!code || !quizId) {
      return NextResponse.json(
        { valid: false, error: "Missing required parameters: code, quizId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("id", quizId)
      .eq("admin_code", code.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({ valid: true, quiz: data });
  });
}
