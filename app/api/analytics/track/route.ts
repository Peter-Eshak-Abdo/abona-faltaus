import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withErrorHandling, apiError } from "@/lib/api-helpers";

// Endpoint لتسجيل مشاهدات المحتوى والأحداث
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json().catch(() => null);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const { contentType, contentId, userId } = body;
    if (!contentType) {
      return apiError("contentType is required", 400);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return apiError("Supabase environment variables missing", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("content_views").insert({
      content_type: contentType,
      content_id: contentId || null,
      user_id: userId || null,
    });

    if (error) {
      console.error("Error inserting content view:", error);
      return apiError("Failed to record analytics event", 500);
    }

    return NextResponse.json({ success: true });
  });
}
