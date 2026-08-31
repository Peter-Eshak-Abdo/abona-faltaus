"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  BookOpen,
  Loader2,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  ZoomIn,
  ZoomOut,
  Cross,
  Sun,
  Moon,
  Flame,
  Scroll,
  Church,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getCopticDate, CopticDate, COPTIC_MONTHS, copticToGregorian } from "@/lib/coptic-date";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { isRtlLocale } from "@/i18n/routing";

interface SynaxariumEntry {
  titleAr: string;
  titleEn: string;
  textAr: string;
  textEn: string;
}

interface KatamarosResponse {
  title: string;
  season: string;
  dayTune: string;
  readings: {
    v_psalm: string;
    v_gospel: string;
    m_psalm: string;
    m_gospel: string;
    pauline: string;
    catholic: string;
    acts: string;
    l_psalm: string;
    l_gospel: string;
  };
  synaxarium: SynaxariumEntry[];
}

export default function KatamarosPage() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  const [date, setDate] = useState<Date>(new Date());
  const [copticInfo, setCopticInfo] = useState<CopticDate | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KatamarosResponse | null>(null);

  // Settings: Font Size & Audio & Bookmarks
  const [fontSize, setFontSize] = useState<number>(18);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [bookmarkedSections, setBookmarkedSections] = useState<Record<string, boolean>>({});

  // Audio narration state
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Coptic Date selector states
  const [showCopticPicker, setShowCopticPicker] = useState(false);
  const [selectedCopticMonth, setSelectedCopticMonth] = useState<number>(1);
  const [selectedCopticDay, setSelectedCopticDay] = useState<number>(1);

  // Load saved preferences
  useEffect(() => {
    const savedSize = localStorage.getItem("katamaros-font-size");
    if (savedSize) setFontSize(Number(savedSize));

    const savedBookmarks = localStorage.getItem("katamaros-bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarkedSections(JSON.parse(savedBookmarks));
      } catch {}
    }
  }, []);

  const updateFontSize = (delta: number) => {
    setFontSize((prev) => {
      const next = Math.min(Math.max(prev + delta, 14), 28);
      localStorage.setItem("katamaros-font-size", String(next));
      return next;
    });
  };

  const toggleBookmark = (key: string, title: string) => {
    setBookmarkedSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("katamaros-bookmarks", JSON.stringify(updated));
      if (updated[key]) {
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
    setPlayingKey(null);
    setAudioLoading(null);
  };

  const playNarration = async (key: string, text: string) => {
    if (playingKey === key) {
      stopAudio();
      return;
    }

    stopAudio();
    setAudioLoading(key);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("فشل توليد الصوت");

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setPlayingKey(null);
          setAudioLoading(null);
        };
        await audioRef.current.play();
        setPlayingKey(key);
      }
    } catch (err) {
      toast.error("تعذر تشغيل الراوي الصوتي حالياً");
    } finally {
      setAudioLoading(null);
    }
  };

  const fetchReadings = async (targetDate: Date) => {
    setLoading(true);
    stopAudio();

    try {
      const cDate = getCopticDate(targetDate);
      setCopticInfo(cDate);
      setSelectedCopticMonth(cDate.month);
      setSelectedCopticDay(cDate.day);

      const isSunday = targetDate.getDay() === 0;

      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copticMonth: cDate.month,
          copticDay: cDate.day,
          isSunday,
          gregorianDate: targetDate.toISOString(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch katamaros readings:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings(date);
  }, [date]);

  const changeDateByDays = (days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    setDate(nextDate);
  };

  const handleCopticDateSubmit = () => {
    if (!copticInfo) return;
    const gregDate = copticToGregorian(copticInfo.year, selectedCopticMonth, selectedCopticDay);
    setDate(gregDate);
    setShowCopticPicker(false);
  };

  return (
    <div className="min-h-screen pb-4 bg-stone-50/50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100" dir={isRtl ? "rtl" : "ltr"}>
      <audio ref={audioRef} className="hidden" />

      {/* Hero Header */}
      <div className="border-b border-amber-900/10 dark:border-amber-500/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-1 py-0.5 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-0.5">
          {/* Title & Coptic Date */}
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-3 rounded-xl bg-amber-700/10 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
              <Church className="w-2.5 h-2.5" />
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                <h1 className="text-lg font-bold text-amber-950 dark:text-amber-400">القطمارس اليومي</h1>
                {copticInfo && (
                  <Badge variant="outline" className="text-amber-800 border-amber-700/30 dark:text-amber-300 text-xs font-semibold px-0.5">
                    {copticInfo.formattedAr}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
                قراءات الكنيسة القبطية الأرثوذكسية اليومية
              </p>
            </div>
          </div>

          {/* Quick Actions & Date Pickers */}
          <div className="flex items-center gap-0.5 flex-wrap justify-center">
            {/* Font Size Controls */}
            <div className="flex items-center bg-stone-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-stone-200 dark:border-zinc-700">
              <button
                onClick={() => updateFontSize(-1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300 transition"
                title="تصغير الخط"
              >
                <ZoomOut className="w-2.5 h-2.5" />
              </button>
              <span className="px-0.5 text-xs font-bold text-stone-700 dark:text-zinc-300 font-mono">{fontSize}</span>
              <button
                onClick={() => updateFontSize(1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300 transition"
                title="تكبير الخط"
              >
                <ZoomIn className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Prev / Next Date Navigation */}
            <div className="flex items-center bg-stone-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-stone-200 dark:border-zinc-700">
              <button
                onClick={() => changeDateByDays(1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300"
                title="اليوم التالي"
              >
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => setDate(new Date())}
                className="px-0.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
              >
                اليوم
              </button>
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-0.5 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md text-stone-600 dark:text-zinc-300"
                title="اليوم السابق"
              >
                <ChevronLeft className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Gregorian Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-2 text-xs font-normal border-stone-200 dark:border-zinc-700 rounded-lg flex items-center gap-0.5 bg-white dark:bg-zinc-800"
                >
                  <CalendarIcon className="h-2.5 w-2.5 text-amber-700" />
                  <span>{format(date, "d MMM yyyy", { locale: arEG })}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl shadow-xl" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Coptic Date Converter Modal / Popover */}
            <Popover open={showCopticPicker} onOpenChange={setShowCopticPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-2.5 text-xs font-semibold border-amber-700/30 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg"
                >
                  التحويل بالتقويم القبطي
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-18 p-0.5 space-y-0.5 rounded-2xl shadow-xl bg-white dark:bg-zinc-900 border-amber-900/20" align="end">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-400">اختر التاريخ القبطي</h4>
                  <p className="text-[11px] text-stone-500">سيتم حساب اليوم الميلادي ومطابقته مباشرة بالقطمارس</p>
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-stone-600 dark:text-zinc-400">الشهر القبطي</label>
                    <select
                      value={selectedCopticMonth}
                      onChange={(e) => setSelectedCopticMonth(Number(e.target.value))}
                      className="w-full text-xs p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800"
                    >
                      {COPTIC_MONTHS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nameAr} ({m.nameCop})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-semibold text-stone-600 dark:text-zinc-400">اليوم</label>
                    <select
                      value={selectedCopticDay}
                      onChange={(e) => setSelectedCopticDay(Number(e.target.value))}
                      className="w-full text-xs p-0.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800"
                    >
                      {Array.from({ length: selectedCopticMonth === 13 ? 6 : 30 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  onClick={handleCopticDateSubmit}
                  className="w-full h-2.5 text-xs bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold"
                >
                  تطبيق التاريخ
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0.5 py-1 max-w-5xl space-y-1">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 space-y-0.5">
            <Loader2 className="h-2.5 w-2.5 animate-spin text-amber-700" />
            <span className="text-sm font-semibold text-stone-600 dark:text-zinc-400">
              جاري تجهيز قراءات اليوم والسنكسار...
            </span>
          </div>
        ) : data ? (
          <>
            {/* Header Banner with Season / Day Name */}
            <Card className="border-amber-900/10 dark:border-zinc-800 bg-linear-to-br from-amber-500/10 via-amber-700/5 to-transparent rounded-2xl shadow-sm overflow-hidden">
              <CardContent className="p-1 flex flex-col md:flex-row items-center justify-between gap-0.5 text-center md:text-right">
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center md:justify-start gap-0.5 flex-wrap">
                    <h2 className="text-lg md:text-xl font-bold text-amber-950 dark:text-amber-300">
                      {data.title || "قراءات اليوم المبارك"}
                    </h2>
                    {data.dayTune && (
                      <Badge className="bg-amber-700/20 text-amber-900 dark:text-amber-300 hover:bg-amber-700/30 border-0 text-xs">
                        {data.dayTune}
                      </Badge>
                    )}
                  </div>
                  {data.season && (
                    <p className="text-xs text-stone-600 dark:text-zinc-400">
                      فصل القراءات: <span className="font-semibold text-amber-800 dark:text-amber-400">{data.season}</span>
                    </p>
                  )}
                </div>
                <div className="text-xs text-stone-500 dark:text-zinc-400 font-medium">
                  {format(date, "EEEE d MMMM yyyy", { locale: arEG })}
                </div>
              </CardContent>
            </Card>

            {/* Category Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-0.5 bg-stone-100/80 dark:bg-zinc-900/80 p-0.5 rounded-xl border border-stone-200/80 dark:border-zinc-800">
                <TabsTrigger value="all" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  الكل
                </TabsTrigger>
                <TabsTrigger value="vespers" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  عشية
                </TabsTrigger>
                <TabsTrigger value="matins" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  باكر
                </TabsTrigger>
                <TabsTrigger value="epistles" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  الرسائل والإبركسيس
                </TabsTrigger>
                <TabsTrigger value="synaxarium" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  السنكسار ({data.synaxarium?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="liturgy" className="flex-1 min-w-[70px] text-xs font-semibold rounded-lg py-0.5">
                  القداس الإلهي
                </TabsTrigger>
              </TabsList>

              {/* All Sections */}
              <TabsContent value="all" className="space-y-1 mt-1">
                {/* 1. رفع بخور عشية */}
                {(data.readings.v_psalm || data.readings.v_gospel) && (
                  <SectionBlock title="رفع بخور عشية" icon={<Moon className="w-2.5 h-2.5 text-indigo-500" />}>
                    <ReadingItem
                      id="v_psalm"
                      title="مزمور عشية"
                      content={data.readings.v_psalm}
                      fontSize={fontSize}
                      isPlaying={playingKey === "v_psalm"}
                      isLoadingAudio={audioLoading === "v_psalm"}
                      isBookmarked={!!bookmarkedSections["v_psalm"]}
                      onPlay={() => playNarration("v_psalm", data.readings.v_psalm)}
                      onBookmark={() => toggleBookmark("v_psalm", "مزمور عشية")}
                    />
                    <ReadingItem
                      id="v_gospel"
                      title="إنجيل عشية"
                      content={data.readings.v_gospel}
                      fontSize={fontSize}
                      isPlaying={playingKey === "v_gospel"}
                      isLoadingAudio={audioLoading === "v_gospel"}
                      isBookmarked={!!bookmarkedSections["v_gospel"]}
                      onPlay={() => playNarration("v_gospel", data.readings.v_gospel)}
                      onBookmark={() => toggleBookmark("v_gospel", "إنجيل عشية")}
                      highlight
                    />
                  </SectionBlock>
                )}

                {/* 2. رفع بخور باكر */}
                {(data.readings.m_psalm || data.readings.m_gospel) && (
                  <SectionBlock title="رفع بخور باكر" icon={<Sun className="w-2 h-2 text-amber-500" />}>
                    <ReadingItem
                      id="m_psalm"
                      title="مزمور باكر"
                      content={data.readings.m_psalm}
                      fontSize={fontSize}
                      isPlaying={playingKey === "m_psalm"}
                      isLoadingAudio={audioLoading === "m_psalm"}
                      isBookmarked={!!bookmarkedSections["m_psalm"]}
                      onPlay={() => playNarration("m_psalm", data.readings.m_psalm)}
                      onBookmark={() => toggleBookmark("m_psalm", "مزمور باكر")}
                    />
                    <ReadingItem
                      id="m_gospel"
                      title="إنجيل باكر"
                      content={data.readings.m_gospel}
                      fontSize={fontSize}
                      isPlaying={playingKey === "m_gospel"}
                      isLoadingAudio={audioLoading === "m_gospel"}
                      isBookmarked={!!bookmarkedSections["m_gospel"]}
                      onPlay={() => playNarration("m_gospel", data.readings.m_gospel)}
                      onBookmark={() => toggleBookmark("m_gospel", "إنجيل باكر")}
                      highlight
                    />
                  </SectionBlock>
                )}

                {/* 3. الرسائل والإبركسيس */}
                {(data.readings.pauline || data.readings.catholic || data.readings.acts) && (
                  <SectionBlock title="الرسائل وسفر أعمال الرسل" icon={<Scroll className="w-2 h-2 text-emerald-600" />}>
                    <ReadingItem
                      id="pauline"
                      title="البولس (رسالة القديس بولس)"
                      content={data.readings.pauline}
                      fontSize={fontSize}
                      isPlaying={playingKey === "pauline"}
                      isLoadingAudio={audioLoading === "pauline"}
                      isBookmarked={!!bookmarkedSections["pauline"]}
                      onPlay={() => playNarration("pauline", data.readings.pauline)}
                      onBookmark={() => toggleBookmark("pauline", "رسالة البولس")}
                    />
                    <ReadingItem
                      id="catholic"
                      title="الكاثوليكون (الرسائل الجامعة)"
                      content={data.readings.catholic}
                      fontSize={fontSize}
                      isPlaying={playingKey === "catholic"}
                      isLoadingAudio={audioLoading === "catholic"}
                      isBookmarked={!!bookmarkedSections["catholic"]}
                      onPlay={() => playNarration("catholic", data.readings.catholic)}
                      onBookmark={() => toggleBookmark("catholic", "الكاثوليكون")}
                    />
                    <ReadingItem
                      id="acts"
                      title="الإبركسيس (أعمال الرسل)"
                      content={data.readings.acts}
                      fontSize={fontSize}
                      isPlaying={playingKey === "acts"}
                      isLoadingAudio={audioLoading === "acts"}
                      isBookmarked={!!bookmarkedSections["acts"]}
                      onPlay={() => playNarration("acts", data.readings.acts)}
                      onBookmark={() => toggleBookmark("acts", "الإبركسيس")}
                    />
                  </SectionBlock>
                )}

                {/* 4. السنكسار اليومي */}
                {data.synaxarium && data.synaxarium.length > 0 && (
                  <SectionBlock title="السنكسار (تذكارات القديسين والشهداء)" icon={<Flame className="w-2 h-2 text-red-500" />}>
                    <div className="space-y-3">
                      {data.synaxarium.map((item, idx) => (
                        <SynaxariumCard
                          key={idx}
                          item={item}
                          fontSize={fontSize}
                          isPlaying={playingKey === `synax_${idx}`}
                          isLoadingAudio={audioLoading === `synax_${idx}`}
                          onPlay={() => playNarration(`synax_${idx}`, item.textAr || item.textEn)}
                        />
                      ))}
                    </div>
                  </SectionBlock>
                )}

                {/* 5. مزمور وإنجيل القداس */}
                {(data.readings.l_psalm || data.readings.l_gospel) && (
                  <SectionBlock title="قراءات القداس الإلهي" icon={<Church className="w-2 h-2 text-amber-700" />}>
                    <ReadingItem
                      id="l_psalm"
                      title="مزمور القداس"
                      content={data.readings.l_psalm}
                      fontSize={fontSize}
                      isPlaying={playingKey === "l_psalm"}
                      isLoadingAudio={audioLoading === "l_psalm"}
                      isBookmarked={!!bookmarkedSections["l_psalm"]}
                      onPlay={() => playNarration("l_psalm", data.readings.l_psalm)}
                      onBookmark={() => toggleBookmark("l_psalm", "مزمور القداس")}
                    />
                    <ReadingItem
                      id="l_gospel"
                      title="إنجيل القداس الإلهي"
                      content={data.readings.l_gospel}
                      fontSize={fontSize}
                      isPlaying={playingKey === "l_gospel"}
                      isLoadingAudio={audioLoading === "l_gospel"}
                      isBookmarked={!!bookmarkedSections["l_gospel"]}
                      onPlay={() => playNarration("l_gospel", data.readings.l_gospel)}
                      onBookmark={() => toggleBookmark("l_gospel", "إنجيل القداس")}
                      highlight
                    />
                  </SectionBlock>
                )}
              </TabsContent>

              {/* Vespers Tab */}
              <TabsContent value="vespers" className="space-y-1 mt-1">
                {data.readings.v_psalm || data.readings.v_gospel ? (
                  <>
                    <ReadingItem
                      id="v_psalm"
                      title="مزمور عشية"
                      content={data.readings.v_psalm}
                      fontSize={fontSize}
                      isPlaying={playingKey === "v_psalm"}
                      isLoadingAudio={audioLoading === "v_psalm"}
                      isBookmarked={!!bookmarkedSections["v_psalm"]}
                      onPlay={() => playNarration("v_psalm", data.readings.v_psalm)}
                      onBookmark={() => toggleBookmark("v_psalm", "مزمور عشية")}
                    />
                    <ReadingItem
                      id="v_gospel"
                      title="إنجيل عشية"
                      content={data.readings.v_gospel}
                      fontSize={fontSize}
                      isPlaying={playingKey === "v_gospel"}
                      isLoadingAudio={audioLoading === "v_gospel"}
                      isBookmarked={!!bookmarkedSections["v_gospel"]}
                      onPlay={() => playNarration("v_gospel", data.readings.v_gospel)}
                      onBookmark={() => toggleBookmark("v_gospel", "إنجيل عشية")}
                      highlight
                    />
                  </>
                ) : (
                  <div className="text-center py-0.5 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 text-stone-500 text-sm">
                    لا ترفع صلاة عشية في هذا اليوم حسب الترتيب الطقسي (انتقل لتبويب باكر أو القداس الإلهي)
                  </div>
                )}
              </TabsContent>

              {/* Matins Tab */}
              <TabsContent value="matins" className="space-y-1 mt-1">
                <ReadingItem
                  id="m_psalm"
                  title="مزمور باكر"
                  content={data.readings.m_psalm}
                  fontSize={fontSize}
                  isPlaying={playingKey === "m_psalm"}
                  isLoadingAudio={audioLoading === "m_psalm"}
                  isBookmarked={!!bookmarkedSections["m_psalm"]}
                  onPlay={() => playNarration("m_psalm", data.readings.m_psalm)}
                  onBookmark={() => toggleBookmark("m_psalm", "مزمور باكر")}
                />
                <ReadingItem
                  id="m_gospel"
                  title="إنجيل باكر"
                  content={data.readings.m_gospel}
                  fontSize={fontSize}
                  isPlaying={playingKey === "m_gospel"}
                  isLoadingAudio={audioLoading === "m_gospel"}
                  isBookmarked={!!bookmarkedSections["m_gospel"]}
                  onPlay={() => playNarration("m_gospel", data.readings.m_gospel)}
                  onBookmark={() => toggleBookmark("m_gospel", "إنجيل باكر")}
                  highlight
                />
              </TabsContent>

              {/* Epistles Tab */}
              <TabsContent value="epistles" className="space-y-1 mt-1">
                <ReadingItem
                  id="pauline"
                  title="البولس (رسالة القديس بولس)"
                  content={data.readings.pauline}
                  fontSize={fontSize}
                  isPlaying={playingKey === "pauline"}
                  isLoadingAudio={audioLoading === "pauline"}
                  isBookmarked={!!bookmarkedSections["pauline"]}
                  onPlay={() => playNarration("pauline", data.readings.pauline)}
                  onBookmark={() => toggleBookmark("pauline", "رسالة البولس")}
                />
                <ReadingItem
                  id="catholic"
                  title="الكاثوليكون (الرسائل الجامعة)"
                  content={data.readings.catholic}
                  fontSize={fontSize}
                  isPlaying={playingKey === "catholic"}
                  isLoadingAudio={audioLoading === "catholic"}
                  isBookmarked={!!bookmarkedSections["catholic"]}
                  onPlay={() => playNarration("catholic", data.readings.catholic)}
                  onBookmark={() => toggleBookmark("catholic", "الكاثوليكون")}
                />
                <ReadingItem
                  id="acts"
                  title="الإبركسيس (أعمال الرسل)"
                  content={data.readings.acts}
                  fontSize={fontSize}
                  isPlaying={playingKey === "acts"}
                  isLoadingAudio={audioLoading === "acts"}
                  isBookmarked={!!bookmarkedSections["acts"]}
                  onPlay={() => playNarration("acts", data.readings.acts)}
                  onBookmark={() => toggleBookmark("acts", "الإبركسيس")}
                />
              </TabsContent>

              {/* Synaxarium Tab */}
              <TabsContent value="synaxarium" className="space-y-1 mt-1">
                {data.synaxarium && data.synaxarium.length > 0 ? (
                  <div className="space-y-3">
                    {data.synaxarium.map((item, idx) => (
                      <SynaxariumCard
                        key={idx}
                        item={item}
                        fontSize={fontSize}
                        isPlaying={playingKey === `synax_${idx}`}
                        isLoadingAudio={audioLoading === `synax_${idx}`}
                        onPlay={() => playNarration(`synax_${idx}`, item.textAr || item.textEn)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-1.5 text-stone-500">لا تتوفر تذكارات سنكسار لهذا اليوم</div>
                )}
              </TabsContent>

              {/* Liturgy Tab */}
              <TabsContent value="liturgy" className="space-y-1 mt-1">
                <ReadingItem
                  id="l_psalm"
                  title="مزمور القداس"
                  content={data.readings.l_psalm}
                  fontSize={fontSize}
                  isPlaying={playingKey === "l_psalm"}
                  isLoadingAudio={audioLoading === "l_psalm"}
                  isBookmarked={!!bookmarkedSections["l_psalm"]}
                  onPlay={() => playNarration("l_psalm", data.readings.l_psalm)}
                  onBookmark={() => toggleBookmark("l_psalm", "مزمور القداس")}
                />
                <ReadingItem
                  id="l_gospel"
                  title="إنجيل القداس الإلهي"
                  content={data.readings.l_gospel}
                  fontSize={fontSize}
                  isPlaying={playingKey === "l_gospel"}
                  isLoadingAudio={audioLoading === "l_gospel"}
                  isBookmarked={!!bookmarkedSections["l_gospel"]}
                  onPlay={() => playNarration("l_gospel", data.readings.l_gospel)}
                  onBookmark={() => toggleBookmark("l_gospel", "إنجيل القداس")}
                  highlight
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-2.5 bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-0.5">
            <BookOpen className="w-3 h-3 text-stone-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-base font-bold text-stone-700 dark:text-zinc-300">لا توجد قراءات مسجلة لهذا اليوم</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              يمكنك اختيار يوم آخر من خلال التقويم بالأعلى أو الانتقال للأيام المجاورة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5 pt-0.5">
      <div className="flex items-center gap-0.5 border-b border-stone-200/80 dark:border-zinc-800 pb-0.5">
        {icon}
        <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-200">{title}</h3>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ReadingItem({
  id,
  title,
  content,
  fontSize,
  isPlaying,
  isLoadingAudio,
  isBookmarked,
  onPlay,
  onBookmark,
  highlight = false,
}: {
  id: string;
  title: string;
  content: string;
  fontSize: number;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  isBookmarked: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    toast.success("تم نسخ النص للحافظة");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={cn(
        "rounded-2xl transition-all border overflow-hidden bg-white dark:bg-zinc-900 shadow-xs",
        highlight
          ? "border-amber-700/40 dark:border-amber-500/30 ring-1 ring-amber-700/10"
          : "border-stone-200 dark:border-zinc-800"
      )}
    >
      <CardHeader className="py-0.5 px-0.5 bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-800 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-amber-950 dark:text-amber-400 flex items-center gap-1.5">
          <BookOpen className="w-2 h-2 text-amber-700 dark:text-amber-400" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-0.25">
          {/* Audio Narrator */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onPlay}
            disabled={isLoadingAudio}
            className={cn(
              "h-2 w-2 p-0 rounded-lg",
              isPlaying ? "text-amber-700 bg-amber-100 dark:bg-amber-950/60" : "text-stone-500"
            )}
            title={isPlaying ? "إيقاف القراءة الصوتية" : "استماع للنص"}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </Button>

          {/* Copy Text */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-2 w-2 p-0 rounded-lg text-stone-500"
            title="نسخ النص"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>

          {/* Bookmark */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onBookmark}
            className={cn(
              "h-2 w-2 p-0 rounded-lg",
              isBookmarked ? "text-amber-700" : "text-stone-400"
            )}
            title={isBookmarked ? "محفوظ في المفضلة" : "حفظ في المفضلة"}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1">
        <p
          className="text-stone-800 dark:text-zinc-200 leading-relaxed font-serif text-justify"
          style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
        >
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

function SynaxariumCard({
  item,
  fontSize,
  isPlaying,
  isLoadingAudio,
  onPlay,
}: {
  item: SynaxariumEntry;
  fontSize: number;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  onPlay: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="rounded-2xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
      <CardHeader className="py-0.5 px-1 bg-amber-50/40 dark:bg-amber-950/20 border-b border-stone-100 dark:border-zinc-800 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-amber-900 dark:text-amber-400 flex items-center gap-0.5">
          <Flame className="w-2 h-2 text-red-500 shrink-0" />
          <span>{item.titleAr || item.titleEn}</span>
        </CardTitle>
        <div className="flex items-center gap-0.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPlay}
            disabled={isLoadingAudio}
            className={cn(
              "h-2 w-2 p-0 rounded-lg",
              isPlaying ? "text-amber-700 bg-amber-100 dark:bg-amber-950/60" : "text-stone-500"
            )}
            title={isPlaying ? "إيقاف القراءة" : "استماع لتاريخ القديس"}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-1 space-y-0.5">
        <div
          className={cn(
            "text-stone-800 dark:text-zinc-200 leading-relaxed font-serif text-justify transition-all",
            !expanded && "line-clamp-4"
          )}
          style={{ fontSize: `${fontSize}px`, lineHeight: `${fontSize * 1.8}px` }}
          dangerouslySetInnerHTML={{ __html: item.textAr || item.textEn }}
        />
        {(item.textAr || item.textEn).length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline pt-1 block"
          >
            {expanded ? "عرض أقل ▲" : "قراءة السيرة كاملة ▼"}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
