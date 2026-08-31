'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaTimes,
  FaArrowRight,
  FaArrowLeft,
  FaExpand,
  FaCompress,
  FaChurch,
  FaMusic,
} from 'react-icons/fa';
import {
  LiturgyDocument,
  LiturgyLanguage,
  LiturgySection,
  ParticipantRole,
} from '@/lib/liturgies/types';

interface Props {
  liturgy: LiturgyDocument;
  enabledLanguages?: Record<LiturgyLanguage, boolean>;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  onClose: () => void;
}

export default function LiturgyPresentationMode({
  liturgy,
  enabledLanguages: initialLanguages,
  fontSize = 'base',
  onClose,
}: Props) {
  const allSections: LiturgySection[] = liturgy.groups.flatMap((g) => g.sections);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [enabledLanguages, setEnabledLanguages] = useState<Record<LiturgyLanguage, boolean>>(
    initialLanguages || {
      arabic: true,
      coptic_arabic: true,
      coptic: true,
      english: false,
    }
  );

  const currentSection = allSections[currentIndex] || allSections[0];

  const handleNext = () => {
    if (currentIndex < allSections.length - 1) {
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
  }, [currentIndex, allSections.length]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-1 md:p-1.5 select-none"
      dir="rtl"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-0.5">
        <div className="flex items-center gap-0.5">
          <FaChurch className="text-amber-400 text-2xl" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-amber-400">
              {liturgy.title.arabic}
            </h2>
            <p className="text-xs md:text-sm text-neutral-400">
              {currentSection.title.arabic} ({currentIndex + 1} / {allSections.length})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
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
                ? 'bg-blue-500 text-white'
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
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto my-1 overflow-y-auto px-0.5">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-1 w-full"
        >
          {/* Section speaker badge */}
          <div className="inline-block px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-bold">
            {currentSection.speaker === 'priest'
              ? 'مرد الكاهن'
              : currentSection.speaker === 'deacon'
              ? 'مرد الشماس'
              : currentSection.speaker === 'people'
              ? 'مرد الشعب'
              : 'صلاة'}
          </div>

          {/* Verses rendering in Large Presentation Fonts */}
          {currentSection.verses.map((verse, idx) => (
            <div key={idx} className="space-y-0.5">
              {/* Arabic */}
              {enabledLanguages.arabic && (
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-neutral-100 leading-tight">
                  {verse.arabic}
                </h1>
              )}

              {/* Arabized Coptic */}
              {enabledLanguages.coptic_arabic && verse.coptic_arabic && (
                <p className="text-2xl md:text-3xl font-sans text-amber-300 leading-relaxed">
                  {verse.coptic_arabic}
                </p>
              )}

              {/* Coptic */}
              {enabledLanguages.coptic && verse.coptic && (
                <p className="text-xl md:text-3xl font-coptic text-blue-300 leading-relaxed">
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
          disabled={currentIndex === allSections.length - 1}
          className="px-1 py-0.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-30 text-black font-bold flex items-center gap-0.5 transition shadow-lg shadow-amber-500/20"
        >
          <span>التالي</span>
          <FaArrowLeft />
        </button>
      </div>
    </div>
  );
}
