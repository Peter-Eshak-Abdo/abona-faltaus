"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Search,
  Calendar as CalendarIcon,
  BookOpen,
  Loader2,
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
  Filter,
  Users,
  Cross,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getCopticDate, COPTIC_MONTHS, CopticDate } from "@/lib/coptic-date";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/i18n/routing";

interface SynaxariumStory {
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

export default function SynaxariumPage() {
  const t = useTranslations("Synaxarium");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const CATEGORIES = useMemo(
    () => [
      { id: "all", label: t("categories.all"), icon: Sparkles },
      { id: "martyrs", label: t("categories.martyrs"), icon: Flame },
      { id: "monastics", label: t("categories.monastics"), icon: Cross },
      { id: "patriarchs", label: t("categories.patriarchs"), icon: Users },
      { id: "biblical", label: t("categories.biblical"), icon: BookOpen },
      { id: "feasts", label: t("categories.feasts"), icon: CalendarIcon },
    ],
    [t],
  );

  // Current today coptic info
  const todayCoptic = useMemo(() => getCopticDate(new Date()), []);

  // Selection states
  const [selectedMonth, setSelectedMonth] = useState<number>(todayCoptic.month);
  const [selectedDay, setSelectedDay] = useState<number>(todayCoptic.day);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "month" | "search">("day");

  // Data & loading
  const [stories, setStories] = useState<SynaxariumStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Font size & audio & bookmarks
  const [fontSize, setFontSize] = useState<number>(18);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Selected story for expanded reading modal / detail view
  const [activeModalStory, setActiveModalStory] = useState<SynaxariumStory | null>(null);

  useEffect(() => {
    const savedSize = localStorage.getItem("synaxarium-font-size");
    if (savedSize) setFontSize(Number(savedSize));

    const savedBookmarks = localStorage.getItem("synaxarium-bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch {}
    }
  }, []);

  const updateFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(Math.max(prev + delta, 14), 28);
      localStorage.setItem("synaxarium-font-size", String(next));
      return next;
    });
  };

  const toggleBookmark = (id: string, title: string) => {
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem("synaxarium-bookmarks", JSON.stringify(updated));
      if (updated[id]) {
        toast.success(`تم حفظ "${title}" في المفضلة`);
      } else {
        toast.info(`تمت الإزالة من المفضلة`);
      }
      return updated;
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingId(null);
    setAudioLoadingId(null);
  };

  const playStoryNarration = async (id: string, text: string) => {
    if (playingId === id) {
      stopAudio();
      return;
    }

    stopAudio();
    setAudioLoadingId(id);

    try {
      // Strip HTML tags for TTS
      const cleanText = text.replace(/<[^>]*>?/gm, "");
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText.substring(0, 3000) }),
      });

      if (!res.ok) throw new Error("تعذر توليد الصوت");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          setPlayingId(null);
          setAudioLoadingId(null);
        };
        await audioRef.current.play();
        setPlayingId(id);
      }
    } catch {
      toast.error("تعذر تشغيل الصوت حالياً");
    } finally {
      setAudioLoadingId(null);
    }
  };

  const fetchStories = async () => {
    setLoading(true);
    stopAudio();

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        if (selectedMonth) params.set("month", String(selectedMonth));
        if (viewMode === "day" && selectedDay) params.set("day", String(selectedDay));
      }

      if (selectedCategory && selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }

      const res = await fetch(`/api/synaxarium?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStories(json.stories || []);
        setTotalCount(json.total || 0);
      } else {
        setStories([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Synaxarium fetch error:", err);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedMonth, selectedDay, selectedCategory, viewMode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setViewMode("search");
    }
    fetchStories();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setViewMode("day");
  };

  const handleTodayClick = () => {
    setSelectedMonth(todayCoptic.month);
    setSelectedDay(todayCoptic.day);
    setViewMode("day");
    setSearchQuery("");
  };

  const handlePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      const prevMonth = selectedMonth === 1 ? 13 : selectedMonth - 1;
      const maxDays = prevMonth === 13 ? 6 : 30;
      setSelectedMonth(prevMonth);
      setSelectedDay(maxDays);
    }
  };

  const handleNextDay = () => {
    const maxDays = selectedMonth === 13 ? 6 : 30;
    if (selectedDay < maxDays) {
      setSelectedDay(selectedDay + 1);
    } else {
      const nextMonth = selectedMonth === 13 ? 1 : selectedMonth + 1;
      setSelectedMonth(nextMonth);
      setSelectedDay(1);
    }
  };

  const currentMonthMeta = COPTIC_MONTHS.find((m) => m.id === selectedMonth) || COPTIC_MONTHS[0];

  return (
    <div className="min-h-screen pb-1 bg-stone-50/60 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100" dir={isRtl ? "rtl" : "ltr"}>
      <audio ref={audioRef} className="hidden" />

      {/* Sticky Hero Bar */}
      <div className="border-b border-amber-900/10 dark:border-amber-500/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="mx-auto px-2 py-0.5 max-w-8xl flex flex-col md:flex-row items-center justify-between gap-0.5">
          {/* Header title */}
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-3 rounded-xl bg-red-700/10 dark:bg-red-500/10 text-red-700 dark:text-red-400 flex items-center justify-center font-bold">
              <Flame className="w-2 h-2" />
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                <h1 className="text-lg font-bold text-amber-950 dark:text-amber-400">{t("title")}</h1>
                <Badge variant="outline" className="text-amber-800 border-amber-700/30 dark:text-amber-300 text-xs font-semibold px-0.5">
                  {locale === "en" ? todayCoptic.formattedEn : todayCoptic.formattedAr}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* Top Controls: Font size, Today, Katamaros link */}
          <div className="flex items-center gap-0.5 flex-wrap justify-center">
            {/* Font size */}
            <div className="flex items-center bg-stone-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-stone-200 dark:border-zinc-700">
              <button
                onClick={() => updateFontSize(-1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-2 h-2" />
              </button>
              <span className="px-0.5 text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">{fontSize}</span>
              <button
                onClick={() => updateFontSize(1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-2 h-2" />
              </button>
            </div>

            <Button
              onClick={handleTodayClick}
              variant="outline"
              className="h-2 text-xs font-bold border-amber-700/30 text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg"
            >
              {t("todaySynaxarium")}
            </Button>

            <Link
              href="/readings"
              className="h-2 text-xs font-semibold px-0.5 rounded-lg flex items-center gap-0.5 border border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <BookOpen className="w-2 h-2 text-amber-700" />
              <span>{t("dailyKatamaros")}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0.5 py-1 max-w-8xl space-y-1">
        {/* Search & Month Selector Card */}
        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <CardContent className="p-1 space-y-0.5">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-0.5">
              <div className="relative flex-1">
                <Search className="absolute right-0.5 top-1/3 -translate-y-1/2 text-stone-400 w-1.5 h-1.5" />
                <Input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-3 pe-2 bg-stone-50 dark:bg-zinc-800/80 border-stone-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm h-3.5"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute left-0.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-2 h-2" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold px-1 h-2"
              >
                بحث
              </Button>
            </form>

            {/* Month Carousel / Buttons */}
            <div className="space-y-0.5 pt-0.5 border-t border-stone-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-600 dark:text-zinc-400">{t("copticMonths")}</span>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400">
                  {locale === "en" ? currentMonthMeta.nameEn : locale === "cop" ? currentMonthMeta.nameCop : currentMonthMeta.nameAr}
                </span>
              </div>

              <div className="flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-thin">
                {COPTIC_MONTHS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMonth(m.id);
                      if (selectedDay > m.days) setSelectedDay(m.days);
                      if (viewMode === "search") setViewMode("day");
                    }}
                    className={cn(
                      "px-0.5 py-0.5 rounded-xl text-xs font-bold whitespace-nowrap transition border",
                      selectedMonth === m.id
                        ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                        : "bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-100"
                    )}
                  >
                    {locale === "en" ? m.nameEn : locale === "cop" ? m.nameCop : m.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Selector Numbers */}
            <div className="space-y-0.5 pt-0.5 border-t border-stone-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-bold text-stone-600 dark:text-zinc-400">
                    {t("copticDays", { month: locale === "en" ? currentMonthMeta.nameEn : currentMonthMeta.nameAr })}
                  </span>
                  <div className="flex items-center gap-0.25">
                    <button
                      onClick={handlePrevDay}
                      className="p-0.25 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded text-stone-600 dark:text-zinc-300"
                      title="Previous Day"
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={handleNextDay}
                      className="p-0.25 hover:bg-stone-200 dark:hover:bg-zinc-800 rounded text-stone-600 dark:text-zinc-300"
                      title="Next Day"
                    >
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <button
                    onClick={() => setViewMode(viewMode === "month" ? "day" : "month")}
                    className={cn(
                      "text-[11px] font-bold px-0.5 py-0.25 rounded-md border",
                      viewMode === "month"
                        ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                        : "text-stone-500 hover:text-stone-800"
                    )}
                  >
                    {viewMode === "month" ? t("viewDay") : t("viewMonth")}
                  </button>
                </div>
              </div>

              {viewMode !== "month" && (
                <div className="grid grid-cols-10 sm:grid-cols-15 gap-0.25">
                  {Array.from({ length: currentMonthMeta.days }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDay(d);
                        setViewMode("day");
                      }}
                      className={cn(
                        "h-2 rounded-lg text-xs font-bold flex items-center justify-center transition border",
                        selectedDay === d && viewMode === "day"
                          ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                          : "bg-stone-50 dark:bg-zinc-800/60 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:bg-stone-100"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="pt-0.5 border-t border-stone-100 dark:border-zinc-800 flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-0.5 py-0.25 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-0.25 border transition",
                      active
                        ? "bg-amber-900 text-white border-amber-900 dark:bg-amber-500 dark:text-zinc-950"
                        : "bg-stone-50 dark:bg-zinc-800/60 text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-700 hover:bg-stone-100"
                    )}
                  >
                    <Icon className="w-2 h-2" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Header for Current Selection */}
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h2 className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-red-500" />
              {searchQuery ? (
                <span>{t("searchResults", { query: searchQuery })}</span>
              ) : viewMode === "month" ? (
                <span>{t("monthCommemorations", { month: locale === "en" ? currentMonthMeta.nameEn : currentMonthMeta.nameAr })}</span>
              ) : (
                <span>{t("dayCommemorations", { day: selectedDay, month: locale === "en" ? currentMonthMeta.nameEn : currentMonthMeta.nameAr })}</span>
              )}
            </h2>
            <p className="text-xs text-stone-500">{t("foundCount", { count: totalCount })}</p>
          </div>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-2 gap-1">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <p className="text-sm font-bold text-stone-500">{t("loadingStories")}</p>
          </div>
        ) : stories.length > 0 ? (
          <div className="space-y-0.5">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                fontSize={fontSize}
                isPlaying={playingId === story.id}
                isLoadingAudio={audioLoadingId === story.id}
                isBookmarked={!!bookmarkedIds[story.id]}
                onPlay={() => playStoryNarration(story.id, story.textAr || story.textEn)}
                onBookmark={() => toggleBookmark(story.id, story.titleAr || story.titleEn)}
                onExpand={() => setActiveModalStory(story)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-2 px-1 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-3xl border border-stone-200/60 dark:border-zinc-800 space-y-0.5">
            <Flame className="w-3 h-3 text-amber-500/40 mx-auto" />
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold text-stone-700 dark:text-zinc-200">
                {t("noStoriesFound")}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                {t("noStoriesHint")}
              </p>
            </div>
            <div className="flex items-center justify-center gap-0.5 pt-0.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTodayClick}
                className="rounded-xl text-xs font-bold"
              >
                {t("todaySynaxarium")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStories}
                className="rounded-xl text-xs font-bold"
              >
                {t("refresh") || "إعادة المحاولة"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Full Story Dialog / Expanded View */}
      {activeModalStory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0.5">
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-900/20 overflow-hidden"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="p-1 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-amber-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 text-red-500" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-300">
                    {activeModalStory.titleAr || activeModalStory.titleEn}
                  </h3>
                  <Badge variant="outline" className="text-[10px] text-amber-800 border-amber-700/30">
                    {activeModalStory.day} {activeModalStory.monthNameAr}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setActiveModalStory(null)}
                className="p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-500"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="p-1.5 overflow-y-auto space-y-1">
              <div
                className="text-stone-800 dark:text-zinc-200 leading-relaxed font-serif text-justify"
                style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.9}px` }}
                dangerouslySetInnerHTML={{ __html: activeModalStory.textAr || activeModalStory.textEn }}
              />
            </div>

            <div className="p-1 border-t border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => playStoryNarration(activeModalStory.id, activeModalStory.textAr || activeModalStory.textEn)}
                className="text-xs font-semibold flex items-center gap-0.25"
              >
                {playingId === activeModalStory.id ? (
                  <>
                    <VolumeX className="w-2.5 h-2.5 text-red-600" />
                    <span>{t("stopAudio")}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-2.5 h-2.5 text-amber-700" />
                    <span>{t("listen")}</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => setActiveModalStory(null)}
                className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold"
              >
                {t("categories.all") === "All" ? "Close" : "إغلاق"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StoryCard({
  story,
  fontSize,
  isPlaying,
  isLoadingAudio,
  isBookmarked,
  onPlay,
  onBookmark,
  onExpand,
}: {
  story: SynaxariumStory;
  fontSize: number;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  isBookmarked: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  onExpand: () => void;
}) {
  const t = useTranslations("Synaxarium");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    const clean = (story.textAr || story.textEn).replace(/<[^>]*>?/gm, "");
    navigator.clipboard.writeText(`${story.titleAr || story.titleEn}\n\n${clean}`);
    setCopied(true);
    toast.success(t("copySuccess"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="rounded-2xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      <CardHeader className="py-0.5 px-1 bg-linear-to-r from-amber-50/60 to-transparent dark:from-amber-950/20 border-b border-stone-100 dark:border-zinc-800 flex flex-row items-center justify-between">
        <div className="flex items-center gap-0.5 flex-1 min-w-0">
          <div className="w-2.5 h-2.5 rounded-lg bg-amber-700/10 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-[10px]">
            {story.day}
          </div>
          <CardTitle className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-400 truncate">
            {story.titleAr || story.titleEn}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex border-amber-700/30 text-amber-800 dark:text-amber-300">
            {story.monthNameAr}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio */}
          <Button
            variant="ghost"
            onClick={onPlay}
            disabled={isLoadingAudio}
            className={cn(
              "h-2 w-2 px-1 rounded-lg",
              isPlaying ? "text-amber-700 bg-amber-100 dark:bg-amber-950/60" : "text-stone-500"
            )}
            title={isPlaying ? t("stopAudio") : t("listen")}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-1.5 h-1.5 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-1.5 h-1.5" />
            ) : (
              <Volume2 className="w-1.5 h-1.5" />
            )}
          </Button>

          {/* Copy */}
          <Button
            variant="ghost"
            onClick={handleCopy}
            className="h-2 w-2 px-1 rounded-lg text-stone-500"
            title={t("copySuccess")}
          >
            {copied ? <Check className="w-1.5 h-1.5 text-green-600" /> : <Copy className="w-1.5 h-1.5" />}
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            onClick={onBookmark}
            className={cn(
              "h-2 w-2 px-1 rounded-lg",
              isBookmarked ? "text-amber-700" : "text-stone-400"
            )}
            title={isBookmarked ? t("bookmarkSaved", { title: story.titleAr || story.titleEn }) : "Bookmark"}
          >
            {isBookmarked ? <BookmarkCheck className="w-1.5 h-1.5" /> : <Bookmark className="w-1.5 h-1.5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0.5 space-y-0.5">
        <div
          className={cn(
            "text-stone-800 dark:text-zinc-200 leading-relaxed font-serif text-justify transition-all",
            !expanded && "line-clamp-4"
          )}
          style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
          dangerouslySetInnerHTML={{ __html: story.textAr || story.textEn }}
        />

        <div className="flex items-center justify-between pt-0.5 border-t border-stone-50 dark:border-zinc-800/60">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
          >
            {expanded ? t("collapseInline") : t("expandInline")}
          </button>

          <Button
            variant="ghost"
            onClick={onExpand}
            className="text-xs text-stone-600 dark:text-zinc-400 hover:text-amber-800 pe-3 left-1"
          >
            {t("showMore")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
