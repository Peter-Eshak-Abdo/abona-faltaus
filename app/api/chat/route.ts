import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { supabase } from "@/lib/supabase";
import { CopticSystemPrompt } from "@/lib/prompt";
import quotesCacheData from "@/public/quotes.json";
import topicsCacheData from "@/public/verses_topics.json";

export const runtime = "nodejs";
export const maxDuration = 30;

// ترتيب النماذج من الأسرع والأخف للأحدث والأقوى لضمان الاستجابة السريعة
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

    // const geminiModels = [
    //   "gemini-2.5-flash-lite",
    //   "gemini-3.1-flash-lite",
    //   "gemini-2.5-flash",
    //   "gemini-3-pro-preview",
    //   "gemini-2.5-pro",
    //   "gemini-3.1-pro",
    // ];
function normalize(term: string): string {
  if (!term) return "";
  return term
    .replace(/[ًٌٍَُِْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

async function searchBible(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) return [];
  try {
    const { data } = await supabase
      .from("bible_verses")
      .select("vocalized_text, book_name, chapter_number, verse_number")
      .ilike("plain_text", `%${searchTerm}%`)
      .limit(5);

    return (data || []).map((v: any) => ({
      text: v.vocalized_text,
      ref: `${v.book_name?.replace(/^\d+-/, "")} ${v.chapter_number}:${v.verse_number}`,
    }));
  } catch (err) {
    console.warn("Bible search error:", err);
    return [];
  }
}

export async function POST(request: Request) {
  // 1. التحقق من صحة الطلب (Request Validation)
  let messages: any[];
  try {
    const body = await request.json();
    messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format. An array of messages is required." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 2. استخراج نص آخر رسالة للمستخدم مع التحقق من الحجم
  const lastMsg = messages[messages.length - 1];
  const userText = Array.isArray(lastMsg?.parts)
    ? lastMsg.parts.map((p: any) => p.text || "").join("")
    : lastMsg?.content || "";

  if (!userText.trim()) {
    return NextResponse.json({ error: "Empty message provided" }, { status: 400 });
  }

  if (userText.length > 2500) {
    return NextResponse.json(
      { error: "Message is too long (maximum 2500 characters)" },
      { status: 400 }
    );
  }

  // 3. بناء السياق من الآيات وأقوال الآباء
  const searchTerm = normalize(userText);
  const [bibleVerses, topicVerses, quotes] = await Promise.allSettled([
    searchBible(searchTerm),
    Promise.resolve(
      (topicsCacheData as any[])
        .filter((v) => normalize(v.topic).includes(searchTerm))
        .slice(0, 5)
        .map((v) => ({ text: v.verse, ref: v.ref }))
    ),
    Promise.resolve(
      (quotesCacheData as any[])
        .filter(
          (q) =>
            normalize(q.quote).includes(searchTerm) ||
            normalize(q.topic || "").includes(searchTerm)
        )
        .slice(0, 3)
    ),
  ]);

  const finalVerses = [
    ...(bibleVerses.status === "fulfilled" ? bibleVerses.value : []),
    ...(topicVerses.status === "fulfilled" ? topicVerses.value : []),
  ].slice(0, 7);

  const finalQuotes = quotes.status === "fulfilled" ? quotes.value : [];

  const systemPrompt = `${CopticSystemPrompt}

المراجع المتاحة لسؤال المستخدم:
الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ") || "لا يوجد"}
الأقوال: ${finalQuotes.map((q: any) => `"${q.quote}" - ${q.author}`).join(" | ") || "لا يوجد"}
`;

  const coreMessages = messages.map((m: any) => ({
    role: m.role as "user" | "assistant",
    content: Array.isArray(m.parts)
      ? m.parts.map((p: any) => p.text || "").join("")
      : m.content || "",
  }));

  // 4. تجربة النماذج بالترتيب مع Fallback تلقائي ومعالجة الأخطاء
  let lastError: any = null;
  for (const modelName of MODELS) {
    try {
      const result = await streamText({
        model: google(modelName),
        system: systemPrompt,
        messages: coreMessages,
        maxOutputTokens: 4096,
      });

      return result.toTextStreamResponse();
    } catch (err: any) {
      console.warn(`Model ${modelName} encountered an error:`, err?.message || err);
      lastError = err;
      const status = err?.statusCode || err?.status;
      // إذا لم يكن خطأ في الشبكة أو في حد الطلبات (Rate limit/Overloaded)، نكمل للنموذج التالي
      if (status && status !== 429 && status !== 503 && status !== 500) {
        // نتابع المحاولة مع النموذج التالي
      }
    }
  }

  console.error("All AI models failed in /api/chat:", lastError);
  return NextResponse.json(
    {
      error: "الخدمة مشغولة أو تواجه ضغطاً حالياً، يرجى المحاولة بعد لحظات.",
      details: lastError?.message || "All models failed",
    },
    { status: 503 }
  );
}
