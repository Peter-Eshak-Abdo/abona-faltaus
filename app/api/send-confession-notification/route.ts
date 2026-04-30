import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const authHeader = (await headers()).get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const confessionMessages = [
    "«يا ابني اعطني قلبك».. لا تنسَ موعدك مع أب اعترافك هذا الشهر لتجديد قلبك.",
    "الاعتراف هو غسل للنفس.. حدد موعداً مع أب اعترافك لتنال الحل والراحة.",
    "فرصة جديدة للبداية.. لا تؤجل اعترافك الدوري، مسيحنا ينتظرك.",
  ];

  const randomMessage =
    confessionMessages[Math.floor(Math.random() * confessionMessages.length)];

  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: "تذكير بالاعتراف", ar: "تذكير بالاعتراف" },
        contents: { en: randomMessage, ar: randomMessage },
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send confession notification" }, { status: 500 });
  }
}
