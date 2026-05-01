import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // التأكد من وجود الـ Secret Key في الـ Headers
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient({ cookies });
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    // جلب التقييمات الجديدة
    const { data: reviews, error } = await supabase
      .from("feedback")
      .select("id")
      .gt("created_at", last24Hours);

    if (error) throw error;

    if (reviews && reviews.length > 0) {
      // إرسال عبر OneSignal
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          included_segments: ["All"],
          headings: { ar: "تقييمات جديدة" },
          contents: {
            ar: `لديك ${reviews.length} تقييمات جديدة لم يتم الرد عليها.`,
          },
        }),
      });
      return NextResponse.json({ sent: true, count: reviews.length });
    }

    return NextResponse.json({ sent: false, message: "No new reviews" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
