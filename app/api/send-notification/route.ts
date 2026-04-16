// import { NextRequest, NextResponse } from 'next/server';
// import { sendDailyVerseNotification } from '@/lib/onesignal';

// export async function POST(request: NextRequest) {
//   try {
//     const { externalUserId } = await request.json();

//     if (!externalUserId) {
//       return NextResponse.json(
//         { error: 'externalUserId is required' },
//         { status: 400 }
//       );
//     }

//     // Send daily verse notification
//     await sendDailyVerseNotification(externalUserId);

//     return NextResponse.json({
//       success: true,
//       message: 'Notification sent successfully'
//     });
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     return NextResponse.json(
//       { error: 'Failed to send notification' },
//       { status: 500 }
//     );
//   }
// }

// import { NextResponse } from "next/server";

// export async function GET() {
//   return NextResponse.json({ message: "Cron is temporarily disabled" });
// }

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    // 1. تجربة جلب قول أباء (بدون علاقات معقدة)
    const { data: quote, error: qError } = await supabase
      .from("fathers_quotes")
      .select("*")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    console.log("Quote found:", quote);

    // 2. تجربة جلب آية
    const { data: poolRow } = await supabase
      .from("daily_verses_pool")
      .select("id, verse_id")
      .is("used_date", null)
      .limit(1)
      .maybeSingle();

    let verseData = null;
    if (poolRow) {
      const { data: v } = await supabase
        .from("bible_verses")
        .select("*")
        .eq("id", poolRow.verse_id)
        .single();
      verseData = v;
    }

    console.log("Verse found:", verseData);

    if (!quote && !verseData) {
      return NextResponse.json({
        message: "Empty Database or all marked as used",
      });
    }

    // إرسال الإشعار
    const message = `☦️ ${quote?.quote || ""}\n📖 ${verseData?.text_vocalized || ""}`;

    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["Total Subscriptions"],
        contents: { ar: message },
        headings: { ar: "رسالة سماوية" },
      }),
    });

    return NextResponse.json(await res.json());
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
