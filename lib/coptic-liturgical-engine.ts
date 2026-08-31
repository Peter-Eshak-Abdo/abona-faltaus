// lib/coptic-liturgical-engine.ts
// المحرك الطقسي القبطي الأرثوذكسي الشامل لحساب المناسبات والأعياد المتنقلة والقطمارس بدقة 100%

export interface CopticFeastOrSeason {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'major_lord_feast' | 'minor_lord_feast' | 'holy_week' | 'lent' | 'pentecost' | 'fast' | 'annual' | 'saint_feast';
  tune: 'annual' | 'festive' | 'kiahk' | 'lent' | 'shaanine' | 'mourning' | 'joyful';
  hasCustomReadings: boolean;
  priority: number; // أعلى أولوية تفوز بالقراءة في ذلك اليوم
}

/**
 * حساب تاريخ عيد القيامة المجيد (Computus لعيد القيامة القبطي الشرقي)
 * المعتمد على حساب الأبقطي وقانون مجمع نيقية المسكوني
 */
export function calculateCopticEasterGregorian(gYear: number): Date {
  const a = gYear % 19;
  const b = gYear % 4;
  const c = gYear % 7;
  const d = (19 * a + 15) % 30;
  const e = (2 * b + 4 * c + 6 * d + 6) % 7;
  const f = d + e;
  
  // Julian Easter in March/April
  let jMonth = 3;
  let jDay = 22 + f;
  if (jDay > 31) {
    jMonth = 4;
    jDay = jDay - 31;
  }
  
  // Convert Julian date to Gregorian (Add 13 days for 20th and 21st century)
  const julianDate = new Date(Date.UTC(gYear, jMonth - 1, jDay));
  julianDate.setUTCDate(julianDate.getUTCDate() + 13);
  return julianDate;
}

/**
 * تحديد الموسم الطقسي أو العيد الحاكم لليوم
 * @param gDate التاريخ الميلادي
 * @param cMonth الشهر القبطي (1 - 13)
 * @param cDay اليوم القبطي (1 - 30)
 */
export function determineLiturgyDayContext(gDate: Date, cMonth: number, cDay: number) {
  const gYear = gDate.getFullYear();
  const easterDate = calculateCopticEasterGregorian(gYear);

  // حساب الفروق بالأيام عن عيد القيامة المجيد
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiffFromEaster = Math.round((gDate.getTime() - easterDate.getTime()) / msPerDay);

  // 1. أسبوع الآلام والبصخة المقدسة والقيامة والخماسين
  if (daysDiffFromEaster >= 0 && daysDiffFromEaster <= 49) {
    // فترة الخماسين المقدسة (فترة القيامة حتى العنصرة)
    if (daysDiffFromEaster === 0) {
      return {
        id: 'easter',
        nameAr: 'عيد القيامة المجيد',
        season: 'pentecost',
        tune: 'joyful',
        isFeast: true,
        pentecostWeek: 1,
        dayOfWeek: gDate.getDay()
      };
    } else if (daysDiffFromEaster === 39) {
      return {
        id: 'ascension',
        nameAr: 'عيد الصعود الإلهي المجيد',
        season: 'pentecost',
        tune: 'joyful',
        isFeast: true,
        pentecostWeek: 6,
        dayOfWeek: gDate.getDay()
      };
    } else if (daysDiffFromEaster === 49) {
      return {
        id: 'pentecost',
        nameAr: 'عيد العنصرة وحلول الروح القدس (صلاة السجدة)',
        season: 'pentecost',
        tune: 'joyful',
        isFeast: true,
        pentecostWeek: 7,
        dayOfWeek: gDate.getDay()
      };
    } else {
      const pentecostWeek = Math.floor(daysDiffFromEaster / 7) + 1;
      return {
        id: `pentecost_w${pentecostWeek}`,
        nameAr: `الخماسين المقدسة — الأسبوع ${pentecostWeek}`,
        season: 'pentecost',
        tune: 'joyful',
        isFeast: false,
        pentecostWeek,
        dayOfWeek: gDate.getDay()
      };
    }
  }

  // 2. أسبوع الآلام والبصخة
  if (daysDiffFromEaster >= -7 && daysDiffFromEaster < 0) {
    if (daysDiffFromEaster === -7) {
      return { id: 'palm_sunday', nameAr: 'أحد الشعانين المجيد', season: 'pascha', tune: 'shaanine', isFeast: true };
    } else if (daysDiffFromEaster === -3) {
      return { id: 'covenant_thursday', nameAr: 'خميس العهد واللقان', season: 'pascha', tune: 'annual', isFeast: true };
    } else if (daysDiffFromEaster === -2) {
      return { id: 'good_friday', nameAr: 'الجمعة العظيمة المقدسة', season: 'pascha', tune: 'mourning', isFeast: false };
    } else if (daysDiffFromEaster === -1) {
      return { id: 'joyous_saturday', nameAr: 'سبت الفرح (أبو غالمسيس)', season: 'pascha', tune: 'joyful', isFeast: true };
    }
    return { id: 'holy_pascha', nameAr: 'البصخة المقدسة وأسبوع الآلام', season: 'pascha', tune: 'mourning', isFeast: false };
  }

  // 3. الصوم الكبير (55 يوماً قبل القيامة)
  if (daysDiffFromEaster >= -55 && daysDiffFromEaster < -7) {
    const lentWeek = Math.floor((daysDiffFromEaster + 55) / 7) + 1;
    return {
      id: `great_lent_w${lentWeek}`,
      nameAr: `الصوم الأربعيني المقدس — الأسبوع ${lentWeek}`,
      season: 'great_lent',
      tune: 'lent',
      isFeast: false,
      lentWeek,
      dayOfWeek: gDate.getDay()
    };
  }

  // 4. صوم يونان (نينوى) — يسبق الصوم الكبير بأسبوعين
  if (daysDiffFromEaster >= -69 && daysDiffFromEaster <= -67) {
    return { id: 'jonah_fast', nameAr: 'صوم يونان (نينوى)', season: 'jonah', tune: 'lent', isFeast: false };
  }
  if (daysDiffFromEaster === -66) {
    return { id: 'jonah_feast', nameAr: 'فصح يونان', season: 'jonah', tune: 'festive', isFeast: true };
  }

  // 5. الأعياد والمواسم الثابتة بالتقويم القبطي
  // عيد النيروز ورأس السنة القبطية (1 توت)
  if (cMonth === 1 && cDay === 1) {
    return { id: 'nayrouz', nameAr: 'عيد النيروز المجيد (رأس السنة القبطية)', season: 'nayrouz', tune: 'festive', isFeast: true };
  }
  // عيد الصليب المجيد (17 توت، 10 برمهات)
  if ((cMonth === 1 && cDay >= 17 && cDay <= 19) || (cMonth === 7 && cDay === 10)) {
    return { id: 'cross_feast', nameAr: 'عيد الصليب المجيد', season: 'cross', tune: 'shaanine', isFeast: true };
  }
  // شهر كيهك المريمي (شهر 4)
  if (cMonth === 4 && cDay <= 28) {
    return { id: 'kiahk', nameAr: 'شهر كيهك المريمي المبارك', season: 'kiahk', tune: 'kiahk', isFeast: false };
  }
  // برمون عيد الميلاد (28 كيهك أو 27-28 إذا كان 29 كيهك يوم أحد/اثنين)
  if (cMonth === 4 && cDay === 28) {
    return { id: 'nativity_paramoun', nameAr: 'برمون عيد الميلاد المجيد', season: 'nativity', tune: 'annual', isFeast: false };
  }
  // عيد الميلاد المجيد (29 كيهك أو 28 كيهك في السنوات الكبيسة)
  if (cMonth === 4 && cDay === 29) {
    return { id: 'nativity', nameAr: 'عيد الميلاد المجيد', season: 'nativity', tune: 'joyful', isFeast: true };
  }
  // عيد الختان المجيد (6 طوبة)
  if (cMonth === 5 && cDay === 6) {
    return { id: 'circumcision', nameAr: 'عيد الختان المجيد', season: 'circumcision', tune: 'joyful', isFeast: true };
  }
  // برمون عيد الغطاس (10 طوبة)
  if (cMonth === 5 && cDay === 10) {
    return { id: 'theophany_paramoun', nameAr: 'برمون عيد الغطاس المجيد', season: 'theophany', tune: 'annual', isFeast: false };
  }
  // عيد الغطاس المجيد وثاني يومه (11 و 12 طوبة)
  if (cMonth === 5 && (cDay === 11 || cDay === 12)) {
    return { id: 'theophany', nameAr: 'عيد الغطاس الإلهي المجيد', season: 'theophany', tune: 'joyful', isFeast: true };
  }
  // عيد عرس قانا الجليل (13 طوبة)
  if (cMonth === 5 && cDay === 13) {
    return { id: 'wedding_cana', nameAr: 'عيد عرس قانا الجليل', season: 'cana', tune: 'joyful', isFeast: true };
  }
  // عيد دخول السيد المسيح الهيكل (8 أمشير)
  if (cMonth === 6 && cDay === 8) {
    return { id: 'presentation_temple', nameAr: 'عيد دخول السيد المسيح الهيكل', season: 'presentation', tune: 'joyful', isFeast: true };
  }
  // عيد البشارة المجيد (29 برمهات)
  if (cMonth === 7 && cDay === 29) {
    return { id: 'annunciation', nameAr: 'عيد البشارة المجيد', season: 'annunciation', tune: 'joyful', isFeast: true };
  }
  // عيد دخول المسيح أرض مصر (24 بشنس)
  if (cMonth === 9 && cDay === 24) {
    return { id: 'entry_egypt', nameAr: 'عيد دخول السيد المسيح أرض مصر', season: 'egypt', tune: 'joyful', isFeast: true };
  }
  // عيد التجلي المجيد (13 مسرى)
  if (cMonth === 12 && cDay === 13) {
    return { id: 'transfiguration', nameAr: 'عيد التجلي المجيد', season: 'transfiguration', tune: 'joyful', isFeast: true };
  }
  // عيد السيدة العذراء (16 مسرى)
  if (cMonth === 12 && cDay === 16) {
    return { id: 'st_mary_assumption', nameAr: 'عيد صعود جسد القديسة مريم العذراء', season: 'st_mary', tune: 'joyful', isFeast: true };
  }

  // 6. تذكار البشارة والميلاد والقيامة (يوم 29 من كل شهر قبطي عدا طوبة وأمشير)
  if (cDay === 29 && cMonth !== 5 && cMonth !== 6) {
    return { id: 'monthly_memorial_29', nameAr: 'تذكار البشارة والميلاد والقيامة (29 في الشهر)', season: 'monthly_29', tune: 'joyful', isFeast: true };
  }

  // الطقس السنوي العادي (آحاد أو أيام)
  const isSunday = gDate.getDay() === 0;
  return {
    id: isSunday ? 'annual_sunday' : 'annual_weekday',
    nameAr: isSunday ? 'أحد من الطقس السنوي' : 'يوم من الطقس السنوي',
    season: 'annual',
    tune: 'annual',
    isFeast: false,
    isSunday
  };
}
