// Coptic to Arabic Transliteration (القبطي المعرب) & Dictionary Engine

// Bohairic Coptic alphabet phonetics to Arabic letters
const COPTIC_TO_ARABIC_LETTERS: Record<string, string> = {
  // Letters
  "ⲁ": "ا", "ⲁ̀": "إ",
  "ⲃ": "ب", "ⲃ̀": "إب",
  "ⲅ": "غ", "ⲅ̀": "إغ",
  "ⲇ": "د", "ⲇ̀": "إد",
  "ⲉ": "إي", "ⲉ̀": "إ",
  "ⲍ": "ز", "ⲍ̀": "إز",
  "ⲏ": "ي", "ⲏ̀": "إي",
  "ⲑ": "ث", "ⲑ̀": "إث",
  "ⲓ": "ي", "ⲓ̀": "إي",
  "ⲕ": "ك", "ⲕ̀": "إك",
  "ⲗ": "ل", "ⲗ̀": "إل",
  "ⲙ": "م", "ⲙ̀": "إم",
  "ⲛ": "ن", "ⲛ̀": "إن",
  "ⲝ": "إكس", "ⲝ̀": "إكس",
  "ⲟ": "او", "ⲟ̀": "أو",
  "ⲡ": "ب", "ⲡ̀": "إب",
  "ⲣ": "ر", "ⲣ̀": "إر",
  "ⲥ": "س", "ⲥ̀": "إس",
  "ⲧ": "ت", "ⲧ̀": "إت",
  "ⲩ": "ي", "ⲩ̀": "إي",
  "ⲫ": "ف", "ⲫ̀": "إف",
  "ⲭ": "خ", "ⲭ̀": "إخ",
  "ⲯ": "إبس", "ⲯ̀": "إبس",
  "ⲱ": "أو", "ⲱ̀": "أو",
  "ϣ": "ش", "ϣ̀": "إش",
  "ϥ": "ف", "ϥ̀": "إف",
  "ϧ": "خ", "ϧ̀": "إخ",
  "ϩ": "هـ", "ϩ̀": "إهـ",
  "ϫ": "ج", "ϫ̀": "إج",
  "ϭ": "تش", "ϭ̀": "إتش",
  "ϯ": "تي", "ϯ̀": "إتي",
};

// Common Coptic words dictionary with translation, synonyms, and explanation
export interface CopticWordDetail {
  coptic: string;
  copticArabic: string;
  meaningAr: string;
  meaningEn: string;
  synonyms: string[];
  exampleSentence: {
    coptic: string;
    arabic: string;
  };
}

export const COPTIC_DICTIONARY: Record<string, CopticWordDetail> = {
  "ⲫⲛⲟⲩϯ": {
    coptic: "Ⲫⲛⲟⲩϯ",
    copticArabic: "إفنوتي",
    meaningAr: "الله (الإله الواحد ضابط الكل)",
    meaningEn: "God",
    synonyms: ["Ⲡϭⲟⲓⲥ (الرب)", "Ⲫⲓⲱⲧ (الآب)"],
    exampleSentence: {
      coptic: "ϧⲉⲛ ⲟⲩⲁⲣⲭⲏ ⲁ̀ ⲫⲛⲟⲩϯ ⲑⲁⲙⲓⲟ ⲛ̀ⲧ̀ⲫⲉ ⲛⲉⲙ ⲡ̀ⲕⲁϩⲓ.",
      arabic: "في البدء خلق الله السماوات والأرض.",
    },
  },
  "ⲡϭⲟⲓⲥ": {
    coptic: "Ⲡϭⲟⲓⲥ",
    copticArabic: "إبشويس",
    meaningAr: "الرب / السيد (صاحب السلطان والمجد)",
    meaningEn: "The Lord / Master",
    synonyms: ["Ⲫⲛⲟⲩϯ (الله)", "Ⲡⲓⲥⲱⲧⲏⲣ (المخلص)"],
    exampleSentence: {
      coptic: "Ⲡϭⲟⲓⲥ ⲡⲉ ⲡⲁⲙⲁⲛⲉⲥⲱⲟⲩ: ⲛ̀ⲛⲁϣⲁⲧ ⲛ̀ϩⲗⲓ.",
      arabic: "الرب راعيّ فلا يعوزني شيء.",
    },
  },
  "ⲓⲏⲥⲟⲩⲥ": {
    coptic: "Ⲓⲏⲥⲟⲩⲥ",
    copticArabic: "إيسوس",
    meaningAr: "يسوع (المخلص / يهوه يخلص)",
    meaningEn: "Jesus",
    synonyms: ["Ⲡⲓⲥⲱⲧⲏⲣ (المخلص)", "Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ (المسيح)"],
    exampleSentence: {
      coptic: "Ⲓⲏⲥⲟⲩⲥ Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ ⲛ̀ⲑⲟϥ ⲡⲉ ⲥⲁϥ ⲛⲉⲙ ⲫⲟⲟⲩ ⲛⲉⲙ ϣⲁ ⲉⲛⲉϩ.",
      arabic: "يسوع المسيح هو هو أمساً واليوم وإلى الأبد.",
    },
  },
  "ⲡⲓⲭⲣⲓⲥⲧⲟⲥ": {
    coptic: "Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ",
    copticArabic: "بيخرستوس",
    meaningAr: "المسيح (الممسوح بالروح القدس مخلص العالم)",
    meaningEn: "The Christ / The Anointed",
    synonyms: ["Ⲡⲓⲥⲱⲧⲏⲣ (المخلص)", "Ⲡⲓⲟⲩⲣⲟ (الملك)"],
    exampleSentence: {
      coptic: "Ⲡⲓⲭⲣⲓⲥⲧⲟⲥ ⲁϥⲧⲱⲛϥ ⲉ̀ⲃⲟⲗ ϧⲉⲛ ⲛⲏⲉⲑⲙⲱⲟⲩⲧ.",
      arabic: "المسيح قام من بين الأموات.",
    },
  },
  "ⲫⲓⲱⲧ": {
    coptic: "Ⲫⲓⲱⲧ",
    copticArabic: "إفيوت",
    meaningAr: "الآب (الأب الأزلي ينبوع اللاهوت)",
    meaningEn: "The Father",
    synonyms: ["Ⲫⲛⲟⲩϯ (الله)", "Ⲡⲉⲛⲓⲱⲧ (أبانا)"],
    exampleSentence: {
      coptic: "Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ: ⲛⲉⲙ Ⲫⲓⲱⲧ ⲛⲉⲙ Ⲡ̀Ϣⲏⲣⲓ.",
      arabic: "المجد للآب والابن والروح القدس.",
    },
  },
  "ⲡϣⲏⲣⲓ": {
    coptic: "Ⲡ̀Ϣⲏⲣⲓ",
    copticArabic: "إبشيري",
    meaningAr: "الابن (ابن الله الكلمة المتجسد)",
    meaningEn: "The Son",
    synonyms: ["Ⲡⲓⲙⲟⲛⲟⲅⲉⲛⲏⲥ (الوحيد الجنس)", "Ⲡⲓⲗⲟⲅⲟⲥ (الكلمة)"],
    exampleSentence: {
      coptic: "Ⲧⲉⲛⲟⲩⲱϣⲧ ⲙ̀Ⲫ̀ⲓⲱⲧ ⲛⲉⲙ Ⲡ̀Ϣⲏⲣⲓ ⲛⲉⲙ Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ.",
      arabic: "نسجد للآب والابن والروح القدس.",
    },
  },
  "ⲡⲓⲡⲛⲉⲩⲙⲁ": {
    coptic: "Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ",
    copticArabic: "بي ابنفما",
    meaningAr: "الروح (الروح القدس المعزي المحيي)",
    meaningEn: "The Spirit",
    synonyms: ["Ⲡⲓⲡⲁⲣⲁⲕⲗⲏⲧⲟⲥ (المعزي)", "Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ Ⲉⲑⲟⲩⲁⲃ (الروح القدس)"],
    exampleSentence: {
      coptic: "Ⲡⲓⲡ̀ⲛⲉⲩⲙⲁ ⲉⲑⲟⲩⲁⲃ ⲡⲓⲡⲁⲣⲁⲕⲗⲏⲧⲟⲥ ⲉϥⲉ̀ⲧⲥⲁⲃⲱⲧⲉⲛ ⲉ̀ϩⲱⲃ ⲛⲓⲃⲉⲛ.",
      arabic: "الروح القدس المعزي يعلمكم كل شيء.",
    },
  },
  "ⲉⲑⲟⲩⲁⲃ": {
    coptic: "Ⲉⲑⲟⲩⲁⲃ",
    copticArabic: "إثؤواب",
    meaningAr: "القدوس / المقدس (المفروز والمطهر بنعمة الله)",
    meaningEn: "Holy / Pure",
    synonyms: ["Ⲭⲁⲑⲁⲣⲟⲥ (طاهر)", "Ⲡⲓⲁⲅⲓⲟⲥ (القديس)"],
    exampleSentence: {
      coptic: "Ⲁⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ: ⲁⲅⲓⲟⲥ ⲓⲥⲭⲩⲣⲟⲥ: ⲁⲅⲓⲟⲥ ⲁⲑⲁⲛⲁⲧⲟⲥ.",
      arabic: "قدوس الله، قدوس القوي، قدوس الحي الذي لا يموت.",
    },
  },
  "ⲟⲩⲙⲁⲕⲁⲣⲓⲟⲥ": {
    coptic: "Ⲟⲩⲙⲁⲕⲁⲣⲓⲟⲥ",
    copticArabic: "أوماكاريوس",
    meaningAr: "طوبى له / مغبوط (سعيد وسعيد الحظ في مخافة الله)",
    meaningEn: "Blessed / Beatified",
    synonyms: ["Ⲱⲟⲩⲛⲓⲁⲧϥ (طوباه)", "Ⲭ̀ⲥ̀ⲙⲁⲣⲱⲟⲩⲧ (مبارك)"],
    exampleSentence: {
      coptic: "Ⲟⲩⲙⲁⲕⲁⲣⲓⲟⲥ ⲡⲉ ⲡⲓⲣⲱⲙⲓ ⲉⲧⲉⲙ̀ⲡⲉϥϣⲉ ϧⲉⲛ ⲡ̀ⲥⲟϭⲛⲓ ⲛ̀ⲧⲉ ⲛⲓⲁⲥⲉⲃⲏⲥ.",
      arabic: "طوبى للرجل الذي لم يسلك في مشورة الأشرار.",
    },
  },
  "ⲁⲅⲁⲡⲏ": {
    coptic: "Ⲁⲅⲁⲡⲏ",
    copticArabic: "أغابي",
    meaningAr: "المحبة (المحبة الإلهية الباذلة غير المشروطة)",
    meaningEn: "Love / Charity",
    synonyms: ["Ⲙⲉⲓ (يحب)", "Ⲙⲉⲧϣⲁⲛⲑⲣⲱⲡⲟⲥ (محبة البشر)"],
    exampleSentence: {
      coptic: "Ϯⲁ̀ⲅⲁⲡⲏ ⲙ̀ⲡⲁⲥϩⲉⲓ ⲉ̀ⲛⲉϩ.",
      arabic: "المحبة لا تسقط أبداً.",
    },
  },
  "ⲛⲁⲓ": {
    coptic: "Ⲛⲁⲓ",
    copticArabic: "ناي",
    meaningAr: "الرحمة / الرأفة الإلهية",
    meaningEn: "Mercy / Compassion",
    synonyms: ["Ⲙⲉⲧϣⲉⲛϩⲏⲧ (رأفة)", "Ⲟⲩϫⲁⲓ (خلاص)"],
    exampleSentence: {
      coptic: "Ⲛⲁⲓ ⲛⲁⲛ Ⲫⲛⲟⲩϯ Ⲫⲓⲱⲧ ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ.",
      arabic: "ارحمنا يا الله الآب ضابط الكل.",
    },
  },
  "ⲟⲩϫⲁⲓ": {
    coptic: "Ⲟⲩϫⲁⲓ",
    copticArabic: "أوجاي",
    meaningAr: "خلاص / سلامة / معافاة",
    meaningEn: "Salvation / Health / Safety",
    synonyms: ["Ⲡⲓⲥⲱϯ (الفداء)", "Ϯϩⲓⲣⲏⲛⲏ (السلام)"],
    exampleSentence: {
      coptic: "Ⲡϭⲟⲓⲥ ⲡⲉ ⲡⲁⲟⲩⲱⲓⲛⲓ ⲛⲉⲙ ⲡⲁⲥⲱⲧⲏⲣ: ⲛⲓⲙ ⲉϯⲛⲁⲉⲣϩⲟϯ ϧⲁⲧⲉϥϩⲏ.",
      arabic: "الرب نوري وخلاصي ممن أخاف.",
    },
  },
  "ϩⲓⲣⲏⲛⲏ": {
    coptic: "Ϩⲓⲣⲏⲛⲏ",
    copticArabic: "هيريني",
    meaningAr: "سلام (السلام الفائق الذي يفوق كل عقل)",
    meaningEn: "Peace",
    synonyms: ["Ⲥⲉⲗⲏⲙ (سلام)", "Ⲙⲉⲧⲁⲧϣⲑⲟⲣⲧⲉⲣ (طمأنينة)"],
    exampleSentence: {
      coptic: "Ϯϩⲓⲣⲏⲛⲏ ⲛ̀ⲧⲉ Ⲫⲛⲟⲩϯ ⲉⲧϭⲟⲥⲓ ⲉ̀ⲛⲟⲩⲥ ⲛⲓⲃⲉⲛ ⲉⲥⲉ̀ⲁ̀ⲣⲉϩ ⲉ̀ⲛⲉⲧⲉⲛϩⲏⲧ.",
      arabic: "سلام الله الذي يفوق كل عقل يحفظ قلوبكم.",
    },
  },
};

/**
 * Transliterates Coptic text into Arabized Coptic (قبطي معرب) phonetically.
 */
export function transliterateCopticToArabized(copticText: string): string {
  if (!copticText) return "";

  // Split text into tokens (words and punctuation)
  const words = copticText.split(/(\s+|[.,:;!?]+)/);

  return words
    .map((word) => {
      if (!word.trim() || /^[.,:;!?]+$/.test(word)) return word;

      let result = "";
      const lowerWord = word.toLowerCase();

      // Multi-character phonetics
      let i = 0;
      while (i < lowerWord.length) {
        // Double letter rules or special combinations
        const twoChar = lowerWord.slice(i, i + 2);
        const threeChar = lowerWord.slice(i, i + 3);

        if (lowerWord.slice(i, i + 3) === "ⲟⲩⲱ") {
          result += "أوو";
          i += 3;
        } else if (twoChar === "ⲟⲩ") {
          result += "أو";
          i += 2;
        } else if (twoChar === "ⲉⲩ") {
          result += "إف";
          i += 2;
        } else if (twoChar === "ⲁⲩ") {
          result += "أف";
          i += 2;
        } else if (twoChar === "ⲡ̀") {
          result += "إب";
          i += 2;
        } else if (twoChar === "ⲛ̀") {
          result += "إن";
          i += 2;
        } else if (twoChar === "ⲙ̀") {
          result += "إم";
          i += 2;
        } else if (twoChar === "ⲧ̀") {
          result += "إت";
          i += 2;
        } else if (twoChar === "ⲫ̀") {
          result += "إف";
          i += 2;
        } else if (twoChar === "ⲭ̀") {
          result += "إخ";
          i += 2;
        } else if (twoChar === "ϣ̀") {
          result += "إش";
          i += 2;
        } else if (twoChar === "ϩ̀") {
          result += "إهـ";
          i += 2;
        } else if (twoChar === "ⲥ̀") {
          result += "إس";
          i += 2;
        } else {
          const ch = lowerWord[i];
          result += COPTIC_TO_ARABIC_LETTERS[ch] || ch;
          i += 1;
        }
      }

      return result;
    })
    .join("");
}

/**
 * Searches the Coptic dictionary for known words within the provided Coptic text
 */
export function explainCopticWords(copticText: string): CopticWordDetail[] {
  if (!copticText) return [];

  const cleaned = copticText
    .toLowerCase()
    .replace(/[.,:;!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const matched: CopticWordDetail[] = [];
  const seen = new Set<string>();

  for (const word of cleaned) {
    for (const [dictKey, detail] of Object.entries(COPTIC_DICTIONARY)) {
      if (
        (word === dictKey || word.includes(dictKey) || dictKey.includes(word)) &&
        !seen.has(detail.coptic)
      ) {
        matched.push(detail);
        seen.add(detail.coptic);
      }
    }
  }

  return matched;
}
