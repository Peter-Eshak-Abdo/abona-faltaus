import fs from "fs/promises";
import path from "path";
import {
  bookNames,
  oldTestament,
  newTestament,
  shortBookNames,
} from "@/lib/books";

export type VerseObj = {
  verse: number | null;
  text_vocalized: string;
  text_plain: string;
};

export type BookObj = {
  abbrev: string;
  name?: string;
  chapters: VerseObj[][];
};

const CANDIDATE_PATHS = [
  path.join(process.cwd(), "public", "bible-json", "bible_fixed.json"),
  path.join(process.cwd(), "public", "bible-json", "bible.json"),
  path.join(process.cwd(), "public", "ar_svd.json"),
  path.join(process.cwd(), "public", "bible.json"),
];
// small util to remove Arabic diacritics for matching
function removeArabicDiacritics(str = "") {
  return str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// build reverse maps from lib/books
const BOOKNAME_TO_ABBREV: Record<string, string> = {};
for (const k of Object.keys(bookNames)) {
  BOOKNAME_TO_ABBREV[removeArabicDiacritics(bookNames[k as keyof typeof bookNames])] = k;
  BOOKNAME_TO_ABBREV[removeArabicDiacritics(shortBookNames[k as keyof typeof shortBookNames] || "")] = k;
}

// extra manual map (some variants)
const EXTRA_NAME_MAP: Record<string, string> = {
  التكوين: "gn",
  "سفر التكوين": "gn",
  التكوين_: "gn",
  تك: "gn",
  الخروج: "ex",
  اللاويين: "lv",
  العدد: "nm",
  التثنية: "dt",
  يشوع: "js",
  قضاة: "jd",
  راعوث: "rt",
  "صموئيل الأول": "1sm",
  "صموئيل الثاني": "2sm",
  "الملوك الأول": "1ki",
  "الملوك الثاني": "2ki",
  "أخبار الأيام الأول": "1ch",
  "أخبار الأيام الثاني": "2ch",
  عزرا: "ezr",
  نحميا: "ne",
  استير: "es",
  أيوب: "job",
  المزامير: "ps",
  الأمثال: "pr",
  الجامعة: "ec",
  "نشيد الأنشاد": "so",
  إشعياء: "is",
  إرمية: "jr",
  "مراثي إرمية": "la",
  حزقيال: "ez",
  دانيال: "dn",
  هوشع: "ho",
  يوئيل: "jl",
  عاموس: "am",
  عوبديا: "ob",
  يونان: "jon",
  ميخا: "mic",
  ناحوم: "na",
  حبقوق: "hab",
  صفنيا: "zep",
  حجاي: "hg",
  زكريا: "zec",
  ملاخي: "mal",
  متى: "mt",
  مرقس: "mk",
  لوقا: "lk",
  يوحنا: "jn",
  "أعمال الرسل": "ac",
  رومية: "ro",
  "كورنثوس الأولى": "1co",
  "كورنثوس الثانية": "2co",
  غلاطية: "ga",
  أفسس: "ep",
  فيلبي: "php",
  كولوسي: "col",
  "تسالونيكي الأولى": "1th",
  "تسالونيكي الثانية": "2th",
  "تيموثاوس الأولى": "1ti",
  "تيموثاوس الثانية": "2ti",
  تيطس: "ti",
  فيليمون: "phm",
  عبرانيين: "hb",
  يعقوب: "ja",
  "بطرس الأولى": "1pe",
  "بطرس الثانية": "2pe",
  "يوحنا الأولى": "1jn",
  "يوحنا الثانية": "2jn",
  "يوحنا الثالثة": "3jn",
  يهوذا: "jude",
  "رؤيا يوحنا": "re",
};


function lookupAbbrevByName(name?: string) {
  if (!name) return null;
  const key = removeArabicDiacritics(name);
  if (BOOKNAME_TO_ABBREV[key]) return BOOKNAME_TO_ABBREV[key];
  if (EXTRA_NAME_MAP[name]) return EXTRA_NAME_MAP[name];
  // try partial match (startsWith)
  for (const kk of Object.keys(BOOKNAME_TO_ABBREV)) {
    if (key.includes(kk) || kk.includes(key)) return BOOKNAME_TO_ABBREV[kk];
  }
  return null;
}

function toVerseObj(input: any, idxInChapter?: number): VerseObj {
  if (typeof input === "string") {
    const txt = input.trim();
    return {
      verse: idxInChapter != null ? idxInChapter + 1 : null,
      text_vocalized: txt,
      text_plain: removeArabicDiacritics(txt),
    };
  }
  if (typeof input === "object" && input !== null) {
    const text = (
      input.text_vocalized ??
      input.text ??
      input.t ??
      input.content ??
      input[0] ??
      ""
    )
      .toString()
      .trim();
    const verseNum =
      typeof input.verse === "number"
        ? input.verse
        : typeof input.verse === "string" && /^\d+$/.test(input.verse)
        ? parseInt(input.verse, 10)
        : null;
    return {
      verse: verseNum ?? (idxInChapter != null ? idxInChapter + 1 : null),
      text_vocalized: text,
      text_plain: removeArabicDiacritics(text),
    };
  }
  const s = String(input ?? "").trim();
  return {
    verse: idxInChapter != null ? idxInChapter + 1 : null,
    text_vocalized: s,
    text_plain: removeArabicDiacritics(s),
  };
}

function normalizeChaptersField(chaptersField: any): VerseObj[][] {
  if (!chaptersField) return [];

  // already array of chapters?
  if (Array.isArray(chaptersField)) {
    if (chaptersField.length > 0 && Array.isArray(chaptersField[0])) {
      return chaptersField.map((ch: any[]) =>
        (ch || []).map((v: any, i: number) => toVerseObj(v, i))
      );
    }
    // flat array of verses -> wrap
    const isFlat = chaptersField.every(
      (el) => typeof el === "string" || typeof el === "object"
    );
    if (isFlat)
      return [chaptersField.map((v: any, i: number) => toVerseObj(v, i))];
  }

  // object keyed by chapter numbers or names
  if (typeof chaptersField === "object") {
    const keys = Object.keys(chaptersField).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, "") || "0", 10);
      const nb = parseInt(b.replace(/\D/g, "") || "0", 10);
      return na - nb;
    });
    const out: VerseObj[][] = [];
    for (const k of keys) {
      const val = chaptersField[k];
      if (Array.isArray(val))
        out.push(val.map((v: any, i: number) => toVerseObj(v, i)));
    }
    if (out.length) return out;
  }

  // fallback single chapter
  try {
    const arr = Array.isArray(chaptersField) ? chaptersField : [chaptersField];
    return [arr.map((v: any, i: number) => toVerseObj(v, i))];
  } catch {
    return [];
  }
}

export async function loadBible(): Promise<BookObj[]> {
  let fileData: string | null = null;
  let usedPath: string | null = null;
  for (const p of CANDIDATE_PATHS) {
    try {
      const stat = await fs.stat(p).catch(() => null);
      if (stat && stat.isFile()) {
        fileData = await fs.readFile(p, "utf-8");
        usedPath = p;
        break;
      }
    } catch (e) {
      // ignore
    }
  }
  if (!fileData)
    throw new Error(
      "لا يوجد ملف JSON للكتاب المقدس في public/. تأكد من وجود bible_fixed.json"
    );

  const parsed = JSON.parse(fileData.replace(/^\uFEFF/, ""));
  let booksRaw: any[] = [];

  if (Array.isArray(parsed)) {
    booksRaw = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    // if top-level keys are book names -> convert to array
    const firstKey = Object.keys(parsed)[0];
    const firstVal = (parsed as any)[firstKey];
    if (
      Array.isArray(firstVal) ||
      (typeof firstVal === "object" &&
        firstVal !== null &&
        (firstVal.chapters || Array.isArray(firstVal)))
    ) {
      // treat as map: key = book name
      booksRaw = Object.keys(parsed).map((k) => {
        const v = (parsed as any)[k];
        if (Array.isArray(v)) return { name: k, chapters: v };
        if (typeof v === "object" && v !== null)
          return { ...(v as object), name: v.name ?? k };
        return { name: k, chapters: [] };
      });
    } else if (parsed.chapters || parsed.abbrev || parsed.name) {
      // single book object
      booksRaw = [parsed];
    } else {
      // unknown object -> try values
      const vals = Object.values(parsed);
      if (Array.isArray(vals) && vals.length > 0) booksRaw = vals as any[];
    }
  }

  // if still empty -> throw
  if (!booksRaw.length) throw new Error("لم أجد كتبًا صالحة داخل JSON");

  // build canonical abbrev list for fallback assignment if needed
  const canonical = [...oldTestament, ...newTestament];

  const books: BookObj[] = booksRaw.map((raw: any, idx: number) => {
    const rawName = (raw.abbrev || raw.name || raw.title || raw.book || "")
      .toString()
      .trim();
    let abbrev = (raw.abbrev || "").toString().trim().toLowerCase();
    if (!abbrev) {
      // try lookup by name via bookNames
      const guessed = lookupAbbrevByName(rawName);
      if (guessed) abbrev = guessed;
    }
    // fallback: if still missing and we have canonical length and idx fits
    if (!abbrev) {
      if (canonical[idx]) abbrev = canonical[idx];
      else
        abbrev =
          rawName.replace(/\s+/g, "_").toLowerCase().slice(0, 6) ||
          `book${idx}`;
    }

    const chapters = normalizeChaptersField(
      raw.chapters ?? raw.verses ?? raw.content ?? raw.text ?? raw
    );
    return {
      abbrev: abbrev.toLowerCase(),
      name: raw.name ?? rawName ?? abbrev,
      chapters,
    };
  });

  // debug log small summary
  // console.log("loadBible used:", usedPath, "books:", books.length, "example:", books.slice(0,2).map(b => ({abbrev:b.abbrev, chapters:b.chapters.length})));
  return books;
}
