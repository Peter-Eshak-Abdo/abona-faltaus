import { NextResponse } from "next/server";
import OpenAI from "openai";
import { promises as fs } from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface BibleVerseResult {
  verse: string;
  ref: string;
}

interface BibleBook {
  name: string;
  chapters: string[][];
}

interface Quote {
  quote: string;
  author: string;
  source: string;
  topic: string;
}

const keywordMap = {
  محبة: [
    "محبة",
    "محب",
    "محبتي",
    "محبتك",
    "محبتهم",
    "محبتنا",
    "محبتكم",
    "محبة الله",
    "محبة الرب",
    "محبة المسيح",
    "المحبة",
  ],
  إيمان: [
    "ايمان",
    "إيماني",
    "إيمانك",
    "إيمانهم",
    "إيماننا",
    "إيمانكم",
    "إيمان الله",
    "إيمان الرب",
    "إيمان المسيح",
    "الايمان",
  ],
  صلاة: [
    "صلاة",
    "صلات",
    "صلاتي",
    "صلاتك",
    "صلاتهم",
    "صلاتنا",
    "صلاتكم",
    "صلاة الله",
    "صلاة الرب",
    "صلاة المسيح",
    "الصلاة",
  ],
  صبر: [
    "صبر",
    "صبري",
    "صبرك",
    "صبرهم",
    "صبرنا",
    "صبركم",
    "صبر الله",
    "صبر الرب",
    "صبر المسيح",
    "الصبر",
  ],
  عقيدة: [
    "عقيدة",
    "عقيدتي",
    "عقيدتك",
    "عقيدتهم",
    "عقيدتنا",
    "عقيدتكم",
    "عقيدة الله",
    "عقيدة الرب",
    "عقيدة المسيح",
    "العقيدة",
  ],
  رجاء: [
    "رجاء",
    "رجائي",
    "رجاؤك",
    "رجاؤهم",
    "رجاؤنا",
    "رجاؤكم",
    "رجاء الله",
    "رجاء الرب",
    "رجاء المسيح",
    "الرجاء",
  ],
  غضب: [
    "غضب",
    "غاضب",
    "غضبك",
    "غضبي",
    "غضبهم",
    "غضبنا",
    "غضبكم",
    "غضب الله",
    "غضب الرب",
    "الغضب",
  ],
  // Add more keywords and their corresponding search results here
};

async function searchBibleVerses(
  bible: BibleBook[],
  query: string,
  searchType: "keyword" | "concept",
  limit: number = 10
): Promise<BibleVerseResult[]> {
  console.log("bible array:", bible);
  let results: BibleVerseResult[] = [];

  if (searchType === "keyword") {
    // Search for verses that contain the keyword
    for (const book of bible) {
      console.log("processing book:", book);
      book.chapters.forEach((chapter: string[], chapterIdx: number) => {
        console.log("processing chapter:", chapter);
        chapter.forEach((verse: string, verseIdx: number) => {
          const keywords = (keywordMap as Record<string, string[]>)[query];
          if (keywords && keywords.some((keyword) => verse.includes(keyword))) {
            results.push({
              verse,
              ref: `${book.name} ${chapterIdx + 1}:${verseIdx + 1}`,
            });
          }
        });
      });
    }
  } else if (searchType === "concept") {
    // Search for verses that explain the concept
    const conceptVerses = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "public", "verses_topics.json"),
        "utf8"
      )
    );
    results = conceptVerses
      .filter((verse: { topic: string }) => verse.topic === query)
      .slice(0, limit);
  }

  console.log("search results:", results);
  return results;
}
function searchQuotes(quotes: Quote[], query: string): Quote[] {
  const keywords = query.split(/\s+/).filter((w: string) => w.length > 2);
  return quotes.filter((q: Quote) =>
    keywords.some((k: string) => q.topic.includes(k) || q.quote.includes(k))
  );
}

export async function POST(request: Request) {
  const booksModule = await import("@/lib/books.js");
  const bookNames = booksModule.bookNames;
  const { messages } = await request.json();
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
  }

  const userMsg: string =
    (messages as ChatMessage[])
      .find((m: ChatMessage) => m.role === "user")
      ?.content.toLowerCase() || "";

  // قراءة ملفات البيانات
  const biblePath = path.join(process.cwd(), "public", "ar_svd.json");
  let bibleRaw = await fs.readFile(biblePath, "utf8");
  if (bibleRaw.charCodeAt(0) === 0xfeff) bibleRaw = bibleRaw.slice(1);
  const bible = JSON.parse(bibleRaw);

  const quotesPath = path.join(process.cwd(), "public", "quotes.json");
  let quotesRaw = await fs.readFile(quotesPath, "utf8");
  if (quotesRaw.charCodeAt(0) === 0xfeff) quotesRaw = quotesRaw.slice(1);
  const quotes = JSON.parse(quotesRaw);

  // قراءة ملف آيات مختارة حسب الموضوع
  const versesTopicsPath = path.join(
    process.cwd(),
    "public",
    "verses_topics.json"
  );
  let versesTopicsRaw = await fs.readFile(versesTopicsPath, "utf8");
  if (versesTopicsRaw.charCodeAt(0) === 0xfeff)
    versesTopicsRaw = versesTopicsRaw.slice(1);
  const versesTopics = JSON.parse(versesTopicsRaw);

  // البحث
  interface VerseTopic {
    topic: string;
    verse: string;
    ref: string;
  }

  const userMsgLimit = userMsg.match(/\d+/)?.[0];
  const searchType =
    userMsg.includes("concept") || userMsg.includes("مفهوم")
      ? ("concept" as const)
      : ("keyword" as const);
  const limit = userMsgLimit ? parseInt(userMsgLimit) : 15;
  const searchTerm = userMsg.replace(/[ًٌٍَُِْ]/g, "").toLowerCase();
  console.log("Search term:", searchTerm);
  console.log("Search type:", searchType);
  console.log("Limit:", limit);

  const topicVerses: VerseTopic[] = (versesTopics as VerseTopic[]).filter(
    (v: VerseTopic) => v.topic.toLowerCase().includes(searchTerm)
  );
  console.log("Topic verses:", topicVerses);
  const verses = await searchBibleVerses(bible, userMsg, searchType, limit);
  const foundQuotes = searchQuotes(quotes, userMsg);

  // تجهيز نص الآيات
  let allVerses: { verse: string; ref: string }[] = [];
  if (topicVerses.length) allVerses = [...topicVerses];
  if (verses.length) allVerses = [...allVerses, ...verses].slice(0, 10);

  let versesText = "لا توجد آيات مطابقة في الكتاب المقدس حول هذا الموضوع.";
  if (allVerses.length) {
    versesText = allVerses
      .map((v, idx) => {
        const ref = v.ref;
        // آيات مختارة من verses_topics
        if (
          ref.match(/^[^ ]+ \\d+:\\d+(-\\d+)?$/) ||
          ref.match(/^.+ \\d+:\\d+(-\\d+)?$/)
        ) {
          // صيغة: "أفسس 4:26-27"
          return `<b>${idx + 1}. ${
            v.verse
          }</b><br><span style='font-size:15px'>${ref}</span>`;
        } else {
          // آيات البحث من ar_svd.json
          const [bookAbbr, chapterVerse] = ref.split(" ");
          const arabicBook =
            (bookNames as Record<string, string>)[bookAbbr] || bookAbbr;
          return `<b>${idx + 1}. ${
            v.verse
          }</b><br><span style='font-size:15px'>${arabicBook} ${chapterVerse}</span>`;
        }
      })
      .join("<br><br>");
  }

  // تجهيز نص أقوال الآباء
  let quotesText = "لا توجد اقتباسات من الآباء حول هذا الموضوع.";
  if (foundQuotes.length) {
    quotesText = foundQuotes
      .slice(0, 5)
      .map(
        (q, idx) =>
          `<b>${idx + 1}. ${q.quote}</b><br><span style='font-size:15px'>${
            q.author
          } (${q.source})</span>`
      )
      .join("<br><br>");
  }

  // تعليمات واضحة للنموذج
  const systemContent = `
أنت مساعد ذكي مسيحي أرثوذكسي. المطلوب:
- اكتب شرحاً وافياً وطويلاً عن موضوع السؤال في فقرة منفصلة.
- بعد الشرح ضع فاصل واضح (———).
- ثم عنوان <h3 style='font-weight:bold;font-size:22px'>آيات من الكتاب المقدس</h3>
- ثم اكتب قائمة الآيات التالية، كل آية في سطر منفصل، نص الآية بخط أكبر وBold، الشاهد بالعربي بخط عادي تحتها:
${versesText}
- بعد فاصل جديد (———)
- ثم عنوان <h3 style='font-weight:bold;font-size:22px'>أقوال الآباء</h3>
- ثم اكتب قائمة الاقتباسات التالية، كل اقتباس في سطر منفصل، النص بخط أكبر وBold، المصدر بخط عادي تحتها:
${quotesText}
لا تضف أي آية أو اقتباس غير الموجودين في القوائم أعلاه. إذا لم توجد آيات أو اقتباسات، اذكر ذلك بوضوح.
`;

  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: systemContent }, ...messages],
  });

  return NextResponse.json({ reply: chatRes.choices[0].message });
}
