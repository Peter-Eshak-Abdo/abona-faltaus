// lib/mappings.ts

export const TITLES_MAP: Record<string, string> = {
  // --- المجلدات الرئيسية ---
  liturgies: "القداسات الإلهية",
  "liturgy-st-basil": "القداس الباسيلي",
  "liturgy-st-gregory": "القداس الغريغوري",
  "liturgy-st-cyril": "القداس الكيرلسي",
  readings: "القراءات اليومية (القطمارس)",
  agpeya: "الأجبية المقدسة",
  psalmody: "التسبحة",

  // --- أقسام القداس (St. Basil Structure) ---
  "00-matins-raising-of-incense": "رفع بخور باكر",
  "01-offering-of-the-lamb": "تقديم الحمل",
  "02-liturgy-of-the-word": "قداس الموعوظين (الكلمة)",
  "03-liturgy-of-the-faithful": "قداس المؤمنين",
  "04-distribution": "التوزيع",

  "HB-Annual-Katamarus-Sundays": "قراءات القطمارس الأحد",
  "HC-Katameros-Great-Lent": "قراءات الصوم الكبير ونينوي",

  // --- صلوات العشية وباكر ---
  vespers: "العشية",
  matins: "باكر",
  "vespers-prayer": "صلاة العشية",
  "matins-prayer": "صلاة باكر",

  // --- الملفات الداخلية (Common Files) ---
  intro: "المقدمة",
  thanksgiving: "صلاة الشكر",
  "psalm-50": "المزمور الخمسون",
  absolution: "التحليل",
  gospel: "الإنجيل",
  litanies: "الأواشي",
  creed: "قانون الإيمان",
  offertory: "صلاة الصلح",
  commemoration: "مجمع القديسين",
  doxologies: "الذكصولوجيات",
  reconciliation: "صلاة الصلح",
  anaphora: "الأنافورا (القداس)",
  agios: "أجيوس",
  institution: "تأسيس السر",
  "7-litanies": "الأواشي السبع الصغار",
  communion: "الاعتراف والتناول",

};

// دالة مساعدة لجلب الاسم
export function getDisplayName(slug: string): string {
  // إزالة الامتداد .json
  const cleanSlug = slug.replace('.json', '');
  // البحث في القاموس أو إرجاع الاسم كما هو مع تحسين شكله
  return TITLES_MAP[cleanSlug] || cleanSlug.replace(/-/g, ' ');
}
