"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import BackButton from "@/components/navigation/BackButton";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Scroll,
  Fish,
  Flame,
  Sun,
  Crown,
  Heart,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getMonthCalendarDays,
  get5YearsMajorFeasts,
  CalendarDayInfo,
  TUNE_NAMES_AR,
  FeastType,
} from "@/lib/coptic-calendar-5years";
import { cn } from "@/lib/utils";

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function CopticCalendarPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<"monthly" | "timeline">("monthly");
  const [activeDay, setActiveDay] = useState<CalendarDayInfo | null>(null);

  // Month days
  const monthDays = useMemo(() => {
    return getMonthCalendarDays(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // 5 Years Timeline
  const fiveYearsFeasts = useMemo(() => {
    return get5YearsMajorFeasts(2025, 2030);
  }, []);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      if (selectedYear > 2025) {
        setSelectedYear((y) => y - 1);
        setSelectedMonth(12);
      }
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      if (selectedYear < 2030) {
        setSelectedYear((y) => y + 1);
        setSelectedMonth(1);
      }
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const getFeastBadge = (type: FeastType) => {
    switch (type) {
      case "major_lord":
        return <Badge className="bg-amber-600 text-white font-bold text-[10px]"><Crown className="w-12 h-12 me-4 inline" /> عيد سيدي كبير</Badge>;
      case "minor_lord":
        return <Badge className="bg-amber-500/80 text-white font-bold text-[10px]"><Sparkles className="w-12 h-12 me-4 inline" /> عيد سيدي صغير</Badge>;
      case "virgin_mary":
        return <Badge className="bg-blue-600 text-white font-bold text-[10px]"><Heart className="w-12 h-12 me-4 inline" /> والدة الإله</Badge>;
      case "fast":
        return <Badge className="bg-purple-700 text-white font-bold text-[10px]"><Flame className="w-12 h-12 me-4 inline" /> صوم مقدس</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-8" dir="rtl">
      {/* Header */}
      <header className="border-b border-[#EBE9E0] dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-lg md:text-xl font-black text-[#4A0012] dark:text-amber-400 flex items-center gap-4">
                <CalendarIcon className="w-20 h-20" />
                التقويم القبطي الأرثوذكسي الشامل
              </h1>
              <p className="text-xs text-stone-500 dark:text-neutral-400">
                الأعياد، الأصوام، والطقوس الكنسية للأعوام 2025 — 2030م (1742 — 1746 للشهداء)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-stone-100 dark:bg-neutral-800 p-4 rounded-xl flex items-center gap-4 border border-stone-200 dark:border-neutral-700">
              <button
                onClick={() => setViewMode("monthly")}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition",
                  viewMode === "monthly"
                    ? "bg-[#4A0012] text-white shadow-sm"
                    : "text-stone-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                )}
              >
                عرض شهري
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition",
                  viewMode === "timeline"
                    ? "bg-[#4A0012] text-white shadow-sm"
                    : "text-stone-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                )}
              >
                أعياد 5 سنوات
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* Quick Year Selector Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-8 scrollbar-none">
          <div className="flex items-center gap-2">
            {YEARS.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-black transition border",
                  selectedYear === yr
                    ? "bg-[#4A0012] text-amber-200 border-[#4A0012] shadow-md shadow-[#4A0012]/20"
                    : "bg-white dark:bg-neutral-900 text-stone-700 dark:text-neutral-300 border-[#EBE9E0] dark:border-neutral-800 hover:bg-stone-50"
                )}
              >
                {yr}م <span className="text-[11px] opacity-75 font-medium">({yr - 284}ش)</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/synaxarium"
              className="px-4 py-2 text-xs font-bold bg-amber-500/10 text-amber-900 dark:text-amber-300 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-2"
            >
              <Scroll className="w-16 h-16" />
              <span>السنكسار</span>
            </Link>
            <Link
              href="/readings"
              className="px-4 py-2 text-xs font-bold bg-[#4A0012]/10 text-[#4A0012] dark:text-amber-300 rounded-xl border border-[#4A0012]/20 hover:bg-[#4A0012]/20 transition flex items-center gap-2"
            >
              <BookOpen className="w-16 h-16" />
              <span>القطمارس</span>
            </Link>
          </div>
        </div>

        {viewMode === "monthly" ? (
          <div className="space-y-2">
            {/* Month Header Controller */}
            <Card className="rounded-2xl border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <CardContent className="p-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevMonth}
                  className="rounded-xl border-stone-200 dark:border-neutral-700"
                >
                  <ChevronRight className="w-16 h-16 me-4" />
                  الشهر السابق
                </Button>

                <div className="text-center">
                  <h2 className="text-xl font-black text-[#4A0012] dark:text-amber-400">
                    {MONTH_NAMES_AR[selectedMonth - 1]} {selectedYear}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-neutral-400 font-medium mt-2">
                    الشهر {selectedMonth} من السنة الميلادية
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextMonth}
                  className="rounded-xl border-stone-200 dark:border-neutral-700"
                >
                  الشهر التالي
                  <ChevronLeft className="w-16 h-16 ms-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Days Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {monthDays.map((day) => {
                const isToday = new Date().toISOString().split("T")[0] === day.dateStr;
                return (
                  <div
                    key={day.dateStr}
                    onClick={() => setActiveDay(day)}
                    className={cn(
                      "p-2 rounded-2xl border transition cursor-pointer flex flex-col justify-between min-h-[140px]",
                      isToday
                        ? "border-[#4A0012] bg-amber-500/10 dark:border-amber-400 shadow-md ring-2 ring-[#4A0012]/30"
                        : "bg-white dark:bg-neutral-900 border-[#EBE9E0] dark:border-neutral-800 hover:border-[#4A0012]/40 hover:shadow-sm"
                    )}
                  >
                    <div>
                      {/* Top Date Row */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-baseline gap-6">
                          <span className="text-xl font-black text-stone-900 dark:text-white font-mono">
                            {day.gregorianDate.getDate()}
                          </span>
                          <span className="text-xs font-bold text-stone-500 dark:text-neutral-400">
                            {day.dayOfWeekAr}
                          </span>
                        </div>

                        {/* Coptic Date Badge */}
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-[11px] rounded-lg px-2"
                        >
                          {day.copticDate.day} {day.copticDate.monthNameAr}
                        </Badge>
                      </div>

                      {/* Title & Feast */}
                      <h3 className="text-xs font-bold text-stone-800 dark:text-neutral-200 line-clamp-2 leading-relaxed">
                        {day.titleAr}
                      </h3>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-2 pt-2 border-t border-stone-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                      {/* Liturgical Tune */}
                      <span className={cn(
                        "px-6 py-2 rounded-md font-bold text-[10px]",
                        day.tune === "joyful" && "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
                        day.tune === "lent" && "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300",
                        day.tune === "shaanine" && "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
                        day.tune === "kiahk" && "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
                        day.tune === "mourning" && "bg-neutral-800 text-white",
                        day.tune === "annual" && "bg-stone-100 text-stone-700 dark:bg-neutral-800 dark:text-neutral-300"
                      )}>
                        {day.tuneNameAr}
                      </span>

                      {/* Fasting indicator */}
                      {day.isFastingDay ? (
                        <span className="flex items-center gap-4 text-purple-700 dark:text-purple-300 font-semibold text-[10px]">
                          <Flame className="w-12 h-12 text-purple-600" />
                          {day.canEatFish ? "مسموح سمك" : "صوم انقطاعي"}
                        </span>
                      ) : day.isNonFastingPeriod ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                          فطار (خماسين)
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[10px]">إفطار</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 5-Year Major Feasts Timeline */
          <div className="space-y-2">
            {fiveYearsFeasts.map((yearGroup) => (
              <Card key={yearGroup.year} className="rounded-2xl border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
                <CardHeader className="bg-[#4A0012]/5 dark:bg-neutral-800/50 border-b border-[#EBE9E0] dark:border-neutral-800 py-2 px-2">
                  <CardTitle className="text-lg font-black text-[#4A0012] dark:text-amber-400 flex items-center gap-8">
                    <Crown className="w-20 h-20 text-amber-500" />
                    أعياد ومناسبات عام {yearGroup.year}م — ({yearGroup.year - 284} للشهداء)
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-stone-100 dark:divide-neutral-800">
                  {yearGroup.events.map((evt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveDay(evt)}
                      className="p-2 hover:bg-stone-50 dark:hover:bg-neutral-800/40 transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 text-center shrink-0">
                          <span className="block text-base font-black text-stone-900 dark:text-white font-mono">
                            {evt.gregorianDate.getDate()}
                          </span>
                          <span className="block text-[11px] font-bold text-stone-500 dark:text-neutral-400">
                            {MONTH_NAMES_AR[evt.gregorianDate.getMonth()]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                              {evt.titleAr}
                            </h4>
                            {getFeastBadge(evt.feastType)}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-neutral-400">
                            {evt.dayOfWeekAr} • {evt.copticDate.day} {evt.copticDate.monthNameAr} ({evt.copticDate.year} ش) • طقس {evt.tuneNameAr}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {evt.isFastingDay && (
                          <Badge variant="outline" className="border-purple-300 text-purple-700 dark:text-purple-300 text-[10px]">
                            {evt.fastingNoteAr || "صوم"}
                          </Badge>
                        )}
                        <ChevronLeft className="w-16 h-16 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Day Details Modal */}
        {activeDay && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-4 border border-[#EBE9E0] dark:border-neutral-800 shadow-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-[#4A0012] text-amber-200 font-bold mb-4">
                    {activeDay.dayOfWeekAr} {activeDay.gregorianDate.getDate()} {MONTH_NAMES_AR[activeDay.gregorianDate.getMonth()]} {activeDay.gregorianDate.getFullYear()}م
                  </Badge>
                  <h3 className="text-lg font-black text-[#4A0012] dark:text-amber-400 mt-4">
                    {activeDay.titleAr}
                  </h3>
                  <p className="text-xs font-bold text-stone-600 dark:text-neutral-400">
                    الموافق {activeDay.copticDate.day} {activeDay.copticDate.monthNameAr} ({activeDay.copticDate.year} للشهداء)
                  </p>
                </div>
                <button
                  onClick={() => setActiveDay(null)}
                  className="p-4 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 py-2 border-y border-stone-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-neutral-400 font-medium">الطقس الكنسي:</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">طقس {activeDay.tuneNameAr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-neutral-400 font-medium">حالة الصوم:</span>
                  <span className="font-bold">
                    {activeDay.isFastingDay ? (
                      <span className="text-purple-700 dark:text-purple-300">{activeDay.fastingNoteAr || "صوم مقدس"}</span>
                    ) : activeDay.isNonFastingPeriod ? (
                      <span className="text-amber-600">فترة إفطار وفرح (الخماسين)</span>
                    ) : (
                      <span className="text-emerald-700">يوم إفطار عادي</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-neutral-400 font-medium">الموسم:</span>
                  <span className="font-bold text-stone-800 dark:text-neutral-200">{activeDay.seasonAr}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={activeDay.synaxariumUrl}
                  className="w-full py-2 px-2 text-center text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition flex items-center justify-center gap-2"
                >
                  <Scroll className="w-14 h-14" />
                  <span>سنكسار اليوم</span>
                </Link>
                <Link
                  href={activeDay.readingsUrl}
                  className="w-full py-2 px-2 text-center text-xs font-bold rounded-xl bg-[#4A0012] text-white hover:bg-[#6B1124] transition flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-14 h-14" />
                  <span>قطمارس اليوم</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
