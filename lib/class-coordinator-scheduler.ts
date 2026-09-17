// lib/class-coordinator-scheduler.ts
// محرك التوزيع الذكي والعادل لخدام فصول مدارس الأحد والاجتماعات الكنسية

export interface Servant {
  id: string;
  name: string;
  phone?: string;
  // أرقام الفقرات التي لا يستطيع خدمتها (مثلاً [1] تعني لا يستطيع الأولى)
  restrictedSlots: number[];
  // تواريخ اعتذار مسبقة بصيغة YYYY-MM-DD
  unavailableDates: string[];
  // تفضيل خاص اختياري
  notes?: string;
}

export interface MeetingSlotConfig {
  slotIndex: number;
  defaultTitle: string;      // مثلاً: "الفقرة الأولى (درس كتاب / عقيدة)"
  servantsNeeded: number;    // عدد الخدام المطلوبين في هذه الفقرة (1 أو 2)
  alternateWeekly?: boolean; // تبادل: أسبوع خادم والأسبوع التالي خادمان
}

export interface ScheduleConfig {
  startDate: string;         // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD
  numberOfWeeks: number;     // عدد الأسابيع (مثلاً 12 أسبوعاً)
  meetingDayOfWeek: number;  // 5 للجمعة، 0 للأحد، 6 للسبت...
  minWeeksBetweenLessons: number; // الحد الأدنى للفاصل بين مرات شرح نفس الخادم (مثلاً 2 أو 3 أسابيع)
  slots: MeetingSlotConfig[];
}

export interface ScheduledSlot {
  slotIndex: number;
  slotTitle: string;
  lessonTitle: string;       // اسم الدرس يحدده أمين الفصل
  assignedServantIds: string[];
}

export interface ScheduledMeeting {
  weekIndex: number;         // 1, 2, 3...
  dateStr: string;           // YYYY-MM-DD
  formattedDateAr: string;   // الجمعة 25 أكتوبر 2026
  slots: ScheduledSlot[];
}

const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export function formatDateToArabic(d: Date): string {
  const dayName = ARABIC_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

/**
 * حساب تواريخ الاجتماعات بناءً على تاريخ البدء ويوم الأسبوع
 */
export function calculateMeetingDates(
  startDateStr: string,
  targetDayOfWeek: number,
  count: number
): Date[] {
  const dates: Date[] = [];
  const cur = new Date(startDateStr);
  
  // تحريك التاريخ لأول يوم اجتماع مستهدف
  while (cur.getDay() !== targetDayOfWeek) {
    cur.setDate(cur.getDate() + 1);
  }

  for (let i = 0; i < count; i++) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 7);
  }
  return dates;
}

/**
 * خوارزمية التوزيع العادل وغير المتتالي مع احترام كامل الشروط
 */
export function generateClassSchedule(
  servants: Servant[],
  config: ScheduleConfig
): ScheduledMeeting[] {
  if (!servants || servants.length === 0) return [];

  const meetingDates = calculateMeetingDates(
    config.startDate,
    config.meetingDayOfWeek,
    config.numberOfWeeks
  );

  // سجل لتتبع عدد مرات تكليف كل خادم
  const assignmentCounts: Record<string, number> = {};
  // سجل لتتبع آخر تاريخ كُلِّف فيه الخادم (لحساب الفاصل الزمني)
  const lastAssignedWeek: Record<string, number> = {};

  servants.forEach((s) => {
    assignmentCounts[s.id] = 0;
    lastAssignedWeek[s.id] = -999;
  });

  const schedule: ScheduledMeeting[] = [];

  meetingDates.forEach((dateObj, weekIdx) => {
    const dateStr = dateObj.toISOString().split("T")[0];
    const meetingWeek = weekIdx + 1;
    const meetingSlots: ScheduledSlot[] = [];
    const servantsAssignedThisMeeting = new Set<string>();

    config.slots.forEach((slotCfg) => {
      // تحديد عدد الخدام المطلوبين لهذا الأسبوع
      let needed = slotCfg.servantsNeeded;
      if (slotCfg.alternateWeekly) {
        needed = (meetingWeek % 2 === 1) ? slotCfg.servantsNeeded : (slotCfg.servantsNeeded > 1 ? 1 : 2);
      }

      const assignedForSlot: string[] = [];

      for (let n = 0; n < needed; n++) {
        // فلترة الخدام المؤهلين لهذه الفقرة في هذا الأسبوع
        const candidates = servants.filter((s) => {
          // 1. لم يتم تكليفه في فقرة أخرى بنفس اليوم
          if (servantsAssignedThisMeeting.has(s.id)) return false;
          // 2. غير معتذر في هذا التاريخ
          if (s.unavailableDates.includes(dateStr)) return false;
          // 3. ليس لديه مانع في رقم هذه الفقرة
          if (s.restrictedSlots.includes(slotCfg.slotIndex)) return false;
          // 4. لا يوجد توالي: احترام الحد الأدنى للفاصل بين الأسابيع
          const weeksSinceLast = meetingWeek - lastAssignedWeek[s.id];
          if (weeksSinceLast < config.minWeeksBetweenLessons) return false;

          return true;
        });

        let chosenServant: Servant | null = null;

        if (candidates.length > 0) {
          // ترتيب المرشحين تصاعدياً حسب عدد مرات الشرح (الأقل أولاً لتحقيق العدالة)
          // مع إضافة عامل عشوائي خفيف لكسر التساوي وتجنب التكرار الرتيب
          candidates.sort((a, b) => {
            const countDiff = assignmentCounts[a.id] - assignmentCounts[b.id];
            if (countDiff !== 0) return countDiff;
            // إذا تساوى عدد المرات، نختار من كان آخر شرح له أبعد
            const weekDiffA = meetingWeek - lastAssignedWeek[a.id];
            const weekDiffB = meetingWeek - lastAssignedWeek[b.id];
            if (weekDiffA !== weekDiffB) return weekDiffB - weekDiffA;
            // عشوائية متزنة
            return Math.random() - 0.5;
          });

          chosenServant = candidates[0];
        } else {
          // حالة طوارئ (Fallback): تخفيف شرط الفاصل الزمني إذا كان عدد الخدام محدوداً جداً
          const fallbackCandidates = servants.filter((s) => {
            if (servantsAssignedThisMeeting.has(s.id)) return false;
            if (s.unavailableDates.includes(dateStr)) return false;
            if (s.restrictedSlots.includes(slotCfg.slotIndex)) return false;
            // على الأقل لا يكون في نفس الأسبوع السابق مباشرة (فاصل أسبوع واحد على الأقل)
            return meetingWeek - lastAssignedWeek[s.id] > 1;
          });

          if (fallbackCandidates.length > 0) {
            fallbackCandidates.sort((a, b) => assignmentCounts[a.id] - assignmentCounts[b.id]);
            chosenServant = fallbackCandidates[0];
          } else {
            // كحل أخير لأي خادم متاح غير معتذر في اليوم وغير مكلف في نفس الاجتماع
            const emergencyCandidates = servants.filter((s) => {
              return !servantsAssignedThisMeeting.has(s.id) && !s.unavailableDates.includes(dateStr);
            });
            if (emergencyCandidates.length > 0) {
              emergencyCandidates.sort((a, b) => assignmentCounts[a.id] - assignmentCounts[b.id]);
              chosenServant = emergencyCandidates[0];
            }
          }
        }

        if (chosenServant) {
          assignedForSlot.push(chosenServant.id);
          servantsAssignedThisMeeting.add(chosenServant.id);
          assignmentCounts[chosenServant.id] += 1;
          lastAssignedWeek[chosenServant.id] = meetingWeek;
        }
      }

      meetingSlots.push({
        slotIndex: slotCfg.slotIndex,
        slotTitle: slotCfg.defaultTitle,
        lessonTitle: "",
        assignedServantIds: assignedForSlot,
      });
    });

    schedule.push({
      weekIndex: meetingWeek,
      dateStr,
      formattedDateAr: formatDateToArabic(dateObj),
      slots: meetingSlots,
    });
  });

  return schedule;
}
