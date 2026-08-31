'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChurch,
  FaArrowRight,
  FaSearch,
  FaListUl,
  FaBookOpen,
  FaCalendarAlt,
  FaScroll,
  FaChevronRight,
  FaChevronLeft,
  FaExpand,
  FaCompress,
  FaTimes
} from 'react-icons/fa';
import {
  LiturgyDocument,
  LiturgyGroup,
  LiturgyLanguage,
  LiturgyLayoutMode,
  ParticipantRole,
} from '@/lib/liturgies/types';
import {
  ALL_LITURGIES,
  filterLiturgySections,
  getLiturgyById,
  CANONICAL_BASIL_LITURGY
} from '@/lib/liturgies';
import LiturgyNavbar from './LiturgyNavbar';
import LiturgyVerseCard from './LiturgyVerseCard';
import LiturgyPresentationMode from './LiturgyPresentationMode';
import { getCopticDate } from '@/lib/coptic-date';
import { useTranslations } from 'next-intl';

interface Props {
  initialLiturgy?: LiturgyDocument;
}

export default function LiturgiesClient({ initialLiturgy }: Props) {
  const t = useTranslations('Liturgies');
  const [activeLiturgy, setActiveLiturgy] = useState<LiturgyDocument>(
    initialLiturgy || CANONICAL_BASIL_LITURGY
  );
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(undefined);
  const [activeRole, setActiveRole] = useState<ParticipantRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<LiturgyLayoutMode>('columns');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [enabledLanguages, setEnabledLanguages] = useState<Record<LiturgyLanguage, boolean>>({
    arabic: true,
    coptic_arabic: true,
    coptic: true,
    english: false,
  });

  // Current liturgical date context
  const copticToday = useMemo(() => getCopticDate(new Date()), []);

  useEffect(() => {
    const savedLangs = localStorage.getItem('liturgy_langs');
    if (savedLangs) {
      try {
        setEnabledLanguages(JSON.parse(savedLangs));
      } catch (e) {}
    }
    const savedFont = localStorage.getItem('liturgy_font') as any;
    if (savedFont) setFontSize(savedFont);
  }, []);

  const toggleLanguage = (lang: LiturgyLanguage) => {
    setEnabledLanguages((prev) => {
      const updated = { ...prev, [lang]: !prev[lang] };
      localStorage.setItem('liturgy_langs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSize(size);
    localStorage.setItem('liturgy_font', size);
  };

  const filteredGroups = useMemo(() => {
    return filterLiturgySections(activeLiturgy, {
      role: activeRole,
      searchQuery,
      groupId: activeGroupId,
    });
  }, [activeLiturgy, activeRole, searchQuery, activeGroupId]);

  const scrollToGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    const element = document.getElementById(`group-${groupId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200" dir="rtl">
      {/* Top Navbar */}
      <LiturgyNavbar
        activeLiturgy={activeLiturgy}
        onSelectLiturgy={(l) => {
          setActiveLiturgy(l);
          setActiveGroupId(undefined);
        }}
        activeRole={activeRole}
        onSelectRole={setActiveRole}
        enabledLanguages={enabledLanguages}
        onToggleLanguage={toggleLanguage}
        layoutMode={layoutMode}
        onToggleLayout={setLayoutMode}
        fontSize={fontSize}
        onChangeFontSize={handleFontSizeChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPresentation={() => setIsPresentationOpen(true)}
      />

      {/* Main Container with Sidebar Navigation (Orsozoxi / Church Presentation style) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quick Canonical Sidebar Navigation */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-18 md:w-20 shrink-0 border-l border-neutral-800 bg-neutral-900/90 flex flex-col h-[calc(100vh-60px)] sticky top-[60px] z-20 overflow-hidden shadow-2xl backdrop-blur-md"
            >
              {/* Sidebar Header */}
              <div className="p-0.5 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-0.5">
                    <FaListUl size={12} />
                    <span>{t('sidebar')}</span>
                  </span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-neutral-400 hover:text-white p-0.5 text-xs"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Liturgy Day Context Badge */}
              <div className="p-0.5 bg-amber-500/10 border-b border-amber-500/20 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-0.5">
                  <FaCalendarAlt size={12} />
                  <span>{t('todayRitual', { date: copticToday.formattedAr })}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {t('todayRitualHint')}
                </div>
              </div>

              {/* Group Nav Items */}
              <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5 divide-y divide-white/5">
                <button
                  onClick={() => setActiveGroupId(undefined)}
                  className={`w-full text-right p-0.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    !activeGroupId
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <span>{t('allLiturgiesFull')}</span>
                </button>

                {activeLiturgy.groups.map((group, idx) => {
                  const isSelected = activeGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      onClick={() => scrollToGroup(group.id)}
                      className={`w-full text-right p-0.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-0.5 truncate">
                        <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="truncate">{group.title.arabic}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 px-0.5 py-0.5 rounded-md bg-black/40 shrink-0">
                        {group.sections.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Viewer */}
        <main className="flex-1 overflow-y-auto p-0.5 md:p-1 space-y-0.5 max-w-6xl mx-auto w-full">
          {/* Top Bar for Toggling Sidebar & Quick Liturgy Title */}
          <div className="flex items-center justify-between pb-0.5 border-b border-neutral-800">
            <div className="flex items-center gap-0.5">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="px-0.5 py-0.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs font-bold flex items-center gap-2 transition"
                >
                  <FaListUl size={12} />
                  <span>{t('openSidebar')}</span>
                </button>
              )}
              <h2 className="text-xl md:text-2xl font-black text-white">
                {activeLiturgy.title.arabic}
              </h2>
            </div>

            <Link
              href="/readings"
              className="px-0.5 py-0.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-0.5 transition"
            >
              <FaScroll size={12} />
              <span>{t('readingsLink')}</span>
            </Link>
          </div>

          {/* Render Groups and 3-Column Sections */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-1 bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-0.5">
              <FaSearch className="w-2 h-2 text-neutral-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">{t('noResults')}</h3>
              <p className="text-xs text-neutral-400">
                {t('noResultsHint')}
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section
                key={group.id}
                id={`group-${group.id}`}
                className="space-y-0.5 scroll-mt-1"
              >
                {/* Group Title */}
                <div className="flex items-center justify-between border-r-4 border-amber-500 pr-0.5 py-0.5 bg-linear-to-l from-amber-500/5 to-transparent rounded-l-xl">
                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white">
                      {group.title.arabic}
                    </h3>
                    {group.badge && (
                      <span className="text-xs text-amber-400 font-semibold">{group.badge}</span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500 font-bold bg-neutral-900 px-0.5 py-0.5 rounded-lg border border-neutral-800">
                    {group.sections.length} صلاة / لحن
                  </span>
                </div>

                {/* Group Sections Cards (3-Column Layout) */}
                <div className="space-y-0.5">
                  {group.sections.map((section) => (
                    <LiturgyVerseCard
                      key={section.id}
                      section={section}
                      enabledLanguages={enabledLanguages}
                      layoutMode={layoutMode}
                      fontSize={fontSize}
                      onNavigateHyperlink={(target) => {
                        // Navigate to targeted group or section
                        const match = activeLiturgy.groups.find((g) => g.id.includes(target) || g.title.arabic.includes(target));
                        if (match) scrollToGroup(match.id);
                      }}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      {/* Presentation Fullscreen Modal */}
      {isPresentationOpen && (
        <LiturgyPresentationMode
          liturgy={activeLiturgy}
          enabledLanguages={enabledLanguages}
          fontSize={fontSize}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
}
