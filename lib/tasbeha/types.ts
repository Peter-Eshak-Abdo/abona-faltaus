export type ParticipantRole = 'all' | 'priest' | 'deacon' | 'people' | 'cantor';

export interface TasbehaHymnRef {
  id: string;
  name: string;
  src?: string;
  hazatSrc?: string;
  duration?: string;
  monasba?: string;
  description?: string;
}

export interface TasbehaHyperlink {
  text: string;
  target: string;
}

export interface TasbehaVerse {
  arabic: string;
  coptic?: string;
  coptic_arabic?: string; // Arabized Coptic (قبطي معرب)
  coptic_english?: string;
  english?: string;
  hymnRef?: TasbehaHymnRef;
  slide_number?: number;
  buttons?: { label: string; target: string; targetId?: string }[];
}

export interface TasbehaSection {
  id: string;
  title: {
    arabic: string;
    coptic?: string;
    english?: string;
  };
  speaker: ParticipantRole;
  type: 'hoos' | 'lobsh' | 'psali' | 'theotokia' | 'doxology' | 'commemoration' | 'prayer' | 'hymn' | 'conclusion';
  rubric?: {
    arabic?: string;
    english?: string;
  };
  tone?: 'adam' | 'watos' | 'both';
  verses: TasbehaVerse[];
  hyperlinks?: TasbehaHyperlink[];
  buttons?: { label: string; target: string; targetId?: string }[];
  source_file?: string;
  start_slide?: number;
}

export interface TasbehaGroup {
  id: string;
  title: {
    arabic: string;
    coptic?: string;
    english?: string;
  };
  badge?: string;
  sections: TasbehaSection[];
}

export interface TasbehaDocument {
  id: 'midnight' | 'vespers' | 'matins' | 'kiahk';
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
  groups: TasbehaGroup[];
}

export type TasbehaLanguage = 'arabic' | 'coptic' | 'coptic_arabic' | 'english';
export type TasbehaLayoutMode = 'columns' | 'stacked';
