import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    if (!audioFile) {
      return NextResponse.json({ error: "لم يتم استلام أي ملف صوتي" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    // 1. الخيار الأول: Groq Whisper (سريع جداً وممتاز مع اللهجات واللغة العربية)
    if (groqApiKey) {
      try {
        const groqFormData = new FormData();
        groqFormData.append("file", audioFile, "recording.webm");
        groqFormData.append("model", "whisper-large-v3");
        groqFormData.append("language", "ar");
        groqFormData.append("response_format", "json");

        const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
          },
          body: groqFormData,
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          if (groqData.text) {
            return NextResponse.json({ transcript: groqData.text, text: groqData.text });
          }
        } else {
          console.warn("Groq Whisper STT failed with status:", groqRes.status);
        }
      } catch (groqErr) {
        console.warn("Groq Whisper STT error, trying next fallback:", groqErr);
      }
    }

    // 2. الخيار الثاني (Fallback): ElevenLabs STT
    if (elevenLabsApiKey) {
      try {
        const elFormData = new FormData();
        elFormData.append("file", audioFile, "recording.webm");
        elFormData.append("model_id", "scribe_v1");
        elFormData.append("language_code", "ara");

        const elRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
          method: "POST",
          headers: {
            "xi-api-key": elevenLabsApiKey,
          },
          body: elFormData,
        });

        if (elRes.ok) {
          const elData = await elRes.json();
          const transcript = elData.text || elData.transcript || "";
          if (transcript) {
            return NextResponse.json({ transcript, text: transcript });
          }
        }
      } catch (elErr) {
        console.warn("ElevenLabs STT error:", elErr);
      }
    }

    // 3. الخيار الثالث (Fallback): OpenAI Whisper API
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
          if (whisperData.text) {
            return NextResponse.json({ transcript: whisperData.text, text: whisperData.text });
          }
        }
      } catch (whisperErr) {
        console.warn("OpenAI Whisper STT error:", whisperErr);
      }
    }

    return NextResponse.json(
      {
        error: "فشل تفريغ الصوت عبر الـ APIs، يُرجى استخدام ميكروفون المتصفح المباشر (Web Speech API).",
        requiresFallback: true,
      },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Transcribe API Error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء معالجة الصوت" }, { status: 500 });
  }
}
