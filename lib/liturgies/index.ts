import { LiturgyDocument, LiturgyGroup } from './types';
import { basilLiturgy } from './data/basil';
import { gregoryLiturgy } from './data/gregory';
import { cyrilLiturgy } from './data/cyril';
import { fractionsLiturgy } from './data/fractions';
import { distributionLiturgy } from './data/distribution';
import fullLiturgiesData from './data/full_liturgies_data.json';

export * from './types';
export { basilLiturgy, gregoryLiturgy, cyrilLiturgy, fractionsLiturgy, distributionLiturgy };

// Canonical Ordered Sections for Holy Liturgy
export const CANONICAL_LITURGY_STRUCTURE = [
  { id: 'agpeya', nameAr: 'صلوات الأجبية (3 و 6 و 9)', icon: 'FaBookOpen' },
  { id: 'matins_incense', nameAr: 'رفع بخور باكر والعشية', icon: 'FaSun' },
  { id: 'offertory', nameAr: 'تقديم الحمل وتحليل الخدام', icon: 'FaChurch' },
  { id: 'word_liturgy', nameAr: 'قداس الموعوظين والقرائات', icon: 'FaScroll' },
  { id: 'reconciliation', nameAr: 'صلاة الصلح والقبلة', icon: 'FaHeart' },
  { id: 'anaphora', nameAr: 'الأنافورا وسر التقديس', icon: 'FaCross' },
  { id: 'litanies_commemoration', nameAr: 'الأواشي ومجمع القديسين', icon: 'FaUsers' },
  { id: 'fraction', nameAr: 'صلوات القسمة المقدسة', icon: 'FaBreadSlice' },
  { id: 'communion_distribution', nameAr: 'سر التناول والتوزيع السنوي', icon: 'FaMusic' },
];

/**
 * بناء شجرة القداس الكاملة بالترتيب الطقسي الكنسي السليم
 */
export function buildCanonicalFullLiturgy(anaphoraType: 'basil' | 'gregory' | 'cyril' = 'basil'): LiturgyDocument {
  const anaphoraDoc = anaphoraType === 'gregory' ? gregoryLiturgy : anaphoraType === 'cyril' ? cyrilLiturgy : basilLiturgy;
  
  // Find annual incense & liturgy files from full dataset
  const rawAnnual = (fullLiturgiesData as any[]).find((d) => d.id === '00-القداس-السنوى');
  const annualGroups: LiturgyGroup[] = rawAnnual ? rawAnnual.groups : [];

  const matinsGroup = annualGroups.find((g) => g.title?.arabic?.includes('رفع بخور باكر')) || basilLiturgy.groups[0];
  const offeringsGroup = basilLiturgy.groups[1] || {
    id: 'offering-lamb',
    title: { arabic: 'تقديم الحمل وتحليل الخدام', english: 'Offertory of the Lamb' },
    badge: 'دورة الحمل',
    sections: []
  };

  const wordLiturgyGroup = basilLiturgy.groups[2] || {
    id: 'liturgy-of-word',
    title: { arabic: 'قداس الموعوظين والقرائات اليومية', english: 'Liturgy of the Word' },
    badge: 'الرسائل والإنجيل',
    sections: []
  };

  const anaphoraGroups = anaphoraDoc.groups.filter((g) => g.id !== 'matins-incense');
  const fractionGroups = fractionsLiturgy.groups;
  const distributionGroups = distributionLiturgy.groups;

  const combinedGroups: LiturgyGroup[] = [
    {
      id: 'agpeya-group',
      title: { arabic: 'صلوات الأجبية للقداس (الثالثة والسادسة)', english: 'Canonical Agpeya Hours' },
      badge: 'الاستعداد والصلاة',
      sections: [
        {
          id: 'agpeya-third-hour',
          title: { arabic: 'صلاة الساعة الثالثة', english: 'Third Hour' },
          speaker: 'all',
          type: 'prayer',
          verses: [
            {
              arabic: 'باسم الآب والابن والروح القدس، الإله الواحد، آمين. يا ملك السلام، أعطنا سلامك، قرر لنا سلامك، واغفر لنا خطايانا.',
              coptic_arabic: 'خين إفران إمفيوت نيم إبشيري نيم بي إبنيفما إثؤواب: أو أورو إنتي تي هيريني ماي نان إن تيك هيريني.',
              coptic: 'Ϧⲉⲛ ⲫ̀ⲣⲁⲛ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ: Ⲡ̀ⲟⲩⲣⲟ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ ⲙⲟⲓ ⲛⲁⲛ ⲛ̀ⲧⲉⲕϩⲓⲣⲏⲛⲏ.'
            }
          ]
        }
      ]
    },
    matinsGroup,
    offeringsGroup,
    wordLiturgyGroup,
    ...anaphoraGroups,
    ...fractionGroups,
    ...distributionGroups
  ];

  return {
    id: anaphoraType,
    slug: anaphoraDoc.slug,
    title: anaphoraDoc.title,
    subtitle: anaphoraDoc.subtitle,
    description: anaphoraDoc.description,
    iconName: anaphoraDoc.iconName,
    accentColor: anaphoraDoc.accentColor,
    groups: combinedGroups
  };
}

export const CANONICAL_BASIL_LITURGY = buildCanonicalFullLiturgy('basil');
export const CANONICAL_GREGORY_LITURGY = buildCanonicalFullLiturgy('gregory');
export const CANONICAL_CYRIL_LITURGY = buildCanonicalFullLiturgy('cyril');

import elnozhaAnnualLiturgyData from './data/elnozha_annual_liturgy.json';
import elnozhaOccasionsData from './data/elnozha_occasions_liturgies.json';

export const ELNOZHA_ANNUAL_LITURGY: LiturgyDocument = (elnozhaAnnualLiturgyData as any[])[0] || CANONICAL_BASIL_LITURGY;

export const ALL_LITURGIES: LiturgyDocument[] = [
  ELNOZHA_ANNUAL_LITURGY,
  CANONICAL_GREGORY_LITURGY,
  CANONICAL_CYRIL_LITURGY,
  fractionsLiturgy,
  distributionLiturgy,
  ...(elnozhaOccasionsData as any as LiturgyDocument[]),
  ...(fullLiturgiesData as any as LiturgyDocument[]).filter((d) => (d.id as string) !== '00-القداس-السنوى' && (d.id as string) !== 'basil')
];

export function getLiturgyById(id: string): LiturgyDocument {
  const found = ALL_LITURGIES.find((l) => l.id === id || l.slug === id);
  return found || ELNOZHA_ANNUAL_LITURGY;
}

export function filterLiturgySections(
  doc: LiturgyDocument,
  options: {
    role?: any;
    searchQuery?: string;
    groupId?: string;
  }
) {
  const { role = 'all', searchQuery = '', groupId } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return doc.groups
    .filter((group) => !groupId || group.id === groupId)
    .map((group) => {
      const filteredSections = group.sections.filter((section) => {
        if (role !== 'all' && section.speaker !== role && section.speaker !== 'all') {
          return false;
        }

        if (normalizedQuery) {
          const matchTitle =
            section.title.arabic?.toLowerCase().includes(normalizedQuery) ||
            section.title.coptic?.toLowerCase().includes(normalizedQuery) ||
            section.title.english?.toLowerCase().includes(normalizedQuery);

          const matchVerses = section.verses.some(
            (v) =>
              v.arabic.toLowerCase().includes(normalizedQuery) ||
              (v.coptic && v.coptic.toLowerCase().includes(normalizedQuery)) ||
              (v.coptic_arabic && v.coptic_arabic.toLowerCase().includes(normalizedQuery)) ||
              (v.english && v.english.toLowerCase().includes(normalizedQuery))
          );

          return matchTitle || matchVerses;
        }

        return true;
      });

      return {
        ...group,
        sections: filteredSections,
      };
    })
    .filter((group) => group.sections.length > 0);
}
