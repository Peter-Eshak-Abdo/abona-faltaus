import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. التأمين (Security Check)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. جلب قول واحد غير مستخدم (used_date is NULL)
    const { data: quoteEntry, error: qError } = await supabase
      .from("fathers_quotes")
      .select("id, author, quote")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    if (!quoteEntry) {
      return NextResponse.json({ message: "No unused quotes left!" });
    }

    const message = `☦️ ${quoteEntry.quote}\n👤 ${quoteEntry.author}`;

    // 3. إرسال الإشعار لـ OneSignal (مع إضافة مفتاح en لتجنب الخطأ)
    const osResponse = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          included_segments: ["Total Subscriptions"],
          headings: {
            en: "Father's Quote",
            ar: "قول اليوم من الآباء",
          },
          contents: {
            en: message, // حطينا الرسالة هنا كمان عشان وان سيجنال يقبل
            ar: message,
          },
        }),
      },
    );

    const osData = await osResponse.json();

    // 4. تحديث حالة القول كأنه "استُخدم" عشان ميتكررش
    if (osResponse.ok) {
      await supabase
        .from("fathers_quotes")
        .update({ used_date: new Date().toISOString() })
        .eq("id", quoteEntry.id);
    }

    return NextResponse.json({ success: true, osData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
