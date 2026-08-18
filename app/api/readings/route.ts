import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// --- إعدادات المسارات ---
// تأكد أن المجلد data موجود في المجلد الرئيسي للمشروع (بجوار app و public)
const DATA_DIR = path.join(process.cwd(), "data");
const KATAMEROS_PATH = path.join(
  DATA_DIR,
  "extracted_data",
  "AnnualReadings.json"
);
const BIBLE_DIR = path.join(process.cwd(), "public", "bible-json", "bible_fixed.json");
// تأكد أن اسم الملف هنا يطابق الموجود عندك بالضبط (fixed vs default)
// const BIBLE_PATH = path.join(DATA_DIR, BIBLE_DIR);

// --- خريطة الاختصارات ---
const ID_TO_ABBREV: Record<number, string> = {
  1: "gn",
  2: "ex",
  3: "lv",
  4: "nm",
  5: "dt",
  6: "js",
  7: "jd",
  8: "rt",
  9: "1sm",
  10: "2sm",
  11: "1ki",
  12: "2ki",
  13: "1ch",
  14: "2ch",
  15: "ezr",
  16: "ne",
  17: "to",
  18: "jdt",
  19: "ps",
  20: "pr",
  21: "ec",
  22: "so",
  23: "wi",
  24: "sir",
  25: "is",
  26: "jr",
  27: "la",
  28: "bar",
  29: "ez",
  30: "dn",
  31: "ho",
  32: "jl",
  33: "am",
  34: "ob",
  35: "jon",
  36: "mic",
  37: "na",
  38: "hab",
  39: "zep",
  // 40: "hg",
  // 41: "zec",
  // 42: "mal",
  40: "mt",
  41: "mk",
  42: "lk",
  43: "jn",
  44: "ac",
  45: "ro",
  46: "1co",
  47: "2co",
  48: "ga",
  49: "ep",
  50: "php",
  51: "col",
  52: "1th",
  53: "2th",
  54: "1ti",
  55: "2ti",
  56: "ti",
  57: "phm",
  58: "hb",
  59: "ja",
  60: "1pe",
  61: "2pe",
  62: "1jn",
  63: "2jn",
  64: "3jn",
  65: "jude",
  73: "re",
};

// Caching
let readingsCache: any[] | null = null;
let bibleCache: Record<string, any> | null = null;

function loadData() {
  if (readingsCache && bibleCache) return;

  try {
    // 1. تحميل القطمارس
    if (!fs.existsSync(KATAMEROS_PATH)) {
      throw new Error(`ملف القطمارس غير موجود في المسار: ${KATAMEROS_PATH}`);
    }
    const readingsFile = fs.readFileSync(KATAMEROS_PATH, "utf-8");
    readingsCache = JSON.parse(readingsFile);

    // 2. تحميل الكتاب المقدس
    if (!fs.existsSync(BIBLE_DIR)) {
      throw new Error(`ملف الكتاب المقدس غير موجود في المسار: ${BIBLE_DIR}`);
    }
    const bibleFile = fs.readFileSync(BIBLE_DIR, "utf-8");
    const rawBible = JSON.parse(bibleFile);

    bibleCache = {};
    rawBible.forEach((book: any) => {
      if (book.abbrev && bibleCache) {
        bibleCache[book.abbrev] = book;
      }
    });
  } catch (error) {
    console.error("[readings] خطأ أثناء تحميل بيانات القطمارس:", error);
    throw error;
  }
}

function getVerseText(refString: string): string {
  if (!bibleCache || !refString) return "";

  let fullText: string[] = [];
  // تنظيف الكود من أي مسافات زائدة
  const parts = refString.split("*@+");

  parts.forEach((part) => {
    try {
      const [bookIdStr, rest] = part.split(".");
      if (!rest) return; // حماية من البيانات الناقصة

      const bookId = parseInt(bookIdStr);
      let abbrev = ID_TO_ABBREV[bookId];
      if (bookId === 19) abbrev = "ps";

      // حماية: التأكد من وجود السفر
      if (!abbrev || !bibleCache![abbrev]) {
        console.warn(`⚠️ سفر غير موجود: ID=${bookId}, Abbrev=${abbrev}`);
        return;
      }

      const [chapterStr, versesStr] = rest.split(":");
      const chapterNum = parseInt(chapterStr);
      const bookObj = bibleCache![abbrev];

      // حماية: التأكد من وجود الإصحاح
      if (
        !bookObj.chapters ||
        chapterNum > bookObj.chapters.length ||
        chapterNum < 1
      ) {
        console.warn(`⚠️ إصحاح غير موجود: ${abbrev} ${chapterNum}`);
        return;
      }

      const chapter = bookObj.chapters[chapterNum - 1];

      let indices: number[] = [];
      if (versesStr.includes("-")) {
        const [s, e] = versesStr.split("-").map(Number);
        for (let i = s; i <= e; i++) indices.push(i);
      } else if (versesStr.includes(",")) {
        indices = versesStr.split(",").map(Number);
      } else {
        indices = [parseInt(versesStr)];
      }

      indices.forEach((idx) => {
        // حماية: التأكد من وجود الآية
        let verseObj = null;
        if (idx <= chapter.length) {
          verseObj = chapter[idx - 1];
        }

        // محاولة بحث إضافية لو الترتيب مختلف
        if (!verseObj || verseObj.verse !== idx) {
          verseObj = chapter.find((v: any) => v.verse === idx);
        }

        if (verseObj) {
          fullText.push(`${verseObj.text_vocalized} (${idx})`);
        }
      });
    } catch (e) {
      console.error(`خطأ في معالجة الجزء: ${part}`, e);
    }
  });

  return fullText.join(" ");
}

export async function POST(request: Request) {
  try {
    // محاولة تحميل البيانات أولاً
    loadData();

    const body = await request.json();
    const { copticMonth, copticDay } = body;

    console.log(`📅 طلب قراءات ليوم: شهر ${copticMonth} / يوم ${copticDay}`);

    const dayRecord = readingsCache?.find(
      (r: any) => r.Month_Number === copticMonth && r.Day === copticDay
    );

    if (!dayRecord) {
      return NextResponse.json({ error: "No readings found" }, { status: 404 });
    }

    const response = {
      title: dayRecord.DayName || "قراءات اليوم",
      season: dayRecord.Season,
      readings: {
        m_psalm: getVerseText(dayRecord.M_Psalm_Ref),
        m_gospel: getVerseText(dayRecord.M_Gospel_Ref),
        l_psalm: getVerseText(dayRecord.L_Psalm_Ref),
        l_gospel: getVerseText(dayRecord.L_Gospel_Ref),
        pauline: getVerseText(dayRecord.P_Gospel_Ref),
        catholic: getVerseText(dayRecord.C_Gospel_Ref),
        acts: getVerseText(dayRecord.X_Gospel_Ref),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("🔥 CRITICAL SERVER ERROR:", error.message);
    // إرجاع رسالة الخطأ للمتصفح لنفهم السبب
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
