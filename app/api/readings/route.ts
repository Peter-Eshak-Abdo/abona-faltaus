import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Paths
const DATA_DIR = path.join(process.cwd(), "data");
const ANNUAL_PATH = path.join(DATA_DIR, "extracted_data", "AnnualReadings.json");
const SUNDAY_PATH = path.join(DATA_DIR, "extracted_data", "SundayReadings.json");
const BIBLE_DIR = path.join(process.cwd(), "public", "bible-json", "bible_fixed.json");
const SYNAXARIUM_DIR = path.join(DATA_DIR, "coptish-datastore", "data", "readings", "synaxarium");

// ID to Bible abbrev mapping
const ID_TO_ABBREV: Record<number, string> = {
  1: "gn", 2: "ex", 3: "lv", 4: "nm", 5: "dt",
  6: "js", 7: "jd", 8: "rt", 9: "1sm", 10: "2sm",
  11: "1ki", 12: "2ki", 13: "1ch", 14: "2ch", 15: "ezr",
  16: "ne", 17: "to", 18: "jdt", 19: "ps", 20: "pr",
  21: "ec", 22: "so", 23: "wi", 24: "sir", 25: "is",
  26: "jr", 27: "la", 28: "bar", 29: "ez", 30: "dn",
  31: "ho", 32: "jl", 33: "am", 34: "ob", 35: "jon",
  36: "mic", 37: "na", 38: "hab", 39: "zep",
  40: "mt", 41: "mk", 42: "lk", 43: "jn", 44: "ac",
  45: "ro", 46: "1co", 47: "2co", 48: "ga", 49: "ep",
  50: "php", 51: "col", 52: "1th", 53: "2th", 54: "1ti",
  55: "2ti", 56: "ti", 57: "phm", 58: "hb", 59: "ja",
  60: "1pe", 61: "2pe", 62: "1jn", 63: "2jn", 64: "3jn",
  65: "jude", 73: "re",
};

const MONTH_SLUGS: Record<number, string> = {
  1: "tout", 2: "baba", 3: "hator", 4: "kiahk", 5: "toba",
  6: "amshir", 7: "baramhat", 8: "baramouda", 9: "bashans",
  10: "paona", 11: "epep", 12: "mesra", 13: "nasie",
};

// In-memory caches
let annualCache: any[] | null = null;
let sundayCache: any[] | null = null;
let bibleCache: Record<string, any> | null = null;

function loadData() {
  if (annualCache && bibleCache && sundayCache) return;

  try {
    if (fs.existsSync(ANNUAL_PATH)) {
      annualCache = JSON.parse(fs.readFileSync(ANNUAL_PATH, "utf-8"));
    }
    if (fs.existsSync(SUNDAY_PATH)) {
      sundayCache = JSON.parse(fs.readFileSync(SUNDAY_PATH, "utf-8"));
    }
    if (fs.existsSync(BIBLE_DIR)) {
      const bibleFile = fs.readFileSync(BIBLE_DIR, "utf-8");
      const rawBible = JSON.parse(bibleFile);
      bibleCache = {};
      rawBible.forEach((book: any) => {
        if (book.abbrev && bibleCache) {
          bibleCache[book.abbrev] = book;
        }
      });
    }
  } catch (error) {
    console.error("[readings API] Data loading error:", error);
    throw error;
  }
}

function getVerseText(refString: string): string {
  if (!bibleCache || !refString) return "";

  const fullText: string[] = [];
  const parts = refString.split("*@+");

  parts.forEach((part) => {
    try {
      const [bookIdStr, rest] = part.split(".");
      if (!rest) return;

      const bookId = parseInt(bookIdStr);
      const abbrev = ID_TO_ABBREV[bookId];

      if (!abbrev || !bibleCache![abbrev]) return;

      const [chapterStr, versesStr] = rest.split(":");
      const chapterNum = parseInt(chapterStr);
      const bookObj = bibleCache![abbrev];

      if (!bookObj.chapters || chapterNum > bookObj.chapters.length || chapterNum < 1) {
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
        let verseObj = null;
        if (idx <= chapter.length) {
          verseObj = chapter[idx - 1];
        }
        if (!verseObj || verseObj.verse !== idx) {
          verseObj = chapter.find((v: any) => v.verse === idx);
        }

        if (verseObj) {
          fullText.push(`${verseObj.text_vocalized || verseObj.text} (${idx})`);
        }
      });
    } catch (e) {
      console.error(`Error parsing reading ref: ${part}`, e);
    }
  });

  return fullText.join(" ");
}

function loadSynaxariumForDay(month: number, day: number) {
  try {
    const slug = MONTH_SLUGS[month];
    if (!slug) return [];

    const filePath = path.join(SYNAXARIUM_DIR, `${slug}-${day}.yml`);
    if (!fs.existsSync(filePath)) return [];

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const parsed: any = yaml.load(fileContent);

    if (parsed && Array.isArray(parsed.commemorations)) {
      return parsed.commemorations.map((item: any) => ({
        titleAr: item.title?.arabic || "",
        titleEn: item.title?.english || "",
        textAr: item.text?.arabic || "",
        textEn: item.text?.english || "",
      }));
    }
    return [];
  } catch (err) {
    console.error("Synaxarium loader error:", err);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    loadData();

    const body = await request.json();
    const { copticMonth, copticDay, isSunday } = body;

    let dayRecord: any = null;

    if (isSunday && sundayCache) {
      // Calculate which Sunday of the month (1st, 2nd, 3rd, 4th, 5th)
      const sundayIndex = Math.min(Math.ceil(copticDay / 7), 5);
      dayRecord = sundayCache.find(
        (r: any) => r.Month_Number === copticMonth && r.Day === sundayIndex
      );
    }

    if (!dayRecord && annualCache) {
      dayRecord = annualCache.find(
        (r: any) => r.Month_Number === copticMonth && r.Day === copticDay
      );
    }

    const synaxariumEntries = loadSynaxariumForDay(copticMonth, copticDay);

    const response = {
      title: dayRecord?.DayName || "قراءات اليوم",
      season: dayRecord?.Season || "",
      dayTune: dayRecord?.Day_Tune || "",
      readings: {
        v_psalm: getVerseText(dayRecord?.V_Psalm_Ref || ""),
        v_gospel: getVerseText(dayRecord?.V_Gospel_Ref || ""),
        m_psalm: getVerseText(dayRecord?.M_Psalm_Ref || ""),
        m_gospel: getVerseText(dayRecord?.M_Gospel_Ref || ""),
        pauline: getVerseText(dayRecord?.P_Gospel_Ref || ""),
        catholic: getVerseText(dayRecord?.C_Gospel_Ref || ""),
        acts: getVerseText(dayRecord?.X_Gospel_Ref || ""),
        l_psalm: getVerseText(dayRecord?.L_Psalm_Ref || ""),
        l_gospel: getVerseText(dayRecord?.L_Gospel_Ref || ""),
      },
      synaxarium: synaxariumEntries,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Katamaros server error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
