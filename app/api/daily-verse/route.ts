import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // حماية الـ API أولاً
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { data: poolEntry, error: poolError } = await supabase
      .from("daily_verses_pool")
      .select("id, verse_id")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    if (poolError || !poolEntry) {
      return NextResponse.json({
        message: "No fresh verses left in the pool!",
      });
    }
    // 2. جلب تفاصيل الآية نفسها
    const { data: verse, error: verseError } = await supabase
      .from("bible_verses")
      .select("vocalized_text, book_name, chapter_number, verse_number")
      .eq("id", poolEntry.verse_id)
      .single();

    if (verseError || !verse) throw new Error("Verse details not found");

    const cleanBookName = verse.book_name.replace(/^\d+-/, "");
    const reference = `(${cleanBookName} ${verse.chapter_number}:${verse.verse_number})`;
    const notificationTitle = "آية اليوم";
    const notificationBody = `${verse.vocalized_text} ${reference}`;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json({ error: "Missing API Keys" }, { status: 500 });
    }

    // 3. إرسال الإشعار
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Total Subscriptions"],
        headings: { en: notificationTitle, ar: notificationTitle },
        contents: { en: notificationBody, ar: notificationBody },
        web_buttons: [
          {
            id: "save-fav",
            text: "❤️ حفظ في المفضلة",
            // تم تعديل الرابط لاستخدام المتغيرات المتاحة في الاستعلام
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/add-fav-from-notification?book=${cleanBookName}&chapter=${verse.chapter_number}&verse=${verse.verse_number}`,
          },
        ],
      }),
    });

    const result = await response.json();

    // 4. تحديث حالة الآية في الـ Pool عشان متتبعتش تاني
    if (response.ok) {
      await supabase
        .from("daily_verses_pool")
        .update({ used_date: new Date().toISOString() })
        .eq("id", poolEntry.id);
    }
    
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
