"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  Send,
  Loader2,
  Bookmark,
  Download,
  Eye,
  RefreshCw,
  Sliders,
  Share2,
  Info,
  Layers,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
import {
  ICON_STYLES,
  QUICK_SUGGESTIONS,
  IconStyleType,
  AspectRatioType,
} from "@/lib/orthodox-prompts";
import IconStyleCard from "./IconStyleCard";
import IconGalleryModal, { GeneratedIconItem } from "./IconGalleryModal";
import { supabase } from "@/lib/supabase";

const RATIOS: { id: AspectRatioType; label: string; desc: string }[] = [
  { id: "1:1", label: "مربع 1:1", desc: "أيقونة قياسية مربعة" },
  { id: "3:4", label: "طولي 3:4", desc: "أيقونة حائط كنسية" },
  { id: "9:16", label: "شاشة كاملة 9:16", desc: "خلفية هاتف وستوري" },
  { id: "16:9", label: "عريض 16:9", desc: "جدارية بانورامية" },
];

const LOCAL_STORAGE_KEY = "orthodox_generated_icons_v1";

export default function IconGeneratorClient() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<IconStyleType>("coptic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<GeneratedIconItem | null>(null);
  const [gallery, setGallery] = useState<GeneratedIconItem[]>([]);
  const [modalIcon, setModalIcon] = useState<GeneratedIconItem | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [user, setUser] = useState<any>(null);

  // تحميل المعرض المحفوظ في LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setGallery(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Error loading cached icons:", e);
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user || null);
    });
  }, []);

  const saveToGallery = useCallback((newItem: GeneratedIconItem) => {
    setGallery((prev) => {
      const updated = [newItem, ...prev.filter((item) => item.id !== newItem.id)];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 40)));
      } catch (e) {
        console.warn("Failed saving icon to localStorage:", e);
      }
      return updated;
    });
  }, []);

  const handleGenerate = async (customPrompt?: string, customStyle?: IconStyleType) => {
    const textToGenerate = (customPrompt || prompt).trim();
    const styleToUse = customStyle || selectedStyle;

    if (!textToGenerate) {
      toast.error("يرجى كتابة وصف للأيقونة أو الصورة المطلوبة أولاً");
      return;
    }

    if (isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading("جاري رسم وتوليد الأيقونة الأرثوذكسية بالذكاء الاصطناعي...");

    try {
      const res = await fetch("/api/generate-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToGenerate,
          style: styleToUse,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل في توليد الأيقونة");
      }

      const newIcon: GeneratedIconItem = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        prompt: data.prompt,
        style: data.style,
        styleTitle: data.styleTitle,
        aspectRatio: data.aspectRatio,
        theologicalInsight: data.theologicalInsight,
        createdAt: data.createdAt || new Date().toISOString(),
        isFavorite: false,
      };

      setCurrentIcon(newIcon);
      saveToGallery(newIcon);
      toast.success("تم توليد الأيقونة بنجاح مع التأمل اللاهوتي!", { id: toastId });
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.message || "حدث خطأ أثناء التوليد، يرجى المحاولة لاحقاً", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setGallery((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (modalIcon && modalIcon.id === id) {
      setModalIcon((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    if (currentIcon && currentIcon.id === id) {
      setCurrentIcon((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    toast.success("تم تحديث المفضلة");
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 relative overflow-x-hidden" dir="rtl">
      {/* Background Ambience & Coptic Golden Dust */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-10 right-1/4 w-24 h-24 bg-amber-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-10 w-24 h-24 bg-yellow-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-2.5 right-2.5 w-20 h-20 bg-red-950/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-amber-500/20 px-1 md:px-2 py-0.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-0.5">
          <Link
            href="/"
            className="p-0.5 rounded-full bg-stone-900 border border-amber-500/20 hover:bg-stone-800 text-amber-300 transition-all shadow-md"
            title="الرجوع للرئيسية"
          >
            <FaArrowRight size={16} />
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent flex items-center gap-0.5 font-serif">
              <Sparkles className="text-amber-400" size={20} />
              مولد الأيقونات والصور الأرثوذكسية الذكي
            </h1>
            <p className="text-xs text-amber-200/60 font-sans hidden sm:block">
              توليد أيقونات قبطية وبيزنطية وفن مقدس بالذكاء الاصطناعي مع القواعد اللاهوتية
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 bg-stone-900/90 p-0.5 rounded-2xl border border-stone-800">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-0.5 ${
              activeTab === "create"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Sparkles size={14} />
            <span>التوليد</span>
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-0.5 ${
              activeTab === "gallery"
                ? "bg-amber-500 text-stone-950 shadow-md"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <ImageIcon size={14} />
            <span>المعرض ({gallery.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-8xl mx-auto px-1 md:px-2 py-1 md:py-2">
        <AnimatePresence mode="wait">
          {activeTab === "create" ? (
            <motion.div
              key="create-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 items-start"
            >
              {/* Left Column (Controls & Inputs) - 7 cols */}
              <div className="lg:col-span-7 flex flex-col gap-1">
                {/* 1. Input Box */}
                <div className="bg-stone-900/70 border border-amber-500/20 rounded-3xl p-1 md:p-1 backdrop-blur-md shadow-xl">
                  <label className="text-sm font-bold text-amber-200 mb-0.5 flex items-center gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    صف الأيقونة أو المشهد المقدس المطلوب
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="مثال: السيد المسيح الراعي الصالح، السيدة العذراء والطفل، القديس مارمرقس، أيقونة القيامة، رئيس الملائكة ميخائيل..."
                      rows={3}
                      className="w-full bg-stone-950/80 border border-stone-700/70 focus:border-amber-400 rounded-2xl p-0.5 text-sm md:text-base text-stone-100 placeholder-stone-500 focus:outline-none transition-all resize-none shadow-inner"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="mt-0.5 pt-1 border-t border-white/5 flex flex-wrap items-center justify-between gap-0.5">
                    <span className="text-xs font-semibold text-stone-400 flex items-center gap-0.5">
                      <Sliders size={13} />
                      نسبة الأبعاد:
                    </span>
                    <div className="flex flex-wrap gap-0.5">
                      {RATIOS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setAspectRatio(r.id)}
                          className={`px-1 py-0.5 text-xs rounded-xl font-medium transition-all ${
                            aspectRatio === r.id
                              ? "bg-amber-400 text-stone-950 font-bold shadow-sm"
                              : "bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                          }`}
                          title={r.desc}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !prompt.trim()}
                    className={`mt-1 w-full py-0.5 px-1 rounded-2xl font-bold text-base flex items-center justify-center gap-0.5 shadow-xl transition-all ${
                      isGenerating || !prompt.trim()
                        ? "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                        : "bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 hover:shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin text-amber-950" size={20} />
                        <span>جاري الرسم والتوليد بالذكاء الاصطناعي...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>توليد الأيقونة الأرثوذكسية الآن</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Select Style */}
                <div>
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <h2 className="text-sm font-bold text-amber-200 flex items-center gap-0.5">
                      <Layers size={16} className="text-amber-400" />
                      اختر النمط الأيقونوغرافي المعتمد
                    </h2>
                    <span className="text-xs text-amber-300/60">3 أنماط كنسية كلاسيكية</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5">
                    {Object.values(ICON_STYLES).map((styleDef) => (
                      <IconStyleCard
                        key={styleDef.id}
                        styleDef={styleDef}
                        isSelected={selectedStyle === styleDef.id}
                        onSelect={(id) => setSelectedStyle(id)}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Quick Suggestions */}
                <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-1 backdrop-blur-md">
                  <h3 className="text-xs font-bold text-amber-300/80 mb-0.5 flex items-center gap-0.5">
                    <Sparkles size={14} className="text-amber-400" />
                    اقتراحات سريعة ونماذج أيقونات شهيرة:
                  </h3>
                  <div className="flex flex-wrap gap-0.5">
                    {QUICK_SUGGESTIONS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(item.arabicPrompt);
                          setSelectedStyle(item.style);
                        }}
                        className="text-xs bg-stone-800/70 hover:bg-amber-950/40 hover:border-amber-500/40 text-stone-300 hover:text-amber-200 px-1 py-0.5 rounded-xl border border-stone-700/50 transition-all text-right"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (Generated Result & Devotional View) - 5 cols */}
              <div className="lg:col-span-5 flex flex-col gap-1 sticky top-6">
                <div className="bg-stone-900/80 border border-amber-500/30 rounded-3xl p-1 md:p-1.5 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-amber-200 flex items-center gap-0.5">
                      <ImageIcon size={16} className="text-amber-400" />
                      معاينة الأيقونة الناتجة
                    </h2>
                    {currentIcon && (
                      <span className="text-[11px] font-bold px-0.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentIcon.styleTitle}
                      </span>
                    )}
                  </div>

                  {/* Image Display Card */}
                  <div className="w-full min-h-[350px] md:min-h-[420px] bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                    {isGenerating ? (
                      <div className="flex flex-col items-center gap-0.5 p-1 text-center">
                        <div className="w-4 h-4 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
                        <p className="text-sm font-bold text-amber-200 mt-0.5">
                          جاري تجسيد الأيقونة بالأسلوب المقدس...
                        </p>
                        <p className="text-xs text-stone-400 max-w-xs">
                          يتم الآن تطبيق القواعد الأيقونوغرافية الكنسية وكتابة التأمل اللاهوتي
                        </p>
                      </div>
                    ) : currentIcon ? (
                      <>
                        <img
                          src={currentIcon.imageUrl}
                          alt={currentIcon.prompt}
                          className="w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                        />

                        {/* Hover action overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-0.5 p-1">
                          <button
                            onClick={() => setModalIcon(currentIcon)}
                            className="bg-amber-400 text-stone-950 font-bold px-1 py-0.5 rounded-xl text-xs flex items-center gap-0.5 shadow-lg hover:bg-amber-300 transition-colors"
                          >
                            <Eye size={15} />
                            <span>عرض وشرح لاهوتي</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 p-1 text-center text-stone-500">
                        <ImageIcon size={20} className="text-stone-700 mb-0.5" />
                        <p className="text-sm font-medium text-stone-400">لا توجد أيقونة مولدة بعد</p>
                        <p className="text-xs text-stone-500 max-w-xs">
                          اكتب وصف الأيقونة واختر النمط واضغط على زر التوليد لتبدأ
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Theological Insight snippet if available */}
                  {currentIcon && currentIcon.theologicalInsight && !isGenerating && (
                    <div className="w-full mt-1 p-1 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed font-serif">
                      <p className="font-bold text-amber-300 mb-0.5 flex items-center gap-0.5">
                        <CheckCircle2 size={13} />
                        التأمل اللاهوتي للأيقونة:
                      </p>
                      <p className="line-clamp-4">{currentIcon.theologicalInsight}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Gallery Tab */
            <motion.div
              key="gallery-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-amber-100 flex items-center gap-0.5">
                    <ImageIcon className="text-amber-400" size={20} />
                    معرض الأيقونات والصور المولدة
                  </h2>
                  <p className="text-xs text-stone-400">
                    أيقوناتك المحفوظة محلياً مع إمكانية التنزيل والمشاركة في أي وقت
                  </p>
                </div>

                {gallery.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("هل تريد مسح سجل الأيقونات المحفوظة محلياً؟")) {
                        setGallery([]);
                        localStorage.removeItem(LOCAL_STORAGE_KEY);
                        toast.success("تم مسح المعرض");
                      }
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 px-1 py-0.5 rounded-xl bg-rose-950/30 border border-rose-800/40"
                  >
                    مسح المعرض
                  </button>
                )}
              </div>

              {gallery.length === 0 ? (
                <div className="bg-stone-900/40 border border-white/5 rounded-3xl p-2 text-center flex flex-col items-center gap-0.5">
                  <ImageIcon size={24} className="text-stone-700" />
                  <h3 className="text-base font-bold text-stone-300">المعرض فارغ حالياً</h3>
                  <p className="text-xs text-stone-500 max-w-sm">
                    قم بتوليد أيقونات جديدة لحفظها تلقائياً في معرضك الروحي والرجوع إليها دائماً
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-0.5 px-1 py-0.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs"
                  >
                    توليد أول أيقونة
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
                  {gallery.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setModalIcon(item)}
                      className="bg-stone-900/70 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden cursor-pointer shadow-lg group transition-all"
                    >
                      <div className="relative aspect-square bg-black/50 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-1 right-1">
                          <span className="text-[10px] font-bold px-0.5 py-0.5 rounded-full bg-black/70 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                            {item.styleTitle}
                          </span>
                        </div>
                      </div>
                      <div className="p-0.5">
                        <p className="text-xs font-bold text-stone-200 line-clamp-2 mb-0.5">
                          {item.prompt}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fullscreen & Theological Detail Modal */}
      <IconGalleryModal
        icon={modalIcon}
        isOpen={Boolean(modalIcon)}
        onClose={() => setModalIcon(null)}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
