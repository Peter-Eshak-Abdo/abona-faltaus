import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
// لو هتجيب الآية من Supabase هتعمل Import للـ Client بتاعك هنا

export async function GET(request: Request) {
  const randomId = Math.floor(Math.random() * 35797) + 1;
  const { data, error } = await supabase
    .from("bible_verses")
    .select("vocalized_text, book_name, chapter_number, verse_number")
    .eq("id", randomId)
    .single();

  if (error || !data) {
    return new NextResponse("Error fetching verse", { status: 500 });
  }
  const cleanBookName = data.book_name.replace(/^\d+-/, "");
  const reference = `(${cleanBookName} ${data.chapter_number}:${data.verse_number})`;
  const notificationTitle = "آية اليوم";
  const notificationBody = `${data.vocalized_text}\n${reference}`;

  // 1. حماية الـ API عشان محدش يفتحه من بره ويبعت إشعارات للناس
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. هات الآية من قاعدة البيانات (Supabase)
  // const { data } = await supabase.from('verses').select('*').limit(1);
  const dailyVerse = "هنا نص الآية اللي المفروض يتبعت";

  // 3. إرسال الإشعار عن طريق OneSignal API
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"], // بيبعت لكل الناس اللي وافقت على الإشعارات
      headings: { en: notificationTitle, ar: notificationTitle },
      contents: { en: notificationBody, ar: notificationBody },
    }),
  };

  try {
    const res = await fetch(
      "https://onesignal.com/api/v1/notifications",
      options,
    );
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
