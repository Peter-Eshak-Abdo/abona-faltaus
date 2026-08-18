export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // حماية الـ API
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    let { data: poolEntry, error: poolError } = await supabase
      .from("daily_verses_pool")
      .select("id, verse_id")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    if (poolError || !poolEntry) {
      console.warn("[daily-verse] Pool empty, resetting...");
      // تصفير الجدول بالكامل
      const { error: resetError } = await supabase
        .from("daily_verses_pool")
        .update({ used_date: null })
        .gte("id", 1);
      // .not("id", "is", null); // شرط وهمي لتحديث كل الصفوف

      if (resetError)
        throw new Error("Failed to reset pool: " + resetError.message);

      // المحاولة مرة تانية بعد التصفير
      const { data: retryEntry, error: retryError } = await supabase
        .from("daily_verses_pool")
        .select("id, verse_id")
        .is("used_date", null)
        .limit(1)
        .maybeSingle();

      if (retryError || !retryEntry) {
        throw new Error(
          `Pool is still empty after reset. Check if table has rows!`,
        );
      }
      poolEntry = retryEntry;

      // return NextResponse.json({message: "No fresh verses left in the pool!"});
    }

    if (!poolEntry) throw new Error("Database is completely empty!");

    // جلب تفاصيل الآية نفسها
    const { data: verse, error: verseError } = await supabase
      .from("bible_verses")
      .select("vocalized_text, book_name, chapter_number, verse_number")
      .eq("id", poolEntry.verse_id)
      .single();

    if (verseError || !verse) throw new Error("Verse details not found");

    const DB_TO_ARABIC: Record<string, string> = {
      "01-Genesis": "التكوين",
      "02-Exodus": "الخروج",
      "03-Leviticus": "اللاويين",
      "04-Numbers": "العدد",
      "05-Deuteronomy": "التثنية",
      "06-Joshua": "يشوع",
      "07-Judges": "القضاة",
      "08-Ruth": "راعوث",
      "09-1-Samuel": "صموئيل الأول",
      "10-2-Samuel": "صموئيل الثاني",
      "11-1-Kings": "الملوك الأول",
      "12-2-Kings": "الملوك الثاني",
      "13-1-Chronicles": "أخبار الأيام الأول",
      "14-2-Chronicles": "أخبار الأيام الثاني",
      "15-Ezra": "عزرا",
      "16-Nehmiah": "نحميا",
      "17-tobit__deu": "طوبيا",
      "18-judith__deu": "يهوديت",
      "19-1-Esther": "أستير",
      "19-2-esther-the-rest__deu": "تتمة أستير",
      "20-Job": "أيوب",
      "21-1-Psalms": "المزامير",
      "21-2-Psalm-151__Deu": "مزمور 151",
      "22-Proverbs": "الأمثال",
      "23-Ecclesiastes": "الجامعة",
      "24-Song-of-Songs": "نشيد الأنشاد",
      "25-wisdom__deu": "الحكمة",
      "26-sirach__deu": "يشوع بن سيراخ",
      "27-Isiah": "إشعياء",
      "28-Jeremiah": "إرميا",
      "29-Lamentations": "مراثي إرميا",
      "30-baruch__deu": "باروخ",
      "31-Ezekiel": "حزقيال",
      "32-1-Daniel": "دانيال",
      "32-2-daniel-the-rest__deu": "تتمة دانيال",
      "33-Hosea": "هوشع",
      "34-Joel": "يوئيل",
      "35-Amos": "عاموس",
      "36-Obadiah": "عوبديا",
      "37-Jonah": "يونان",
      "38-Micah": "ميخا",
      "39-Nahum": "ناحوم",
      "40-Habakuk": "حبقوق",
      "41-Zephaniah": "صفنيا",
      "42-Haggai": "حجي",
      "43-Zechariah": "زكريا",
      "44-Malachi": "ملاخي",
      "45-first-maccabees__deu": "المكابيين الأول",
      "46-second-maccabees__deu": "المكابيين الثاني",
      "47-Matthew": "إنجيل متى",
      "48-Mark": "إنجيل مرقس",
      "49-Luke": "إنجيل لوقا",
      "50-John": "إنجيل يوحنا",
      "51-Acts": "أعمال الرسل",
      "52-Romans": "رسالة رومية",
      "53-1-Corinthians": "رسالة كورنثوس الأولى",
      "54-2-Corinthians": "رسالة كورنثوس الثانية",
      "55-Galatians": "رسالة غلاطية",
      "56-Ephesians": "رسالة أفسس",
      "57-Philipians": "رسالة فيلبي",
      "58-Colossians": "رسالة كولوسي",
      "59-1-thessalonians": "رسالة تسالونيكي الأولى",
      "60-2-thessalonians": "رسالة تسالونيكي الثانية",
      "61-1-Timothy": "رسالة تيموثاوس الأولى",
      "62-2-Timothy": "رسالة تيموثاوس الثانية",
      "63-Titus": "رسالة تيطس",
      "64-Phillemon": "رسالة فليمون",
      "65-Hebrews": "رسالة عبرانيين",
      "66-James": "رسالة يعقوب",
      "67-1-Peter": "رسالة بطرس الأولى",
      "68-2-Peter": "رسالة بطرس الثانية",
      "69-1-John": "رسالة يوحنا الأولى",
      "70-2-John": "رسالة يوحنا الثانية",
      "71-3-John": "رسالة يوحنا الثالثة",
      "72-Jude": "رسالة يهوذا",
      "73-Revelation": "سفر الرؤيا",
    };

    const arabicBookName =
      DB_TO_ARABIC[verse.book_name] || verse.book_name.replace(/^\d+-/, "");
    const reference = `(${arabicBookName} ${verse.chapter_number} : ${verse.verse_number})`;
    const notificationTitle = "آية اليوم";
    const notificationBody = `(${verse.verse_number}) ${verse.vocalized_text}\n${reference}`;

    const bookNumberMatch = verse.book_name.match(/^(\d+)/);
    const bIdx = bookNumberMatch ? parseInt(bookNumberMatch[1], 10) - 1 : 0;
    const cIdx = verse.chapter_number - 1;
    const vNum = verse.verse_number;

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json({ error: "Missing API Keys" }, { status: 500 });
    }

    // إرسال الإشعار
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
        url:
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://abona-faltaus.vercel.app",
        chrome_web_icon:
          "https://abona-faltaus.vercel.app/_next/image?url=%2Fimages%2Flogo.webp&w=640&q=75",
        web_buttons: [
          {
            id: "save-fav",
            text: "❤️ حفظ في المفضلة",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://abona-faltaus.vercel.app"}/api/add-fav-from-notification?bIdx=${bIdx}&cIdx=${cIdx}&vNum=${vNum}`,
            // url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/add-fav-from-notification?book=${cleanBookName}&chapter=${verse.chapter_number}&verse=${verse.verse_number}`,
          },
        ],
      }),
    });

    const result = await response.json();

    // تحديث حالة الآية في الـ Pool عشان متتبعتش تاني
    if (response.ok) {
      await supabase
        .from("daily_verses_pool")
        .update({ used_date: new Date().toISOString().split("T")[0] })
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
