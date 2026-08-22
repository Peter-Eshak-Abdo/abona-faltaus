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

    const groqApiKey = process.env.GROQ_API_KEY;
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // 1. الخيار الأول: Groq Whisper (الأسرع وأفضل دعم للعربية)
    if (groqApiKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append("file", audioFile, "recording.webm");
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("language", "ar");
        groqFormData.append("response_format", "json");

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${groqApiKey}` },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.text) {
            return NextResponse.json({ text: groqData.text });
          }
        }
      } catch (groqErr) {
        console.warn("Groq Whisper STT error, trying ElevenLabs:", groqErr);
      }
    }

    // 2. الخيار الثاني: ElevenLabs Scribe STT API
    if (elevenLabsApiKey) {
      try {
        const bodyFormData = new FormData();
        bodyFormData.append("file", audioFile, "recording.webm");
        bodyFormData.append("model_id", "scribe_v1");
        bodyFormData.append("language_code", "ara");

        const elResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: { "xi-api-key": elevenLabsApiKey },
          body: bodyFormData,
        });

        if (elResponse.ok) {
          const elData = await elResponse.json();
          return NextResponse.json({ text: elData.text || elData.transcript || "" });
        }
      } catch (elErr) {
        console.warn("ElevenLabs STT error, trying OpenAI Whisper:", elErr);
      }
    }

    // 3. الخيار الثالث (Fallback الأخير): OpenAI Whisper API
    if (openaiApiKey) {
      try {
        const whisperFormData = new FormData();
        whisperFormData.append("file", audioFile, "recording.webm");
        whisperFormData.append("model", "whisper-1");
        whisperFormData.append("language", "ar");

        const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${openaiApiKey}` },
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

    return NextResponse.json({
      error: "تعذر تفريغ الصوت. يرجى التحقق من إعدادات API أو استخدام الكتابة اليدوية.",
      requiresConfig: true,
    }, { status: 400 });

  } catch (error: any) {
    console.error("STT Error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء معالجة الصوت" }, { status: 500 });
  }
}
