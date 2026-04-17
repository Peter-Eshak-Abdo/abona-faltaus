import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // التأمين (Security Check)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // جلب قول واحد غير مستخدم (used_date is NULL)
    let { data: quoteEntry, error: quoteError } = await supabase
      .from("fathers_quotes")
      .select("id, author, quote")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    if (!quoteEntry || quoteError) {
      console.log("الخزان فِضي! بنصفر البيانات دلوقتي...");

      // تصفير الجدول بالكامل
      await supabase
        .from("fathers_quotes")
        .update({ used_date: new Date().toISOString().split("T")[0] })
        .neq("id", 0); // شرط وهمي لتحديث كل الصفوف

      // المحاولة مرة تانية بعد التصفير
      const { data: retryEntry } = await supabase
        .from("fathers_quotes")
        .select("id, author, quote")
        .is("used_date", null)
        .limit(1)
        .maybeSingle();

      quoteEntry = retryEntry;

      // return NextResponse.json({ message: "No unused quotes left!" });
    }

    if (!quoteEntry) throw new Error("Database is completely empty!");

    const message = `☦️ ${quoteEntry.quote}\n👤 ${quoteEntry.author}`;

    // إرسال الإشعار لـ OneSignal
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
            en: message,
            ar: message,
          },
          url:
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://abona-faltaus.vercel.app",
          chrome_web_icon:
            "https://abona-faltaus.vercel.app/_next/image?url=%2Fimages%2Flogo.webp&w=640&q=75",
        }),
      },
    );

    const osData = await osResponse.json();

    // تحديث حالة القول كأنه "استُخدم" عشان ميتكررش
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
