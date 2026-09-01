import { TasbehaDocument, ParticipantRole } from './types';
import { midnightTasbeha } from './data/midnight';
import { vespersTasbeha } from './data/vespers';
import { matinsTasbeha } from './data/matins';
import { kiahkTasbeha } from './data/kiahk';

import fullTasbehaData from './data/full_tasbeha_data.json';

export * from './types';
export { midnightTasbeha, vespersTasbeha, matinsTasbeha, kiahkTasbeha };

export const ALL_TASBEHA: TasbehaDocument[] = [
  midnightTasbeha,
  vespersTasbeha,
  matinsTasbeha,
  kiahkTasbeha,
  ...(fullTasbehaData as any as TasbehaDocument[]),
];

export function getTasbehaById(id: string): TasbehaDocument {
  const found = ALL_TASBEHA.find((t) => t.id === id || t.slug === id);
  return found || midnightTasbeha;
}

export function filterTasbehaSections(
  doc: TasbehaDocument,
  options: {
    role?: ParticipantRole;
    searchQuery?: string;
    groupId?: string;
    tone?: 'adam' | 'watos' | 'both';
  }
) {
  const { role = 'all', searchQuery = '', groupId, tone } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return doc.groups
    .filter((group) => !groupId || group.id === groupId)
    .map((group) => {
      const filteredSections = group.sections.filter((section) => {
        // Filter by role
        if (role !== 'all' && section.speaker !== role && section.speaker !== 'all') {
          return false;
        }

        // Filter by tone if specified
        if (tone && tone !== 'both' && section.tone && section.tone !== 'both' && section.tone !== tone) {
          return false;
        }

        // Filter by query
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
