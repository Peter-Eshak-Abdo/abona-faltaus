import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { requireAdmin, withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // التحقق من صلاحية الأدمن
    requireAdmin(user);

    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  });
}
