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
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 shadow-xl" dir="rtl">
      {/* 1. Top Bar: Tasbeha Types Tabs Selector */}
      <div className="px-1 py-0.5 flex items-center justify-between gap-0.5 overflow-x-auto no-scrollbar border-b border-white/5">
        {/* <div className="flex items-center gap-0.5 shrink-0">
          {ALL_TASBEHA.map((tas) => {
            const isActive = activeTasbeha.id === tas.id;
            return (
              <button
                key={tas.id}
                onClick={() => onSelectTasbeha(tas)}
                className={`px-1 py-0.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-0.5 ${
                  isActive
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 scale-102'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                }`}
              >
                <FaMusic className={isActive ? 'text-white' : 'text-blue-400'} />
                <span>{tas.title.arabic}</span>
              </button>
            );
          })}
        </div> */}

        {/* Presentation Fullscreen Button */}
      </div>

      {/* 2. Controls & Filter Bar */}
      {/* <div className="px-1 py-0.5 flex flex-wrap items-center justify-between gap-0.5"> */}
        {/* Participant Role Switcher */}
        {/* <div className="flex items-center bg-neutral-900 p-0.25 rounded-xl border border-neutral-800 shrink-0">
          {ROLES.map((r) => {
            const isSelected = activeRole === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`px-0.5 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-0.5 ${
                  isSelected
                    ? 'bg-neutral-800 text-white shadow-xs border border-white/10'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className={isSelected ? r.color : 'text-neutral-500'} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div> */}

        {/* Tone Selector: Adam / Watos / Both */}
        {/* <div className="flex items-center bg-neutral-900 p-0.25 rounded-xl border border-neutral-800 shrink-0 text-xs">
          <button
            onClick={() => onSelectTone('both')}
            className={`px-0.5 py-0.5 rounded-lg font-bold transition ${
              activeTone === 'both' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => onSelectTone('adam')}
            className={`px-0.5 py-0.5 rounded-lg font-bold transition flex items-center gap-0.25 ${
              activeTone === 'adam' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-neutral-500 hover:text-amber-400'
            }`}
          >
            <FaSun className="text-[10px]" />
            <span>آدام</span>
          </button>
          <button
            onClick={() => onSelectTone('watos')}
            className={`px-0.5 py-0.5 rounded-lg font-bold transition flex items-center gap-0.25 ${
              activeTone === 'watos' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-neutral-500 hover:text-blue-400'
            }`}
          >
            <FaMoon className="text-[10px]" />
            <span>واطس</span>
          </button>
        </div> */}

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
            عربي
          </button>
          <button
            onClick={() => onToggleLanguage('coptic_arabic')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition ${
              enabledLanguages.coptic_arabic
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            قبطي معرب
          </button>
          <button
            onClick={() => onToggleLanguage('coptic')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition font-coptic ${
              enabledLanguages.coptic
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ
          </button>
          <button
            onClick={() => onToggleLanguage('english')}
            className={`px-0.5 py-0.25 rounded-lg font-bold transition ${
              enabledLanguages.english
                ? 'bg-neutral-700 text-white border border-neutral-600'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            English
          </button>
        </div>

        {/* Layout & Font Size Controllers */}
        <div className="flex items-center gap-0.5">
        <button
          onClick={onOpenPresentation}
          className="shrink-0 px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold bg-neutral-900 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-2 transition"
          title="شاشة الخورس والتسبيح ملء الشاشة"
        >
          <FaTv className="text-blue-400" />
          <span className="hidden sm:inline">شاشة التسبيح</span>
        </button>
          {/* Columns / Stacked View */}
          <div className="hidden sm:flex items-center bg-neutral-900 p-0.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => onToggleLayout('columns')}
              className={`p-0.5 rounded-lg text-xs transition ${
                layoutMode === 'columns' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-500'
              }`}
              title="عرض الأعمدة المتجاورة"
            >
              <FaColumns />
            </button>
            <button
              onClick={() => onToggleLayout('stacked')}
              className={`p-0.5 rounded-lg text-xs transition ${
                layoutMode === 'stacked' ? 'bg-neutral-800 text-blue-400' : 'text-neutral-500'
              }`}
              title="عرض البطاقات المتتالية"
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
                  placeholder="ابحث في التسبحة..."
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
                title="بحث في نصوص التسبحة"
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
