"use client";

import React from "react";
import {
  Sparkles,
  BookOpen,
  Quote,
  Target,
  FileText,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import { Slide, SlideTheme, SlideType, SLIDE_THEMES } from "@/lib/slides/types";
import { cn } from "@/lib/utils";

interface SlideEditorProps {
  slide: Slide;
  slideIndex: number;
  globalTheme: SlideTheme;
  onUpdate: (updated: Slide) => void;
}

export default function SlideEditor({
  slide,
  slideIndex,
  globalTheme,
  onUpdate,
}: SlideEditorProps) {
  const activeTheme = slide.backgroundTheme || globalTheme;
  const themeConfig = SLIDE_THEMES[activeTheme] || SLIDE_THEMES["orthodox-dark"];

  const handleTitleChange = (val: string) => {
    onUpdate({ ...slide, title: val });
  };

  const handleSubtitleChange = (val: string) => {
    onUpdate({ ...slide, subtitle: val });
  };

  const handlePointChange = (index: number, val: string) => {
    const updated = [...slide.points];
    updated[index] = val;
    onUpdate({ ...slide, points: updated });
  };

  const handleAddPoint = () => {
    onUpdate({ ...slide, points: [...(slide.points || []), "نقطة جديدة..."] });
  };

  const handleRemovePoint = (index: number) => {
    onUpdate({ ...slide, points: slide.points.filter((_, i) => i !== index) });
  };

  const handleTypeChange = (newType: SlideType) => {
    const updated: Slide = { ...slide, slideType: newType };
    if (newType === "verse" && !updated.verse) {
      updated.verse = { text: "اَلرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ", ref: "مز 23: 1" };
    }
    if (newType === "quote" && !updated.quote) {
      updated.quote = { text: "الصلاة هي مفتاح السماء", author: "القديس يوحنا ذهبي الفم" };
    }
    onUpdate(updated);
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Slide Type & Theme Selectors */}
      <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-0.5 flex flex-wrap items-center justify-between gap-0.5">
        <div className="flex items-center gap-0.5 flex-wrap">
          <span className="text-xs font-bold text-stone-500">نوع الشريحة:</span>
          {[
            { type: "cover", label: "غلاف", icon: <Sparkles size={14} /> },
            { type: "content", label: "محتوى", icon: <FileText size={14} /> },
            { type: "verse", label: "آية", icon: <BookOpen size={14} /> },
            { type: "quote", label: "قول آبائي", icon: <Quote size={14} /> },
            { type: "activity", label: "نشاط", icon: <Target size={14} /> },
            { type: "conclusion", label: "خاتمة", icon: <CheckCircle size={14} /> },
          ].map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type as SlideType)}
              className={cn(
                "flex items-center gap-0.5 text-xs font-bold px-0.5 py-0.5 rounded-xl border transition-all",
                slide.slideType === type
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-zinc-700 hover:border-amber-400"
              )}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Individual Background Theme Override */}
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-bold text-stone-500">الثيم:</span>
          <select
            value={slide.backgroundTheme || "default"}
            onChange={(e) =>
              onUpdate({
                ...slide,
                backgroundTheme: e.target.value === "default" ? undefined : (e.target.value as SlideTheme),
              })
            }
            className="text-xs font-bold bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl px-0.5 py-0.5 outline-none text-stone-800 dark:text-stone-200"
          >
            <option value="default">حسب الثيم العام</option>
            {Object.entries(SLIDE_THEMES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* WYSIWYG Slide Canvas / Preview */}
      <div
        className={cn(
          "w-full aspect-16/9 rounded-3xl p-1 sm:p-2 border shadow-md flex flex-col justify-between transition-all duration-300 overflow-y-auto relative",
          themeConfig.bgClass
        )}
      >
        <div
          className={cn(
            "w-full h-full rounded-2xl p-1 sm:p-2 flex flex-col justify-between border",
            themeConfig.cardClass
          )}
        >
          {/* Header area */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs opacity-70">
              <span className={themeConfig.accentColor}>
                {slide.slideType.toUpperCase()} • شريحة {slideIndex + 1}
              </span>
              <span className={themeConfig.textColor}>منصة أبونا فلتاؤس</span>
            </div>

            {/* Editable Title */}
            <input
              type="text"
              value={slide.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="اكتب عنوان الشريحة هنا..."
              className={cn(
                "w-full bg-transparent border-b border-white/20 focus:border-amber-400 outline-none pb-1 font-black text-xl sm:text-2xl md:text-3xl",
                themeConfig.titleColor
              )}
            />

            {/* Subtitle if cover */}
            {slide.slideType === "cover" && (
              <input
                type="text"
                value={slide.subtitle || ""}
                onChange={(e) => handleSubtitleChange(e.target.value)}
                placeholder="عنوان فرعي توضيحي..."
                className={cn(
                  "w-full bg-transparent border-b border-white/10 focus:border-amber-400 outline-none pb-1 font-medium text-sm sm:text-lg",
                  themeConfig.subtitleColor
                )}
              />
            )}
          </div>

          {/* Body Section for Verse */}
          {slide.slideType === "verse" && (
            <div className="space-y-0.5 my-auto">
              <textarea
                value={slide.verse?.text || ""}
                onChange={(e) =>
                  onUpdate({
                    ...slide,
                    verse: { text: e.target.value, ref: slide.verse?.ref || "" },
                  })
                }
                rows={2}
                placeholder="نص الآية الذهبية..."
                className={cn(
                  "w-full bg-black/20 rounded-xl p-0.5 border border-amber-400/30 text-lg sm:text-xl font-bold outline-none text-center resize-none",
                  themeConfig.accentColor
                )}
              />
              <input
                type="text"
                value={slide.verse?.ref || ""}
                onChange={(e) =>
                  onUpdate({
                    ...slide,
                    verse: { text: slide.verse?.text || "", ref: e.target.value },
                  })
                }
                placeholder="شاهد الآية (مثال: مت 5: 14)"
                className={cn(
                  "w-full bg-transparent border-b border-white/20 text-center font-bold text-sm outline-none",
                  themeConfig.titleColor
                )}
              />
            </div>
          )}

          {/* Body Section for Quote */}
          {slide.slideType === "quote" && (
            <div className="space-y-0.5 my-auto">
              <textarea
                value={slide.quote?.text || ""}
                onChange={(e) =>
                  onUpdate({
                    ...slide,
                    quote: { text: e.target.value, author: slide.quote?.author || "" },
                  })
                }
                rows={2}
                placeholder="قول الأب القديس..."
                className={cn(
                  "w-full bg-black/20 rounded-xl p-0.5 border border-rose-400/30 text-base sm:text-xl font-bold italic outline-none text-center resize-none",
                  themeConfig.textColor
                )}
              />
              <input
                type="text"
                value={slide.quote?.author || ""}
                onChange={(e) =>
                  onUpdate({
                    ...slide,
                    quote: { text: slide.quote?.text || "", author: e.target.value },
                  })
                }
                placeholder="اسم القديس (مثال: القديس ماراسحق السرياني)"
                className={cn(
                  "w-full bg-transparent border-b border-white/20 text-center font-bold text-sm outline-none",
                  themeConfig.titleColor
                )}
              />
            </div>
          )}

          {/* Points list for standard slides */}
          {!["verse", "quote"].includes(slide.slideType) && (
            <div className="space-y-0.5 my-auto">
              {(slide.points || []).map((pt, pIdx) => (
                <div key={pIdx} className="flex items-center gap-0.5">
                  <span className={cn("text-base sm:text-xl", themeConfig.accentColor)}>✦</span>
                  <input
                    type="text"
                    value={pt}
                    onChange={(e) => handlePointChange(pIdx, e.target.value)}
                    placeholder="نقطة فرعية أو عنصر..."
                    className={cn(
                      "flex-1 bg-transparent border-b border-white/10 focus:border-amber-400 outline-none pb-0.5 text-sm sm:text-lg font-medium",
                      themeConfig.textColor
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(pIdx)}
                    className="text-stone-400 hover:text-red-400 p-0.5"
                    title="حذف النقطة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddPoint}
                className="flex items-center gap-0.5 text-xs font-bold text-amber-400 hover:text-amber-300 mt-0.5"
              >
                <Plus size={14} />
                <span>إضافة نقطة أخرى</span>
              </button>
            </div>
          )}

          {/* Footer of Slide */}
          <div className="flex justify-between items-center text-xs opacity-60 pt-0.5 border-t border-white/10">
            <span className={themeConfig.textColor}>
              {slide.illustrationPrompt ? `🎨 ${slide.illustrationPrompt}` : "محتوى درس مدارس الأحد"}
            </span>
          </div>
        </div>
      </div>

      {/* Speaker Notes & Illustration Prompt Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
        <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-0.5 space-y-0.5">
          <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
            🗣️ ملاحظات وتوجيهات الإلقاء للخادم (Speaker Notes):
          </label>
          <textarea
            value={slide.notes || ""}
            onChange={(e) => onUpdate({ ...slide, notes: e.target.value })}
            placeholder="توجيهات الشرح، أفكار لتشجيع التفاعل، تساؤلات تفتح النقاش..."
            rows={2}
            className="w-full bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-xs font-medium outline-none resize-none"
          />
        </div>

        <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-0.5 space-y-0.5">
          <label className="text-xs font-bold text-stone-600 dark:text-stone-300 block">
            🖼️ وصف الأيقونة أو الصورة القبطية المقترحة:
          </label>
          <div className="flex gap-0.5">
            <input
              type="text"
              value={slide.illustrationPrompt || ""}
              onChange={(e) => onUpdate({ ...slide, illustrationPrompt: e.target.value })}
              placeholder="مثال: أيقونة الراعي الصالح، مشهد السامرية عند البئر..."
              className="flex-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-0.5 text-xs font-medium outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
