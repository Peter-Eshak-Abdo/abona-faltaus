'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaChurch,
  FaUserTie,
  FaUsers,
  FaMusic,
  FaCopy,
  FaCheck,
  FaShareAlt,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import {
  TasbehaSection,
  TasbehaHymnRef,
  TasbehaLanguage,
  TasbehaLayoutMode,
  ParticipantRole,
} from '@/lib/tasbeha/types';
import { toast } from 'sonner';

interface Props {
  section: TasbehaSection;
  enabledLanguages: Record<TasbehaLanguage, boolean>;
  layoutMode: TasbehaLayoutMode;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  onPlayHymn?: (hymn: TasbehaHymnRef) => void;
}

const ROLE_META: Record<
  ParticipantRole,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  all: {
    label: 'الكل',
    bg: 'bg-neutral-800/80',
    text: 'text-neutral-300',
    border: 'border-neutral-700',
    icon: FaChurch,
  },
  priest: {
    label: 'الكاهن',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: FaChurch,
  },
  deacon: {
    label: 'الشماس',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: FaUserTie,
  },
  people: {
    label: 'الخورس والشعب',
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: FaUsers,
  },
  cantor: {
    label: 'المعلم والمرتل',
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: FaMusic,
  },
};

const FONT_CLASSES: Record<
  'sm' | 'base' | 'lg' | 'xl',
  { arabic: string; coptic: string; meta: string }
> = {
  sm: { arabic: 'text-base', coptic: 'text-sm', meta: 'text-xs' },
  base: { arabic: 'text-lg md:text-xl', coptic: 'text-base md:text-lg', meta: 'text-sm' },
  lg: { arabic: 'text-xl md:text-2xl', coptic: 'text-lg md:text-xl', meta: 'text-base' },
  xl: { arabic: 'text-2xl md:text-3xl', coptic: 'text-xl md:text-2xl', meta: 'text-lg' },
};

export default function TasbehaVerseCard({
  section,
  enabledLanguages,
  layoutMode,
  fontSize,
  onPlayHymn,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const roleInfo = ROLE_META[section.speaker] || ROLE_META.people;
  const RoleIcon = roleInfo.icon;
  const fonts = FONT_CLASSES[fontSize];

  const activeLangCount = Object.values(enabledLanguages).filter(Boolean).length;

  const copySectionText = async () => {
    const textLines = section.verses
      .map((v) => {
        const parts = [];
        if (enabledLanguages.arabic && v.arabic) parts.push(v.arabic);
        if (enabledLanguages.coptic_arabic && v.coptic_arabic)
          parts.push(`[المعرب]: ${v.coptic_arabic}`);
        if (enabledLanguages.coptic && v.coptic) parts.push(`[قبطي]: ${v.coptic}`);
        if (enabledLanguages.english && v.english) parts.push(`[Eng]: ${v.english}`);
        return parts.join('\n');
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(
        `${section.title.arabic} (${roleInfo.label})\n\n${textLines}`
      );
      setCopied(true);
      toast.success('تم نسخ نص التسبحة المبارك');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل النسخ');
    }
  };

  const shareSection = async () => {
    const textLines = section.verses.map((v) => v.arabic).join('\n');
    const shareData = {
      title: section.title.arabic,
      text: `${section.title.arabic}\n\n${textLines}\n— من تسبحة الكنيسة القبطية الأرثوذكسية`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareData.text)}`,
        '_blank'
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${roleInfo.bg} ${roleInfo.border} p-1 md:p-1.5 shadow-lg backdrop-blur-xs`}
    >
      {/* Header with Role Badge, Tone Tag, & Section Title */}
      <div className="flex flex-wrap items-center justify-between gap-0.5 pb-0.5 mb-0.5 border-b border-white/5 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            className="p-0.5 text-neutral-400 hover:text-blue-400 transition"
            aria-label="تبديل العرض"
          >
            <span className={`inline-block transform transition-transform duration-200 text-xs ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              ▲
            </span>
          </button>

          <span
            className={`inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-full text-xs md:text-sm font-bold border ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
          >
            <RoleIcon className="text-xs" />
            <span>{roleInfo.label}</span>
          </span>

          {section.tone && section.tone !== 'both' && (
            <span className="inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-800 border border-neutral-700 text-amber-300">
              {section.tone === 'adam' ? <FaSun className="text-[10px]" /> : <FaMoon className="text-[10px]" />}
              <span>{section.tone === 'adam' ? 'آدام' : 'واطس'}</span>
            </span>
          )}

          <h4 className="font-bold text-white text-base md:text-lg">
            {section.title.arabic}
            {section.title.coptic && enabledLanguages.coptic && (
              <span className="text-neutral-400 font-normal mr-0.5 text-sm font-coptic">
                ({section.title.coptic})
              </span>
            )}
          </h4>
          <span className="text-xs text-neutral-400 bg-neutral-800/60 px-0.5 py-0.5 rounded-full">
            {section.verses.length} ربع
          </span>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={copySectionText}
            className="p-0.5 text-neutral-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition text-xs"
            title="نسخ النص"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
          </button>
          <button
            onClick={shareSection}
            className="p-0.5 text-neutral-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition text-xs"
            title="مشاركة"
          >
            <FaShareAlt />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >

      {/* Rubric / Instructions if present */}
      {section.rubric?.arabic && (
        <div className="mb-0.5 px-0.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs md:text-sm leading-relaxed">
          <span className="font-bold ml-0.5">📌 توجيه طقسي:</span>
          {section.rubric.arabic}
        </div>
      )}

      {/* Interactive Hyperlinks / Options */}
      {section.hyperlinks && section.hyperlinks.length > 0 && (
        <div className="mb-0.5 flex flex-wrap items-center gap-0.5 p-0.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <span className="text-xs font-bold text-blue-400">🔗 خيارات وانتقالات التسبحة:</span>
          {section.hyperlinks.map((hl, hIdx) => (
            <span
              key={hIdx}
              className="inline-flex items-center gap-0.25 px-0.5 py-0.25 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-500/30 text-xs font-semibold hover:bg-blue-500/30 transition cursor-pointer shadow-xs"
              title={hl.target}
            >
              <span>{hl.text}</span>
            </span>
          ))}
        </div>
      )}

      {/* Verses Container */}
      <div className="space-y-0.5">
        {section.verses.map((verse, vIdx) => {
          const isGrid = layoutMode === 'columns' && activeLangCount > 1;

          return (
            <div
              key={vIdx}
              className={`rounded-xl p-0.5 md:p-1 bg-black/20 border border-white/5 space-y-0.5 ${
                isGrid ? `grid gap-0.5 md:grid-cols-${activeLangCount}` : 'flex flex-col'
              }`}
            >
              {/* 1. Arabic View */}
              {enabledLanguages.arabic && verse.arabic && (
                <div className="space-y-0.25">
                  <span className="text-[11px] font-bold text-blue-400/80 uppercase tracking-wider block">
                    العربية
                  </span>
                  <p
                    className={`${fonts.arabic} font-serif leading-relaxed text-neutral-100`}
                  >
                    {verse.arabic}
                  </p>
                </div>
              )}

              {/* 2. Arabized Coptic View (قبطي معرب) */}
              {enabledLanguages.coptic_arabic && verse.coptic_arabic && (
                <div className="space-y-0.25 bg-amber-500/5 p-0.5 rounded-lg border border-amber-500/10">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                    قبطي معرب (نطق بالعربي)
                  </span>
                  <p
                    className={`${fonts.arabic} font-sans leading-relaxed text-amber-200`}
                  >
                    {verse.coptic_arabic}
                  </p>
                </div>
              )}

              {/* 3. Coptic View (قبطي أصيل) */}
              {enabledLanguages.coptic && verse.coptic && (
                <div className="space-y-0.25 bg-blue-500/5 p-0.5 rounded-lg border border-blue-500/10" dir="ltr">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block text-left">
                    ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ (Coptic)
                  </span>
                  <p
                    className={`${fonts.coptic} font-coptic leading-relaxed text-blue-200 text-left`}
                  >
                    {verse.coptic}
                  </p>
                </div>
              )}

              {/* 4. English View */}
              {enabledLanguages.english && verse.english && (
                <div className="space-y-0.25" dir="ltr">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block text-left">
                    English
                  </span>
                  <p
                    className={`${fonts.meta} font-sans leading-relaxed text-neutral-300 text-left`}
                  >
                    {verse.english}
                  </p>
                </div>
              )}

              {/* Direct Hymn Audio & Hazat Link Button */}
              {verse.hymnRef && (
                <div className="pt-0.5 flex items-center justify-end">
                  <button
                    onClick={() => onPlayHymn?.(verse.hymnRef!)}
                    className="inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-xl bg-linear-to-r from-blue-500/20 to-indigo-600/30 hover:from-blue-500/30 hover:to-indigo-600/40 text-blue-300 border border-blue-500/40 text-xs md:text-sm font-bold shadow-md hover:scale-102 transition"
                  >
                    <FaMusic className="text-blue-400" />
                    <span>تسجيل اللحن ومذكرة الهزات: {verse.hymnRef.name}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </motion.div>
      )}
    </motion.div>
  );
}
