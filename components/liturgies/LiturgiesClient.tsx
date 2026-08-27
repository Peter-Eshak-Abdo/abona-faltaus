'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChurch,
  FaSearch,
  FaBookmark,
  FaListUl,
  FaSlidersH,
  FaCross,
  FaMusic,
  FaAngleDown,
} from 'react-icons/fa';
import {
  LiturgyDocument,
  LiturgyHymnRef,
  LiturgyLanguage,
  LiturgyLayoutMode,
  ParticipantRole,
} from '@/lib/liturgies/types';
import { ALL_LITURGIES, filterLiturgySections } from '@/lib/liturgies';
import LiturgyNavbar from './LiturgyNavbar';
import LiturgyVerseCard from './LiturgyVerseCard';
import LiturgyHymnModal from './LiturgyHymnModal';
import LiturgyPresentationMode from './LiturgyPresentationMode';

import TasbehaClient from '@/components/tasbeha/TasbehaClient';
import UnifiedAl7anClient from '@/app/[locale]/al7an/page';
import BibleReaderPage from '@/app/[locale]/bible/page';
import AgpeyaPage from '@/app/[locale]/agpeya/page';
import SynaxariumPage from '@/app/[locale]/synaxarium/page';

export default function LiturgiesClient() {
  const [liturgicalTab, setLiturgicalTab] = useState<'liturgy' | 'tasbeha' | 'alhan' | 'bible' | 'agpeya' | 'synaxarium'>('liturgy');
  const [activeLiturgy, setActiveLiturgy] = useState<LiturgyDocument>(ALL_LITURGIES[0]);
  const [activeRole, setActiveRole] = useState<ParticipantRole>('all');
  const [enabledLanguages, setEnabledLanguages] = useState<Record<LiturgyLanguage, boolean>>({
    arabic: true,
    coptic_arabic: true,
    coptic: true,
    english: false,
  });
  const [layoutMode, setLayoutMode] = useState<LiturgyLayoutMode>('stacked');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(undefined);

  const [activeHymnModal, setActiveHymnModal] = useState<LiturgyHymnRef | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [showIndexDrawer, setShowIndexDrawer] = useState(false);

  // Persistence in localStorage
  useEffect(() => {
    const savedLangs = localStorage.getItem('liturgy_langs');
    if (savedLangs) {
      try {
        setEnabledLanguages(JSON.parse(savedLangs));
      } catch {}
    }
    const savedFont = localStorage.getItem('liturgy_font');
    if (savedFont && ['sm', 'base', 'lg', 'xl'].includes(savedFont)) {
      setFontSize(savedFont as any);
    }
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

  // Filter groups and sections
  const filteredGroups = useMemo(() => {
    return filterLiturgySections(activeLiturgy, {
      role: activeRole,
      searchQuery,
      groupId: activeGroupId,
    });
  }, [activeLiturgy, activeRole, searchQuery, activeGroupId]);

  const scrollToGroup = (groupId: string) => {
    setActiveGroupId(undefined);
    setShowIndexDrawer(false);
    const element = document.getElementById(`group-${groupId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200" dir="rtl">
      {/* Master Hub Switcher Tabs */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-0.5 py-0.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-0.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setLiturgicalTab('liturgy')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'liturgy'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaChurch />
              <span>القداس</span>
            </button>

            <button
              onClick={() => setLiturgicalTab('tasbeha')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'tasbeha'
                  ? 'bg-blue-500 text-neutral-950 shadow-md shadow-blue-500/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaMusic />
              <span>التسبحة والإبصالمودية</span>
            </button>

            <button
              onClick={() => setLiturgicalTab('alhan')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'alhan'
                  ? 'bg-indigo-500 text-neutral-950 shadow-md shadow-indigo-500/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaMusic />
              <span>الألحان الكنسية</span>
            </button>

            <button
              onClick={() => setLiturgicalTab('bible')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'bible'
                  ? 'bg-amber-400 text-neutral-950 shadow-md shadow-amber-400/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaSlidersH />
              <span>الكتاب المقدس</span>
            </button>

            <button
              onClick={() => setLiturgicalTab('agpeya')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'agpeya'
                  ? 'bg-yellow-500 text-neutral-950 shadow-md shadow-yellow-500/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaCross />
              <span>الأجبية المقدسة</span>
            </button>

            <button
              onClick={() => setLiturgicalTab('synaxarium')}
              className={`px-0.5 py-0.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-0.5 whitespace-nowrap ${
                liturgicalTab === 'synaxarium'
                  ? 'bg-rose-500 text-neutral-950 shadow-md shadow-rose-500/20'
                  : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <FaChurch />
              <span>السنكسار</span>
            </button>
          </div>
        </div>
      </div>

      {liturgicalTab === 'tasbeha' ? (
        <div className="flex-1">
          <TasbehaClient />
        </div>
      ) : liturgicalTab === 'alhan' ? (
        <div className="flex-1">
          <UnifiedAl7anClient />
        </div>
      ) : liturgicalTab === 'bible' ? (
        <div className="flex-1">
          <BibleReaderPage />
        </div>
      ) : liturgicalTab === 'agpeya' ? (
        <div className="flex-1">
          <AgpeyaPage />
        </div>
      ) : liturgicalTab === 'synaxarium' ? (
        <div className="flex-1">
          <SynaxariumPage />
        </div>
      ) : (
        <>
          {/* Top Navbar - Hidden on Mobile */}
          <div className="hidden md:block">
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
          </div>

          {/* Hero Banner for Selected Liturgy */}
          <div className="relative overflow-hidden border-b border-neutral-800 bg-neutral-900/60 py-0.5 px-0.5 md:px-0.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-0.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5">
              <span className="p-0.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-lg">
                <FaChurch />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {activeLiturgy.title.arabic}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {activeLiturgy.description}
            </p>
          </div>

        {/* Quick Liturgy Switcher Buttons */}
        <div className="max-w-8xl mx-auto mt-0.5 pt-0.5 border-t border-neutral-800/80 flex items-center gap-0.5 overflow-x-auto pb-1 no-scrollbar">
          {ALL_LITURGIES.map((lit) => (
            <button
              key={lit.id}
              onClick={() => {
                setActiveLiturgy(lit);
                setActiveGroupId(undefined);
              }}
              className={`px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap border transition flex items-center gap-0.5 ${
                activeLiturgy.id === lit.id
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{lit.title.arabic}</span>
            </button>
          ))}
        </div>
      </div>

        {/* Index Drawer Dropdown */}
        <AnimatePresence>
          {showIndexDrawer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-8xl mx-auto mt-0.5 pt-0.5 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0.5"
            >
              <button
                onClick={() => {
                  setActiveGroupId(undefined);
                  setShowIndexDrawer(false);
                }}
                className={`text-right p-0.5 rounded-xl text-xs md:text-sm font-bold border transition ${
                  !activeGroupId
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                عرض كل القداس كاملاً
              </button>
              {activeLiturgy.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => scrollToGroup(g.id)}
                  className={`text-right p-0.5 rounded-xl text-xs md:text-sm font-bold border transition flex items-center justify-between ${
                    activeGroupId === g.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <span>{g.title.arabic}</span>
                  <span className="text-[10px] text-neutral-500 px-0.5 py-0.25 rounded-full bg-neutral-800">
                    {g.sections.length} مردات
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content: Liturgy Groups & Sections */}
      <main className="flex-1 max-w-8xl mx-auto w-full p-0.5 md:p-0.5 space-y-0.5">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-0.5 bg-neutral-900/30 rounded-3xl border border-neutral-800 space-y-0.5">
            <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500 text-2xl">
              <FaSearch />
            </div>
            <h3 className="text-xl font-bold text-white">لم يتم العثور على نتائج</h3>
            <p className="text-sm text-neutral-400">
              جرب تغيير كلمات البحث أو تغيير محدد الأدوار (الكاهن / الشماس / الشعب).
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveRole('all');
                setActiveGroupId(undefined);
              }}
              className="px-0.5 py-0.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section
              key={group.id}
              id={`group-${group.id}`}
              className="space-y-0.5 scroll-mt-6"
            >
              {/* Group Section Header */}
              <div className="flex items-center justify-between gap-0.5 border-r-4 border-amber-500 pr-0.5 py-0.25">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-white">
                    {group.title.arabic}
                  </h2>
                  {group.title.coptic && (
                    <span className="text-xs text-blue-400 font-coptic">
                      {group.title.coptic}
                    </span>
                  )}
                </div>

                {group.badge && (
                  <span className="px-0.5 py-0.25 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300 text-xs font-semibold">
                    {group.badge}
                  </span>
                )}
              </div>

              {/* Sections list inside this group */}
              <div className="space-y-0.5">
                {group.sections.map((section) => (
                  <LiturgyVerseCard
                    key={section.id}
                    section={section}
                    enabledLanguages={enabledLanguages}
                    layoutMode={layoutMode}
                    fontSize={fontSize}
                    onPlayHymn={(hymn) => setActiveHymnModal(hymn)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Hymn Slide-over / Modal */}
      <LiturgyHymnModal
        hymn={activeHymnModal}
        onClose={() => setActiveHymnModal(null)}
      />

      {/* Presentation Fullscreen Mode */}
      {isPresentationOpen && (
        <LiturgyPresentationMode
          liturgy={activeLiturgy}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
        </>
      )}
    </div>
  );
}
