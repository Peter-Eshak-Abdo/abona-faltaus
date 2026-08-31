export type ParticipantRole = 'all' | 'priest' | 'deacon' | 'people' | 'reader';

export interface LiturgyHymnRef {
  id: string;
  name: string;
  src?: string;
  hazatSrc?: string;
  duration?: string;
  monasba?: string;
  description?: string;
}

export interface LiturgyHyperlink {
  text: string;
  target: string;
}

export interface LiturgyVerse {
  arabic: string;
  coptic?: string;
  coptic_arabic?: string; // Arabized Coptic (قبطي معرب)
  coptic_english?: string;
  english?: string;
  hymnRef?: LiturgyHymnRef;
  slide_number?: number;
}

export interface LiturgySection {
  id: string;
  title: {
    arabic: string;
    coptic?: string;
    english?: string;
  };
  speaker: ParticipantRole;
  type: 'prayer' | 'litany' | 'creed' | 'anaphora' | 'hymn' | 'fraction' | 'instruction' | 'communion';
  rubric?: {
    arabic?: string;
    english?: string;
  };
  verses: LiturgyVerse[];
  hyperlinks?: LiturgyHyperlink[];
  source_file?: string;
  start_slide?: number;
}

export interface LiturgyGroup {
  id: string;
  title: {
    arabic: string;
    coptic?: string;
    english?: string;
  };
  badge?: string;
  sections: LiturgySection[];
}

export interface LiturgyDocument {
  id: 'basil' | 'gregory' | 'cyril' | 'fractions' | 'distribution';
  slug: string;
  title: {
    arabic: string;
    coptic: string;
    english: string;
  };
  subtitle: string;
  description: string;
  iconName: string;
  accentColor: string;
  groups: LiturgyGroup[];
}

export type LiturgyLanguage = 'arabic' | 'coptic' | 'coptic_arabic' | 'english';
export type LiturgyLayoutMode = 'columns' | 'stacked';
