'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from '@/i18n/navigation';
import {
  FaSearch,
  FaTimes,
  FaChurch,
  FaMusic,
  FaBook,
  FaSun,
  FaFileAlt,
  FaPenFancy,
  FaCog,
  FaArrowRight,
} from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: any;
  keywords: string[];
}

const SEARCH_CATALOG: SearchItem[] = [
  {
    id: 'liturgies-basil',
    title: 'القداس الباسيلي',
    subtitle: 'صلوات قداس القديس باسيليوس الكبير ومردات الشماس والكاهن والشعب',
    category: 'القداسات',
    href: '/liturgies',
    icon: FaChurch,
    keywords: ['قداس', 'باسيلي', 'أنافورا', 'خولاجي', 'تقديس', 'مردات'],
  },
  {
    id: 'liturgies-gregory',
    title: 'القداس الغريغوري',
    subtitle: 'قداس القديس غريغوريوس اللاهوتي وتأملات سر التجسد',
    category: 'القداسات',
    href: '/liturgies',
    icon: FaChurch,
    keywords: ['غريغوري', 'قداس', 'أيها الكائن', 'أعياد سيدية'],
  },
  {
    id: 'liturgies-cyril',
    title: 'القداس الكيرلسي',
    subtitle: 'قداس القديس كيرلس عمود الدين والأواشي الكبرى',
    category: 'القداسات',
    href: '/liturgies',
    icon: FaChurch,
    keywords: ['كيرلسي', 'مرقسي', 'أواشي', 'مياه الأنهار', 'زروع'],
  },
  {
    id: 'tasbeha-midnight',
    title: 'تسبحة نصف الليل',
    subtitle: 'الهوسات الأربعة، إبصاليات الأيام، المجمع، والذكصولوجيات',
    category: 'التسبحة',
    href: '/tasbeha',
    icon: FaMusic,
    keywords: ['تسبحة', 'هوس', 'لبش', 'إبصالية', 'ثيؤطوكية', 'تن ثينو', 'آري بسالين'],
  },
  {
    id: 'tasbeha-kiahk',
    title: 'تسبحة كيهك',
    subtitle: 'المدائح الكيهكية السبعة وثيؤطوكيات شهر كيهك المبارك',
    category: 'التسبحة',
    href: '/tasbeha',
    icon: FaMusic,
    keywords: ['كيهك', 'عليقة', 'سبعة وسبعة', 'مدائح'],
  },
  {
    id: 'slides-builder',
    title: 'صانع العروض التقديمية (Slides & PowerPoint)',
    subtitle: 'توليد عروض بوربوينت لمدارس الأحد والخدمة بالذكاء الاصطناعي مع التصدير',
    category: 'الأدوات الذكية',
    href: '/slides',
    icon: FaFileAlt,
    keywords: ['بوربوينت', 'slides', 'powerpoint', 'مدارس الأحد', 'عروض', 'دروس'],
  },
  {
    id: 'al7an-player',
    title: 'الألحان القبطية والهزات',
    subtitle: 'مكتبة الألحان القبطية الصوتية مع النوتات الموسيقية والهزات',
    category: 'الألحان',
    href: '/al7an',
    icon: FaMusic,
    keywords: ['لحن', 'ألحان', 'هزات', 'صوتيات', 'أرشيف', 'طقس سنوي', 'صوم كبير'],
  },
  {
    id: 'agpeya-prayers',
    title: 'الأجبية المقدسة (صلوات السواعي)',
    subtitle: 'صلوات الساعات السبع من باكر إلى صلاة الستار ونوم',
    category: 'الصلوات',
    href: '/agpeya',
    icon: FaSun,
    keywords: ['أجبية', 'مزامير', 'باكر', 'غروب', 'نوم', 'نصف الليل', 'سواعي'],
  },
  {
    id: 'bible-reader',
    title: 'الكتاب المقدس والبحث الذكي',
    subtitle: 'العهدين القديم والجديد والأسفار القانونية الثانية والتفاسير',
    category: 'الكتاب المقدس',
    href: '/bible',
    icon: FaBook,
    keywords: ['إنجيل', 'مزمور', 'عهد جديد', 'عهد قديم', 'تفسير'],
  },
  {
    id: 'synaxarium-today',
    title: 'السنكسار اليومي وقصص الشهداء',
    subtitle: 'سير القديسين والشهداء وأعياد الكنيسة القبطية الأرثوذكسية اليومية',
    category: 'التاريخ الكنسي',
    href: '/synaxarium',
    icon: FaChurch,
    keywords: ['سنكسار', 'قديسين', 'شهداء', 'تاريخ', 'تذكار'],
  },
  {
    id: 'chat-bot',
    title: 'المساعد الآبائي الذكي (AI Orthodox Assistant)',
    subtitle: 'إجابة الأسئلة اللاهوتية والطقسية وفق العقيدة وتفاسير الآباء والـ RAG',
    category: 'المساعد الذكي',
    href: '/chat',
    icon: FaChurch,
    keywords: ['شات', 'ذكاء اصطناعي', 'آباء', 'تفسير', 'عقيدة', 'أسئلة'],
  },
  {
    id: 'icon-generator',
    title: 'مولد الأيقونات القبطية والبيزنطية',
    subtitle: 'رسم وتوليد أيقونات مسيحية بالذكاء الاصطناعي بنمط إيساك فانوس والبيزنطي',
    category: 'الأدوات الذكية',
    href: '/icon-generator',
    icon: FaChurch,
    keywords: ['أيقونات', 'إيساك فانوس', 'بيزنطي', 'توليد صور', 'فن كنسي'],
  },
  {
    id: 'preparation-notes',
    title: 'نوتة التحضير الذكية للخدام والكهنة',
    subtitle: 'تحضير الدروس والوعظات مع مراجع الآيات وأقوال الآباء',
    category: 'الخدمة',
    href: '/preparation',
    icon: FaFileAlt,
    keywords: ['تحضير', 'درس', 'وعظة', 'خادم', 'ملاحظات'],
  },
  {
    id: 'exam-dashboard',
    title: 'الامتحانات والمسابقات الدينية',
    subtitle: 'مسابقات فردية وجماعية وبنك أسئلة الكتاب المقدس والطقس',
    category: 'التعليم',
    href: '/exam/quiz/dashboard',
    icon: FaPenFancy,
    keywords: ['امتحان', 'مسابقة', 'أسئلة', 'كويز', 'نقاط'],
  },
  {
    id: 'settings-page',
    title: 'الإعدادات والمظهر',
    subtitle: 'تخصيص المظهر (فاتح / داكن / ذهبي)، الإشعارات، واللغات',
    category: 'النظام',
    href: '/settings',
    icon: FaCog,
    keywords: ['إعدادات', 'مظهر', 'ثيم', 'إشعارات', 'لغة', 'كاش'],
  },
];

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = SEARCH_CATALOG.filter((item) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchSubtitle = item.subtitle.toLowerCase().includes(q);
    const matchCategory = item.category.toLowerCase().includes(q);
    const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
    return matchTitle || matchSubtitle || matchCategory || matchKeywords;
  });

  if (!isOpen) return null;

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-0.5 sm:p-1 pt-4 sm:pt-5 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          dir="rtl"
        >
          {/* Search Header */}
          <div className="flex items-center gap-0.5 p-0.5 border-b border-neutral-800 bg-neutral-950">
            <FaSearch className="text-amber-400 text-lg shrink-0" />
            <input
              type="text"
              placeholder="ابحث في القداسات، التسبحة، الألحان، الكتاب المقدس، الأدوات..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm md:text-base outline-hidden placeholder-neutral-500"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-0.5 text-neutral-400 hover:text-white rounded-lg transition"
            >
              <FaTimes />
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-2 text-neutral-500 space-y-0.5">
                <FaSearch className="mx-auto text-2xl opacity-40" />
                <p className="text-sm">لم يتم العثور على نتائج مطابقة لـ &quot;{query}&quot;</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.href)}
                    className="w-full text-right p-0.5 rounded-xl bg-neutral-950/40 hover:bg-neutral-800 border border-neutral-800/80 hover:border-amber-500/30 flex items-center justify-between gap-3 transition group"
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="p-0.5 rounded-xl bg-neutral-800 group-hover:bg-amber-500/20 text-amber-400 border border-neutral-700 group-hover:border-amber-500/40 transition">
                        <Icon className="text-base" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-0.5">
                          <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                            {item.title}
                          </h4>
                          <span className="text-[10px] px-1 py-0.25 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <FaArrowRight className="text-xs text-neutral-600 group-hover:text-amber-400 rotate-180 transition shrink-0" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-1 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-500">
            <span>انقر على أي عنصر للانتقال الفوري</span>
            <span className="font-mono">Esc للإغلاق</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
