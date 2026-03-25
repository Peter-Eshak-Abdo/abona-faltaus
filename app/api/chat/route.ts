import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

let bibleCache: any = null;
let quotesCache: any = null;
let topicsCache: any = null;

function normalize(term: string): string {
  if (!term) return "";
  return term
    .replace(/[ًٌٍَُِْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

async function loadData() {
  if (bibleCache && quotesCache && topicsCache) return;
  const publicPath = path.join(process.cwd(), "public");
  const [bibleData, quotesData, topicsData] = await Promise.all([
    fs.readFile(
      path.join(publicPath, "bible-json", "bible_fixed.json"),
      "utf8",
    ),
    fs.readFile(path.join(publicPath, "quotes.json"), "utf8"),
    fs.readFile(path.join(publicPath, "verses_topics.json"), "utf8"),
  ]);
  bibleCache = JSON.parse(bibleData.replace(/^\uFEFF/, ""));
  quotesCache = JSON.parse(quotesData.replace(/^\uFEFF/, ""));
  topicsCache = JSON.parse(topicsData.replace(/^\uFEFF/, ""));
}

function searchBible(searchTerm: string): { text: string; ref: string }[] {
  const found: { text: string; ref: string }[] = [];
  if (!bibleCache) return found;
  for (const book of bibleCache) {
    if (found.length >= 4) break;
    (book.chapters as any[][]).forEach((chapter, cIdx) => {
      for (const vObj of chapter) {
        if (
          found.length < 4 &&
          normalize(vObj.text_plain).includes(searchTerm)
        ) {
          found.push({
            text: vObj.text_vocalized,
            ref: `${book.name} ${cIdx + 1}:${vObj.verse}`,
          });
        }
      }
    });
  }
  return found;
}

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // ✅ AI SDK v5/6: الـ messages بييجوا كـ UIMessages بـ parts
//     // convertToModelMessages بيحوّلها للـ format الصح للـ model
//     const { messages } = body;

//     if (!messages || !Array.isArray(messages) || messages.length === 0) {
//       return NextResponse.json({ error: "رسائل غير صالحة" }, { status: 400 });
//     }

//     // استخراج نص آخر رسالة من الـ parts format الجديد
//     const lastMsg = messages[messages.length - 1];
//     const lastUserMessage = lastMsg?.parts
//       ? lastMsg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
//       : (lastMsg?.content ?? "");

//     const searchTerm = normalize(lastUserMessage);

//     await loadData();

//     const foundVerses  = searchBible(searchTerm);
//     const topicResults = (topicsCache ?? [])
//       .filter((v: any) => normalize(v.topic).includes(searchTerm))
//       .slice(0, 5)
//       .map((v: any) => ({ text: v.verse, ref: v.ref }));

//     const finalVerses = [...foundVerses, ...topicResults].slice(0, 7);
//     const finalQuotes = (quotesCache ?? [])
//       .filter((q: any) =>
//         normalize(q.quote).includes(searchTerm) ||
//         normalize(q.topic).includes(searchTerm)
//       )
//       .slice(0, 5);

//     const systemPrompt = `أنت مساعد مسيحي أرثوذكسي. أجب بعمق على السؤال.
// المراجع المتاحة:
// الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ")}
// الأقوال: ${finalQuotes.map((q: { quote: any; author: any }) => `"${q.quote}" - ${q.author}`).join(" | ")}
// استخدم HTML لتنسيق الرد (فقرات، عناوين h3، خط عريض).`;

//     // ✅ convertToModelMessages يحوّل UIMessages لـ CoreMessages
//     const modelMessages = await convertToModelMessages(messages);

//     const allMessages = [
//       { role: "system" as const, content: systemPrompt },
//       ...modelMessages,
//     ];

//     // المحاولة الأولى: Gemini
//     try {
//       const result = streamText({
//         model: google("gemini-3-flash-preview"),
//         messages: allMessages,
//       });
//       return result.toUIMessageStreamResponse();
//     } catch (geminiErr) {
//       console.error("Gemini failed, falling back to OpenAI:", geminiErr);
//       const fallback = streamText({
//         model: openai("gpt-4o-mini"),
//         messages: allMessages,
//       });
//       return fallback.toUIMessageStreamResponse();
//     }
//   } catch (error: any) {
//     console.error("Chat API error:", error);
//     return NextResponse.json(
//       { error: "حدث خطأ في السيرفر، يرجى المحاولة لاحقاً" },
//       { status: 500 }
//     );
//   }
// }

async function buildSystemPrompt(searchTerm: string): Promise<string> {
  const foundVerses = searchBible(searchTerm);
  const topicResults = (topicsCache ?? [])
    .filter((v: any) => normalize(v.topic).includes(searchTerm))
    .slice(0, 5)
    .map((v: any) => ({ text: v.verse, ref: v.ref }));

  const finalVerses = [...foundVerses, ...topicResults].slice(0, 7);
  const finalQuotes = (quotesCache ?? [])
    .filter(
      (q: any) =>
        normalize(q.quote).includes(searchTerm) ||
        normalize(q.topic).includes(searchTerm),
    )
    .slice(0, 5);

  return `أنت مساعد مسيحي أرثوذكسي روحاني. أجب بعمق وتفصيل كامل على السؤال دون اختصار.
المراجع المتاحة:
الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ")}
الأقوال: ${finalQuotes.map((q: { quote: any; author: any }) => `"${q.quote}" - ${q.author}`).join(" | ")}
استخدم HTML لتنسيق الرد: فقرات <p>، عناوين <h3>، خط عريض <strong>.
اكتب الآيات الكتابية دائماً داخل: <span dir="rtl" style="direction:rtl;unicode-bidi:embed;">نص الآية</span>`;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "رسائل غير صالحة" }, { status: 400 });
    }

    const lastMsg = messages[messages.length - 1];
    const lastUserMessage = lastMsg?.parts
      ? lastMsg.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("")
      : (lastMsg?.content ?? "");

    const searchTerm = normalize(lastUserMessage);
    await loadData();

    const systemPrompt = await buildSystemPrompt(searchTerm);
    const modelMessages = await convertToModelMessages(messages);
    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...modelMessages,
    ];

    // ✅ المحاولة الأولى: Gemini مع maxTokens كافي للرد الكامل
    try {
      const geminiResult = streamText({
        model: google("gemini-2.0-flash"),
        messages: allMessages,
        maxOutputTokens: 2048, // ✅ كافي للرد التفصيلي
      });

      await geminiResult.consumeStream();

      const result2 = streamText({
        model: google("gemini-3-flash-preview"),
        messages: allMessages,
        maxOutputTokens: 2048,
      });
      return result2.toUIMessageStreamResponse();
    } catch (geminiErr: any) {
      console.error(
        "Gemini failed, falling back to OpenAI:",
        geminiErr?.message ?? geminiErr,
      );

      // ✅ Fallback: GPT-4o-mini
      const fallback = streamText({
        model: openai("gpt-4o-mini"),
        messages: allMessages,
        maxOutputTokens: 2048,
      });
      return fallback.toUIMessageStreamResponse();
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في السيرفر، يرجى المحاولة لاحقاً" },
      { status: 500 },
    );
  }
}
