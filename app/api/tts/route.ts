import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS } from "msedge-tts";

async function generateAudioBuffer(
  text: string,
  voice: string,
): Promise<Buffer> {
  const tts = new MsEdgeTTS({});
  await tts.setMetadata(voice, "audio-24khz-48kbitrate-mono-mp3" as any);

  const { audioStream } = tts.toStream(text);
  const chunks = [];

  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text)
      return NextResponse.json({ error: "Text is required" }, { status: 400 });

    let audioBuffer: Buffer;

    try {
      audioBuffer = await generateAudioBuffer(text, "ar-SA-HamedNeural");
    } catch (error) {
      audioBuffer = await generateAudioBuffer(text, "ar-EG-ShakirNeural");
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
