import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const DATA_DIR = path.join(process.cwd(), "data");
const SYNAXARIUM_DIR = path.join(DATA_DIR, "coptish-datastore", "data", "readings", "synaxarium");

const MONTH_SLUGS: Record<number, string> = {
  1: "tout", 2: "baba", 3: "hator", 4: "kiahk", 5: "toba",
  6: "amshir", 7: "baramhat", 8: "baramouda", 9: "bashans",
  10: "paona", 11: "epep", 12: "mesra", 13: "nasie",
};

const COPTIC_MONTHS = [
  { id: 1, nameAr: "توت", nameEn: "Tout", days: 30 },
  { id: 2, nameAr: "بابه", nameEn: "Baba", days: 30 },
  { id: 3, nameAr: "هاتور", nameEn: "Hator", days: 30 },
  { id: 4, nameAr: "كيهك", nameEn: "Kiahk", days: 30 },
  { id: 5, nameAr: "طوبة", nameEn: "Toba", days: 30 },
  { id: 6, nameAr: "أمشير", nameEn: "Amshir", days: 30 },
  { id: 7, nameAr: "برمهات", nameEn: "Baramhat", days: 30 },
  { id: 8, nameAr: "برمودة", nameEn: "Baramouda", days: 30 },
  { id: 9, nameAr: "بشنس", nameEn: "Bashans", days: 30 },
  { id: 10, nameAr: "بؤونة", nameEn: "Paona", days: 30 },
  { id: 11, nameAr: "أبيب", nameEn: "Epep", days: 30 },
  { id: 12, nameAr: "مسرى", nameEn: "Mesra", days: 30 },
  { id: 13, nameAr: "النسيء", nameEn: "Nasie", days: 6 },
];

export interface SynaxariumStory {
  id: string;
  month: number;
  monthNameAr: string;
  day: number;
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
  category: "martyrs" | "monastics" | "patriarchs" | "biblical" | "feasts" | "general";
}

let synaxariumIndexCache: SynaxariumStory[] | null = null;

function categorizeStory(title: string, text: string): SynaxariumStory["category"] {
  const content = (title + " " + text).toLowerCase();
  
  if (content.includes("استشهاد") || content.includes("شهيد") || content.includes("martyr") || content.includes("شهداء")) {
    return "martyrs";
  }
  if (content.includes("راهب") || content.includes("أنبا") || content.includes("دير") || content.includes("متوحد") || content.includes("monk") || content.includes("hermit") || content.includes("قديس") && content.includes("رهبن")) {
    return "monastics";
  }
  if (content.includes("بطريرك") || content.includes("بابا") || content.includes("أسقف") || content.includes("patriarch") || content.includes("pope") || content.includes("bishop")) {
    return "patriarchs";
  }
  if (content.includes("نبي") || content.includes("رسول") || content.includes("تلميذ") || content.includes("داود") || content.includes("إيليا") || content.includes("موسى") || content.includes("apostle") || content.includes("prophet")) {
    return "biblical";
  }
  if (content.includes("عيد") || content.includes("تذكار") || content.includes("تكريس") || content.includes("feast") || content.includes("consecration") || content.includes("صعود") || content.includes("بشارة")) {
    return "feasts";
  }
  return "general";
}

function loadAllSynaxariumIndex(): SynaxariumStory[] {
  if (synaxariumIndexCache) return synaxariumIndexCache;

  const list: SynaxariumStory[] = [];

  for (const m of COPTIC_MONTHS) {
    const slug = MONTH_SLUGS[m.id];
    if (!slug) continue;

    for (let d = 1; d <= m.days; d++) {
      const filePath = path.join(SYNAXARIUM_DIR, `${slug}-${d}.yml`);
      if (!fs.existsSync(filePath)) continue;

      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed: any = yaml.load(fileContent);

        if (parsed && Array.isArray(parsed.commemorations)) {
          parsed.commemorations.forEach((item: any, idx: number) => {
            const titleAr = item.title?.arabic || "";
            const titleEn = item.title?.english || "";
            const textAr = item.text?.arabic || "";
            const textEn = item.text?.english || "";

            if (!titleAr && !titleEn && !textAr) return;

            const category = categorizeStory(titleAr || titleEn, textAr || textEn);

            list.push({
              id: `${m.id}-${d}-${idx + 1}`,
              month: m.id,
              monthNameAr: m.nameAr,
              day: d,
              titleAr,
              titleEn,
              textAr,
              textEn,
              category,
            });
          });
        }
      } catch (err) {
        console.error(`Error reading synaxarium file ${slug}-${d}.yml`, err);
      }
    }
  }

  synaxariumIndexCache = list;
  return list;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month");
    const dayParam = searchParams.get("day");
    const query = (searchParams.get("q") || "").trim().toLowerCase();
    const category = searchParams.get("category");

    const allStories = loadAllSynaxariumIndex();

    let filtered = allStories;

    if (monthParam) {
      const m = parseInt(monthParam);
      filtered = filtered.filter((s) => s.month === m);
    }

    if (dayParam) {
      const d = parseInt(dayParam);
      filtered = filtered.filter((s) => s.day === d);
    }

    if (category && category !== "all") {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (query) {
      filtered = filtered.filter(
        (s) =>
          s.titleAr.toLowerCase().includes(query) ||
          s.titleEn.toLowerCase().includes(query) ||
          s.textAr.toLowerCase().includes(query) ||
          s.textEn.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      total: filtered.length,
      stories: filtered,
    });
  } catch (error: any) {
    console.error("Synaxarium API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
