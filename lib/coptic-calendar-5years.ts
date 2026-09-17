// lib/coptic-calendar-5years.ts
// محرك التقويم القبطي الأرثوذكسي لـ 5 سنوات كاملة (2025 - 2030م / 1742 - 1746 للشهداء)
// مطابق لطقوس الكنيسة القبطية الأرثوذكسية وسنكسار دير السريان وتقويم الأنبا تكلا

import { getCopticDate, copticToGregorian, COPTIC_MONTHS, CopticDate } from "./coptic-date";
import { determineLiturgyDayContext, calculateCopticEasterGregorian } from "./coptic-liturgical-engine";

export type FeastType = 
  | "major_lord"    // عيد سيدي كبير
  | "minor_lord"    // عيد سيدي صغير
  | "fast"          // صوم مقدس
  | "virgin_mary"   // عيد السيدة العذراء
  | "major_saint"   // تذكار قديس رئيسي
  | "annual";       // طقس سنوي / عادي

export type LiturgicalTune = 
  | "annual"        // سنوي
  | "joyful"        // فرايحي
  | "lent"          // صيامي
  | "kiahk"         // كيهكي
  | "shaanine"      // شعانيني
  | "mourning";     // حزايني (البصخة)

export interface CalendarDayInfo {
  dateStr: string;           // YYYY-MM-DD
  gregorianDate: Date;
  dayOfWeekAr: string;
  dayOfWeekEn: string;
  copticDate: CopticDate;
  titleAr: string;
  seasonAr: string;
  feastType: FeastType;
  tune: LiturgicalTune;
  tuneNameAr: string;
  fastingNoteAr?: string;
  isFastingDay: boolean;
  canEatFish: boolean;
  isNonFastingPeriod: boolean; // كالخماسين
  synaxariumUrl: string;
  readingsUrl: string;
}

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const TUNE_NAMES_AR: Record<LiturgicalTune, string> = {
  annual: "سنوي",
  joyful: "فرايحي",
  lent: "صيامي (أربعيني)",
  kiahk: "كيهكي",
  shaanine: "شعانيني",
  mourning: "حزايني (أسبوع الآلام)"
};

/**
 * فحص تفاصيل يوم كامل في التقويم القبطي
 */
export function getCalendarDayInfo(date: Date): CalendarDayInfo {
  const cDate = getCopticDate(date);
  const dow = date.getDay();
  const dayOfWeekAr = DAYS_AR[dow];
  const dayOfWeekEn = DAYS_EN[dow];
  const dateStr = date.toISOString().split("T")[0];

  const ctx = determineLiturgyDayContext(date, cDate.month, cDate.day);
  const easterDate = calculateCopticEasterGregorian(date.getFullYear());
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiffFromEaster = Math.round((date.getTime() - easterDate.getTime()) / msPerDay);

  let titleAr = ctx.nameAr;
  let seasonAr = "طقس سنوي";
  let feastType: FeastType = "annual";
  let tune: LiturgicalTune = ctx.tune as LiturgicalTune || "annual";
  let isFastingDay = false;
  let canEatFish = false;
  let isNonFastingPeriod = false;
  let fastingNoteAr = "";

  // 1. الخماسين المقدسة (لا صوم ولا قطاعة، طقس فرايحي كامل)
  if (daysDiffFromEaster >= 0 && daysDiffFromEaster <= 49) {
    isNonFastingPeriod = true;
    isFastingDay = false;
    tune = "joyful";
    seasonAr = "فترة الخماسين المقدسة";
    if (daysDiffFromEaster === 0) feastType = "major_lord";
    else if (daysDiffFromEaster === 39) feastType = "major_lord"; // الصعود
    else if (daysDiffFromEaster === 49) feastType = "major_lord"; // العنصرة
  } 
  // 2. أسبوع الآلام
  else if (daysDiffFromEaster >= -7 && daysDiffFromEaster < 0) {
    isFastingDay = true;
    canEatFish = false;
    tune = ctx.tune as LiturgicalTune;
    seasonAr = "أسبوع الآلام المقدسة";
    if (daysDiffFromEaster === -7) feastType = "major_lord"; // الشعانين
    else if (daysDiffFromEaster === -3) feastType = "minor_lord"; // خميس العهد
    else if (daysDiffFromEaster === -1) feastType = "minor_lord"; // سبت الفرح
  }
  // 3. الصوم الكبير (55 يوماً - صوم درجة أولى بلا سمك)
  else if (daysDiffFromEaster >= -55 && daysDiffFromEaster < -7) {
    isFastingDay = true;
    canEatFish = false;
    tune = "lent";
    seasonAr = "الصوم الكبير المقدس";
    fastingNoteAr = "صوم درجة أولى (بدون أسماك)";
  }
  // 4. صوم نينوى (يونان - صوم درجة أولى بلا سمك)
  else if (daysDiffFromEaster >= -69 && daysDiffFromEaster <= -67) {
    isFastingDay = true;
    canEatFish = false;
    tune = "lent";
    seasonAr = "صوم نينوى (يونان)";
    fastingNoteAr = "صوم درجة أولى (بدون أسماك)";
  }
  else if (daysDiffFromEaster === -66) {
    feastType = "minor_lord";
    tune = "joyful";
    titleAr = "فصح يونان";
  }
  // 5. صوم الميلاد المجيد (من 16 هاتور إلى 28 كيهك - 43 يوماً، مسموح بالسمك عدا الأربعاء والجمعة والبرمون)
  else if ((cDate.month === 3 && cDate.day >= 16) || (cDate.month === 4 && cDate.day <= 28)) {
    isFastingDay = true;
    seasonAr = "صوم الميلاد المجيد";
    if (cDate.month === 4 && cDate.day === 28) {
      fastingNoteAr = "برمون الميلاد (انقطاع وبدون سمك)";
      canEatFish = false;
    } else if (dow === 3 || dow === 5) {
      fastingNoteAr = "صوم انقطاعي (الأربعاء والجمعة بلا سمك)";
      canEatFish = false;
    } else {
      fastingNoteAr = "صوم درجة ثانية (مسموح بالسمك)";
      canEatFish = true;
    }
  }
  // 6. صوم العذراء مريم (1 إلى 15 مسرى)
  else if (cDate.month === 12 && cDate.day >= 1 && cDate.day <= 15) {
    isFastingDay = true;
    seasonAr = "صوم السيدة العذراء";
    if (dow === 3 || dow === 5) {
      canEatFish = false;
      fastingNoteAr = "صوم انقطاعي (الأربعاء والجمعة)";
    } else {
      canEatFish = true;
      fastingNoteAr = "صوم درجة ثانية (مسموح بالسمك)";
    }
  }
  // 7. صوم الرسل (يبدأ من الإثنين التالي لعيد العنصرة حتى 4 أبيب)
  else if ((daysDiffFromEaster > 49 && cDate.month <= 10) || (cDate.month === 11 && cDate.day <= 4)) {
    isFastingDay = true;
    seasonAr = "صوم الآباء الرسل الأطهار";
    if (dow === 3 || dow === 5) {
      canEatFish = false;
      fastingNoteAr = "صوم انقطاعي (الأربعاء والجمعة)";
    } else {
      canEatFish = true;
      fastingNoteAr = "صوم درجة ثانية (مسموح بالسمك)";
    }
  }
  // 8. الأصوام الأسبوعية العادية (الأربعاء والجمعة)
  else if (dow === 3 || dow === 5) {
    isFastingDay = true;
    canEatFish = false;
    tune = "annual";
    fastingNoteAr = "صوم أسبوعي انقطاعي";
  }

  // تصنيف الأعياد السيدية والتذكارات الثابتة
  // الأعياد السيدية الكبرى
  if (
    (cDate.month === 1 && cDate.day === 1) || // النيروز
    (cDate.month === 4 && (cDate.day === 28 || cDate.day === 29) && ctx.id === 'nativity') || // الميلاد
    (cDate.month === 5 && cDate.day === 11) || // الغطاس
    (cDate.month === 7 && cDate.day === 29)    // البشارة المجيدة
  ) {
    feastType = "major_lord";
    tune = "joyful";
  }
  // الأعياد السيدية الصغرى
  else if (
    (cDate.month === 5 && cDate.day === 6) ||  // الختان
    (cDate.month === 5 && cDate.day === 13) || // عرس قانا الجليل
    (cDate.month === 6 && cDate.day === 8) ||  // دخول الهيكل
    (cDate.month === 9 && cDate.day === 24) || // دخول المسيح مصر
    (cDate.month === 12 && cDate.day === 13)   // التجلي
  ) {
    feastType = "minor_lord";
    tune = "joyful";
  }
  // أعياد العذراء مريم (21 من كل شهر قبطي، 16 مسرى صعود جسدها، 7 كيهك، 1 بشنس)
  else if (cDate.day === 21 || (cDate.month === 12 && cDate.day === 16)) {
    feastType = "virgin_mary";
    if (cDate.month === 12 && cDate.day === 16) {
      titleAr = "عيد صعود جسد القديسة مريم العذراء";
      tune = "joyful";
    } else {
      titleAr = `تذكار والدة الإله القديسة مريم العذراء (21 ${cDate.monthNameAr})`;
    }
  }
  // عيد الصليب المجيد
  else if ((cDate.month === 1 && cDate.day >= 17 && cDate.day <= 19) || (cDate.month === 7 && cDate.day === 10)) {
    feastType = "minor_lord";
    tune = "shaanine";
    titleAr = "عيد الصليب المجيد";
  }

  return {
    dateStr,
    gregorianDate: date,
    dayOfWeekAr,
    dayOfWeekEn,
    copticDate: cDate,
    titleAr,
    seasonAr,
    feastType,
    tune,
    tuneNameAr: TUNE_NAMES_AR[tune] || "سنوي",
    fastingNoteAr,
    isFastingDay,
    canEatFish,
    isNonFastingPeriod,
    synaxariumUrl: `/synaxarium?month=${cDate.month}&day=${cDate.day}`,
    readingsUrl: `/readings?date=${dateStr}`,
  };
}

/**
 * توليد تقويم كامل لشهر ميلادي محدد
 */
export function getMonthCalendarDays(year: number, month: number): CalendarDayInfo[] {
  const days: CalendarDayInfo[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(year, month - 1, d);
    days.push(getCalendarDayInfo(dObj));
  }
  return days;
}

/**
 * قائمة الأعياد الكبرى لـ 5 سنوات (2025 - 2030)
 */
export function get5YearsMajorFeasts(startYear = 2025, endYear = 2030) {
  const feasts: { year: number; events: CalendarDayInfo[] }[] = [];

  for (let yr = startYear; yr <= endYear; yr++) {
    const yrEvents: CalendarDayInfo[] = [];
    const easter = calculateCopticEasterGregorian(yr);
    const ms = 1000 * 60 * 60 * 24;

    // تواريخ المناسبات المتنقلة لهذا العام
    const datesToCheck = [
      new Date(yr, 0, 7),                           // عيد الميلاد (7 يناير)
      new Date(yr, 0, 14),                          // عيد الختان (14 يناير)
      new Date(yr, 0, 19),                          // عيد الغطاس (19 يناير)
      new Date(yr, 0, 21),                          // عرس قانا الجليل (21 يناير)
      new Date(yr, 1, 15),                          // دخول الهيكل (15 فبراير)
      new Date(easter.getTime() - 69 * ms),         // بدء صوم يونان
      new Date(easter.getTime() - 55 * ms),         // بدء الصوم الكبير
      new Date(easter.getTime() - 7 * ms),          // أحد الشعانين
      new Date(easter.getTime() - 3 * ms),          // خميس العهد
      new Date(easter.getTime() - 2 * ms),          // الجمعة العظيمة
      new Date(easter.getTime() - 1 * ms),          // سبت الفرح
      easter,                                       // عيد القيامة المجيد
      new Date(easter.getTime() + 7 * ms),          // أحد توما
      new Date(easter.getTime() + 39 * ms),         // عيد الصعود
      new Date(easter.getTime() + 49 * ms),         // عيد العنصرة
      new Date(yr, 2, 19),                          // عيد الصليب (10 برمهات)
      new Date(yr, 3, 7),                           // عيد البشارة المجيدة (29 برمهات)
      new Date(yr, 5, 1),                           // دخول السيد المسيح أرض مصر (24 بشنس)
      new Date(yr, 6, 12),                          // عيد الرسل واستشهاد بطرس وبولس (5 أبيب)
      new Date(yr, 7, 7),                           // بدء صوم العذراء (1 مسرى)
      new Date(yr, 7, 19),                          // عيد التجلي (13 مسرى)
      new Date(yr, 7, 22),                          // عيد صعود جسد العذراء (16 مسرى)
      new Date(yr, 8, 11),                          // عيد النيروز رأس السنة القبطية (1 توت)
      new Date(yr, 8, 27),                          // عيد الصليب (17 توت)
      new Date(yr, 10, 25),                         // بدء صوم الميلاد (16 هاتور)
    ];

    datesToCheck.sort((a, b) => a.getTime() - b.getTime());
    datesToCheck.forEach((dt) => {
      yrEvents.push(getCalendarDayInfo(dt));
    });

    feasts.push({ year: yr, events: yrEvents });
  }

  return feasts;
}
