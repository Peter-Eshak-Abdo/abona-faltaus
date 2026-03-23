import { NextResponse } from "next/server";
import OpenAIClient from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { promises as fs } from "fs";
import path from "path";

// تفعيل الـ Edge Runtime لتجنب الـ 10 ثواني
// export const runtime = 'edge';
export const runtime = "nodejs";

const openaiClient = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY || "",
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// متغير لتخزين البيانات في الذاكرة (Memory Cache) لسرعة الوصول
let bibleCache: any = null;
let quotesCache: any = null;
let topicsCache: any = null;

// interface BibleVerseResult {
//   verse: string;
//   ref: string;
// }

// interface BibleBook {
//   name: string;
//   chapters: string[][];
// }

// interface Quote {
//   quote: string;
//   author: string;
//   source: string;
//   topic: string;
// }

// const synonymMap: Record<string, string[]> = {
//   إيمان: ["إيمان", "الايمان", "ايمان", "الإيمان"],
//   محبة: ["محبة", "حب", "الحب"],
//   صلاة: ["صلاة", "صلوات", "الصلاة"],
//   صبر: ["صبر", "الصبر"],
//   عقيدة: ["عقيدة", "عقائد", "العقيدة"],
//   رجاء: ["رجاء", "الرجاء"],
//   غضب: ["غضب", "الغضب", "غاضب"],
// };

function normalize(term: string) {
  // const t = term.replace(/[ًٌٍَُِْ]/g, "").toLowerCase();
  // return synonymMap[t] || t;
  // return term.replace(/[ًٌٍَُِْ]/g, "").trim();
  // return term.replace(/[ًٌٍَُِْ]/g, "").trim().toLowerCase();
  if (!term) return "";
  return term
    .replace(/[ًٌٍَُِْ]/g, "") // إزالة التشكيل
    .replace(/[أإآ]/g, "ا") // توحيد الألف
    .replace(/ة/g, "ه") // توحيد التاء المربوطة
    .trim()
    .toLowerCase();
}

// async function searchBibleVerses(
//   bible: BibleBook[],
//   query: string,
//   searchType: "keyword" | "concept",
//   limit: number = 10
// ): Promise<BibleVerseResult[]> {
//   console.log("bible array:", bible);
//   let results: BibleVerseResult[] = [];
//   if (searchType === "keyword") {
//     // Search for verses that contain the keyword
//     for (const book of bible) {
//       console.log("processing book:", book);
//       book.chapters.forEach((chapter: string[], chapterIdx: number) => {
//         console.log("processing chapter:", chapter);
//         chapter.forEach((verse: string, verseIdx: number) => {
//           const keywords = (synonymMap as unknown as Record<string, string[]>)[query];
//           if (keywords && keywords.some((keyword) => verse.includes(keyword))) {
//             results.push({
//               verse,
//               ref: `${book.name} ${chapterIdx + 1}:${verseIdx + 1}`,
//             });
//           }
//         });
//       });
//     }
//   } else if (searchType === "concept") {
//     // Search for verses that explain the concept
//     const conceptVerses = JSON.parse(
//       await fs.readFile(
//         path.join(process.cwd(), "public", "verses_topics.json"),
//         "utf8"
//       )
//     );
//     results = conceptVerses
//       .filter((verse: { topic: string }) => verse.topic === query)
//       .slice(0, limit);
//   }

//   console.log("search results:", results);
//   return results;
// }
// function searchQuotes(quotes: Quote[], query: string): Quote[] {
//   const keywords = query.split(/\s+/).filter((w: string) => w.length > 2);
//   return quotes.filter((q: Quote) =>
//     keywords.some((k: string) => q.topic.includes(k) || q.quote.includes(k))
//   );
// }

// export async function POST(request: Request) {
//   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // تم نقل التهيئة إلى هنا
//   const { messages, mode } = await request.json();
//   const searchType = mode; // "keyword" أو "concept"
//   const booksModule = await import("@/lib/books.js");
//   const bookNames = booksModule.bookNames;
//   // const { messages } = await request.json();
//   interface ChatMessage {
//     role: "user" | "assistant";
//     content: string;
//   }
//  const raw =
//    (messages as ChatMessage[]).find((m) => m.role === "user")?.content || "";
//   const userMsg = normalize(raw);

//   // const userMsg: string =
//   //   (messages as ChatMessage[])
//   //     .find((m: ChatMessage) => m.role === "user")
//   //     ?.content.toLowerCase() || "";

//   // قراءة ملفات البيانات
//   const biblePath = path.join(process.cwd(), "public", "ar_svd.json");
//   let bibleRaw = await fs.readFile(biblePath, "utf8");
//   if (bibleRaw.charCodeAt(0) === 0xfeff) bibleRaw = bibleRaw.slice(1);
//   const bible = JSON.parse(bibleRaw);

//   const quotesPath = path.join(process.cwd(), "public", "quotes.json");
//   let quotesRaw = await fs.readFile(quotesPath, "utf8");
//   if (quotesRaw.charCodeAt(0) === 0xfeff) quotesRaw = quotesRaw.slice(1);
//   const quotes = JSON.parse(quotesRaw);

//   // قراءة ملف آيات مختارة حسب الموضوع
//   const versesTopicsPath = path.join(
//     process.cwd(),
//     "public",
//     "verses_topics.json"
//   );
//   let versesTopicsRaw = await fs.readFile(versesTopicsPath, "utf8");
//   if (versesTopicsRaw.charCodeAt(0) === 0xfeff)
//     versesTopicsRaw = versesTopicsRaw.slice(1);
//   const versesTopics = JSON.parse(versesTopicsRaw);

//   // البحث
//   interface VerseTopic {
//     topic: string;
//     verse: string;
//     ref: string;
//   }

//   const userMsgLimit = userMsg.match(/\d+/)?.[0];
//   // const searchType =
//   //   userMsg.includes("concept") || userMsg.includes("مفهوم")
//   //     ? ("concept" as const)
//   //     : ("keyword" as const);
//   const limit = userMsgLimit ? parseInt(userMsgLimit) : 15;
//   const searchTerm = userMsg.replace(/[ًٌٍَُِْ]/g, "").toLowerCase();
//   console.log("Search term:", searchTerm);
//   console.log("Search type:", searchType);
//   console.log("Limit:", limit);

//   const topicVerses: VerseTopic[] = (versesTopics as VerseTopic[]).filter(
//     (v: VerseTopic) => v.topic.toLowerCase().includes(searchTerm)
//   );
//   console.log("Topic verses:", topicVerses);
//   let allVerses: { verse: string; ref: string }[] = []; // Declare allVerses here
//   if (mode === "keyword") {
//     // بحث نصّي: ابحث في JSON الكامل
//     const verses = await searchBibleVerses(bible, userMsg, "keyword", limit);
//     allVerses = verses; // Assign to allVerses
//   } else {
//     // بحث مفهوم: من ملف verses_topics.json فقط
//     const topicVerses: VerseTopic[] = versesTopics
//       .filter((v: { topic: string; }) => normalize(v.topic) === userMsg)
//       .slice(0, limit);
//     allVerses = topicVerses.map((v) => ({ verse: v.verse, ref: v.ref })); // Assign to allVerses
//   }

//   const foundQuotes = searchQuotes(quotes, userMsg);
//   // تجهيز نص الآيات
//   if (topicVerses.length) allVerses = [...topicVerses];
//   // if (verses.length) allVerses = [...allVerses, ...verses].slice(0, 10);

//   let versesText = "لا توجد آيات مطابقة في الكتاب المقدس حول هذا الموضوع.";
//   if (allVerses.length) {
//     versesText = allVerses
//       .map((v, idx) => {
//         const ref = v.ref;
//         // آيات مختارة من verses_topics
//         if (
//           ref.match(/^[^ ]+ \d+:\d+(-\d+)?$/) ||
//           ref.match(/^.+ \d+:\d+(-\d+)?$/)
//         ) {
//           // صيغة: "أفسس 4:26-27"
//           return `<b>${idx + 1}. ${
//             v.verse
//           }</b><br><span style='font-size:15px'>${ref}</span>`;
//         } else {
//           // آيات البحث من ar_svd.json
//           const [bookAbbr, chapterVerse] = ref.split(" ");
//           const arabicBook =
//             (bookNames as Record<string, string>)[bookAbbr] || bookAbbr;
//           return `<b>${idx + 1}. ${
//             v.verse
//           }</b><br><span style='font-size:15px'>${arabicBook} ${chapterVerse}</span>`;
//         }
//       })
//       .join("<br><br>");
//   }

//   // تجهيز نص أقوال الآباء
//   let quotesText = "لا توجد اقتباسات من الآباء حول هذا الموضوع.";
//   if (foundQuotes.length) {
//     quotesText = foundQuotes
//       .slice(0, 5)
//       .map(
//         (q, idx) =>
//           `<b>${idx + 1}. ${q.quote}</b><br><span style='font-size:15px'>${
//             q.author
//           } (${q.source})</span>`
//       )
//       .join("<br><br>");
//   }

//   // تعليمات واضحة للنموذج
//   const systemContent = `
// أنت مساعد ذكي مسيحي أرثوذكسي. المطلوب:
// - اكتب شرحاً وافياً وطويلاً عن موضوع السؤال في فقرة منفصلة.
// - بعد الشرح ضع فاصل واضح (———).
// - ثم عنوان <h3 style='font-weight:bold;font-size:22px'>آيات من الكتاب المقدس</h3>
// - ثم اكتب قائمة الآيات التالية، كل آية في سطر منفصل، نص الآية بخط أكبر وBold، الشاهد بالعربي بخط عادي تحتها:
// ${versesText}
// - بعد فاصل جديد (———)
// - ثم عنوان <h3 style='font-weight:bold;font-size:22px'>أقوال الآباء</h3>
// - ثم اكتب قائمة الاقتباسات التالية، كل اقتباس في سطر منفصل، النص بخط أكبر وBold، المصدر بخط عادي تحتها:
// ${quotesText}
// لا تضف أي آية أو اقتباس غير الموجودين في القوائم أعلاه. إذا لم توجد آيات أو اقتباسات، اذكر ذلك بوضوح.
// `;

//   const chatRes = await openai.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [{ role: "system", content: systemContent }, ...messages],
//   });

//   return NextResponse.json({ reply: chatRes.choices[0].message });
// }
// async function searchBibleVerses(
//   bible: any[],
//   query: string,
//   limit: number = 10,
// ) {
//   let results: { verse: string; ref: string }[] = [];
//   const normalizedQuery = normalize(query);

//   // الحصول على كل الكلمات المفتاحية المرتبطة بالبحث
//   const keywords = synonymMap[normalizedQuery] || [normalizedQuery];

//   for (const book of bible) {
//     if (results.length >= limit) break;

//     book.chapters.forEach((chapter: string[], chapterIdx: number) => {
//       chapter.forEach((verse: string, verseIdx: number) => {
//         if (results.length < limit) {
//           const normalizedVerse = normalize(verse);
//           if (keywords.some((k) => normalizedVerse.includes(k))) {
//             results.push({
//               verse,
//               ref: `${book.name} ${chapterIdx + 1}:${verseIdx + 1}`,
//             });
//           }
//         }
//       });
//     });
//   }
//   return results;
// }

// export async function POST(request: Request) {
//   try {
//     const { messages, mode } = await request.json();
//     const lastUserMessage = messages[messages.length - 1]?.content || "";
//     const searchTerm = normalize(lastUserMessage);

//     // 1. استيراد أسماء الكتب
//     const booksModule = await import("@/lib/books.js");
//     const bookNames = booksModule.bookNames;

//     // 2. قراءة البيانات (يفضل استخدام Path.join)
//     const getPublicFile = async (fileName: string) => {
//       const filePath = path.join(process.cwd(), "public", fileName);
//       let content = await fs.readFile(filePath, "utf8");
//       if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
//       return JSON.parse(content);
//     };

//     const [bible, quotes, versesTopics] = await Promise.all([
//       getPublicFile("ar_svd.json"),
//       getPublicFile("quotes.json"),
//       getPublicFile("verses_topics.json")
//     ]);

//     let foundVerses: any[] = [];
//     let foundQuotes: any[] = [];

//     // 3. منطق البحث
//     if (mode === "keyword") {
//       foundVerses = await searchBibleVerses(bible, searchTerm, 10);
//     } else {
//       foundVerses = versesTopics
//         .filter((v: any) => normalize(v.topic).includes(searchTerm))
//         .slice(0, 10);
//     }

//     foundQuotes = quotes
//       .filter((q: any) => normalize(q.quote).includes(searchTerm) || normalize(q.topic).includes(searchTerm))
//       .slice(0, 5);

//     // 4. تجهيز النصوص للـ AI
//     const formattedVerses = foundVerses.map((v, i) => {
//         const bookAbbr = v.ref.split(' ')[0] as keyof typeof bookNames;
//         const arabicRef = bookNames[bookAbbr]
//                           ? `${bookNames[bookAbbr]} ${v.ref.split(' ')[1]}`
//                           : v.ref;
//         return `${i + 1}. ${v.verse} (${arabicRef})`;
//     }).join("\n");

//     const formattedQuotes = foundQuotes.map((q, i) =>
//         `${i + 1}. "${q.quote}" - ${q.author}`
//     ).join("\n");

//     // 5. طلب OpenAI
//     const systemPrompt = `أنت مساعد مسيحي أرثوذكسي.
// أجب على سؤال المستخدم بشرح روحي وافٍ.
// استخدم البيانات التالية فقط (لا تخترع آيات):
// الآيات المتاحة:
// ${formattedVerses || "لا توجد آيات مطابقة."}

// أقوال الآباء المتاحة:
// ${formattedQuotes || "لا توجد أقوال مطابقة."}

// تنسيق الرد:
// 1. الشرح الروحي (فقرات واضحة).
// 2. فاصل (---)
// 3. عنوان: آيات من الكتاب المقدس (بتنسيق HTML: <h3 style='color:#2563eb'>آيات من الكتاب المقدس</h3>)
// 4. قائمة الآيات: نص الآية Bold والشاهد تحتها.
// 5. فاصل (---)
// 6. عنوان: من أقوال الآباء (بتنسيق HTML: <h3 style='color:#2563eb'>من أقوال الآباء</h3>)
// 7. قائمة الأقوال.`;

//     const chatRes = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: systemPrompt },
//         ...messages.slice(-3) // إرسال آخر 3 رسائل فقط لتوفير التكلفة والسرعة
//       ],
//       temperature: 0.7,
//     });

//     return NextResponse.json({ reply: chatRes.choices[0].message });

//   } catch (error: any) {
//     console.error("Chat API Error:", error);
//     return NextResponse.json({ error: "حدث خطأ في السيرفر", details: error.message }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const searchTerm = normalize(lastUserMessage);

    const publicPath = path.join(process.cwd(), "public");

    // تحميل البيانات إذا لم تكن في الكاش
    if (!bibleCache || !quotesCache || !topicsCache) {
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

    // البحث في الإنجيل
    let foundVerses: any[] = [];
    if (bibleCache) {
      for (const book of bibleCache) {
        if (foundVerses.length >= 4) break;
        for (const [cIdx, chapter] of (book.chapters as any[][]).entries()) {
          for (const vObj of chapter) {
            if (
              foundVerses.length < 4 &&
              normalize(vObj.text_plain).includes(searchTerm)
            ) {
              foundVerses.push({
                text: vObj.text_vocalized,
                ref: `${book.name} ${cIdx + 1}:${vObj.verse}`,
              });
            }
          }
        }
      }
    }

    const topicResults = topicsCache
      .filter((v: any) => normalize(v.topic).includes(searchTerm))
      .slice(0, 5)
      .map((v: any) => ({ text: v.verse, ref: v.ref }));

    const finalVerses = [...foundVerses, ...topicResults].slice(0, 7);
    const finalQuotes = quotesCache
      .filter(
        (q: any) =>
          normalize(q.quote).includes(searchTerm) ||
          normalize(q.topic).includes(searchTerm),
      )
      .slice(0, 5);

    const systemPrompt = `أنت مساعد مسيحي أرثوذكسي. أجب بعمق على السؤال.
المراجع المتاحة:
الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ")}
الأقوال: ${finalQuotes.map((q: { quote: any; author: any; }) => `"${q.quote}" - ${q.author}`).join(" | ")}

استخدم HTML لتنسيق الرد (فقرات، عناوين h3، خط عريض).`;

    try {
      // ضروري جداً استخدام await هنا
      const result = streamText({
        model: google("gemini-3-flash-preview"),
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });

      return result.toTextStreamResponse();
    } catch (err) {
      console.error("AI Error:", err);
      const fallback = streamText({
        model: openai("gpt-3.5-turbo"),
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });
      return fallback.toTextStreamResponse();
    }
  } catch (error: any) {
    return NextResponse.json(
      { content: "حدث خطأ في السيرفر" },
      { status: 500 },
    );
  }
}
