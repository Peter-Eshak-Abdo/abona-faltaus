import { LiturgyDocument, ParticipantRole } from './types';
import { basilLiturgy } from './data/basil';
import { gregoryLiturgy } from './data/gregory';
import { cyrilLiturgy } from './data/cyril';
import { fractionsLiturgy } from './data/fractions';
import { distributionLiturgy } from './data/distribution';

import fullLiturgiesData from './data/full_liturgies_data.json';

export * from './types';
export { basilLiturgy, gregoryLiturgy, cyrilLiturgy, fractionsLiturgy, distributionLiturgy };

export const ALL_LITURGIES: LiturgyDocument[] = [
  ...(fullLiturgiesData as any as LiturgyDocument[]),
  basilLiturgy,
  gregoryLiturgy,
  cyrilLiturgy,
  fractionsLiturgy,
  distributionLiturgy,
];

export function getLiturgyById(id: string): LiturgyDocument {
  const found = ALL_LITURGIES.find((l) => l.id === id || l.slug === id);
  return found || basilLiturgy;
}

export function filterLiturgySections(
  doc: LiturgyDocument,
  options: {
    role?: ParticipantRole;
    searchQuery?: string;
    groupId?: string;
  }
) {
  const { role = 'all', searchQuery = '', groupId } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return doc.groups
    .filter((group) => (!groupId || group.id === groupId))
    .map((group) => {
      const filteredSections = group.sections.filter((section) => {
        // Filter by role
        if (role !== 'all' && section.speaker !== role && section.speaker !== 'all') {
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
