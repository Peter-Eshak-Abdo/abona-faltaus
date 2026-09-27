'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMusic,
  FaSearch,
  FaListUl,
  FaSun,
  FaMoon,
} from 'react-icons/fa';
import {
  TasbehaDocument,
  TasbehaHymnRef,
  TasbehaLanguage,
  TasbehaLayoutMode,
  ParticipantRole,
} from '@/lib/tasbeha/types';
import { ALL_TASBEHA, filterTasbehaSections } from '@/lib/tasbeha';
import TasbehaNavbar from './TasbehaNavbar';
import TasbehaVerseCard from './TasbehaVerseCard';
import TasbehaHymnModal from './TasbehaHymnModal';
import TasbehaPresentationMode from './TasbehaPresentationMode';

export default function TasbehaClient() {
  const [activeTasbeha, setActiveTasbeha] = useState<TasbehaDocument>(ALL_TASBEHA[0]);
  const [activeRole, setActiveRole] = useState<ParticipantRole>('all');
  const [activeTone, setActiveTone] = useState<'adam' | 'watos' | 'both'>('both');
  const [enabledLanguages, setEnabledLanguages] = useState<Record<TasbehaLanguage, boolean>>({
    arabic: true,
    coptic_arabic: true,
    coptic: true,
    english: false,
  });
  const [layoutMode, setLayoutMode] = useState<TasbehaLayoutMode>('stacked');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(undefined);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const [activeHymnModal, setActiveHymnModal] = useState<TasbehaHymnRef | null>(null);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [showIndexDrawer, setShowIndexDrawer] = useState(false);

  // Ensure initial activeTasbeha is never empty or desynced
  useEffect(() => {
    if (!activeTasbeha && ALL_TASBEHA.length > 0) {
      setActiveTasbeha(ALL_TASBEHA[0]);
    }
  }, [activeTasbeha]);

  // Persistence in localStorage
  useEffect(() => {
    const savedLangs = localStorage.getItem('tasbeha_langs');
    if (savedLangs) {
      try {
        setEnabledLanguages(JSON.parse(savedLangs));
      } catch {}
    }
    const savedFont = localStorage.getItem('tasbeha_font');
    if (savedFont && ['sm', 'base', 'lg', 'xl'].includes(savedFont)) {
      setFontSize(savedFont as any);
    }
  }, []);

  const toggleLanguage = (lang: TasbehaLanguage) => {
    setEnabledLanguages((prev) => {
      const updated = { ...prev, [lang]: !prev[lang] };
      localStorage.setItem('tasbeha_langs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontSize(size);
    localStorage.setItem('tasbeha_font', size);
  };

  // Filter groups and sections
  const filteredGroups = useMemo(() => {
    return filterTasbehaSections(activeTasbeha, {
      role: activeRole,
      searchQuery,
      groupId: activeGroupId,
      tone: activeTone,
    });
  }, [activeTasbeha, activeRole, searchQuery, activeGroupId, activeTone]);

  const scrollToGroup = (groupId: string) => {
    setActiveGroupId(undefined);
    setShowIndexDrawer(false);
    const element = document.getElementById(`group-${groupId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-blue-500/30 selection:text-blue-200" dir="rtl">
      {/* Top Navbar - Hidden on Mobile */}
      <div className="hidden md:block">
        <TasbehaNavbar
          activeTasbeha={activeTasbeha}
          onSelectTasbeha={(t) => {
            setActiveTasbeha(t);
            setActiveGroupId(undefined);
          }}
          activeRole={activeRole}
          onSelectRole={setActiveRole}
          activeTone={activeTone}
          onSelectTone={setActiveTone}
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

      {/* Hero Banner for Selected Tasbeha */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-neutral-900/60 py-4 px-4 md:px-6">
        <div className="max-w-8xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-lg">
                <FaMusic />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {activeTasbeha.title.arabic}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {activeTasbeha.description}
            </p>
          </div>

        {/* Quick Tasbeha Switcher Buttons */}
        <div className="max-w-8xl mx-auto mt-2 pt-2 border-t border-neutral-800/80 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {ALL_TASBEHA.map((tas) => (
            <button
              key={tas.id}
              onClick={() => {
                setActiveTasbeha(tas);
                setActiveGroupId(undefined);
              }}
              className={`px-0.5 py-0.5 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap border transition flex items-center gap-0.5 ${
                activeTasbeha.id === tas.id
                  ? 'bg-blue-500 text-neutral-950 border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <span>{tas.title.arabic}</span>
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
              className="max-w-8xl mx-auto mt-4 pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
            >
              <button
                onClick={() => {
                  setActiveGroupId(undefined);
                  setShowIndexDrawer(false);
                }}
                className={`text-right p-0.5 rounded-xl text-xs md:text-sm font-bold border transition ${
                  !activeGroupId
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                }`}
              >
                عرض كل التسبحة كاملة
              </button>
              {activeTasbeha.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => scrollToGroup(g.id)}
                  className={`text-right p-0.5 rounded-xl text-xs md:text-sm font-bold border transition flex items-center justify-between ${
                    activeGroupId === g.id
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <span>{g.title.arabic}</span>
                  <span className="text-[10px] text-neutral-500 px-2 py-1 rounded-full bg-neutral-800">
                    {g.sections.length} ترتيل
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content: Groups & Sections */}
      <main className="flex-1 max-w-8xl mx-auto w-full p-4 md:p-6 space-y-2">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/30 rounded-3xl border border-neutral-800 space-y-2">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500 text-2xl">
              <FaSearch />
            </div>
            <h3 className="text-xl font-bold text-white">لم يتم العثور على نتائج</h3>
            <p className="text-sm text-neutral-400">
              جرب تغيير كلمات البحث أو تغيير محدد النغمة (آدام / واطس).
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveRole('all');
                setActiveTone('both');
                setActiveGroupId(undefined);
              }}
              className="px-8 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <section
              key={group.id}
              id={`group-${group.id}`}
              className="space-y-2 scroll-mt-6"
            >
              {/* Group Section Header */}
              <div className="flex items-center justify-between gap-2 border-r-4 border-blue-500 pr-4 py-1">
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
                  <span className="px-2 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-300 text-xs font-semibold">
                    {group.badge}
                  </span>
                )}
              </div>

              {/* Hyperlinked Section Buttons (مثل شرائح الباوربوينت والروابط التشعبية) */}
              {group.sections.length > 1 && (
                <div className="flex flex-wrap gap-2 p-2 bg-neutral-900/80 rounded-2xl border border-neutral-800/80">
                  <button
                    onClick={() => setActiveSectionId(null)}
                    className={`px-0.5 py-0.25 rounded-xl text-xs font-bold transition ${
                      activeSectionId === null
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    عرض المجموعة كاملة
                  </button>
                  {group.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-0.5 py-0.25 rounded-xl text-xs font-bold transition flex items-center gap-0.5 ${
                        activeSectionId === sec.id
                          ? "bg-amber-600 text-white shadow-md ring-1 ring-amber-400"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <span>{sec.title.arabic}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sections list inside this group */}
              <div className="space-y-4">
                {group.sections
                  .filter((section) => !activeSectionId || section.id === activeSectionId)
                  .map((section) => (
                    <div key={section.id} id={`sec-${section.id}`}>
                      <TasbehaVerseCard
                        section={section}
                        enabledLanguages={enabledLanguages}
                        layoutMode={layoutMode}
                        fontSize={fontSize}
                        onPlayHymn={(hymn) => setActiveHymnModal(hymn)}
                      />
                    </div>
                  ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Hymn Slide-over / Modal */}
      <TasbehaHymnModal
        hymn={activeHymnModal}
        onClose={() => setActiveHymnModal(null)}
      />

      {/* Presentation Fullscreen Mode */}
      {isPresentationOpen && (
        <TasbehaPresentationMode
          tasbeha={activeTasbeha}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
}
