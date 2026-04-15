import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. حماية الـ API أولاً
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. جلب آية عشوائية من "مجموعة مختارة" (لو ضفت الـ Column)
    // أو جلب عشوائي من الكل حالياً
    const randomId = Math.floor(Math.random() * 35797) + 1;
    const { data: verse, error } = await supabase
      .from("bible_verses")
      .select("vocalized_text, book_name, chapter_number, verse_number")
      .eq("id", randomId)
      .single();

    if (error || !verse) throw new Error("Verse not found");

    const cleanBookName = verse.book_name.replace(/^\d+-/, "");
    const reference = `(${cleanBookName} ${verse.chapter_number}:${verse.verse_number})`;
    const notificationTitle = "آية اليوم";
    const notificationBody = `${verse.vocalized_text} ${reference}`;

    // 3. إرسال الإشعار - تأكد من أسماء المتغيرات هنا
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json({ error: "Missing API Keys" }, { status: 500 });
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Total Subscriptions"], // "Subscribed Users" أحياناً بتعمل مشاكل، دي أضمن
        headings: { en: notificationTitle, ar: notificationTitle },
        contents: { en: notificationBody, ar: notificationBody },
        web_buttons: [
          {
            id: "save-fav",
            text: "❤️ حفظ في المفضلة",
            icon: "رابط_صورة_قلب_صغيرة_لو_تحب.png",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/add-fav-from-notification?bIdx=${verse.book_idx}&cIdx=${verse.chapter_idx}&vNum=${verse.verse_number}`,
          },
        ],
      }),
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
