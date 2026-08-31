'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChurch,
  FaUserTie,
  FaUsers,
  FaBookOpen,
  FaCopy,
  FaCheck,
  FaShareAlt,
  FaMusic,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import {
  LiturgySection,
  LiturgyHymnRef,
  LiturgyLanguage,
  LiturgyLayoutMode,
  ParticipantRole,
} from '@/lib/liturgies/types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface Props {
  section: LiturgySection;
  enabledLanguages: Record<LiturgyLanguage, boolean>;
  layoutMode: LiturgyLayoutMode;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  onPlayHymn?: (hymn: LiturgyHymnRef) => void;
  onNavigateHyperlink?: (target: string) => void;
}

export default function LiturgyVerseCard({
  section,
  enabledLanguages,
  layoutMode,
  fontSize,
  onPlayHymn,
  onNavigateHyperlink,
}: Props) {
  const t = useTranslations('Liturgies');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const roleMeta: Record<
    ParticipantRole,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    all: {
      label: t('roles.all'),
      bg: 'bg-neutral-800/80',
      text: 'text-neutral-300',
      border: 'border-neutral-700',
      icon: FaChurch,
    },
    priest: {
      label: t('roles.priestSays'),
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      icon: FaChurch,
    },
    deacon: {
      label: t('roles.deaconSays'),
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      icon: FaUserTie,
    },
    people: {
      label: t('roles.peopleSay'),
      bg: 'bg-blue-950/40',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: FaUsers,
    },
    reader: {
      label: t('roles.peopleSay'),
      bg: 'bg-purple-950/40',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      icon: FaBookOpen,
    },
  };

  const roleInfo = roleMeta[section.speaker] || roleMeta.all;
  const RoleIcon = roleInfo.icon;

  const fontSizes = {
    sm: { arabic: 'text-sm', coptic: 'text-sm', meta: 'text-xs' },
    base: { arabic: 'text-base md:text-lg', coptic: 'text-base md:text-lg', meta: 'text-xs md:text-sm' },
    lg: { arabic: 'text-lg md:text-xl', coptic: 'text-lg md:text-xl', meta: 'text-sm md:text-base' },
    xl: { arabic: 'text-xl md:text-2xl', coptic: 'text-xl md:text-2xl', meta: 'text-base md:text-lg' },
  };

  const fonts = fontSizes[fontSize] || fontSizes.base;

  const activeLangs = [
    enabledLanguages.arabic && 'arabic',
    enabledLanguages.coptic_arabic && 'coptic_arabic',
    enabledLanguages.coptic && 'coptic',
    enabledLanguages.english && 'english',
  ].filter(Boolean) as string[];

  const activeLangCount = activeLangs.length || 1;

  const copySectionText = () => {
    const textToCopy = section.verses
      .map((v) => {
        const parts = [];
        if (enabledLanguages.arabic && v.arabic) parts.push(v.arabic);
        if (enabledLanguages.coptic_arabic && v.coptic_arabic) parts.push(v.coptic_arabic);
        if (enabledLanguages.coptic && v.coptic) parts.push(v.coptic);
        if (enabledLanguages.english && v.english) parts.push(v.english);
        return parts.join('\n');
      })
      .join('\n---\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success(t('copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-neutral-900/60 ${roleInfo.border} p-0.5 shadow-lg backdrop-blur-xs`}
    >
      {/* Header with Speaker Badge & Title */}
      <div
        className="flex flex-wrap items-center justify-between gap-0.5 pb-0.5 mb-0.5 border-b border-white/5 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            className="p-0.5 text-neutral-400 hover:text-amber-400 transition"
            aria-label="تبديل العرض"
          >
            {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>

          <span
            className={`inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-full text-xs md:text-sm font-bold border ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
          >
            <RoleIcon className="text-xs" />
            <span>{roleInfo.label}</span>
          </span>

          <h4 className="font-bold text-white text-base md:text-lg">
            {section.title.arabic}
            {section.title.coptic && enabledLanguages.coptic && (
              <span className="text-neutral-400 font-normal mr-0.5 text-sm font-coptic">
                ({section.title.coptic})
              </span>
            )}
          </h4>

          {section.verses.length > 1 && (
            <span className="text-xs text-neutral-400 bg-neutral-800/80 px-0.5 py-0.5 rounded-full">
              {section.verses.length} أرباع
            </span>
          )}
        </div>

        {/* Quick Toolbar */}
        <div
          className="flex items-center gap-0.5 opacity-80 hover:opacity-100 transition"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={copySectionText}
            className="p-0.5 text-neutral-400 hover:text-amber-400 hover:bg-white/5 rounded-lg transition text-xs"
            title="نسخ النص"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-0.5"
          >
            {/* Rubric / Instructions */}
            {section.rubric?.arabic && (
              <div className="px-0.5 py-0.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs md:text-sm leading-relaxed">
                <span className="font-bold ml-0.5">📌 توجيه طقسي:</span>
                {section.rubric.arabic}
              </div>
            )}

            {/* Interactive Hyperlinks / Options */}
            {section.hyperlinks && section.hyperlinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-0 p-0.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-xs font-bold text-amber-400">🔗 خيارات وانتقالات طقسية:</span>
                {section.hyperlinks.map((hl, hIdx) => (
                  <button
                    key={hIdx}
                    onClick={() => onNavigateHyperlink?.(hl.target)}
                    className="inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/40 transition cursor-pointer shadow-xs"
                    title={hl.target}
                  >
                    <span>{hl.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 3-Column / Grid Verses Table (Orsozoxi Canonical Layout) */}
            <div className="rounded-xl overflow-hidden border border-white/5 bg-black/30">
              {/* Columns Header */}
              <div
                className={`grid border-b border-white/10 bg-neutral-900/80 text-[11px] font-bold text-neutral-400 p-0.5 ${
                  activeLangCount === 4
                    ? 'grid-cols-4'
                    : activeLangCount === 3
                    ? 'grid-cols-3'
                    : activeLangCount === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                {enabledLanguages.arabic && <div className="text-right text-amber-400">العربية</div>}
                {enabledLanguages.coptic_arabic && <div className="text-right text-amber-200">قبطي معرب (نطق عربي)</div>}
                {enabledLanguages.coptic && <div className="text-left text-blue-400" dir="ltr">ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ</div>}
                {enabledLanguages.english && <div className="text-left text-neutral-300" dir="ltr">English</div>}
              </div>

              {/* Verses Rows */}
              <div className="divide-y divide-white/5">
                {section.verses.map((verse, vIdx) => (
                  <div
                    key={vIdx}
                    className={`grid items-center p-0.5 hover:bg-white/5 transition duration-150 ${
                      activeLangCount === 4
                        ? 'grid-cols-4'
                        : activeLangCount === 3
                        ? 'grid-cols-3'
                        : activeLangCount === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                    }`}
                  >
                    {/* 1. Arabic View */}
                    {enabledLanguages.arabic && (
                      <div className="p-0.5">
                        <p className={`${fonts.arabic} font-serif leading-relaxed text-neutral-100 text-right`}>
                          {verse.arabic || '—'}
                        </p>
                      </div>
                    )}

                    {/* 2. Arabized Coptic (قبطي معرب) */}
                    {enabledLanguages.coptic_arabic && (
                      <div className="p-0.5">
                        <p className={`${fonts.arabic} font-sans leading-relaxed text-amber-200 text-right`}>
                          {verse.coptic_arabic || '—'}
                        </p>
                      </div>
                    )}

                    {/* 3. Coptic View (قبطي أصيل) */}
                    {enabledLanguages.coptic && (
                      <div className="p-0.5" dir="ltr">
                        <p className={`${fonts.coptic} font-coptic leading-relaxed text-blue-200 text-left`}>
                          {verse.coptic || '—'}
                        </p>
                      </div>
                    )}

                    {/* 4. English View */}
                    {enabledLanguages.english && (
                      <div className="p-0.5" dir="ltr">
                        <p className={`${fonts.meta} font-sans leading-relaxed text-neutral-300 text-left`}>
                          {verse.english || '—'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hymn Hazat Audio Button */}
            {section.verses.some((v) => v.hymnRef) && (
              <div className="pt-0.5 flex items-center justify-end">
                {section.verses.find((v) => v.hymnRef)?.hymnRef && (
                  <button
                    onClick={() => onPlayHymn?.(section.verses.find((v) => v.hymnRef)!.hymnRef!)}
                    className="inline-flex items-center gap-0.5 px-0.5 py-0.5 rounded-xl bg-linear-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 text-amber-300 border border-amber-500/40 text-xs md:text-sm font-bold shadow-md hover:scale-102 transition"
                  >
                    <FaMusic className="text-amber-400" />
                    <span>مذكرة الهزات والصوت: {section.verses.find((v) => v.hymnRef)!.hymnRef!.name}</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
