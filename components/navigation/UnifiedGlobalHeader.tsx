'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import {
  FaArrowRight,
  FaHome,
  FaSearch,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaChurch,
  FaMusic,
  FaBook,
  FaFileAlt,
  FaCog,
  FaPenFancy,
  FaUserCircle,
} from 'react-icons/fa';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GlobalBreadcrumbs from './GlobalBreadcrumbs';
import GlobalSearchModal from './GlobalSearchModal';

const MENU_ITEMS = [
  { href: '/liturgies', label: 'الليتورجيا والصلوات (القداس، التسبحة، الألحان، الإنجيل، الأجبية)', icon: FaChurch, color: 'text-amber-400' },
  { href: '/preparation', label: 'نوتة التحضير وعروض الشرائح (Slides)', icon: FaFileAlt, color: 'text-teal-400' },
  { href: '/chat', label: 'المساعد الذكي وتوليد الأيقونات', icon: FaChurch, color: 'text-amber-400' },
  { href: '/synaxarium', label: 'السنكسار والسنوات القبطية', icon: FaChurch, color: 'text-rose-400' },
  { href: '/exam/quiz/dashboard', label: 'الامتحانات والمسابقات', icon: FaPenFancy, color: 'text-purple-400' },
  { href: '/settings', label: 'الإعدادات واللغة', icon: FaCog, color: 'text-neutral-400' },
];

export default function UnifiedGlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const tNav = useTranslations('Navigation');
  const tHome = useTranslations('Home');
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const MENU_ITEMS = [
    { href: '/liturgies', label: tNav('liturgiesMenu'), icon: FaChurch, color: 'text-amber-400' },
    { href: '/preparation', label: tNav('prepMenu'), icon: FaFileAlt, color: 'text-teal-400' },
    { href: '/chat', label: tNav('aiMenu'), icon: FaChurch, color: 'text-amber-400' },
    { href: '/synaxarium', label: tNav('synaxariumMenu'), icon: FaChurch, color: 'text-rose-400' },
    { href: '/exam/quiz/dashboard', label: tNav('examMenu'), icon: FaPenFancy, color: 'text-purple-400' },
    { href: '/settings', label: tNav('settingsMenu'), icon: FaCog, color: 'text-neutral-400' },
  ];

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isHome = pathname === '/' || pathname === '';

  // Intelligent Back navigation
  const handleBack = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) {
      router.push('/');
    } else {
      const parent = `/${parts.slice(0, -1).join('/')}`;
      router.push(parent);
    }
  };

  const cycleTheme = () => {
    if (!mounted) return;
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('gold');
    else setTheme('light');
  };

  // If on homepage, render a sleek floating top toolbar
  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isHome
            ? 'bg-transparent'
            : 'bg-neutral-950/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800 shadow-md'
        }`}
        dir="rtl"
      >
        <div className="max-w-7xl mx-auto px-0.5 sm:px-1 py-0.5 flex items-center justify-between gap-0.5">
          {/* 1. Left Side: Back Button & Logo Brand */}
          <div className="flex items-center gap-0.5 shrink-0">
            {!isHome && (
              <button
                onClick={handleBack}
                className="p-0.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition flex items-center gap-0.5 text-xs font-bold"
                title={tNav('back')}
              >
                <FaArrowRight className="text-xs" />
                <span className="hidden md:inline">{tNav('back')}</span>
              </button>
            )}

            <Link href="/" className="flex items-center gap-0.5 group">
              <Image
                src="/images/eagle.webp"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-full border border-amber-500/30 group-hover:scale-105 transition"
                priority
              />
              <span className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition whitespace-nowrap">
                أبونا فلتاؤس
              </span>
            </Link>
          </div>

          {/* 2. Middle: Dynamic Breadcrumbs (Hidden on mobile) */}
          <div className="hidden lg:flex flex-1 items-center justify-start px-0.5 overflow-hidden">
            <GlobalBreadcrumbs />
          </div>

          {/* 3. Right Side: Quick Action Toolbar */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-0.5 sm:px-0.5 sm:py-0.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 flex items-center gap-0.5 text-xs transition"
              title={tNav('search')}
            >
              <FaSearch className="text-xs text-amber-400" />
              <span className="hidden sm:inline font-medium text-neutral-400">{tNav('searchPlaceholder')}</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-0.5 py-0.25 bg-neutral-800 border border-neutral-700 rounded text-neutral-500">
                ⌘K
              </kbd>
            </button>

            {/* Quick Link to Settings */}
            <Link
              href="/settings"
              className="p-0.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition text-xs flex items-center gap-0.5"
              title={tNav('settings')}
            >
              <FaCog className="text-sm" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-0.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition text-xs lg:hidden"
              title={tNav('menu')}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 animate-in slide-in-from-top duration-200">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-0.5 rounded-xl border text-xs font-bold flex items-center gap-0.5 transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-900/70 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  <Icon className={`text-sm ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search Palette Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
