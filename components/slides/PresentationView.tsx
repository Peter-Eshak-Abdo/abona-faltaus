"use client";

import React, { useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Sparkles,
  BookOpen,
  Quote,
  Target,
} from "lucide-react";
import { Slide, SlideTheme, SLIDE_THEMES } from "@/lib/slides/types";
import { cn } from "@/lib/utils";

interface PresentationViewProps {
  slides: Slide[];
  initialIndex?: number;
  globalTheme: SlideTheme;
  onClose: () => void;
}

export default function PresentationView({
  slides,
  initialIndex = 0,
  globalTheme,
  onClose,
}: PresentationViewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const currentSlide = slides[currentIndex] || slides[0];
  const activeThemeKey = currentSlide.backgroundTheme || globalTheme;
  const themeConfig = SLIDE_THEMES[activeThemeKey] || SLIDE_THEMES["orthodox-dark"];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  }, [slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col justify-between select-none overflow-hidden transition-colors duration-500",
        themeConfig.bgClass
      )}
      dir="rtl"
    >
      {/* Top Bar Controls */}
      <header className="flex items-center justify-between p-1 sm:p-1.5 z-20 bg-linear-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-0.5">
          <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase px-0.5 py-0.5 rounded-full border bg-black/40 border-amber-400/30 text-amber-300 backdrop-blur-md">
            شريحة {currentIndex + 1} من {slides.length}
          </span>
          <span className="text-xs text-stone-300/80 hidden md:inline-block">
            استخدم الأسهم ← → أو المسافة للتنقل | F للشاشة الكاملة
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleFullscreen}
            className="p-0.5 rounded-full bg-black/40 hover:bg-black/60 text-stone-200 border border-white/10 backdrop-blur-md transition-all active:scale-95"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-0.5 rounded-full bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/30 backdrop-blur-md transition-all active:scale-95"
            title="إغلاق العرض (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Slide Content Stage */}
      <main className="flex-1 flex items-center justify-center p-1 sm:p-2 lg:p-2 relative max-w-6xl w-full mx-auto">
        <div
          key={currentSlide.id}
          className={cn(
            "w-full h-full max-h-[80vh] flex flex-col justify-center rounded-3xl p-1.5 sm:p-2 border shadow-2xl animate-in fade-in zoom-in-95 duration-300",
            themeConfig.cardClass
          )}
        >
          {/* Cover Slide */}
          {currentSlide.slideType === "cover" && (
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <div className="p-1 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/40 animate-pulse">
                <Sparkles size={36} />
              </div>
              <h1 className={cn("text-3xl sm:text-5xl md:text-6xl font-black leading-tight", themeConfig.titleColor)}>
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <p className={cn("text-xl sm:text-2xl md:text-3xl font-medium max-w-3xl", themeConfig.subtitleColor)}>
                  {currentSlide.subtitle}
                </p>
              )}
              {currentSlide.illustrationPrompt && (
                <div className="text-xs text-stone-400/70 border-t border-white/10 pt-1 max-w-md italic">
                  🎨 تصور الأيقونة: {currentSlide.illustrationPrompt}
                </div>
              )}
            </div>
          )}

          {/* Verse Slide */}
          {currentSlide.slideType === "verse" && (
            <div className="flex flex-col justify-center items-center text-center space-y-1.5">
              <div className="flex items-center gap-0.5 text-xs sm:text-sm font-bold uppercase tracking-widest px-1 py-0.5 rounded-full border bg-amber-500/10 border-amber-400/30 text-amber-300">
                <BookOpen size={16} />
                <span>الآية الذهبية للحفظ</span>
              </div>
              {currentSlide.verse && (
                <div className="space-y-1 max-w-4xl">
                  <blockquote className={cn("text-2xl sm:text-4xl md:text-5xl font-black leading-relaxed", themeConfig.accentColor)}>
                    « {currentSlide.verse.text} »
                  </blockquote>
                  <cite className={cn("block text-lg sm:text-2xl font-bold not-italic", themeConfig.titleColor)}>
                    ({currentSlide.verse.ref})
                  </cite>
                </div>
              )}
              {currentSlide.points && currentSlide.points.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center pt-1">
                  {currentSlide.points.map((pt, i) => (
                    <span
                      key={i}
                      className={cn("text-base sm:text-xl font-medium px-1 py-0.5 rounded-xl border", themeConfig.cardClass, themeConfig.textColor)}
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Patristic Quote Slide */}
          {currentSlide.slideType === "quote" && (
            <div className="flex flex-col justify-center items-center text-center space-y-1.5">
              <div className="flex items-center gap-0.5 text-xs sm:text-sm font-bold uppercase tracking-widest px-1 py-0.5 rounded-full border bg-rose-500/10 border-rose-400/30 text-rose-300">
                <Quote size={16} />
                <span>أقوال الآباء القديسين</span>
              </div>
              {currentSlide.quote && (
                <div className="space-y-1 max-w-4xl">
                  <p className={cn("text-2xl sm:text-4xl md:text-5xl font-black leading-relaxed italic", themeConfig.textColor)}>
                    &ldquo;{currentSlide.quote.text}&rdquo;
                  </p>
                  <p className={cn("text-xl sm:text-3xl font-extrabold", themeConfig.titleColor)}>
                    — {currentSlide.quote.author}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Standard Content / Activity / Conclusion */}
          {["content", "activity", "conclusion"].includes(currentSlide.slideType) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <h2 className={cn("text-2xl sm:text-4xl md:text-5xl font-black", themeConfig.titleColor)}>
                  {currentSlide.title}
                </h2>
                {currentSlide.slideType === "activity" && (
                  <span className="flex items-center gap-0.5 text-xs sm:text-sm font-bold px-0.5 py-0.25 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <Target size={16} />
                    <span>نشاط وتطبيق</span>
                  </span>
                )}
              </div>

              {currentSlide.points && currentSlide.points.length > 0 && (
                <ul className="space-y-1 sm:space-y-1.5 pr-0.5">
                  {currentSlide.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-0.5 text-xl sm:text-3xl font-bold leading-relaxed">
                      <span className={cn("text-2xl sm:text-4xl leading-none mt-1", themeConfig.accentColor)}>✦</span>
                      <span className={themeConfig.textColor}>{pt}</span>
                    </li>
                  ))}
                </ul>
              )}

              {currentSlide.verse && (
                <div className={cn("mt-1 p-1 rounded-2xl border text-base sm:text-xl font-medium", themeConfig.cardClass, themeConfig.accentColor)}>
                  « {currentSlide.verse.text} » ({currentSlide.verse.ref})
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Navigation Footer Controls */}
      <footer className="p-1 sm:p-1.5 flex items-center justify-between z-20 bg-linear-to-t from-black/70 to-transparent">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-1 sm:px-1.5 py-0.5 sm:py-0.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={20} />
          <span>السابق</span>
        </button>

        {/* Thumbnail dots */}
        <div className="hidden sm:flex items-center gap-0.5 overflow-x-auto max-w-[50vw] px-0.5 py-0.25">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300",
                currentIndex === idx
                  ? "w-8 bg-amber-400 shadow-md shadow-amber-500/50"
                  : "w-2.5 bg-white/30 hover:bg-white/60"
              )}
              title={`الانتقال إلى شريحة ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 sm:py-0.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm sm:text-base shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
        >
          <span>التالي</span>
          <ChevronLeft size={20} />
        </button>
      </footer>
    </div>
  );
}
