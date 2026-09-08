"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBook, FaLanguage, FaListUl, FaCopy } from "react-icons/fa";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { explainCopticWords, transliterateCopticToArabized, type CopticWordDetail } from "@/lib/coptic-transliterate";
import type { BookObj, VerseObj } from "@/lib/bible-utils";
import localforage from "localforage";

interface VerseTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bibleData: BookObj[];
  currentBookIdx: number;
  currentChapterIdx: number;
  selectedVerses: number[];
  language: "ar" | "cop";
}

interface ParallelVerseData {
  verseNum: number;
  coptic: string;
  copticArabic: string;
  arabic: string;
  english: string;
  wordDetails: CopticWordDetail[];
}

export default function VerseTranslationModal({
  isOpen,
  onClose,
  bibleData,
  currentBookIdx,
  currentChapterIdx,
  selectedVerses,
  language,
}: VerseTranslationModalProps) {
  const [parallelVerses, setParallelVerses] = useState<ParallelVerseData[]>([]);
  const [activeTab, setActiveTab] = useState<"quad" | "words">("quad");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || selectedVerses.length === 0) return;

    async function loadTranslations() {
      setLoading(true);
      try {
        const activeBook = bibleData[currentBookIdx];
        const activeChapter = activeBook?.chapters?.[currentChapterIdx] || [];

        // Load Arabic bible data from cache or fetch to ensure accurate Arabic parallel text
        let arabicData: BookObj[] | null = await localforage.getItem<BookObj[]>("offline_bible_data");
        if (!arabicData || arabicData.length === 0) {
          try {
            const res = await fetch("/bible-json/bible_fixed.json");
            if (res.ok) {
              const json = await res.json();
              arabicData = json.map((b: any) => ({
                abbrev: b.abbrev,
                name: b.name || b.abbrev,
                chapters: b.chapters || [],
              }));
            }
          } catch {}
        }

        const sortedVNums = [...selectedVerses].sort((a, b) => a - b);
        const results: ParallelVerseData[] = [];

        for (const vNum of sortedVNums) {
          const vObj = activeChapter.find((v) => v.verse === vNum);
          const currentText = vObj?.text_vocalized || vObj?.text_plain || "";

          let copticText = "";
          let arabicText = "";
          let englishText = vObj?.translation || "";
          let copticArabicText = vObj?.text_coptic_arabic || "";

          if (language === "cop") {
            copticText = currentText;
            if (!copticArabicText) {
              copticArabicText = transliterateCopticToArabized(copticText);
            }

            // Find matching Arabic verse
            if (arabicData) {
              const arBook = arabicData.find((b) => b.abbrev === activeBook?.abbrev);
              const arChapter = arBook?.chapters?.[currentChapterIdx];
              const arVerse = arChapter?.find((v) => v.verse === vNum);
              if (arVerse) {
                arabicText = arVerse.text_vocalized || arVerse.text_plain;
              }
            }
          } else {
            arabicText = currentText;
          }

          const wordDetails = copticText ? explainCopticWords(copticText) : [];

          results.push({
            verseNum: vNum,
            coptic: copticText,
            copticArabic: copticArabicText,
            arabic: arabicText,
            english: englishText,
            wordDetails,
          });
        }

        setParallelVerses(results);
      } catch (err) {
        console.error("Error loading parallel translations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [isOpen, selectedVerses, bibleData, currentBookIdx, currentChapterIdx, language]);

  if (!isOpen) return null;

  const activeBook = bibleData[currentBookIdx];
  const citation = `(${activeBook?.name || ""} - أصحاح ${currentChapterIdx + 1} : ${selectedVerses.join("، ")})`;

  const handleCopyAll = () => {
    const text = parallelVerses
      .map(
        (v) =>
          `[آية ${v.verseNum}]\n` +
          (v.coptic ? `🇨🇴 القبطي: ${v.coptic}\n` : "") +
          (v.copticArabic ? `🔤 القبطي المعرب: ${v.copticArabic}\n` : "") +
          (v.arabic ? `🇸🇦 العربي: ${v.arabic}\n` : "") +
          (v.english ? `🇬🇧 الإنجليزي: ${v.english}\n` : "")
      )
      .join("\n---\n");

    navigator.clipboard.writeText(`${text}\n\n📌 الشاهد: ${citation}`);
    toast.success("تم نسخ الترجمة الرباعية بنجاح!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0.5 sm:p-1 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="bg-stone-900 border border-amber-600/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-1 py-0.5 bg-stone-950/80 border-b border-amber-600/20 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <span className="p-0.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <FaLanguage className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-100">
                  ترجمة الآيات والمعاني القبطية
                </h3>
                <p className="text-[11px] text-amber-300/70 font-semibold">{citation}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={handleCopyAll}
                className="p-0.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 transition text-xs flex items-center gap-0.25 font-bold"
                title="نسخ الترجمة"
              >
                <FaCopy />
                <span className="hidden sm:inline">نسخ</span>
              </button>
              <button
                onClick={onClose}
                className="p-0.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-800 bg-stone-950/40 px-0.5 pt-0.5 gap-0.5">
            <button
              onClick={() => setActiveTab("quad")}
              className={`px-0.5 py-0.25 text-xs font-bold rounded-t-xl transition flex items-center gap-0.25 ${
                activeTab === "quad"
                  ? "bg-amber-600/20 text-amber-300 border-b-2 border-amber-500"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <FaBook className="w-3.5 h-3.5" />
              <span>الترجمة الرباعية (عربي • قبطي • معرب • إنجليزي)</span>
            </button>

            <button
              onClick={() => setActiveTab("words")}
              className={`px-0.5 py-0.25 text-xs font-bold rounded-t-xl transition flex items-center gap-0.25 ${
                activeTab === "words"
                  ? "bg-amber-600/20 text-amber-300 border-b-2 border-amber-500"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <FaListUl className="w-3.5 h-3.5" />
              <span>قاموس الكلمات القبطية وشرحها</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-1 overflow-y-auto space-y-0.5 flex-1 text-right">
            {loading ? (
              <div className="py-2 text-center text-amber-300/60 font-semibold animate-pulse">
                جاري استخراج الترجمات والمعاني...
              </div>
            ) : parallelVerses.length === 0 ? (
              <div className="py-2 text-center text-stone-400">لا توجد آيات محددة.</div>
            ) : activeTab === "quad" ? (
              parallelVerses.map((v) => (
                <div
                  key={`parallel-${v.verseNum}`}
                  className="bg-stone-950/60 border border-amber-500/15 rounded-2xl p-0.5 space-y-0.5 shadow-inner"
                >
                  <div className="flex items-center justify-between border-b border-stone-800 pb-0.5">
                    <span className="px-0.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                      الآية {v.verseNum}
                    </span>
                  </div>

                  {/* Coptic */}
                  {v.coptic && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-cyan-400 block tracking-wider">
                        القبطي (ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ):
                      </span>
                      <p className="font-coptic text-base sm:text-lg text-cyan-200 text-left leading-relaxed" dir="ltr">
                        {v.coptic}
                      </p>
                    </div>
                  )}

                  {/* Coptic Arabized */}
                  {v.copticArabic && (
                    <div className="space-y-0.5 bg-amber-500/5 p-0.5 rounded-xl border border-amber-500/10">
                      <span className="text-[10px] font-bold text-amber-300 block">
                        القبطي المعرب (النطق بالحروف العربية):
                      </span>
                      <p className="font-arabic text-sm sm:text-base text-amber-200 font-semibold leading-relaxed">
                        {v.copticArabic}
                      </p>
                    </div>
                  )}

                  {/* Arabic */}
                  {v.arabic && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-400 block">
                        العربي (النص البيروتي الفانديك):
                      </span>
                      <p className="font-arabic text-sm sm:text-base text-emerald-200 leading-relaxed">
                        {v.arabic}
                      </p>
                    </div>
                  )}

                  {/* English */}
                  {v.english && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-400 block tracking-wider">
                        English Translation:
                      </span>
                      <p className="text-xs sm:text-sm text-blue-200 text-left leading-relaxed font-sans" dir="ltr">
                        {v.english}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Coptic Words Dictionary View
              <div className="space-y-0.5">
                {parallelVerses.flatMap((v) => v.wordDetails).length === 0 ? (
                  <div className="text-center py-8 text-stone-400 space-y-2">
                    <p>لم يتم العثور على كلمات مفتاحية شهيرة في هذه الآية داخل القاموس التوضيحي.</p>
                    <p className="text-xs text-stone-500">
                      يمكنك استخدام زر "تفسير" لسؤال المرشد الآلي عن المعنى التفصيلي الكامل.
                    </p>
                  </div>
                ) : (
                  parallelVerses
                    .flatMap((v) => v.wordDetails)
                    .map((w, idx) => (
                      <div
                        key={`word-${w.coptic}-${idx}`}
                        className="bg-stone-950/60 border border-amber-500/20 rounded-2xl p-0.5 space-y-0.5"
                      >
                        <div className="flex items-center justify-between border-b border-stone-800 pb-0.5">
                          <div className="flex items-center gap-0.5">
                            <span className="font-coptic text-base font-bold text-amber-300" dir="ltr">
                              {w.coptic}
                            </span>
                            <span className="text-xs font-semibold text-stone-400">
                              ({w.copticArabic})
                            </span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">{w.meaningAr}</span>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">
                          <strong className="text-amber-400">المعنى الإنجليزي:</strong> {w.meaningEn}
                        </p>

                        {w.synonyms.length > 0 && (
                          <div className="text-xs text-stone-300">
                            <strong className="text-amber-400">كلمات مرادفة أو قريبة: </strong>
                            {w.synonyms.join(" ، ")}
                          </div>
                        )}

                        <div className="bg-stone-900/80 p-0.5 rounded-xl border border-stone-800 space-y-0.25">
                          <span className="text-[10px] font-bold text-stone-400 block">
                            مثال في جملة كنسية توضيحية:
                          </span>
                          <p className="font-coptic text-xs text-cyan-300 text-left" dir="ltr">
                            {w.exampleSentence.coptic}
                          </p>
                          <p className="text-xs text-stone-300 font-semibold">
                            {w.exampleSentence.arabic}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
