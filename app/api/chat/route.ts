import { NextResponse } from "next/server";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function searchBibleVerses(
  bible: Array<{ name: string; chapters: string[][] }>,
  query: string
) {
  const keywords = query.split(/\s+/).filter((w) => w.length > 2);
  const results: { verse: string; ref: string }[] = [];
  for (const book of bible) {
    book.chapters.forEach((chapter: string[], chapterIdx: number) => {
      chapter.forEach((verse: string, verseIdx: number) => {
        if (keywords.some((k) => verse.includes(k))) {
          results.push({
            verse,
            ref: `${book.name} ${chapterIdx + 1}:${verseIdx + 1}`,
          });
        }
      });
    });
  }
  return results;
}

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  const { messages } = await request.json();
  const userMsg =
    (messages as ChatMessage[]).find((m: ChatMessage) => m.role === "user")
      ?.content || "";

  // قراءة ملف الكتاب المقدس من public
  const biblePath = path.join(process.cwd(), "public", "ar_svd.json");
  let bibleRaw = await fs.readFile(biblePath, "utf8");
  // إزالة BOM لو موجود
  if (bibleRaw.charCodeAt(0) === 0xfeff) bibleRaw = bibleRaw.slice(1);
  const bible = JSON.parse(bibleRaw);

  const verses = searchBibleVerses(bible, userMsg);
  let versesText = "";
  if (verses.length) {
    versesText =
      "\nهذه بعض الآيات من الكتاب المقدس حول سؤالك:\n" +
      verses
        .slice(0, 3)
        .map((v) => `- ${v.verse} (${v.ref})`)
        .join("\n");
  }
  const systemContent = `
أنت مساعد ذكي مسيحي أرثوذكسي. أي سؤال ديني يجب أن تكون إجابته من الكتاب المقدس (بالتشكيل والشاهد) أو من كتب آباء الكنيسة الأرثوذكسية (البابا شنودة، أبونا داود لمعي، أبونا تادرس يعقوب ملطي، أو موقع الأنبا تكلا). إذا لم تجد نصًا دقيقًا، اعتذر وقل أنك لا ترد إلا من المصادر الأرثوذكسية فقط.
${versesText}
`;

  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: systemContent }, ...messages],
  });

  return NextResponse.json({ reply: chatRes.choices[0].message });
}
