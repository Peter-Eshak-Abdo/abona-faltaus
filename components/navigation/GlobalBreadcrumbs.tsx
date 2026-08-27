'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { FaHome, FaChevronLeft, FaChurch, FaMusic, FaBook, FaFileAlt, FaCog, FaSun, FaMoon, FaPenFancy } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

const ROUTE_META: Record<string, { labelKey: string; defaultLabel: string; icon?: any }> = {
  slides: { labelKey: 'slides', defaultLabel: 'صانع العروض', icon: FaFileAlt },
  liturgies: { labelKey: 'liturgies', defaultLabel: 'القداسات الإلهية', icon: FaChurch },
  tasbeha: { labelKey: 'tasbeha', defaultLabel: 'التسبحة والإبصالمودية', icon: FaMusic },
  al7an: { labelKey: 'hymns', defaultLabel: 'الألحان القبطية', icon: FaMusic },
  bible: { labelKey: 'bible', defaultLabel: 'الكتاب المقدس', icon: FaBook },
  agpeya: { labelKey: 'agpeya', defaultLabel: 'الأجبية المقدسة', icon: FaSun },
  synaxarium: { labelKey: 'synaxarium', defaultLabel: 'السنكسار', icon: FaChurch },
  preparation: { labelKey: 'preparation', defaultLabel: 'نوتة التحضير', icon: FaFileAlt },
  exam: { labelKey: 'exams', defaultLabel: 'الامتحانات والمسابقات', icon: FaPenFancy },
  settings: { labelKey: 'settings', defaultLabel: 'الإعدادات', icon: FaCog },
  articles: { labelKey: 'articles', defaultLabel: 'المقالات', icon: FaFileAlt },
  chat: { labelKey: 'chat', defaultLabel: 'المساعد الآبائي الذكي', icon: FaChurch },
  'icon-generator': { labelKey: 'icons', defaultLabel: 'مولد الأيقونات', icon: FaChurch },
  prayers: { labelKey: 'prayers', defaultLabel: 'الصلوات القبطية', icon: FaChurch },
  auth: { labelKey: 'auth', defaultLabel: 'الحساب', icon: FaCog },
};

export default function GlobalBreadcrumbs() {
  const pathname = usePathname();
  const tHome = useTranslations('Home');

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-neutral-400 overflow-x-auto no-scrollbar whitespace-nowrap" dir="rtl" aria-label="Breadcrumbs">
      <Link
        href="/"
        className="flex items-center gap-0.5 text-neutral-400 hover:text-amber-400 transition"
        title="الرئيسية"
      >
        <FaHome className="text-xs" />
        <span className="hidden sm:inline">الرئيسية</span>
      </Link>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1;
        const href = `/${segments.slice(0, idx + 1).join('/')}`;
        const meta = ROUTE_META[seg];

        let label = seg;
        if (meta) {
          try {
            label = tHome(`sections.${meta.labelKey}`) || meta.defaultLabel;
          } catch {
            label = meta.defaultLabel;
          }
        }

        const Icon = meta?.icon;

        return (
          <div key={href} className="flex items-center gap-1">
            <FaChevronLeft className="text-[9px] text-neutral-600 shrink-0" />
            {isLast ? (
              <span className="font-bold text-neutral-100 flex items-center gap-0.5">
                {Icon && <Icon className="text-[11px] text-amber-400" />}
                <span>{label}</span>
              </span>
            ) : (
              <Link
                href={href}
                className="text-neutral-400 hover:text-amber-400 flex items-center gap-0.5 transition"
              >
                {Icon && <Icon className="text-[11px] text-neutral-500" />}
                <span>{label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
