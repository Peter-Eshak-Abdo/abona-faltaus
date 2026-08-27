"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Flame,
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AGPEYA_HOURS, AgpeyaPrayerHour } from "@/lib/agpeya-data";

export default function AgpeyaPage() {
  const [selectedHourId, setSelectedHourId] = useState<string>("baker");
  const [prayerMode, setPrayerMode] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(30); // pixels per interval
  const [fontSize, setFontSize] = useState<number>(18);
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  const [bookmarkedHours, setBookmarkedHours] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReadingSpeech, setIsReadingSpeech] = useState<boolean>(false);
  const [currentSectionTab, setCurrentSectionTab] = useState<string>("all");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved preferences
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem("agpeya_font_size");
      if (savedFontSize) setFontSize(Number(savedFontSize));

      const savedBookmarks = localStorage.getItem("agpeya_bookmarks");
      if (savedBookmarks) setBookmarkedHours(JSON.parse(savedBookmarks));

      const savedCompleted = localStorage.getItem("agpeya_completed_sections");
      if (savedCompleted) setCompletedSections(JSON.parse(savedCompleted));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Determine current active canonical hour by current time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) setSelectedHourId("baker");
    else if (hour >= 9 && hour < 12) setSelectedHourId("third");
    else if (hour >= 12 && hour < 15) setSelectedHourId("sixth");
    else if (hour >= 15 && hour < 17) setSelectedHourId("ninth");
    else if (hour >= 17 && hour < 19) setSelectedHourId("sunset");
    else if (hour >= 19 && hour < 23) setSelectedHourId("sleep");
    else setSelectedHourId("midnight");
  }, []);

  const currentHour = useMemo(
    () => AGPEYA_HOURS.find((h) => h.id === selectedHourId) || AGPEYA_HOURS[0],
    [selectedHourId]
  );

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll) {
      autoScrollIntervalRef.current = setInterval(() => {
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollBy({
            top: 1.5,
            behavior: "smooth",
          });
        } else {
          window.scrollBy({
            top: 1.5,
            behavior: "smooth",
          });
        }
      }, Math.max(10, 80 - scrollSpeed));
    } else {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    }

    return () => {
      if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    };
  }, [autoScroll, scrollSpeed]);

  // Handle TTS text to speech
  const toggleSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("خاصية القراءة الصوتية غير مدعومة في متصفحك");
      return;
    }

    if (isReadingSpeech) {
      window.speechSynthesis.cancel();
      setIsReadingSpeech(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-EG";
    utterance.rate = 0.9;
    utterance.onend = () => setIsReadingSpeech(false);
    utterance.onerror = () => setIsReadingSpeech(false);
    window.speechSynthesis.speak(utterance);
    setIsReadingSpeech(true);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ النص بنجاح");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title}\n\n${text}\n\nمن تطبيق الأجبية المقدسة - أبونا فلتاؤس`,
        });
      } catch {
        // Ignored
      }
    } else {
      handleCopy("share", `${title}\n\n${text}`);
    }
  };

  const toggleBookmark = (hourId: string) => {
    const next = bookmarkedHours.includes(hourId)
      ? bookmarkedHours.filter((id) => id !== hourId)
      : [...bookmarkedHours, hourId];
    setBookmarkedHours(next);
    localStorage.setItem("agpeya_bookmarks", JSON.stringify(next));
    toast.success(
      bookmarkedHours.includes(hourId) ? "تمت إزالة الساعة من المحفوظات" : "تم حفظ الساعة في المفضلة"
    );
  };

  const toggleSectionCompleted = (key: string) => {
    const next = { ...completedSections, [key]: !completedSections[key] };
    setCompletedSections(next);
    localStorage.setItem("agpeya_completed_sections", JSON.stringify(next));
  };

  const toggleCollapse = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const changeFontSize = (delta: number) => {
    const next = Math.min(32, Math.max(14, fontSize + delta));
    setFontSize(next);
    localStorage.setItem("agpeya_font_size", next.toString());
  };

  const getHourProgress = (hour: AgpeyaPrayerHour) => {
    const totalItems = 1 + hour.psalms.length + 1 + hour.litanies.length + 1;
    let done = 0;
    if (completedSections[`${hour.id}_intro`]) done++;
    hour.psalms.forEach((p) => {
      if (completedSections[`${hour.id}_psalm_${p.number}`]) done++;
    });
    if (completedSections[`${hour.id}_gospel`]) done++;
    hour.litanies.forEach((_, idx) => {
      if (completedSections[`${hour.id}_lit_${idx}`]) done++;
    });
    if (completedSections[`${hour.id}_conclusion`]) done++;
    return Math.round((done / totalItems) * 100);
  };

  const currentHourProgress = getHourProgress(currentHour);

  return (
    <div
      dir="rtl"
      className={cn(
        "min-h-screen transition-colors duration-300 font-sans pb-1",
        prayerMode
          ? "bg-stone-950 text-stone-100"
          : "bg-linear-to-b from-amber-50/50 via-stone-50 to-amber-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-stone-900 dark:text-zinc-100"
      )}
    >
      {/* Top Floating Control Bar */}
      <header
        className={cn(
          "sticky top-0 z-40 backdrop-blur-md border-b px-1 py-0.5 transition-all duration-200",
          prayerMode
            ? "bg-black/80 border-stone-800 text-stone-200"
            : "bg-white/80 dark:bg-zinc-900/80 border-stone-200 dark:border-zinc-800 shadow-xs"
        )}
      >
        <div className="max-w-8xl mx-auto flex items-center mx-1 justify-between gap-0.5">
          <div className="flex items-center gap-0.5">
            <Link
              href="/"
              className="p-0.5 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-500 transition"
              title="الرئيسية"
            >
              <ArrowRight size={18} />
            </Link>
            <div className="flex items-center gap-0.5">
              <span className="text-xl font-black text-amber-700 dark:text-amber-500 flex items-center gap-0.5">
                <BookOpen size={20} />
                الأجبية المقدسة
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex text-[11px] font-bold border-amber-600/40 text-amber-800 dark:text-amber-400 bg-amber-500/10"
              >
                {currentHour.nameCoptic}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-0.5">
            {/* Prayer Mode Toggle */}
            <Button
              variant={prayerMode ? "default" : "outline"}
              // size="sm"
              onClick={() => {
                setPrayerMode(!prayerMode);
                toast(prayerMode ? "تم إيقاف وضع الصلاة" : "تم تفعيل وضع الخشوع والصلاة");
              }}
              className={cn(
                "rounded-xl text-xs font-bold gap-0.5 px-0.5",
                prayerMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "border-amber-600/40 text-amber-800 dark:text-amber-400 hover:bg-amber-500/10"
              )}
            >
              <Flame size={14} className={prayerMode ? "text-yellow-300" : ""} />
              <span className="hidden md:inline">{prayerMode ? "وضع الخشوع" : "وضع الصلاة"}</span>
            </Button>

            {/* Font Size Adjusters */}
            <div className="flex items-center border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-stone-50 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => changeFontSize(2)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 transition"
                title="تكبير الخط"
              >
                <ZoomIn size={14} />
              </button>
              <span className="text-[11px] font-mono font-bold px-0.5 text-stone-600 dark:text-zinc-400">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => changeFontSize(-2)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 transition"
                title="تصغير الخط"
              >
                <ZoomOut size={14} />
              </button>
            </div>

            {/* Bookmark Current Hour */}
            <button
              type="button"
              onClick={() => toggleBookmark(currentHour.id)}
              className="p-0.5 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-100 dark:hover:bg-zinc-800 transition"
              title="حفظ الصلاة"
            >
              {bookmarkedHours.includes(currentHour.id) ? (
                <BookmarkCheck size={16} className="text-amber-600" />
              ) : (
                <Bookmark size={16} className="text-stone-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-8xl mx-auto px-1 pt-1 space-y-1">
        {/* Hours Selector Horizontal Bar */}
        {!prayerMode && (
          <section className="space-y-0.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-stone-500 dark:text-zinc-400 flex items-center gap-0.5">
                <Clock size={13} />
                الصلوات السبع القانونية وصلوات السواعي:
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                إنجاز الصلاة: {currentHourProgress}%
              </span>
            </div>

            <div className="flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {AGPEYA_HOURS.map((h) => {
                const isSelected = selectedHourId === h.id;
                const prog = getHourProgress(h);
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHourId(h.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={cn(
                      "flex flex-col items-start min-w-[135px] p-0.5 rounded-2xl border text-right transition-all shrink-0 relative overflow-hidden",
                      isSelected
                        ? "bg-linear-to-br from-amber-700 to-amber-900 text-white border-amber-800 shadow-md scale-102"
                        : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 hover:border-amber-400/50 hover:bg-stone-50 dark:hover:bg-zinc-800/80"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black">{h.nameAr}</span>
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isSelected ? "text-amber-200" : "text-stone-400"
                        )}
                      >
                        {h.hourTime.split(" ")[0]}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] line-clamp-1 mt-1 font-medium",
                        isSelected ? "text-amber-100/90" : "text-stone-500 dark:text-zinc-400"
                      )}
                    >
                      {h.nameEn}
                    </span>

                    {/* Progress indicator line */}
                    <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isSelected ? "bg-amber-300" : "bg-amber-600"
                        )}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Current Hour Header Banner */}
        <Card
          className={cn(
            "border shadow-sm rounded-3xl overflow-hidden relative transition-all",
            prayerMode
              ? "bg-zinc-900/60 border-zinc-800"
              : "bg-linear-to-r from-amber-900 via-amber-800 to-amber-950 text-white border-amber-800/40"
          )}
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-70" />
          <CardContent className="p-1 sm:p-1.5 space-y-0.5">
            <div className="flex flex-wrap items-center justify-between gap-0.5">
              <div className="flex items-center gap-0.5">
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs px-0.5 py-0.5">
                  الساعة {currentHour.order}
                </Badge>
                <Badge className="bg-white/10 text-stone-200 border-white/20 text-xs font-mono">
                  {currentHour.hourTime}
                </Badge>
              </div>
              <span className="text-xs text-amber-200/80 font-mono tracking-widest">
                {currentHour.nameCoptic}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight">
                {currentHour.nameAr}
              </h1>
              <p className="text-sm sm:text-base text-amber-200/90 font-medium mt-1">
                {currentHour.themeAr}
              </p>
            </div>

            {/* Quick Sections Navigation Filter */}
            <div className="pt-0.5 flex flex-wrap gap-0.5">
              {[
                { id: "all", label: "كامل الصلاة" },
                { id: "intro", label: "المقدمة والمزامير" },
                { id: "gospel", label: "الإنجيل" },
                { id: "litanies", label: "القطع والطلبات" },
                { id: "conclusion", label: "الختام" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentSectionTab(tab.id)}
                  className={cn(
                    "text-xs font-bold px-0.5 py-0.5 rounded-full transition-all border",
                    currentSectionTab === tab.id
                      ? "bg-white text-amber-950 border-white shadow-xs font-black"
                      : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto Scroll Floating Controls (When in Prayer Mode or active) */}
        <div
          className={cn(
            "flex items-center justify-between p-0.5 rounded-2xl border transition-all text-xs font-bold",
            prayerMode
              ? "bg-zinc-900 border-zinc-800"
              : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 shadow-xs"
          )}
        >
          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              // size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "rounded-xl gap-0.5 h-2 text-xs font-bold",
                autoScroll
                  ? "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                  : "border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300"
              )}
            >
              {autoScroll ? <Pause size={14} /> : <Play size={14} />}
              <span>{autoScroll ? "إيقاف التمرير التلقائي" : "تمرير تلقائي للقراءة"}</span>
            </Button>

            {autoScroll && (
              <div className="hidden sm:flex items-center gap-0.5 w-8">
                <span className="text-[10px] text-stone-400">السرعة</span>
                <Slider
                  value={[scrollSpeed]}
                  onValueChange={(val) => setScrollSpeed(val[0])}
                  min={10}
                  max={70}
                  step={5}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              // size="sm"
              onClick={() => {
                const fullPrayerText = [
                  ...currentHour.introduction.flatMap((i) => i.text),
                  ...currentHour.psalms.map((p) => `${p.title}: ${p.text}`),
                  currentHour.gospel.text,
                  ...currentHour.litanies.map((l) => `${l.title}: ${l.text}`),
                  ...currentHour.conclusion.flatMap((c) => c.text),
                ].join("\n\n");
                toggleSpeech(fullPrayerText);
              }}
              className="rounded-xl gap-0.5 h-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              {isReadingSpeech ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="hidden sm:inline">
                {isReadingSpeech ? "إيقاف الصوت" : "قراءة صوتية ذكية"}
              </span>
            </Button>

            <Button
              variant="ghost"
              // size="sm"
              onClick={() => {
                const allKeys: Record<string, boolean> = {};
                allKeys[`${currentHour.id}_intro`] = true;
                currentHour.psalms.forEach((p) => {
                  allKeys[`${currentHour.id}_psalm_${p.number}`] = true;
                });
                allKeys[`${currentHour.id}_gospel`] = true;
                currentHour.litanies.forEach((_, idx) => {
                  allKeys[`${currentHour.id}_lit_${idx}`] = true;
                });
                allKeys[`${currentHour.id}_conclusion`] = true;
                setCompletedSections((prev) => ({ ...prev, ...allKeys }));
                toast.success("تم تحديد صلاة الساعة بالكامل كمكتملة 🎉");
              }}
              className="rounded-xl gap-0.5 h-2 text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">إتمام الصلاة</span>
            </Button>
          </div>
        </div>

        {/* 1. INTRODUCTION (مقدمة الصلاة، صلاة الشكر، المزمور الخمسون) */}
        {(currentSectionTab === "all" || currentSectionTab === "intro") && (
          <section className="space-y-0.5">
            <div className="flex items-center justify-between border-b pb-0.5 border-amber-600/20">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                <Sparkles size={18} />
                مقدمة كل ساعة والصلوات الافتتاحية
              </h2>
              <button
                onClick={() => toggleSectionCompleted(`${currentHour.id}_intro`)}
                className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-0.5 py-0.5 rounded-lg border transition",
                  completedSections[`${currentHour.id}_intro`]
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100"
                )}
              >
                <Check size={13} />
                {completedSections[`${currentHour.id}_intro`] ? "تمت القراءة" : "تحديد كمكتمل"}
              </button>
            </div>

            {currentHour.introduction.map((intro, idx) => (
              <Card
                key={idx}
                className={cn(
                  "border rounded-2xl shadow-xs transition-all",
                  prayerMode
                    ? "bg-zinc-900/80 border-zinc-800"
                    : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800"
                )}
              >
                <CardHeader className="py-0.5 px-1 border-b border-stone-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-amber-700 dark:text-amber-400">
                    {intro.title}
                  </CardTitle>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleCopy(`intro_${idx}`, intro.text.join("\n\n"))}
                      className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                      title="نسخ"
                    >
                      {copiedId === `intro_${idx}` ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleSpeech(intro.text.join(" "))}
                      className="p-0.5 text-stone-400 hover:text-amber-600 transition"
                      title="استماع"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-1 space-y-0.5">
                  {intro.text.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{ fontSize: `${fontSize}px` }}
                      className="leading-loose font-serif text-stone-800 dark:text-stone-200"
                    >
                      {p}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* 2. PSALMS (المزامير) */}
        {(currentSectionTab === "all" || currentSectionTab === "intro") && (
          <section className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between border-b pb-0.5 border-amber-600/20">
              <div className="flex items-center gap-0.5">
                <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                  <BookOpen size={18} />
                  مزامير الساعة ({currentHour.psalms.length} مزموراً)
                </h2>
              </div>
            </div>

            <div className="space-y-1">
              {currentHour.psalms.map((psalm) => {
                const pKey = `${currentHour.id}_psalm_${psalm.number}`;
                const isDone = completedSections[pKey];
                const isCollapsed = collapsedSections[pKey];

                return (
                  <Card
                    key={psalm.number}
                    className={cn(
                      "border rounded-2xl shadow-xs transition-all",
                      isDone
                        ? "border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10"
                        : prayerMode
                        ? "bg-zinc-900/80 border-zinc-800"
                        : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800"
                    )}
                  >
                    <CardHeader className="py-0.5 px-1 border-b border-stone-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs text-amber-700 dark:text-amber-400 border-amber-600/30"
                        >
                          مزمور {psalm.number}
                        </Badge>
                        <CardTitle className="text-base font-bold text-stone-800 dark:text-stone-200">
                          {psalm.title}
                        </CardTitle>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => toggleSectionCompleted(pKey)}
                          className={cn(
                            "p-0.5 rounded-lg border text-xs transition flex items-center gap-0.5",
                            isDone
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-stone-200 dark:border-zinc-700 text-stone-400 hover:text-stone-700"
                          )}
                          title="تحديد كمكتمل"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleCopy(`psalm_${psalm.number}`, psalm.text)}
                          className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                          title="نسخ المزمور"
                        >
                          {copiedId === `psalm_${psalm.number}` ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => toggleSpeech(psalm.text)}
                          className="p-0.5 text-stone-400 hover:text-amber-600 transition"
                          title="استماع للمزمور"
                        >
                          <Volume2 size={14} />
                        </button>
                        <button
                          onClick={() => toggleCollapse(pKey)}
                          className="p-0.5 text-stone-400 hover:text-stone-700 transition"
                          title={isCollapsed ? "عرض" : "طي"}
                        >
                          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                      </div>
                    </CardHeader>

                    {!isCollapsed && (
                      <CardContent className="p-1">
                        <p
                          style={{ fontSize: `${fontSize}px` }}
                          className="leading-loose font-serif text-stone-800 dark:text-stone-200 text-justify"
                        >
                          {psalm.text}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. GOSPEL (الإنجيل المقدس) */}
        {(currentSectionTab === "all" || currentSectionTab === "gospel") && (
          <section className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between border-b pb-0.5 border-amber-600/20">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                <Flame size={18} />
                فصل من الإنجيل المقدس
              </h2>
              <button
                onClick={() => toggleSectionCompleted(`${currentHour.id}_gospel`)}
                className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-0.5 py-0.5 rounded-lg border transition",
                  completedSections[`${currentHour.id}_gospel`]
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100"
                )}
              >
                <Check size={13} />
                {completedSections[`${currentHour.id}_gospel`] ? "تمت القراءة" : "تحديد كمكتمل"}
              </button>
            </div>

            <Card
              className={cn(
                "border rounded-2xl shadow-xs transition-all relative overflow-hidden",
                prayerMode
                  ? "bg-zinc-900/90 border-amber-800/40"
                  : "bg-linear-to-b from-amber-50/40 to-white dark:from-zinc-900 dark:to-zinc-900 border-amber-200 dark:border-amber-900/40"
              )}
            >
              <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-amber-600" />
              <CardHeader className="py-0.5 px-1 border-b border-stone-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
                <div>
                  <Badge className="bg-amber-700 text-white text-[11px] mb-1">
                    {currentHour.gospel.reference}
                  </Badge>
                  <CardTitle className="text-base font-bold text-amber-900 dark:text-amber-300">
                    {currentHour.gospel.title}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy("gospel", currentHour.gospel.text)}
                    className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
                    title="نسخ الإنجيل"
                  >
                    {copiedId === "gospel" ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => toggleSpeech(currentHour.gospel.text)}
                    className="p-0.5 text-stone-400 hover:text-amber-600 transition"
                    title="استماع للإنجيل"
                  >
                    <Volume2 size={14} />
                  </button>
                  <button
                    onClick={() => handleShare(currentHour.gospel.title, currentHour.gospel.text)}
                    className="p-0.5 text-stone-400 hover:text-stone-700 transition"
                    title="مشاركة الإنجيل"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-1">
                <div
                  style={{ fontSize: `${fontSize + 1}px` }}
                  className="leading-loose font-serif text-stone-900 dark:text-stone-100 whitespace-pre-line text-justify"
                >
                  {currentHour.gospel.text}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* 4. LITANIES & TROPARIA (القطع والطلبات) */}
        {(currentSectionTab === "all" || currentSectionTab === "litanies") && (
          <section className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between border-b pb-0.5 border-amber-600/20">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                <Sparkles size={18} />
                القطع والطلبات وتسابيح الساعة
              </h2>
            </div>

            <div className="space-y-0.5">
              {currentHour.litanies.map((lit, idx) => {
                const litKey = `${currentHour.id}_lit_${idx}`;
                const isDone = completedSections[litKey];

                return (
                  <Card
                    key={idx}
                    className={cn(
                      "border rounded-2xl shadow-xs transition-all",
                      isDone
                        ? "border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10"
                        : prayerMode
                        ? "bg-zinc-900/80 border-zinc-800"
                        : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800"
                    )}
                  >
                    <CardHeader className="py-0.5 px-1 border-b border-stone-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-bold text-amber-700 dark:text-amber-400">
                        {lit.title}
                      </CardTitle>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => toggleSectionCompleted(litKey)}
                          className={cn(
                            "p-0.5 rounded-lg border text-xs transition flex items-center gap-0.5",
                            isDone
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "border-stone-200 dark:border-zinc-700 text-stone-400 hover:text-stone-700"
                          )}
                          title="تحديد كمكتمل"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => handleCopy(`lit_${idx}`, lit.text)}
                          className="p-0.5 text-stone-400 hover:text-stone-700 transition"
                          title="نسخ القطعة"
                        >
                          {copiedId === `lit_${idx}` ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => toggleSpeech(lit.text)}
                          className="p-0.5 text-stone-400 hover:text-amber-600 transition"
                          title="استماع"
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-1">
                      <p
                        style={{ fontSize: `${fontSize}px` }}
                        className="leading-loose font-serif text-stone-800 dark:text-stone-200 text-justify"
                      >
                        {lit.text}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. CONCLUSION (كيريياليسون والختام والبركة) */}
        {(currentSectionTab === "all" || currentSectionTab === "conclusion") && (
          <section className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between border-b pb-0.5 border-amber-600/20">
              <h2 className="text-lg font-bold text-amber-800 dark:text-amber-400 flex items-center gap-0.5">
                <CheckCircle2 size={18} />
                التحليل وختام كل صلاة
              </h2>
              <button
                onClick={() => toggleSectionCompleted(`${currentHour.id}_conclusion`)}
                className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-0.5 py-0.5 rounded-lg border transition",
                  completedSections[`${currentHour.id}_conclusion`]
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100"
                )}
              >
                <Check size={13} />
                {completedSections[`${currentHour.id}_conclusion`] ? "تمت القراءة" : "تحديد كمكتمل"}
              </button>
            </div>

            {currentHour.conclusion.map((item, idx) => (
              <Card
                key={idx}
                className={cn(
                  "border rounded-2xl shadow-xs transition-all",
                  prayerMode
                    ? "bg-zinc-900/80 border-zinc-800"
                    : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800"
                )}
              >
                <CardHeader className="py-0.5 px-1 border-b border-stone-100 dark:border-zinc-800/80 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-amber-700 dark:text-amber-400">
                    {item.title}
                  </CardTitle>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleCopy(`concl_${idx}`, item.text.join("\n\n"))}
                      className="p-0.5 text-stone-400 hover:text-stone-700 transition"
                      title="نسخ"
                    >
                      {copiedId === `concl_${idx}` ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleSpeech(item.text.join(" "))}
                      className="p-0.5 text-stone-400 hover:text-amber-600 transition"
                      title="استماع"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-1 space-y-0.5">
                  {item.text.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{ fontSize: `${fontSize}px` }}
                      className="leading-loose font-serif text-stone-800 dark:text-stone-200"
                    >
                      {p}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Bottom Navigation Buttons to next/prev canonical hours */}
        <section className="flex items-center justify-between pt-1 border-t border-stone-200 dark:border-zinc-800">
          {(() => {
            const currentIndex = AGPEYA_HOURS.findIndex((h) => h.id === currentHour.id);
            const prevHour = currentIndex > 0 ? AGPEYA_HOURS[currentIndex - 1] : null;
            const nextHour =
              currentIndex < AGPEYA_HOURS.length - 1 ? AGPEYA_HOURS[currentIndex + 1] : null;

            return (
              <>
                {prevHour ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedHourId(prevHour.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-2xl gap-0.5 text-xs font-bold"
                  >
                    <ChevronRight size={16} />
                    <span>الساعة السابقة: {prevHour.nameAr}</span>
                  </Button>
                ) : (
                  <div />
                )}

                {nextHour && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedHourId(nextHour.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-2xl gap-0.5 text-xs font-bold"
                  >
                    <span>الساعة التالية: {nextHour.nameAr}</span>
                    <ChevronLeft size={16} />
                  </Button>
                )}
              </>
            );
          })()}
        </section>
      </main>
    </div>
  );
}
