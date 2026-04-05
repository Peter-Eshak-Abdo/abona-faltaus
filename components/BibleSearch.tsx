"use client";

import { useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-1">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* الهيدر */}
        <div className="flex justify-between items-center p-1 border-b dark:border-zinc-800">
          <h2 className="text-xl font-bold text-blue-600">البحث في الكتاب المقدس</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-red-500 rounded-full transition">
            <FaTimes size={20} />
          </button>
        </div>

        {/* أدوات البحث */}
        <div className="p-1 space-y-1 border-b dark:border-zinc-800">
          <div className="flex gap-1">
            <input
              type="text"
              placeholder="اكتب كلمة للبحث (مثال: محبة)"
              className="flex-1 p-1 rounded-lg border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center gap-1"
            >
              <FaSearch /> بحث
            </button>
          </div>

          <div className="flex gap-1 text-sm font-bold">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="filter" checked={filter === "all"} onChange={() => setFilter("all")} />
              كل الكتاب
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="filter" checked={filter === "old"} onChange={() => setFilter("old")} />
              العهد القديم
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="radio" name="filter" checked={filter === "new"} onChange={() => setFilter("new")} />
              العهد الجديد
            </label>
          </div>
        </div>

        {/* النتائج */}
        <div className="flex-1 overflow-y-auto p-1 space-y-1">
          {/* التعديل هنا: 4 حالات بدل من شروط متداخلة معقدة */}
          {isSearching ? (
            <div className="text-center text-zinc-500 py-1 font-bold animate-pulse">جاري البحث في الآيات...</div>
          ) : results.length > 0 ? (
            results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => onGoToVerse(res.bookIdx, res.chapterIdx, res.verseNum)}
                className="p-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-zinc-800 transition group"
              >
                <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
                  {res.bookName} - إصحاح {res.chapterIdx + 1} : {res.verseNum}
                </div>
                <p className="text-zinc-800 dark:text-zinc-300 font-arabic group-hover:text-black dark:group-hover:text-white text-justify">
                  {res.text}
                </p>
              </div>
            ))
          ) : searchTerm && !isSearching ? (
            <div className="text-center text-red-500 py-1 font-bold">لم يتم العثور على نتائج. تأكد من الكلمة المكتوبة.</div>
          ) : (
            <div className="text-center text-zinc-400 py-1 font-bold">ابدأ بكتابة كلمة للبحث عنها...</div>
          )}
        </div>
      </div>
    </div>
  );
}
