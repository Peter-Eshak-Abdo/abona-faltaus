import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { promises as fs } from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export const maxDuration = 30;
// تعريفات الـ Cache عشان الـ TypeScript ميزعلش
let quotesCache: { quote: string; author: string; topic: string }[] | null = null;
let topicsCache: { topic: string; verse: string; ref: string }[] | null = null;

function normalize(term: string): string {
  if (!term) return "";
  return term
    .replace(/[ًٌٍَُِْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

async function loadStaticData() {
  if (quotesCache && topicsCache) return;
  const publicPath = path.join(process.cwd(), "public");
  try {
    const [quotesData, topicsData] = await Promise.all([
      fs.readFile(path.join(publicPath, "quotes.json"), "utf8"),
      fs.readFile(path.join(publicPath, "verses_topics.json"), "utf8"),
    ]);
    quotesCache = JSON.parse(quotesData.replace(/^\uFEFF/, ""));
    topicsCache = JSON.parse(topicsData.replace(/^\uFEFF/, ""));
  } catch (err) {
    console.error("Error loading static data:", err);
    quotesCache = [];
    topicsCache = [];
  }
}

async function searchBible(searchTerm: string) {
  const { data, error } = await supabase
    .from("bible_verses")
    .select("vocalized_text, book_name, chapter_number, verse_number")
    .ilike("plain_text", `%${searchTerm}%`)
    .limit(5);

  if (error || !data) {
    console.error("Search Error:", error);
    return [];
  }

  return data.map((v: { vocalized_text: any; book_name: any; chapter_number: any; verse_number: any; }) => ({
    text: v.vocalized_text,
    ref: `${v.book_name} ${v.chapter_number}:${v.verse_number}`,
  }));
}

async function buildSystemPrompt(searchTerm: string): Promise<string> {
  const foundVerses = await searchBible(searchTerm);
  const topicResults = (topicsCache ?? [])
    .filter((v) => normalize(v.topic).includes(searchTerm))
    .slice(0, 5)
    .map((v) => ({ text: v.verse, ref: v.ref }));

  const finalVerses = [...foundVerses, ...topicResults].slice(0, 7);
  const finalQuotes = (quotesCache ?? [])
    .filter(
      (q) =>
        normalize(q.quote).includes(searchTerm) ||
        normalize(q.topic).includes(searchTerm)
    )
    .slice(0, 5);

  return `أنت مساعد مسيحي أرثوذكسي روحاني يسمى "مساعد اجتماع النسور".
أجب بعمق وتفصيل كامل على الأسئلة الروحية والطقسية.

**قواعد السلوك:**
1. ابدأ الرد فوراً بالدخول في صلب الموضوع بأسلوب روحي.
2. لا تذكر معلومات المطور (Peter Eshak) أو روابط الاجتماع إلا إذا سألك المستخدم صراحة عن هويتك أو من طورك.
3. معلوماتك للرجوع إليها عند الحاجة فقط:
   - المطور: Peter Eshak Abdo
   - التابع لـ: اجتماع النسور - كنيسة العذراء بالاسماعيلية.
4- المراجع الروحية لتفسير الكتاب المقدس او شرح للعقيدة اوللطقس او تاريخ الكنيسة من موقع (https://st-takla.org)

المراجع المتاحة حالياً:
الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ")}
الأقوال: ${finalQuotes.map((q) => `"${q.quote}" - ${q.author}`).join(" | ")}

تنسيق الرد:
- استخدم HTML: فقرات <p>، عناوين <h3>، خط عريض <strong>.
- الآيات الكتابية داخل: <span dir="rtl" style="direction:rtl;unicode-bidi:embed;">نص الآية</span>`;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    await loadStaticData();

    // 1. استخراج نص آخر رسالة
    const lastMsg = messages[messages.length - 1];
    const lastUserMessage = Array.isArray(lastMsg.parts)
      ? lastMsg.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
      : (lastMsg.content ?? "");

    const systemPrompt = await buildSystemPrompt(normalize(lastUserMessage));

    // 2. تجهيز الرسائل بالشكل المطلوب للـ SDK Core
    const coreMessages = messages.map((m: any) => ({
      role: m.role as "user" | "assistant" | "system",
      content: Array.isArray(m.parts)
        ? m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
        : (m.content ?? ""),
    }));

    const streamConfig = {
      messages: [
        { role: "system" as const, content: systemPrompt },
        ...coreMessages,
      ],
      maxOutputTokens: 4096,
    };

    // --- نظام التعاقب (Model Waterfall) ---
    try {
      // المحاولة الأولى: Gemini 3 Flash
      const result = streamText({
        model: google("gemini-3-flash-preview"),
        ...streamConfig,
      });
      // ✅ السر هنا: لازم toDataStreamResponse عشان useChat في الكلاينت تفهمها
      return result.toTextStreamResponse();

    } catch (geminiErr) {
      console.warn("Gemini 3 failed, trying Gemini 1.5 Flash...", geminiErr);

      try {
        // المحاولة الثانية: Gemini 1.5 Flash
        const result = streamText({
          model: google("gemini-1.5-flash"),
          ...streamConfig,
        });
        return result.toTextStreamResponse();

      } catch (gemini15Err) {
        console.warn("All Gemini models failed, falling back to OpenAI...", gemini15Err);

        // المحاولة الثالثة: GPT-4o-mini
        const result = streamText({
          model: openai("gpt-4o-mini"),
          ...streamConfig,
        });
        return result.toTextStreamResponse();
      }
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
