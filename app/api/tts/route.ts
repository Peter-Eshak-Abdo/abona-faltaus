// app/api/tts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS } from "edge-tts-node";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID;

    // محاولة استخدام ElevenLabs أولاً
    if (elevenLabsApiKey && voiceId) {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": elevenLabsApiKey,
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_multilingual_v2",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          },
        );

        // إذا نجح ElevenLabs، قم بإرجاع الصوت
        if (response.ok) {
          return new NextResponse(response.body, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
            status: 200,
          });
        } else {
          // إذا فشل (مثل انتهاء الباقة أو خطأ 402/404)، سجل الخطأ وانتقل للـ Fallback
          const errorData = await response.json().catch(() => ({}));
          console.warn(
            "ElevenLabs failed, triggering Edge TTS fallback. Reason:",
            errorData,
          );
        }
      } catch (elevenLabsError) {
        console.warn(
          "ElevenLabs fetch error, triggering Edge TTS fallback. Reason:",
          elevenLabsError,
        );
      }
    } else {
      console.warn("ElevenLabs keys not found, using Edge TTS directly.");
    }

    // Fallback: استخدام Microsoft Edge TTS في حالة فشل ElevenLabs أو عدم وجود مفاتيح
    const tts = new MsEdgeTTS({});
    const stream = await (tts as any).synthesize(text, { voice: "ar-EG-SalmaNeural" });
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      status: 200,
    });
  } catch (error) {
    console.error(
      "Error in TTS API route (Both ElevenLabs & Edge TTS failed):",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
