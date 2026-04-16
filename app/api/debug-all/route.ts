import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const report: any = {
    supabase_test: {},
    onesignal_test: {},
    content_test: {},
  };

  try {
    // 1. اختبار قاعدة البيانات
    const { count: quotesCount } = await supabase
      .from("fathers_quotes")
      .select("*", { count: "exact", head: true });

    const { count: unusedQuotes } = await supabase
      .from("fathers_quotes")
      .select("*", { count: "exact", head: true })
      .is("used_date", null);

    report.supabase_test = {
      total_quotes: quotesCount || 0,
      unused_quotes: unusedQuotes || 0,
      sample_quote: unusedQuotes ? await supabase.from("fathers_quotes").select("quote").is("used_date", null).limit(1).maybeSingle() : null,
    };

    // 2. اختبار سحب البيانات الصحيحة
    const { data: testQuote } = await supabase
      .from("fathers_quotes")
      .select("quote")
      .limit(1)
      .maybeSingle();
    const { data: testVerse } = await supabase
      .from("bible_verses")
      .select("vocalized_text")
      .limit(1)
      .maybeSingle();

    report.content_test = {
      quote_retrieved: !!testQuote,
      verse_retrieved: !!testVerse,
      sample_verse: testVerse?.vocalized_text || "N/A",
    };

    // 3. اختبار وان سيجنال النظيف (بدون أندرويد)
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
          contents: {
            ar: "هذا إشعار تجريبي من السيرفر 🔔",
            en: "This is a test notification from the server 🔔",
          },
          headings: { ar: "نجاح الاختبار", en: "Test Success" },
        }),
      },
    );

    const osData = await osResponse.json();
    report.onesignal_test = {
      status_code: osResponse.status,
      os_response: osData,
    };

    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
