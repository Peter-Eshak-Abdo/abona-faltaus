"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Presentation,
  Plus,
  Trash2,
  Download,
  Play,
  Copy,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileDown,
  LayoutTemplate,
  Layers,
  ArrowRight,
  Share2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Slide, SlideTheme, PresentationData, SLIDE_THEMES } from "@/lib/slides/types";
import SlideEditor from "@/components/slides/SlideEditor";
import PresentationView from "@/components/slides/PresentationView";
import { cn } from "@/lib/utils";

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "slide-1",
    slideType: "cover",
    title: "فضيلة المحبة الحقيقية",
    subtitle: "درس تفاعلي لمدارس الأحد والشباب",
    points: [],
    notes: "ابدأ الدرس بطرح سؤال تشويقي: ما هو أصعب موقف طُلب منك فيه أن تسامح؟",
    illustrationPrompt: "أيقونة قبطية للسيد المسيح الفادي باسطاً ذراعيه بالحب",
    backgroundTheme: "orthodox-dark",
  },
  {
    id: "slide-2",
    slideType: "verse",
    title: "الآية الذهبية",
    points: ["المحبة ليست مجرد مشاعر، بل بذل وعطاء عملي."],
    verse: {
      text: "بِهذَا يَعْرِفُ الْجَمِيعُ أَنَّكُمْ تَلاَمِيذِي: إِنْ كَانَ لَكُمْ حُبٌّ بَعْضاً لِبَعْضٍ",
      ref: "يوحنا 13: 35",
    },
    notes: "ردد الآية مع المخدومين 3 مرات متتالية مع التوقف عند كلمة (تلاميذي).",
    illustrationPrompt: "مشهد السيد المسيح يغسل أرجل تلاميذه في العلية",
    backgroundTheme: "orthodox-dark",
  },
  {
    id: "slide-3",
    slideType: "content",
    title: "سمات المحبة المسيحية",
    points: [
      "محبة باذلة ومضحية بدون انتظار مقابل",
      "محبة تتسع للجميع حتى للأعداء والمسيئين",
      "محبة دائمة لا تسقط أبداً (1 كو 13: 8)",
    ],
    notes: "أعطِ مثالاً حياً من حياة الشهداء أو القديسين في التسامح الفوري.",
    illustrationPrompt: "أيقونة القديس إسطفانوس وهو يصلي من أجل راجميه",
    backgroundTheme: "orthodox-dark",
  },
  {
    id: "slide-4",
    slideType: "quote",
    title: "أقوال الآباء القديسين",
    points: [],
    quote: {
      text: "المحبة هي شجرة الحياة، ومن يغرسها في قلبه يثمر كل الفضائل.",
      author: "القديس ماراسحق السرياني",
    },
    notes: "شرح معنى أن المحبة هي أم كل الفضائل وتاجها.",
    illustrationPrompt: "أيقونة قبطية للقديس ماراسحق السرياني في قلايته",
    backgroundTheme: "orthodox-dark",
  },
  {
    id: "slide-5",
    slideType: "activity",
    title: "تطبيق عملي وتدريب الأسبوع",
    points: [
      "اختر شخصاً اختلفت معه، وبادر بإرسال رسالة سلام أو صلاة لأجله اليوم.",
      "قدم عملاً بسيطاً من المحبة الخفية (خدمة في البيت، مساعدة زميل).",
    ],
    notes: "اطلب من الشباب كتابة التدريب في هواتفهم ومتابعته في الاعتراف القادم.",
    illustrationPrompt: "رمز المحبة والعطاء الروحي القبطي",
    backgroundTheme: "orthodox-dark",
  },
];

interface PresentationBuilderProps {
  initialTitle?: string;
  initialContent?: string;
  isEmbedded?: boolean;
}

export default function PresentationBuilderClient({
  initialTitle,
  initialContent,
  isEmbedded = false,
}: PresentationBuilderProps = {}) {
  const [title, setTitle] = useState(initialTitle || "عرض درس مدارس الأحد التفاعلي");
  const [globalTheme, setGlobalTheme] = useState<SlideTheme>("orthodox-dark");
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // AI Modal Generation State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState(initialTitle || "");
  const [audience, setAudience] = useState("إعدادي وثانوي");
  const [slidesCount, setSlidesCount] = useState(6);
  const [style, setStyle] = useState("تفاعلي وروحي");
  const [mainGoal, setMainGoal] = useState("");
  const [customNotes, setCustomNotes] = useState(initialContent || "");

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Local Storage Save & Restore
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coptic_slides_builder_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.theme) setGlobalTheme(parsed.theme);
        if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setSlides(parsed.slides);
        }
      }
    } catch (err) {
      console.warn("Could not load slides from localStorage", err);
    }
  }, []);

  const saveToLocal = (newSlides: Slide[], newTitle: string, newTheme: SlideTheme) => {
    try {
      localStorage.setItem(
        "coptic_slides_builder_state",
        JSON.stringify({
          title: newTitle,
          theme: newTheme,
          slides: newSlides,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.warn("Failed saving slides", err);
    }
  };

  const handleUpdateCurrentSlide = (updated: Slide) => {
    const newSlides = [...slides];
    newSlides[activeSlideIndex] = updated;
    setSlides(newSlides);
    saveToLocal(newSlides, title, globalTheme);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      slideType: "content",
      title: `عنصر ${slides.length + 1}`,
      points: ["نقطة ومحور تأملي جديد"],
      notes: "",
      illustrationPrompt: "",
      backgroundTheme: globalTheme,
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
    saveToLocal(updated, title, globalTheme);
    toast.success("تمت إضافة شريحة جديدة");
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("يجب أن يحتوي العرض على شريحة واحدة على الأقل");
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, index - 1));
    saveToLocal(updated, title, globalTheme);
    toast.info("تم حذف الشريحة");
  };

  const handleReorder = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    const updated = [...slides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSlides(updated);
    setActiveSlideIndex(to);
    saveToLocal(updated, title, globalTheme);
  };

  // AI Generation Handler
  const handleGenerateWithAI = async () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال موضوع العرض أو الدرس");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/slides/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience: audience,
          slidesCount,
          style,
          mainGoal,
          theme: globalTheme,
          customNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || "فشل توليد الشرائح");
      }

      const generatedData = json.data;
      if (generatedData.presentationTitle) {
        setTitle(generatedData.presentationTitle);
      }
      if (Array.isArray(generatedData.slides) && generatedData.slides.length > 0) {
        setSlides(generatedData.slides);
        setActiveSlideIndex(0);
        saveToLocal(generatedData.slides, generatedData.presentationTitle || topic, globalTheme);
      }
      setIsAiModalOpen(false);
      toast.success("تم توليد العرض التقديمي الأرثوذكسي بنجاح! 🪄");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء توليد الشرائح");
    } finally {
      setIsGenerating(false);
    }
  };

  // PPTX Export Handler
  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/slides/export-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          theme: globalTheme,
          slides,
        }),
      });

      if (!res.ok) {
        throw new Error("فشل تصدير ملف البوربوينت");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "orthodox-presentation"}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير ملف PowerPoint (.pptx) بنجاح! 🎉");
    } catch (err: any) {
      toast.error(err.message || "فشل تصدير PowerPoint");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#fdfbf7] dark:bg-zinc-950 text-[#2d1b18] dark:text-stone-100 flex flex-col font-sans ${isEmbedded ? 'pb-2' : ''}`} dir="rtl">
      {/* Top Header Navbar - Hidden when embedded */}
      {!isEmbedded && (
        <header className="bg-[#5c4538] dark:bg-zinc-900 text-[#e8cfae] px-1 py-0.5 sm:px-1.5 flex items-center justify-between shadow-md sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+8px)]">
          <div className="flex items-center gap-0.5">
            <Link href="/" className="p-0.5 hover:bg-white/10 rounded-xl transition-colors text-white">
              <ArrowRight size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-0.5">
                <Presentation className="text-amber-400" size={20} />
                <h1 className="text-base sm:text-lg font-black">صانع العروض التقديمية الكنسية (Slides AI)</h1>
              </div>
              <p className="text-xs text-[#e8cfae]/80 hidden sm:block">
                تصميم وتوليد عروض بوربوينت ومدارس الأحد بالذكاء الاصطناعي مع التصدير المباشر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-0.5 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-950 font-black px-0.5 py-0.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>توليد بالـ AI 🪄</span>
            </button>

            <button
              onClick={() => setIsPlaying(true)}
              className="flex items-center gap-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-0.5 py-0.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play size={16} />
              <span>بدء العرض 🖥️</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-1 sm:p-1.5 flex flex-col gap-0.5">
        {/* Title, Global Theme & Actions Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-0.5 sm:p-1.5 shadow-sm border border-stone-200/80 dark:border-zinc-800 flex flex-col md:flex-row gap-0.5 items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              saveToLocal(slides, e.target.value, globalTheme);
            }}
            placeholder="عنوان العرض التقديمي..."
            className="w-full md:w-1/2 text-lg sm:text-xl font-black bg-transparent border-b-2 border-stone-200 dark:border-zinc-700 focus:border-amber-600 outline-none pb-1 text-[#2d1b18] dark:text-stone-100"
          />

          <div className="flex items-center gap-0.5 w-full md:w-auto justify-end flex-wrap">
            {/* Global Theme Selector */}
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">الثيم العام:</span>
              <select
                value={globalTheme}
                onChange={(e) => {
                  const newTheme = e.target.value as SlideTheme;
                  setGlobalTheme(newTheme);
                  saveToLocal(slides, title, newTheme);
                }}
                className="text-xs font-bold bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-0.5 py-0.5 outline-none"
              >
                {Object.entries(SLIDE_THEMES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export PPTX Button */}
            <button
              onClick={handleExportPPTX}
              disabled={isExporting}
              className="flex items-center gap-0.5 px-0.5 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
              <span>تصدير PowerPoint (.pptx)</span>
            </button>
          </div>
        </div>

        {/* Slides Thumbnails Sidebar + Active Slide Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0.5 items-start">
          {/* Thumbnails Navigator (Left/Right depending on RTL) */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-3xl p-0.5 shadow-sm border border-stone-200/80 dark:border-zinc-800 flex flex-col gap-0.5 max-h-[calc(100vh-250px)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-0.5">
              <div className="flex items-center gap-0.5 text-xs font-black text-stone-700 dark:text-stone-300">
                <Layers size={16} className="text-amber-600" />
                <span>الشرائح ({slides.length})</span>
              </div>
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-0.25 text-xs font-bold px-0.5 py-0.25 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl transition cursor-pointer"
              >
                <Plus size={14} />
                <span>إضافة شريحة</span>
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {slides.map((s, idx) => {
                const isCurrent = idx === activeSlideIndex;
                const slideThemeKey = s.backgroundTheme || globalTheme;
                const themeConf = SLIDE_THEMES[slideThemeKey] || SLIDE_THEMES["orthodox-dark"];

                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={cn(
                      "group p-0.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-0.5 select-none",
                      isCurrent
                        ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-50/50 dark:bg-zinc-800"
                        : "border-stone-200 dark:border-zinc-800 hover:border-stone-300 bg-stone-50 dark:bg-zinc-900/60"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-stone-600 dark:text-stone-300">
                        {idx + 1}. {s.title || "شريحة بدون عنوان"}
                      </span>
                      <div className="flex items-center gap-0.25 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(idx, idx - 1);
                          }}
                          disabled={idx === 0}
                          className="p-0.25 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md disabled:opacity-30"
                          title="تحريك لأعلى"
                        >
                          ▲
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(idx, idx + 1);
                          }}
                          disabled={idx === slides.length - 1}
                          className="p-0.25 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-md disabled:opacity-30"
                          title="تحريك لأسفل"
                        >
                          ▼
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSlide(idx);
                          }}
                          className="p-0.25 hover:bg-red-100 dark:hover:bg-red-950 text-red-600 rounded-md"
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Mini Preview Box */}
                    <div
                      className={cn(
                        "w-full h-4 rounded-xl p-0.5 flex flex-col justify-center border text-[10px] overflow-hidden leading-tight",
                        themeConf.bgClass
                      )}
                    >
                      <span className={cn("font-bold truncate", themeConf.titleColor)}>
                        {s.title}
                      </span>
                      <span className={cn("truncate opacity-80 text-[9px]", themeConf.textColor)}>
                        {s.slideType === "verse"
                          ? `« ${s.verse?.text || ""} »`
                          : s.slideType === "quote"
                          ? `"${s.quote?.text || ""}"`
                          : s.points?.[0] || s.subtitle || "..."}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Slide Editor Canvas */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-3xl p-1 sm:p-1.5 shadow-sm border border-stone-200/80 dark:border-zinc-800">
            {slides[activeSlideIndex] && (
              <SlideEditor
                slide={slides[activeSlideIndex]}
                slideIndex={activeSlideIndex}
                globalTheme={globalTheme}
                onUpdate={handleUpdateCurrentSlide}
              />
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive Presentation Mode */}
      {isPlaying && (
        <PresentationView
          slides={slides}
          initialIndex={activeSlideIndex}
          globalTheme={globalTheme}
          onClose={() => setIsPlaying(false)}
        />
      )}

      {/* AI Presentation Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-1">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-1.5 max-w-lg w-full shadow-2xl border border-amber-200/50 dark:border-zinc-800 space-y-1 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-0.5">
                <div className="p-0.5 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-stone-900 dark:text-stone-100">
                  توليد عرض تقديمي بالذكاء الاصطناعي
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-0.5">
              <div>
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-0.5">
                  موضوع الدرس أو العرض
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: فضيلة التواضع، رحلة الفلك وطوفان نوح، سر الإفخارستيا..."
                  className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-0.5">
                    الفئة المستهدفة
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value="حضانة وابتدائي">حضانة +1و2ابتدائي</option>
                    <option value="3و4و5و6 ابتدائي">3و4و5و6 ابتدائي</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                    <option value="شباب وخريجين">شباب وخريجين</option>
                    <option value="اجتماع عام / شعب">اجتماع الشعب</option>
                    <option value="خدام وخادمات">خدام وخادمات</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    عدد الشرائح
                  </label>
                  <select
                    value={slidesCount}
                    onChange={(e) => setSlidesCount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value={5}>5 شرائح (موجز سريع)</option>
                    <option value={6}>6 شرائح (نموذجي لدرس)</option>
                    <option value={8}>8 شرائح (شامل ومفصل)</option>
                    <option value={10}>10 شرائح (عرض طويل)</option>
                    <option value={15}>15 شرائح (عرض طويل اوي)</option>
                    <option value={20}>20 شرائح (عرض طويل اوي اوي)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    أسلوب الشرح
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value="تفاعلي وروحي">تفاعلي وروحي</option>
                    <option value="قصصي ومبسط">قصصي ومبسط</option>
                    <option value="لاهوتي ودراسي">لاهوتي ودراسي</option>
                    <option value="أسئلة ومسابقات">أسئلة ومسابقات</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1">
                    الهدف المركزي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="مثال: تشجيع الشباب على الصلاة اليومية"
                    className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block mb-1">
                  ملاحظات أو مراجع تريد التركيز عليها
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="مثال: ركز على قصة القديس الأنبا أنطونيوس، وضع آية من رسالة أفسس..."
                  rows={2}
                  className="w-full bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-xs font-medium outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex gap-0.5 justify-end pt-0.5 border-t border-stone-100 dark:border-zinc-800">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-1 py-0.5 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-xl text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري توليد العرض بالـ AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>توليد الشرائح 🪄</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
