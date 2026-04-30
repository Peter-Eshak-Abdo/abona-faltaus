import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const authHeader = (await headers()).get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hour = new Date().getUTCHours() + 2; // لتوقيت مصر

  const message =
    hour > 12
      ? {
          title: "استعداد للقداس",
          body: "ينبغي لنا أن نستعد للتناول بالصوم والتوبة.. نلتقي في القداس غداً ✨",
        }
      : {
          title: "صباح البركة",
          body: "يوم جديد مع المسيح.. حان وقت الذهاب للقداس والتناول من الأسرار المقدسة 🍞🍷",
        };

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"], 
        headings: { en: message.title, ar: message.title },
        contents: { en: message.body, ar: message.body },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
