// lib/coptic-date.ts

export interface CopticDate {
  year: number;
  month: number; // 1 to 13 (1: Tout, 13: Nasie)
  day: number; // 1 to 30 (or 1 to 5/6 for Nasie)
  monthNameAr: string;
  monthNameEn: string;
  monthNameCop: string;
  formattedAr: string;
  formattedEn: string;
}

export const COPTIC_MONTHS = [
  { id: 1, nameAr: "توت", nameEn: "Tout", nameCop: "Ⲑⲱⲟⲩⲧ", slug: "tout", days: 30 },
  { id: 2, nameAr: "بابه", nameEn: "Baba", nameCop: "Ⲡⲁⲟⲡⲓ", slug: "baba", days: 30 },
  { id: 3, nameAr: "هاتور", nameEn: "Hator", nameCop: "Ⲁⲑⲱⲣ", slug: "hator", days: 30 },
  { id: 4, nameAr: "كيهك", nameEn: "Kiahk", nameCop: "Ⲭⲟⲓⲁⲕ", slug: "kiahk", days: 30 },
  { id: 5, nameAr: "طوبة", nameEn: "Toba", nameCop: "Ⲧⲱⲃⲓ", slug: "toba", days: 30 },
  { id: 6, nameAr: "أمشير", nameEn: "Amshir", nameCop: "Ⲙⲉϣⲓⲣ", slug: "amshir", days: 30 },
  { id: 7, nameAr: "برمهات", nameEn: "Baramhat", nameCop: "Ⲡⲁⲣⲉⲙϩⲁⲧ", slug: "baramhat", days: 30 },
  { id: 8, nameAr: "برمودة", nameEn: "Baramouda", nameCop: "Ⲡⲁⲣⲙⲟⲩⲧⲉ", slug: "baramouda", days: 30 },
  { id: 9, nameAr: "بشنس", nameEn: "Bashans", nameCop: "Ⲡⲁϣⲟⲛⲥ", slug: "bashans", days: 30 },
  { id: 10, nameAr: "بؤونة", nameEn: "Paona", nameCop: "Ⲡⲁⲱⲛⲓ", slug: "paona", days: 30 },
  { id: 11, nameAr: "أبيب", nameEn: "Epep", nameCop: "Ⲉⲡⲏⲡ", slug: "epep", days: 30 },
  { id: 12, nameAr: "مسرى", nameEn: "Mesra", nameCop: "Ⲙⲉⲥⲱⲣⲏ", slug: "mesra", days: 30 },
  { id: 13, nameAr: "النسيء", nameEn: "Nasie", nameCop: "Ⲡⲓⲕⲟⲩϫⲓ ⲛ̀ⲁ̀ⲃⲟⲧ", slug: "nasie", days: 6 },
];

/**
 * Calculate Julian Day Number from Gregorian Date
 */
function gregorianToJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert Julian Day Number to Coptic Date
 */
function jdnToCoptic(jdn: number): { year: number; month: number; day: number } {
  // Epoch of Coptic Calendar in Julian Day Number: Aug 29, 284 AD (Julian) -> JDN 1824665
  const copticEpochJDN = 1824665;
  const daysSinceEpoch = jdn - copticEpochJDN;

  const copticYear = Math.floor((daysSinceEpoch - Math.floor((daysSinceEpoch + 365) / 1461)) / 365) + 1;
  
  // Find start of this Coptic Year
  const startOfYearDays = (copticYear - 1) * 365 + Math.floor((copticYear - 1) / 4);
  const dayOfYear = daysSinceEpoch - startOfYearDays; // 0-indexed day within the coptic year

  const copticMonth = Math.min(Math.floor(dayOfYear / 30) + 1, 13);
  const copticDay = (dayOfYear % 30) + 1;

  return {
    year: copticYear,
    month: copticMonth,
    day: copticDay,
  };
}

/**
 * Convert Coptic Date back to Gregorian Date
 */
export function copticToGregorian(cYear: number, cMonth: number, cDay: number): Date {
  const copticEpochJDN = 1824665;
  const daysSinceEpoch = (cYear - 1) * 365 + Math.floor((cYear - 1) / 4) + (cMonth - 1) * 30 + (cDay - 1);
  const jdn = copticEpochJDN + daysSinceEpoch;

  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l1 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l1 + 1)) / 1461001);
  const l2 = l1 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l2) / 2447);
  const day = l2 - Math.floor((2447 * j) / 80);
  const l3 = Math.floor(j / 11);
  const month = j + 2 - 12 * l3;
  const year = 100 * (n - 49) + i + l3;

  return new Date(year, month - 1, day);
}

/**
 * Main function: converts JavaScript Date to exact CopticDate object
 */
export function getCopticDate(date: Date): CopticDate {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const { year, month, day } = jdnToCoptic(jdn);

  const monthMeta = COPTIC_MONTHS[month - 1] || COPTIC_MONTHS[0];

  return {
    year,
    month,
    day,
    monthNameAr: monthMeta.nameAr,
    monthNameEn: monthMeta.nameEn,
    monthNameCop: monthMeta.nameCop,
    formattedAr: `${day} ${monthMeta.nameAr} ${year} ش.`,
    formattedEn: `${day} ${monthMeta.nameEn} ${year} A.M.`,
  };
}

export function getCopticMonthSlug(monthNumber: number): string {
  const meta = COPTIC_MONTHS.find((m) => m.id === monthNumber);
  return meta ? meta.slug : "tout";
}
