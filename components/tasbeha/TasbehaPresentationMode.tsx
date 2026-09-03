'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
  FaMusic,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import {
  TasbehaDocument,
  TasbehaLanguage,
  TasbehaSection,
  TasbehaVerse,
} from '@/lib/tasbeha/types';

interface Props {
  tasbeha: TasbehaDocument;
  onClose: () => void;
}

export default function TasbehaPresentationMode({ tasbeha, onClose }: Props) {
  // Flatten into presentation items (either single verse or paired verses for Psali / Part 8)
  const presentationSlides = useMemo(() => {
    const slides: {
      sectionTitle: string;
      tone?: string;
      side: 'qebli' | 'bahri';
      verses: any[];
    }[] = [];

    let currentSide: 'qebli' | 'bahri' = 'qebli';

    tasbeha.groups.forEach((g) => {
      g.sections.forEach((sec) => {
        const titleLower = sec.title.arabic.toLowerCase();
        const isPsali = titleLower.includes('إبصالية') || titleLower.includes('ابصالية');
        const isPart8 = titleLower.includes('القطعة الثامنة') || sec.verses.some((v) => v.arabic.includes('السلامُ لكِ يا مريم، التي شهد لها'));
        const isPaired = isPsali || isPart8;

        const verses = sec.verses;
        const step = isPaired ? 2 : 1;

        for (let i = 0; i < verses.length; i += step) {
          const chunk = verses.slice(i, i + step);
          slides.push({
            sectionTitle: sec.title.arabic,
            tone: sec.tone,
            side: currentSide,
            verses: chunk,
          });
          currentSide = currentSide === 'qebli' ? 'bahri' : 'qebli';
        }
      });
    });

    return slides.length > 0 ? slides : [{ sectionTitle: 'التسبحة', side: 'qebli' as const, verses: [] }];
  }, [tasbeha]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [enabledLanguages, setEnabledLanguages] = useState<Record<TasbehaLanguage, boolean>>({
    arabic: true,
    coptic_arabic: true,
    coptic: true,
    english: false,
  });

  const currentSlide = presentationSlides[currentIndex] || presentationSlides[0];

  const handleNext = () => {
    if (currentIndex < presentationSlides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, presentationSlides.length]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-1 md:p-1.5 select-none"
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-0.5">
        <div className="flex items-center gap-1">
          <FaMusic className="text-amber-400 text-2xl" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-400">
              {tasbeha.title.arabic}
            </h2>
            <p className="text-xs md:text-sm text-neutral-400">
              {currentSlide.sectionTitle} ({currentIndex + 1} / {presentationSlides.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* خورس قبلي / بحري Indicator */}
          <div
            className={`px-0.5 py-0.5 rounded-full text-xs font-black border transition ${
              currentSlide.side === 'qebli'
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-blue-500/20'
                : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
            }`}
          >
            {currentSlide.side === 'qebli' ? '🔔 خورس قبلي (يمين)' : '🌿 خورس بحري (يسار)'}
          </div>

          <button
            onClick={() =>
              setEnabledLanguages((prev) => ({
                ...prev,
                coptic_arabic: !prev.coptic_arabic,
              }))
            }
            className={`px-0.5 py-0.5 rounded-lg text-xs font-bold transition ${
              enabledLanguages.coptic_arabic
                ? 'bg-amber-500 text-black'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            المعرب
          </button>
          <button
            onClick={() =>
              setEnabledLanguages((prev) => ({
                ...prev,
                coptic: !prev.coptic,
              }))
            }
            className={`px-0.5 py-0.5 rounded-lg text-xs font-bold transition ${
              enabledLanguages.coptic
                ? 'bg-blue-500 text-black'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            القبطي
          </button>

          <button
            onClick={onClose}
            className="p-0.5 bg-neutral-800 hover:bg-red-600/80 rounded-xl transition text-white"
            title="خروج من وضع العرض (Esc)"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-1 overflow-y-auto px-1 w-full">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="space-y-0.5 w-full"
        >
          {/* Section speaker / tone badge */}
          <div className="inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-700 text-sm font-bold text-amber-300">
            <span>{currentSlide.sectionTitle}</span>
            {currentSlide.tone && currentSlide.tone !== 'both' && (
              <span className="text-amber-400 flex items-center gap-0.25">
                • {currentSlide.tone === 'adam' ? 'لحن آدام' : 'لحن واطس'}
              </span>
            )}
          </div>

          {/* Verses rendering in Large Single-Quarter (ربع واحد فقط كبير مالي الشاشة) */}
          {currentSlide.verses.map((verse: TasbehaVerse, idx: number) => (
            <div
              key={idx}
              className={`p-0.5 rounded-2xl border transition ${
                currentSlide.side === 'qebli'
                  ? 'bg-blue-950/20 border-blue-500/30'
                  : 'bg-emerald-950/20 border-emerald-500/30'
              } space-y-0.5`}
            >
              {/* Arabic */}
              {enabledLanguages.arabic && (
                <h1
                  className={`text-3xl md:text-5xl lg:text-6xl font-serif font-black leading-snug ${
                    currentSlide.side === 'qebli' ? 'text-blue-100' : 'text-emerald-100'
                  }`}
                >
                  {verse.arabic}
                </h1>
              )}

              {/* Arabized Coptic */}
              {enabledLanguages.coptic_arabic && verse.coptic_arabic && (
                <p className="text-2xl md:text-4xl font-sans font-semibold text-amber-300 leading-relaxed">
                  {verse.coptic_arabic}
                </p>
              )}

              {/* Coptic */}
              {enabledLanguages.coptic && verse.coptic && (
                <p className="text-xl md:text-3xl font-coptic text-neutral-300 leading-relaxed" dir="ltr">
                  {verse.coptic}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="flex items-center justify-between border-t border-white/10 pt-0.5">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-1 py-0.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white font-bold flex items-center gap-0.5 transition"
        >
          <FaArrowRight />
          <span>السابق</span>
        </button>

        <div className="text-xs text-neutral-400 font-mono">
          استخدم الأسهم ← → أو مسافة للتنقل
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === presentationSlides.length - 1}
          className="px-0.5 py-0.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-neutral-950 font-bold flex items-center gap-0.5 transition shadow-lg shadow-amber-500/20"
        >
          <span>التالي</span>
          <FaArrowLeft />
        </button>
      </div>
    </div>
  );
}
