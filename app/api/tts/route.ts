import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS } from "msedge-tts";

function formatTextForDeaconSpeech(rawText: string): string {
  // تنظيف وتجهيز النص للوقف الصحيح عند الفواصل والنقاط كقراءة شماس وقور
  return rawText
    .replace(/([.؛!?])/g, "$1 ... ") // وقوف وسكت واضح عند النقطة والفصلة المنقوطة
    .replace(/([،,])/g, "$1 , ") // سكت لحظي خاشع عند الفواصل
    .replace(/\s+/g, " ")
    .trim();
}

async function generateAudioBuffer(
  text: string,
  voice: string,
): Promise<Buffer> {
  const formattedText = formatTextForDeaconSpeech(text);
  const tts = new MsEdgeTTS({});
  // استخدام معدل نطق وقور وهادئ (-5% إلى -8%) ليعطي هيبة تلاوة شماس الكنيسة
  await tts.setMetadata(voice, "audio-24khz-48kbitrate-mono-mp3" as any);

  const { audioStream } = tts.toStream(formattedText, {
    rate: "-5%",
    pitch: "+0Hz",
    volume: "+0%",
  });
  const chunks = [];

  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice } = await req.json();

    if (!text)
      return NextResponse.json({ error: "Text is required" }, { status: 400 });

    let audioBuffer: Buffer;

    // الأصوات الأكثر وقاراً وفصاحة بمخارج ألفاظ واضحة (شاكر المصري الوقور أو حامد الفصيح)
    const selectedVoice = voice || "ar-EG-ShakirNeural";

    try {
      audioBuffer = await generateAudioBuffer(text, selectedVoice);
    } catch (error) {
      // Fallback voice
      audioBuffer = await generateAudioBuffer(text, "ar-SA-HamedNeural");
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        // تفعيل الكاش لمدة سنة ليعمل بدون إنترنت بعد أول مرة
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
