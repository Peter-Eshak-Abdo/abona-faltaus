import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { determineLiturgyDayContext } from "@/lib/coptic-liturgical-engine";
import { bookNames, shortBookNames } from "@/lib/books";

// Paths
const DATA_DIR = path.join(process.cwd(), "data");
const READINGS_ANNUAL_DIR = path.join(DATA_DIR, "coptish-datastore", "output", "readings", "annual");
const SYNAXARIUM_DIR = path.join(DATA_DIR, "coptish-datastore", "data", "readings", "synaxarium");
const BIBLE_FILE = path.join(process.cwd(), "public", "bible-json", "bible_fixed.json");

const MONTH_SLUGS: Record<number, string> = {
  1: "tout", 2: "baba", 3: "hator", 4: "kiahk", 5: "toba",
  6: "amshir", 7: "baramhat", 8: "baramouda", 9: "bashans",
  10: "paona", 11: "epep", 12: "mesra", 13: "nasie",
};

let bibleCache: Record<string, any> | null = null;
const BOOK_NAME_MAP: Record<string, string> = {};

function normalizeArabicText(str = "") {
  return str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function initBookNameMap() {
  if (Object.keys(BOOK_NAME_MAP).length > 0) return;

  for (const [abbrev, name] of Object.entries(bookNames)) {
    BOOK_NAME_MAP[normalizeArabicText(name)] = abbrev;
  }
  for (const [abbrev, shortName] of Object.entries(shortBookNames)) {
    if (shortName) BOOK_NAME_MAP[normalizeArabicText(shortName)] = abbrev;
  }

  // English and Arabic common alias variations
  const aliases: Record<string, string> = {
    "مزمور": "ps", "مزامير": "ps", "psalm": "ps", "psalms": "ps", "ps": "ps",
    "متى": "mt", "انجيل متى": "mt", "matthew": "mt", "mt": "mt",
    "مرقس": "mk", "انجيل مرقس": "mk", "mark": "mk", "mk": "mk",
    "لوقا": "lk", "انجيل لوقا": "lk", "luke": "lk", "lk": "lk",
    "يوحنا": "jn", "انجيل يوحنا": "jn", "john": "jn", "jn": "jn",
    "اعمال": "ac", "اعمال الرسل": "ac", "أعمال": "ac", "أعمال الرسل": "ac", "acts": "ac", "ac": "ac",
    "رومية": "ro", "رسالة رومية": "ro", "romans": "ro", "rom": "ro", "ro": "ro",
    "1كورنثوس": "1co", "١كورنثوس": "1co", "كورنثوس الاولى": "1co", "كورنثوس الأولى": "1co", "1corinthians": "1co", "1co": "1co",
    "2كورنثوس": "2co", "٢كورنثوس": "2co", "كورنثوس الثانية": "2co", "2corinthians": "2co", "2co": "2co",
    "غلاطية": "ga", "galatians": "ga", "ga": "ga",
    "افسس": "ep", "أفسس": "ep", "ephesians": "ep", "ep": "ep",
    "فيلبي": "php", "philippians": "php", "php": "php",
    "كولوسي": "col", "colossians": "col", "col": "col",
    "1تسالونيكي": "1th", "١تسالونيكي": "1th", "1thessalonians": "1th", "1th": "1th",
    "2تسالونيكي": "2th", "٢تسالونيكي": "2th", "2thessalonians": "2th", "2th": "2th",
    "1تيموثاوس": "1ti", "١تيموثاوس": "1ti", "1timothy": "1ti", "1ti": "1ti",
    "2تيموثاوس": "2ti", "٢تيموثاوس": "2ti", "2timothy": "2ti", "2ti": "2ti",
    "تيطس": "ti", "titus": "ti", "ti": "ti",
    "فليمون": "phm", "فيليمون": "phm", "philemon": "phm", "phm": "phm",
    "عبرانيين": "hb", "hebrews": "hb", "heb": "hb", "hb": "hb",
    "يعقوب": "ja", "james": "ja", "jas": "ja", "ja": "ja",
    "1بطرس": "1pe", "١بطرس": "1pe", "1peter": "1pe", "1pet": "1pe", "1pe": "1pe",
    "2بطرس": "2pe", "٢بطرس": "2pe", "2peter": "2pe", "2pet": "2pe", "2pe": "2pe",
    "1يوحنا": "1jn", "١يوحنا": "1jn", "1john": "1jn", "1jn": "1jn",
    "2يوحنا": "2jn", "٢يوحنا": "2jn", "2john": "2jn", "2jn": "2jn",
    "3يوحنا": "3jn", "٣يوحنا": "3jn", "3john": "3jn", "3jn": "3jn",
    "يهوذا": "jude", "jude": "jude",
    "رؤيا": "re", "رؤيا يوحنا": "re", "revelation": "re", "rev": "re", "re": "re"
  };

  for (const [k, v] of Object.entries(aliases)) {
    BOOK_NAME_MAP[normalizeArabicText(k)] = v;
  }
}

function loadBible() {
  if (bibleCache) return;
  try {
    initBookNameMap();
    if (fs.existsSync(BIBLE_FILE)) {
      const rawBible = JSON.parse(fs.readFileSync(BIBLE_FILE, "utf-8"));
      bibleCache = {};
      rawBible.forEach((book: any) => {
        if (book.abbrev && bibleCache) {
          bibleCache[book.abbrev] = book;
        }
      });
    }
  } catch (err) {
    console.error("[readings API] Bible loading error:", err);
  }
}

function findBookAbbrev(rawBookName: string): string | null {
  initBookNameMap();
  const clean = normalizeArabicText(rawBookName).replace(/[^a-z0-9\u0621-\u064A]/g, "");
  if (BOOK_NAME_MAP[clean]) return BOOK_NAME_MAP[clean];

  for (const [name, abbrev] of Object.entries(BOOK_NAME_MAP)) {
    const cleanKey = name.replace(/[^a-z0-9\u0621-\u064A]/g, "");
    if (clean === cleanKey || clean.includes(cleanKey) || cleanKey.includes(clean)) {
      return abbrev;
    }
  }
  return null;
}

function fetchVocalizedVerses(bookAbbrev: string, startChap: number, startVerse: number, endChap: number, endVerse: number): string {
  if (!bibleCache || !bibleCache[bookAbbrev]) return "";
  const book = bibleCache[bookAbbrev];
  const verses: string[] = [];

  for (let c = startChap; c <= endChap; c++) {
    const chapterIdx = c - 1;
    if (chapterIdx < 0 || chapterIdx >= (book.chapters || []).length) continue;
    const chapter = book.chapters[chapterIdx];
    if (!Array.isArray(chapter)) continue;

    const fromV = (c === startChap) ? startVerse : 1;
    const toV = (c === endChap) ? endVerse : chapter.length;

    for (let v = fromV; v <= toV; v++) {
      let verseObj = chapter[v - 1];
      if (!verseObj || verseObj.verse !== v) {
        verseObj = chapter.find((item: any) => item.verse === v);
      }
      if (verseObj) {
        const text = verseObj.text_vocalized || verseObj.text || verseObj.text_plain || "";
        if (text) {
          verses.push(`${text} (${v})`);
        }
      }
    }
  }

  return verses.join(" ");
}

function parseAndGetVocalizedReading(referenceStr: string): string {
  if (!referenceStr || !bibleCache) return "";
  
  // Split multiple parts joined by &, +, or comma when separate passages
  const segments = referenceStr.split(/\s*(?:&|\band\b|\+)\s*/i);
  const vocalizedParts: string[] = [];

  for (const segment of segments) {
    const norm = normalizeArabicText(segment);
    // Regex matches Book Name followed by Chapter:Verse or Chapter:Verse-Verse or Chapter:Verse-Chapter:Verse
    const match = norm.match(/^([a-z\u0621-\u064A0-9\s]+?)\s*(\d+)\s*[:\.]\s*(\d+)(?:\s*[-—–to]+\s*(?:(\d+)\s*[:\.]\s*)?(\d+))?/i);
    
    if (match) {
      const rawBook = match[1].trim();
      const startChap = parseInt(match[2], 10);
      const startVerse = parseInt(match[3], 10);
      let endChap = startChap;
      let endVerse = startVerse;

      if (match[5]) {
        if (match[4]) {
          endChap = parseInt(match[4], 10);
          endVerse = parseInt(match[5], 10);
        } else {
          endVerse = parseInt(match[5], 10);
        }
      }

      const abbrev = findBookAbbrev(rawBook);
      if (abbrev) {
        const text = fetchVocalizedVerses(abbrev, startChap, startVerse, endChap, endVerse);
        if (text) vocalizedParts.push(text);
      }
    }
  }

  return vocalizedParts.join("\n\n");
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

function extractSectionTextWithVocalizedBible(sectionArray: any[]): string {
  if (!Array.isArray(sectionArray) || sectionArray.length === 0) return "";
  const parts: string[] = [];

  for (const item of sectionArray) {
    // 1. Try to fetch vocalized Bible text using Arabic or English title
    const refAr = item?.title?.arabic || "";
    const refEn = item?.title?.english || "";
    
    let vocalized = parseAndGetVocalizedReading(refAr);
    if (!vocalized && refEn) {
      vocalized = parseAndGetVocalizedReading(refEn);
    }

    if (vocalized) {
      parts.push(vocalized);
      continue;
    }

    // 2. Fallback to datastore text
    if (Array.isArray(item?.text)) {
      for (const t of item.text) {
        if (t?.arabic) parts.push(t.arabic);
        else if (typeof t === "string") parts.push(t);
      }
    } else if (item?.text?.arabic) {
      parts.push(item.text.arabic);
    } else if (typeof item?.text === "string") {
      parts.push(item.text);
    }
  }

  return parts.join("\n\n").trim();
}

function loadAnnualFile(targetDate: Date) {
  try {
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(targetDate.getDate()).padStart(2, "0");
    const mmdd = `${monthStr}-${dayStr}`;

    const candidateFile2024 = path.join(READINGS_ANNUAL_DIR, `2024-${mmdd}.json`);
    if (fs.existsSync(candidateFile2024)) {
      return JSON.parse(fs.readFileSync(candidateFile2024, "utf-8"));
    }

    const candidateCurrent = path.join(READINGS_ANNUAL_DIR, `${targetDate.getFullYear()}-${mmdd}.json`);
    if (fs.existsSync(candidateCurrent)) {
      return JSON.parse(fs.readFileSync(candidateCurrent, "utf-8"));
    }

    if (fs.existsSync(READINGS_ANNUAL_DIR)) {
      const files = fs.readdirSync(READINGS_ANNUAL_DIR);
      const match = files.find(f => f.endsWith(`-${mmdd}.json`));
      if (match) {
        return JSON.parse(fs.readFileSync(path.join(READINGS_ANNUAL_DIR, match), "utf-8"));
      }
    }
  } catch (err) {
    console.error("[readings API] Annual reading read error:", err);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    loadBible();

    const body = await request.json();
    const { copticMonth, copticDay, isSunday, gregorianDate } = body;

    const gDate = gregorianDate ? new Date(gregorianDate) : new Date();
    const liturgicalContext = determineLiturgyDayContext(gDate, copticMonth, copticDay);

    const annualReadingData = loadAnnualFile(gDate);
    const synaxariumEntries = loadSynaxariumForDay(copticMonth, copticDay);

    const readings = {
      v_psalm: extractSectionTextWithVocalizedBible(annualReadingData?.["vespers-psalm"]),
      v_gospel: extractSectionTextWithVocalizedBible(annualReadingData?.["vespers-gospel"]),
      m_psalm: extractSectionTextWithVocalizedBible(annualReadingData?.["matins-psalm"]),
      m_gospel: extractSectionTextWithVocalizedBible(annualReadingData?.["matins-gospel"]),
      pauline: extractSectionTextWithVocalizedBible(annualReadingData?.["pauline-epistle"]),
      catholic: extractSectionTextWithVocalizedBible(annualReadingData?.["catholic-epistle"]),
      acts: extractSectionTextWithVocalizedBible(annualReadingData?.["acts-of-the-apostles"]),
      l_psalm: extractSectionTextWithVocalizedBible(annualReadingData?.["liturgy-psalm"]),
      l_gospel: extractSectionTextWithVocalizedBible(annualReadingData?.["liturgy-gospel"]),
    };

    const response = {
      title: liturgicalContext.nameAr || "قراءات اليوم المبارك",
      season: liturgicalContext.season || "annual",
      dayTune: liturgicalContext.tune || "annual",
      liturgicalContext,
      readings,
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


