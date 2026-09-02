import {
  bookNames,
  oldTestament,
  newTestament,
  shortBookNames,
} from "@/lib/books";
// import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);
// let cachedBible: any = null;

let cachedBible: any = null;

export type VerseObj = {
  verse: number;
  text_vocalized: string;
  text_plain: string;
};

export type BookObj = {
  abbrev: string;
  name: string;
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

let cachedCopticBible: BookObj[] | null = null;

export const COPTIC_BOOK_NAMES: Record<string, { coptic: string; arabic: string; abbrev: string }> = {
  Genesis: { coptic: "Ϯⲅⲉⲛⲉⲥⲓⲥ", arabic: "التكوين", abbrev: "gn" },
  Exodus: { coptic: "Ⲡⲓⲉⲝⲟⲇⲟⲥ", arabic: "الخروج", abbrev: "ex" },
  Leviticus: { coptic: "Ⲡⲓⲗⲉⲩⲓⲧⲓⲕⲟⲛ", arabic: "اللاويين", abbrev: "lv" },
  Numeri: { coptic: "Ⲛⲓⲁⲣⲓⲑⲙⲟⲥ", arabic: "العدد", abbrev: "nm" },
  Deuteronomium: { coptic: "Ⲡⲓⲇⲉⲩⲧⲉⲣⲟⲛⲟⲙⲓⲟⲛ", arabic: "التثنية", abbrev: "dt" },
  Joshua: { coptic: "Ⲓⲏⲥⲟⲩ ⲡϣⲏⲣⲉ ⲛ̀Ⲛⲁⲩⲏ", arabic: "يشوع", abbrev: "js" },
  Judges: { coptic: "Ⲛⲓⲕⲣⲓⲧⲏⲥ", arabic: "القضاة", abbrev: "jd" },
  Ruth: { coptic: "Ⲣⲟⲩⲑ", arabic: "راعوث", abbrev: "rt" },
  Job: { coptic: "Ⲓⲱⲃ", arabic: "أيوب", abbrev: "job" },
  Iob: { coptic: "Ⲓⲱⲃ", arabic: "أيوب", abbrev: "job" },
  Psalmi: { coptic: "Ⲛⲓⲯⲁⲗⲙⲟⲥ", arabic: "المزامير", abbrev: "ps" },
  Proverbs: { coptic: "Ⲛⲓⲡⲁⲣⲟⲓⲙⲓⲁ", arabic: "الأمثال", abbrev: "pr" },
  Ecclesiastes: { coptic: "Ⲡⲓⲉⲕⲕⲗⲏⲥⲓⲁⲥⲧⲏⲥ", arabic: "الجامعة", abbrev: "ec" },
  Song: { coptic: "Ⲡϫⲱ ⲛ̀ⲧⲉ ⲛⲓϫⲱ", arabic: "نشيد الأنشاد", abbrev: "so" },
  Wisdom: { coptic: "Ϯⲥⲟⲫⲓⲁ ⲛ̀Ⲥⲟⲗⲟⲙⲱⲛ", arabic: "الحكمة", abbrev: "wi" },
  Sirach: { coptic: "Ϯⲥⲟⲫⲓⲁ ⲛ̀Ⲓⲏⲥⲟⲩ ⲡϣⲏⲣⲉ ⲛ̀Ⲥⲓⲣⲁⲭ", arabic: "يشوع بن سيراخ", abbrev: "sir" },
  Esther: { coptic: "Ⲉⲥⲑⲏⲣ", arabic: "أستير", abbrev: "es" },
  Judith: { coptic: "Ⲓⲟⲩⲇⲓⲑ", arabic: "يهوديت", abbrev: "jdt" },
  Tobit: { coptic: "Ⲧⲱⲃⲓⲧ", arabic: "طوبيا", abbrev: "to" },
  Baruch: { coptic: "Ⲃⲁⲣⲟⲩⲭ", arabic: "باروخ", abbrev: "bar" },
  Isaias: { coptic: "Ⲏⲥⲁⲏⲁⲥ", arabic: "إشعياء", abbrev: "is" },
  Ieremias: { coptic: "Ⲓⲉⲣⲉⲙⲓⲁⲥ", arabic: "إرميا", abbrev: "jr" },
  Lamentationes: { coptic: "Ⲛⲉϩⲡⲓ ⲛ̀Ⲓⲉⲣⲉⲙⲓⲁⲥ", arabic: "مراثي إرميا", abbrev: "la" },
  Ezechiel: { coptic: "Ⲓⲉⲍⲉⲕⲓⲏⲗ", arabic: "حزقيال", abbrev: "ez" },
  Daniel: { coptic: "Ⲇⲁⲛⲓⲏⲗ", arabic: "دانيال", abbrev: "dn" },
  Osee: { coptic: "Ⲱⲥⲏⲉ", arabic: "هوشع", abbrev: "ho" },
  Ioel: { coptic: "Ⲓⲱⲏⲗ", arabic: "يوئيل", abbrev: "jl" },
  Amos: { coptic: "Ⲁⲙⲱⲥ", arabic: "عاموس", abbrev: "am" },
  Abdias: { coptic: "Ⲁⲃⲇⲓⲟⲩ", arabic: "عوبديا", abbrev: "ob" },
  Ionas: { coptic: "Ⲓⲱⲛⲁⲥ", arabic: "يونان", abbrev: "jon" },
  Michaeas: { coptic: "Ⲙⲓⲭⲁⲓⲁⲥ", arabic: "ميخا", abbrev: "mic" },
  Nahum: { coptic: "Ⲛⲁⲟⲩⲙ", arabic: "ناحوم", abbrev: "na" },
  Habacuc: { coptic: "Ⲁⲙⲃⲁⲕⲟⲩⲙ", arabic: "حبقوق", abbrev: "hab" },
  Sophonias: { coptic: "Ⲥⲟⲫⲟⲛⲓⲁⲥ", arabic: "صفنيا", abbrev: "zep" },
  Aggaeus: { coptic: "Ⲁⲅⲅⲉⲟⲥ", arabic: "حجي", abbrev: "hg" },
  Zacharias: { coptic: "Ⲍⲁⲭⲁⲣⲓⲁⲥ", arabic: "زكريا", abbrev: "zec" },
  Malachias: { coptic: "Ⲙⲁⲗⲁⲭⲓⲁⲥ", arabic: "ملاخي", abbrev: "mal" },
  MAT: { coptic: "Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ ⲕⲁⲧⲁ Ⲙⲁⲧⲑⲉⲟⲛ", arabic: "إنجيل متى", abbrev: "mt" },
  MRK: { coptic: "Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ ⲕⲁⲧⲁ Ⲙⲁⲣⲕⲟⲛ", arabic: "إنجيل مرقس", abbrev: "mk" },
  LUK: { coptic: "Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ ⲕⲁⲧⲁ Ⲗⲟⲩⲕⲁⲛ", arabic: "إنجيل لوقا", abbrev: "lk" },
  JHN: { coptic: "Ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ ⲕⲁⲧⲁ Ⲓⲱⲁⲛⲛⲏⲛ", arabic: "إنجيل يوحنا", abbrev: "jn" },
  ACT: { coptic: "Ⲛⲓⲡⲣⲁⲝⲓⲥ ⲛ̀ⲧⲉ ⲛⲓⲁ̀ⲡⲟⲥⲧⲟⲗⲟⲥ", arabic: "أعمال الرسل", abbrev: "ac" },
  ROM: { coptic: "Ⲡⲣⲟⲥ Ⲣⲱⲙⲉⲟⲩⲥ", arabic: "رومية", abbrev: "ro" },
  "1CO": { coptic: "Ⲡⲣⲟⲥ Ⲕⲟⲣⲓⲛⲑⲓⲟⲩⲥ Ⲁ̅", arabic: "كورنثوس الأولى", abbrev: "1co" },
  "2CO": { coptic: "Ⲡⲣⲟⲥ Ⲕⲟⲣⲓⲛⲑⲓⲟⲩⲥ Ⲃ̅", arabic: "كورنثوس الثانية", abbrev: "2co" },
  GAL: { coptic: "Ⲡⲣⲟⲥ Ⲅⲁⲗⲁⲧⲁⲥ", arabic: "غلاطية", abbrev: "ga" },
  EPH: { coptic: "Ⲡⲣⲟⲥ Ⲉⲫⲉⲥⲓⲟⲩⲥ", arabic: "أفسس", abbrev: "ep" },
  PHP: { coptic: "Ⲡⲣⲟⲥ Ⲫⲓⲗⲓⲡⲡⲏⲥⲓⲟⲩⲥ", arabic: "فيلبي", abbrev: "php" },
  COL: { coptic: "Ⲡⲣⲟⲥ Ⲕⲟⲗⲟⲥⲥⲁⲉⲓⲥ", arabic: "كولوسي", abbrev: "col" },
  "1TH": { coptic: "Ⲡⲣⲟⲥ Ⲑⲉⲥⲥⲁⲗⲟⲛⲓⲕⲉⲩⲥ Ⲁ̅", arabic: "تسالونيكي الأولى", abbrev: "1th" },
  "2TH": { coptic: "Ⲡⲣⲟⲥ Ⲑⲉⲥⲥⲁⲗⲟⲛⲓⲕⲉⲩⲥ Ⲃ̅", arabic: "تسالونيكي الثانية", abbrev: "2th" },
  "1TI": { coptic: "Ⲡⲣⲟⲥ Ⲧⲓⲙⲟⲑⲉⲟⲛ Ⲁ̅", arabic: "تيموثاوس الأولى", abbrev: "1ti" },
  "2TI": { coptic: "Ⲡⲣⲟⲥ Ⲧⲓⲙⲟⲑⲉⲟⲛ Ⲃ̅", arabic: "تيموثاوس الثانية", abbrev: "2ti" },
  TIT: { coptic: "Ⲡⲣⲟⲥ Ⲧⲓⲧⲟⲛ", arabic: "تيطس", abbrev: "ti" },
  PHM: { coptic: "Ⲡⲣⲟⲥ Ⲫⲓⲗⲏⲙⲟⲛⲁ", arabic: "فليمون", abbrev: "phm" },
  HEB: { coptic: "Ⲡⲣⲟⲥ Ϩⲉⲃⲣⲁⲓⲟⲩⲥ", arabic: "العبرانيين", abbrev: "hb" },
  JAS: { coptic: "Ⲓⲁⲕⲱⲃⲟⲥ", arabic: "يعقوب", abbrev: "ja" },
  "1PE": { coptic: "Ⲡⲉⲧⲣⲟⲥ Ⲁ̅", arabic: "بطرس الأولى", abbrev: "1pe" },
  "2PE": { coptic: "Ⲡⲉⲧⲣⲟⲥ Ⲃ̅", arabic: "بطرس الثانية", abbrev: "2pe" },
  "1JN": { coptic: "Ⲓⲱⲁⲛⲛⲏⲥ Ⲁ̅", arabic: "يوحنا الأولى", abbrev: "1jn" },
  "2JN": { coptic: "Ⲓⲱⲁⲛⲛⲏⲥ Ⲃ̅", arabic: "يوحنا الثانية", abbrev: "2jn" },
  "3JN": { coptic: "Ⲓⲱⲁⲛⲛⲏⲥ Ⲅ̅", arabic: "يوحنا الثالثة", abbrev: "3jn" },
  JUD: { coptic: "Ⲓⲟⲩⲇⲁ", arabic: "يهوذا", abbrev: "jude" },
  REV: { coptic: "Ϯⲁ̀ⲡⲟⲕⲁⲗⲩⲙⲯⲓⲥ ⲛ̀ⲧⲉ Ⲓⲱⲁⲛⲛⲏⲥ", arabic: "رؤيا يوحنا", abbrev: "re" },
};

export async function loadCopticBible(onProgress?: (percent: number) => void): Promise<BookObj[]> {
  if (cachedCopticBible) return cachedCopticBible;

  if (onProgress) onProgress(20);

  const res = await fetch("/bible-json/coptic_bible.json");
  if (!res.ok) {
    throw new Error("Failed to load coptic_bible.json");
  }

  if (onProgress) onProgress(60);
  const data = await res.json();

  const canonicalOrder = [...oldTestament, ...newTestament];
  const books: BookObj[] = [];

  const processSection = (sectionObj: Record<string, any>) => {
    for (const [bookKey, chMap] of Object.entries(sectionObj)) {
      const mapping = COPTIC_BOOK_NAMES[bookKey] || {
        coptic: bookKey,
        arabic: bookKey,
        abbrev: bookKey.toLowerCase(),
      };

      const chaptersList: VerseObj[][] = [];
      const chNums = Object.keys(chMap).map(Number).sort((a, b) => a - b);

      for (const chNum of chNums) {
        const versesObj = chMap[String(chNum)] || {};
        const vNums = Object.keys(versesObj).map(Number).sort((a, b) => a - b);

        const vList: VerseObj[] = [];
        for (const vNum of vNums) {
          const vData = versesObj[String(vNum)] || {};
          const copticText = vData.coptic || "";
          vList.push({
            verse: vNum,
            text_vocalized: copticText,
            text_plain: copticText,
          });
        }
        chaptersList.push(vList);
      }

      books.push({
        abbrev: mapping.abbrev,
        name: `${mapping.coptic} (${mapping.arabic})`,
        chapters: chaptersList,
      });
    }
  };

  if (data.old_testament) processSection(data.old_testament);
  if (data.old_testament_sahidic_supplements) processSection(data.old_testament_sahidic_supplements);
  if (data.new_testament) processSection(data.new_testament);

  books.sort((a, b) => {
    const idxA = canonicalOrder.indexOf(a.abbrev);
    const idxB = canonicalOrder.indexOf(b.abbrev);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  if (onProgress) onProgress(100);
  cachedCopticBible = books;
  return books;
}
