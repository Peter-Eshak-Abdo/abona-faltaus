"use client";

import { useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

interface BibleSearchProps {
  isOpen: boolean;
  onClose: () => void;
  bibleData: BookObj[];
  onGoToVerse: (bookIdx: number, chapterIdx: number, verseNum: number) => void;
}

// دالة توحيد الحروف
const normalizeArabic = (text: string) => {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0640]/g, "")
    .toLowerCase();
};

export default function BibleSearch({ isOpen, onClose, bibleData, onGoToVerse }: BibleSearchProps) {
  const t = useTranslations('Bible');
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'old', 'new'
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setResults([]); // تفريغ النتائج القديمة أثناء البحث

    // استخدام setTimeout عشان الـ UI ميهنجش أثناء البحث في 31 ألف آية
    setTimeout(() => {
      const normalizedSearch = normalizeArabic(searchTerm);
      let found: any[] = [];

      bibleData.forEach((book, bIdx) => {
        // فلترة العهدين (بافتراض أول 46 سفر عهد قديم، والباقي جديد)
        if (filter === "old" && bIdx >= 46) return;
        if (filter === "new" && bIdx < 46) return;

        book.chapters.forEach((chapter, cIdx) => {
          chapter.forEach((verse) => {
            if (normalizeArabic(verse.text_plain).includes(normalizedSearch)) {
              found.push({
                bookIdx: bIdx,
                chapterIdx: cIdx,
                verseNum: verse.verse,
                bookName: book.name,
                text: verse.text_vocalized
              });
            }
          });
        });
      });

      setResults(found.slice(0, 100)); // عرض أول 100 نتيجة فقط للسرعة
      setIsSearching(false);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-0.5">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* الهيدر */}
        <div className="flex justify-between items-center p-0.5 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold text-blue-600">{t('searchTitle')}</h2>
          <button onClick={onClose} className="p-0.5 text-zinc-500 hover:text-red-500 rounded-full transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* أدوات البحث */}
        <div className="p-0.5 space-y-0.5 border-b dark:border-zinc-800">
          <div className="flex gap-0.5">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="flex-1 p-0.5 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center gap-0.5"
            >
              <FaSearch /> {t('searchBtn')}
            </button>
          </div>

          <div className="flex gap-0.5 text-sm font-bold justify-around">
            <label className="flex items-center gap-0.5 cursor-pointer">
              <input type="radio" name="filter" value="all" checked={filter === "all"} onChange={() => setFilter("all")} />
              {t('filterAll')}
            </label>
            <label className="flex items-center gap-0.5 cursor-pointer">
              <input type="radio" name="filter" value="old" checked={filter === "old"} onChange={() => setFilter("old")} />
              {t('filterOld')}
            </label>
            <label className="flex items-center gap-0.5 cursor-pointer">
              <input type="radio" name="filter" value="new" checked={filter === "new"} onChange={() => setFilter("new")} />
              {t('filterNew')}
            </label>
          </div>
        </div>

        {/* نتائج البحث */}
        <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5">
          {isSearching ? (
            <p className="text-center text-zinc-500 py-1">{t('searchBtn')}...</p>
          ) : results.length > 0 ? (
            results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onGoToVerse(res.bookIdx, res.chapterIdx, res.verseNum);
                  onClose();
                }}
                className="p-0.5 rounded-lg border dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-800 cursor-pointer transition"
              >
                <div className="text-sm font-bold text-blue-600">
                  {res.bookName} {res.chapterIdx + 1} : {res.verseNum}
                </div>
                <div className="text-base text-zinc-800 dark:text-zinc-200 mt-0.25">
                  {res.text}
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <p className="text-center text-zinc-500 py-1">{t('noResults')}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
