import {
  bookNames,
  oldTestament,
  newTestament,
  shortBookNames,
} from "@/lib/books";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
let cachedBible: any = null;

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
  BOOKNAME_TO_ABBREV[
    removeArabicDiacritics(bookNames[k as keyof typeof bookNames])
  ] = k;
  BOOKNAME_TO_ABBREV[
    removeArabicDiacritics(
      shortBookNames[k as keyof typeof shortBookNames] || "",
    )
  ] = k;
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
  مزمور151: "2ps",
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

const DB_NAME_TO_ABBREV: Record<string, string> = {
  "01-Genesis": "gn",
  "02-Exodus": "ex",
  "03-Leviticus": "lv",
  "04-Numbers": "nm",
  "05-Deuteronomy": "dt",
  "06-Joshua": "js",
  "07-Judges": "jd",
  "08-Ruth": "rt",
  "09-1-Samuel": "1sm",
  "10-2-Samuel": "2sm",
  "11-1-Kings": "1ki",
  "12-2-Kings": "2ki",
  "13-1-Chronicles": "1ch",
  "14-2-Chronicles": "2ch",
  "15-Ezra": "ezr",
  "16-Nehmiah": "ne",
  "17-tobit__deu": "to",
  "18-judith__deu": "jdt",
  "19-1-Esther": "es",
  "19-2-esther-the-rest__deu": "2es",
  "20-Job": "job",
  "21-1-Psalms": "ps",
  "21-2-Psalm-151__Deu": "2ps",
  "22-Proverbs": "pr",
  "23-Ecclesiastes": "ec",
  "24-Song-of-Songs": "so",
  "25-wisdom__deu": "wi",
  "26-sirach__deu": "sir",
  "27-Isiah": "is",
  "28-Jeremiah": "jr",
  "29-Lamentations": "la",
  "31-Ezekiel": "ez",
  "30-baruch__deu": "bar",
  "32-1-Daniel": "dn",
  "32-2-daniel-the-rest__deu": "2dn",
  "33-Hosea": "ho",
  "34-Joel": "jl",
  "35-Amos": "am",
  "36-Obadiah": "ob",
  "37-Jonah": "jon",
  "38-Micah": "mic",
  "39-Nahum": "na",
  "40-Habakuk": "hab",
  "41-Zephaniah": "zep",
  "42-Haggai": "hg",
  "43-Zechariah": "zec",
  "44-Malachi": "mal",
  "45-first-maccabees__deu": "1mac",
  "46-second-maccabees__deu": "2mac",
  "47-Matthew": "mt",
  "48-Mark": "mk",
  "49-Luke": "lk",
  "50-John": "jn",
  "51-Acts": "ac",
  "52-Romans": "ro",
  "53-1-Corinthians": "1co",
  "54-2-Corinthians": "2co",
  "55-Galatians": "ga",
  "56-Ephesians": "ep",
  "57-Philipians": "php",
  "58-Colossians": "col",
  "59-1-thessalonians": "1th",
  "60-2-thessalonians": "2th",
  "61-1-Timothy": "1ti",
  "62-2-Timothy": "2ti",
  "63-Titus": "ti",
  "64-Phillemon": "phm",
  "65-Hebrews": "hb",
  "66-James": "ja",
  "67-1-Peter": "1pe",
  "68-2-Peter": "2pe",
  "69-1-John": "1jn",
  "70-2-John": "2jn",
  "71-3-John": "3jn",
  "72-Jude": "jude",
  "73-Revelation": "re"
};

// lib/bible-utils.ts

export async function loadBible(onProgress?: (percent: number) => void): Promise<BookObj[]> {
  if (cachedBible) return cachedBible;

  const canonicalOrder = [...oldTestament, ...newTestament];
  let allData: any[] = [];
  let from = 0;
  let step = 1000;
  let fetchMore = true;

  // تقديرياً عدد آيات الكتاب المقدس بالأسفار القانونية الثانية حوالي 35,000 آية
  const TOTAL_ESTIMATED_VERSES = 35797;

  while (fetchMore) {
    const { data, error } = await supabase
      .from("bible_verses")
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + step - 1);

    if (error) break;
    if (data && data.length > 0) {
      allData.push(...data);
      from += step;

      // تحديث نسبة التحميل
      if (onProgress) {
        const percent = Math.min(Math.round((allData.length / TOTAL_ESTIMATED_VERSES) * 100), 99);
        onProgress(percent);
      }

      if (data.length < step) fetchMore = false;
    } else fetchMore = false;
  }

  const booksMap = new Map<string, BookObj>();

  allData.forEach((row) => {
    // حل مشكلة Genesis: نستخدم الاسم الإنجليزي كـ Key لو فشل الاختصار
    let abbrev = DB_NAME_TO_ABBREV[row.book_name] || lookupAbbrevByName(row.book_name) || row.book_name;

    if (!booksMap.has(abbrev)) {
      booksMap.set(abbrev, {
        abbrev: abbrev,
        name: bookNames[abbrev as keyof typeof bookNames] || row.book_name,
        chapters: [],
      });
    }

    const book = booksMap.get(abbrev)!;
    const chapterIndex = (row.chapter_number || 1) - 1;

    if (!book.chapters[chapterIndex]) {
      book.chapters[chapterIndex] = [];
    }

    book.chapters[chapterIndex].push({
      verse: row.verse_number,
      text_vocalized: row.vocalized_text,
      text_plain: row.plain_text,
    });
  });

  const sortedBooks = Array.from(booksMap.values()).sort((a, b) => {
    const indexA = canonicalOrder.indexOf(a.abbrev);
    const indexB = canonicalOrder.indexOf(b.abbrev);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  if (onProgress) onProgress(100); // اكتمل التحميل
  cachedBible = sortedBooks;
  return cachedBible;
}
