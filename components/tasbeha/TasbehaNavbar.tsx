'use client';

import { useState } from 'react';
import {
  FaMoon,
  FaSun,
  FaMusic,
  FaChurch,
  FaUserTie,
  FaUsers,
  FaColumns,
  FaThList,
  FaSearch,
  FaTv,
  FaTimes,
} from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import {
  TasbehaDocument,
  TasbehaLanguage,
  TasbehaLayoutMode,
  ParticipantRole,
} from '@/lib/tasbeha/types';
import { ALL_TASBEHA } from '@/lib/tasbeha';

interface Props {
  activeTasbeha: TasbehaDocument;
  onSelectTasbeha: (t: TasbehaDocument) => void;
  activeRole: ParticipantRole;
  onSelectRole: (r: ParticipantRole) => void;
  activeTone: 'adam' | 'watos' | 'both';
  onSelectTone: (tone: 'adam' | 'watos' | 'both') => void;
  enabledLanguages: Record<TasbehaLanguage, boolean>;
  onToggleLanguage: (lang: TasbehaLanguage) => void;
  layoutMode: TasbehaLayoutMode;
  onToggleLayout: (m: TasbehaLayoutMode) => void;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  onChangeFontSize: (s: 'sm' | 'base' | 'lg' | 'xl') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPresentation: () => void;
}

const ROLES: { id: ParticipantRole; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'الكل', icon: FaChurch, color: 'text-neutral-300' },
  { id: 'people', label: 'الخورس والشعب', icon: FaUsers, color: 'text-blue-400' },
  { id: 'cantor', label: 'المرتل والمعلم', icon: FaMusic, color: 'text-indigo-400' },
  { id: 'priest', label: 'الكاهن', icon: FaChurch, color: 'text-amber-400' },
];

export default function TasbehaNavbar({
  activeTasbeha,
  onSelectTasbeha,
  activeRole,
  onSelectRole,
  activeTone,
  onSelectTone,
  enabledLanguages,
  onToggleLanguage,
  layoutMode,
  onToggleLayout,
  fontSize,
  onChangeFontSize,
  searchQuery,
  onSearchChange,
  onOpenPresentation,
}: Props) {
  const t = useTranslations('Tasbeha');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 shadow-xl" dir="rtl">
      {/* 1. Top Bar: Tasbeha Types Tabs Selector */}
      <div className="px-1 py-0.5 flex items-center justify-between gap-0.5 overflow-x-auto no-scrollbar border-b border-white/5">
      </div>

      {/* 2. Controls & Filter Bar */}
        {/* Language Toggles */}
        <div className="flex items-center gap-0.25 bg-neutral-900 p-0.25 rounded-xl border border-neutral-800 shrink-0 text-xs">
          <button
            onClick={() => onToggleLanguage('arabic')}
            className={`px-0.5 py-0.5 rounded-lg font-bold transition ${
              enabledLanguages.arabic
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t('languages.arabic')}
          </button>
          <button
            onClick={() => onToggleLanguage('coptic_arabic')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition ${
              enabledLanguages.coptic_arabic
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t('languages.copticArabic')}
          </button>
          <button
            onClick={() => onToggleLanguage('coptic')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition font-coptic ${
              enabledLanguages.coptic
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t('languages.coptic')}
          </button>
          <button
            onClick={() => onToggleLanguage('english')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition ${
              enabledLanguages.english
                ? 'bg-neutral-700 text-white border border-neutral-600'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {t('languages.english')}
          </button>
        </div>

        {/* Layout & Font Size Controllers */}
        <div className="flex items-center gap-0.5">
        <button
          onClick={onOpenPresentation}
          className="shrink-0 px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold bg-neutral-900 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-2 transition"
          title={t('presentationTitle')}
        >
          <FaTv className="text-blue-400" />
          <span className="hidden sm:inline">{t('presentationMode')}</span>
        </button>
          {/* Columns / Stacked View */}
          <div className="hidden sm:flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => onToggleLayout('columns')}
              className={`p-0.5 rounded-lg text-xs transition ${
                layoutMode === 'columns' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-500'
              }`}
              title={t('layoutColumns')}
            >
              <FaColumns />
            </button>
            <button
              onClick={() => onToggleLayout('stacked')}
              className={`p-0.5 rounded-lg text-xs transition ${
                layoutMode === 'stacked' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-500'
              }`}
              title={t('layoutStacked')}
            >
              <FaThList />
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 text-xs">
            {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onChangeFontSize(s)}
                className={`px-0.5 py-0.5 rounded-md font-bold transition ${
                  fontSize === s
                    ? 'bg-blue-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s === 'sm' ? 'A-' : s === 'base' ? 'A' : s === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* Search Button / Input */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-0.5 bg-neutral-900 border border-neutral-700 rounded-xl px-0.5 py-0.5">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="bg-transparent text-white text-xs outline-hidden w-32 md:w-48 placeholder-neutral-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    onSearchChange('');
                  }}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition text-xs"
                title={t('searchTooltip')}
              >
                <FaSearch />
              </button>
            )}
          </div>
        </div>
      </div>
    // </div>
  );
}
