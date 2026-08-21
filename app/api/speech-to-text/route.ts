import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "لم يتم استلام أي ملف صوتي" }, { status: 400 });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // 1. الخيار الأول: ElevenLabs Scribe / Speech-to-Text API
    if (elevenLabsApiKey) {
      try {
        const bodyFormData = new FormData();
        bodyFormData.append("file", audioFile, "recording.webm");
        bodyFormData.append("model_id", "scribe_v1"); // أو النموذج الصوتي العربي المتاح في ElevenLabs
        bodyFormData.append("language_code", "ara");

        const elResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
          },
          body: bodyFormData,
        });

        if (elResponse.ok) {
          const elData = await elResponse.json();
          return NextResponse.json({ text: elData.text || elData.transcript || "" });
        }
      } catch (elErr) {
        console.warn("ElevenLabs STT error, trying fallback:", elErr);
      }
    }

    // 2. الخيار البديل (Fallback): OpenAI Whisper API
    if (openaiApiKey) {
      try {
        const whisperFormData = new FormData();
        whisperFormData.append("file", audioFile, "recording.webm");
        whisperFormData.append("model", "whisper-1");
        whisperFormData.append("language", "ar");

        const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: whisperFormData,
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          return NextResponse.json({ text: whisperData.text || "" });
        }
      } catch (whisperErr) {
        console.warn("Whisper STT error:", whisperErr);
      }
    }

    // إذا لم تتوفر مفاتيح API في البيئة
    return NextResponse.json({
      error: "مفتاح API الخاص بخدمة التفريغ الصوتي (ELEVENLABS_API_KEY أو OPENAI_API_KEY) غير متاح حالياً في متغيرات البيئة.",
      requiresConfig: true,
    }, { status: 400 });

  } catch (error: any) {
    console.error("STT Error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء معالجة الصوت" }, { status: 500 });
  }
}
