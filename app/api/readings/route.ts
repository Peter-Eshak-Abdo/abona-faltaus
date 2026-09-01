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
    if (!Number.isInteger(month) || !Number.isInteger(day)) return [];
    if (month < 1 || month > 13 || day < 1 || day > 30) return [];

    const slug = MONTH_SLUGS[month];
    if (!slug) return [];

    const fileName = `${slug}-${day}.yml`;
    const synaxariumRoot = path.resolve(SYNAXARIUM_DIR);
    const filePath = path.resolve(synaxariumRoot, fileName);
    const rootWithSep = synaxariumRoot.endsWith(path.sep) ? synaxariumRoot : synaxariumRoot + path.sep;
    if (!(filePath === synaxariumRoot || filePath.startsWith(rootWithSep))) return [];

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

import { determineLiturgyDayContext } from "@/lib/coptic-liturgical-engine";

const LENT_PATH = path.join(DATA_DIR, "extracted_data", "GreatLentReadings.json");
const PENTECOST_PATH = path.join(DATA_DIR, "extracted_data", "PentecostReadings.json");

let lentCache: any[] | null = null;
let pentecostCache: any[] | null = null;

function loadAllLiturgicalCaches() {
  loadData();
  if (!lentCache && fs.existsSync(LENT_PATH)) {
    lentCache = JSON.parse(fs.readFileSync(LENT_PATH, "utf-8"));
  }
  if (!pentecostCache && fs.existsSync(PENTECOST_PATH)) {
    pentecostCache = JSON.parse(fs.readFileSync(PENTECOST_PATH, "utf-8"));
  }
}

export async function POST(request: Request) {
  try {
    loadAllLiturgicalCaches();

    const body = await request.json();
    const { copticMonth, copticDay, isSunday, gregorianDate } = body;

    // Use Gregorian Date if provided, otherwise reconstruct
    const gDate = gregorianDate ? new Date(gregorianDate) : new Date();
    const liturgicalContext = determineLiturgyDayContext(gDate, copticMonth, copticDay);

    let dayRecord: any = null;

    // 1. Check Moveable Seasons first (Great Lent, Pentecost, Pascha)
    if (liturgicalContext.season === 'great_lent' && lentCache) {
      const week = (liturgicalContext as any).lentWeek || 1;
      const dayOfWeek = (liturgicalContext as any).dayOfWeek || 0;
      dayRecord = lentCache.find((r: any) => r.Week === week && r.DayOfWeek === dayOfWeek);
    } else if (liturgicalContext.season === 'pentecost' && pentecostCache) {
      const week = (liturgicalContext as any).pentecostWeek || 1;
      const dayOfWeek = (liturgicalContext as any).dayOfWeek || 0;
      dayRecord = pentecostCache.find((r: any) => r.Week === week && r.DayOfWeek === dayOfWeek);
    }

    // 2. Sunday Katameros
    if (!dayRecord && isSunday && sundayCache) {
      const sundayIndex = Math.min(Math.ceil(copticDay / 7), 5);
      dayRecord = sundayCache.find(
        (r: any) => r.Month_Number === copticMonth && r.Day === sundayIndex
      );
    }

    // 3. Annual Days Katameros
    if (!dayRecord && annualCache) {
      dayRecord = annualCache.find(
        (r: any) => r.Month_Number === copticMonth && r.Day === copticDay
      );
    }

    const synaxariumEntries = loadSynaxariumForDay(copticMonth, copticDay);

    const response = {
      title: liturgicalContext.nameAr || dayRecord?.DayName || "قراءات اليوم",
      season: liturgicalContext.season || dayRecord?.Season || "annual",
      dayTune: liturgicalContext.tune || dayRecord?.Day_Tune || "annual",
      liturgicalContext,
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
