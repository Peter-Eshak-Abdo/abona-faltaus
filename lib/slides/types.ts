export type SlideTheme =
  | "orthodox-dark"
  | "coptic-gold"
  | "royal-blue"
  | "parchment"
  | "deep-burgundy";

export interface SlideVerse {
  text: string;
  ref: string;
}

export interface SlideQuote {
  text: string;
  author: string;
}

export type SlideType = "cover" | "content" | "verse" | "quote" | "activity" | "conclusion";

export interface Slide {
  id: string;
  slideType: SlideType;
  title: string;
  subtitle?: string;
  points: string[];
  verse?: SlideVerse;
  quote?: SlideQuote;
  imageUrl?: string;
  illustrationPrompt?: string;
  notes?: string;
  backgroundTheme?: SlideTheme;
}

export interface PresentationData {
  id: string;
  title: string;
  theme: SlideTheme;
  targetAudience?: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export const SLIDE_THEMES: Record<
  SlideTheme,
  {
    name: string;
    bgClass: string;
    cardClass: string;
    titleColor: string;
    subtitleColor: string;
    textColor: string;
    accentColor: string;
    badgeBg: string;
    pptxBg: string;
    pptxTitleColor: string;
    pptxTextColor: string;
    pptxAccentColor: string;
  }
> = {
  "orthodox-dark": {
    name: "ليلي قبطي (ذهبي وكحلي داكن)",
    bgClass: "bg-radial from-[#1e1e38] via-[#131224] to-[#0a0a14]",
    cardClass: "bg-black/40 border-amber-500/30 backdrop-blur-md",
    titleColor: "text-amber-300",
    subtitleColor: "text-amber-100/80",
    textColor: "text-stone-100",
    accentColor: "text-amber-400",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    pptxBg: "131224",
    pptxTitleColor: "F59E0B",
    pptxTextColor: "F3F4F6",
    pptxAccentColor: "FBBF24",
  },
  "coptic-gold": {
    name: "ذهبي تراثي ملكي",
    bgClass: "bg-radial from-[#3d2817] via-[#24170d] to-[#120b06]",
    cardClass: "bg-amber-950/40 border-amber-400/40 backdrop-blur-md",
    titleColor: "text-yellow-300",
    subtitleColor: "text-amber-200/90",
    textColor: "text-amber-50",
    accentColor: "text-yellow-400",
    badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
    pptxBg: "24170D",
    pptxTitleColor: "FDE047",
    pptxTextColor: "FFFBEB",
    pptxAccentColor: "FACC15",
  },
  "royal-blue": {
    name: "أزرق ملكي كنسي",
    bgClass: "bg-radial from-[#1e3a8a] via-[#0f172a] to-[#020617]",
    cardClass: "bg-blue-950/50 border-blue-400/30 backdrop-blur-md",
    titleColor: "text-cyan-200",
    subtitleColor: "text-blue-200/80",
    textColor: "text-slate-100",
    accentColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40",
    pptxBg: "0F172A",
    pptxTitleColor: "38BDF8",
    pptxTextColor: "F8FAFC",
    pptxAccentColor: "7DD3FC",
  },
  "parchment": {
    name: "مخطوطة قبطية ناصعة",
    bgClass: "bg-radial from-[#faf6ee] via-[#f3ecdc] to-[#e7dac1]",
    cardClass: "bg-white/80 border-amber-900/20 backdrop-blur-md shadow-lg",
    titleColor: "text-amber-950",
    subtitleColor: "text-amber-900/80",
    textColor: "text-stone-900",
    accentColor: "text-amber-800",
    badgeBg: "bg-amber-900/10 text-amber-900 border-amber-900/30",
    pptxBg: "F3ECDC",
    pptxTitleColor: "451A03",
    pptxTextColor: "1C1917",
    pptxAccentColor: "78350F",
  },
  "deep-burgundy": {
    name: "عنابي كنسي مهيب",
    bgClass: "bg-radial from-[#4a0e17] via-[#2a050c] to-[#120005]",
    cardClass: "bg-rose-950/40 border-rose-400/30 backdrop-blur-md",
    titleColor: "text-rose-200",
    subtitleColor: "text-rose-100/80",
    textColor: "text-rose-50",
    accentColor: "text-amber-300",
    badgeBg: "bg-rose-500/20 text-rose-200 border-rose-400/40",
    pptxBg: "2A050C",
    pptxTitleColor: "FECDD3",
    pptxTextColor: "FFF1F2",
    pptxAccentColor: "FDE047",
  },
};
