"use client";
import { FaHeart } from "react-icons/fa";
import { useRef } from "react";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

type VerseItemProps = {
  bibleData: BookObj[];
  currentBookIdx: number;
  setCurrentBookIdx: (idx: number) => void;
  currentChapterIdx: number;
  setCurrentChapterIdx: (idx: number) => void;
  selectedVerses: number[];
  toggleVerseSelection: (verseNum: number) => void;
  favorites: { bIdx: number; cIdx: number; vNum: number }[];
  fontSize: number;
  language?: "ar" | "cop";
};

export default function VerseItem({
  bibleData,
  currentBookIdx,
  setCurrentBookIdx,
  currentChapterIdx,
  setCurrentChapterIdx,
  selectedVerses,
  toggleVerseSelection,
  favorites,
  fontSize,
  language = "ar",
}: VerseItemProps) {
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleNextChapter = () => {
    const currentBook = bibleData[currentBookIdx];
    if (currentChapterIdx < currentBook.chapters.length - 1) {
      setCurrentChapterIdx(currentChapterIdx + 1);
    } else if (currentBookIdx < bibleData.length - 1) {
      setCurrentBookIdx(currentBookIdx + 1);
      setCurrentChapterIdx(0);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIdx > 0) {
      setCurrentChapterIdx(currentChapterIdx - 1);
    } else if (currentBookIdx > 0) {
      const prevBook = bibleData[currentBookIdx - 1];
      setCurrentBookIdx(currentBookIdx - 1);
      setCurrentChapterIdx(prevBook.chapters.length - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartPos.current.x - touchEndX;
    const diffY = Math.abs(touchStartPos.current.y - touchEndY);

    if (Math.abs(diffX) > 70 && diffY < 50) {
      if (diffX > 0) handlePrevChapter();
      else handleNextChapter();
    }
  };

  if (!bibleData || bibleData.length === 0) return null;

  const activeChapter = bibleData[currentBookIdx]?.chapters?.[currentChapterIdx] || [];
  return (
    <div
      className={`w-full px-1 sm:px-2 md:px-3 max-w-7xl mx-auto select-text ${
        language === "cop" ? "font-coptic text-left" : "font-arabic text-right"
      }`}
      dir={language === "cop" ? "ltr" : "rtl"}
      style={{ fontSize: `${fontSize}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {activeChapter.length > 0 ? (
        <p className="text-justify leading-[2.3] sm:leading-[2.4] tracking-normal inline">
          {activeChapter.map((verseObj, index) => {
            const uniqueKey = `book-${currentBookIdx}-ch-${currentChapterIdx}-v-${verseObj.verse}-${index}`;
            const isSelected = selectedVerses.includes(verseObj.verse);
            const isFav = favorites.some(
              (f) =>
                f.bIdx === currentBookIdx &&
                f.cIdx === currentChapterIdx &&
                f.vNum === verseObj.verse
            );

            return (
              <span
                key={uniqueKey}
                id={`verse-${verseObj.verse}`}
                onClick={() => toggleVerseSelection(verseObj.verse)}
                className={`inline cursor-pointer transition-colors duration-150 rounded-sm px-0.5 py-0.5 box-decoration-clone ${
                  isSelected
                    ? "bg-amber-200/90 dark:bg-amber-900/60 text-stone-950 dark:text-amber-100 ring-1 ring-amber-400 font-semibold"
                    : isFav
                    ? "bg-amber-500/10 dark:bg-amber-500/20 text-stone-900 dark:text-stone-100"
                    : "text-stone-900 dark:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-zinc-800/60"
                }`}
              >
                <sup
                  className={`text-[0.62em] font-bold align-super select-none mx-0.5 inline-flex items-center gap-0.5 font-sans ${
                    isSelected
                      ? "text-amber-900 dark:text-amber-200 font-black"
                      : isFav
                      ? "text-red-600 dark:text-red-400 font-bold"
                      : "text-amber-700 dark:text-amber-500/90"
                  }`}
                >
                  {verseObj.verse}
                  {isFav && <FaHeart className="inline text-[0.7em] text-red-500" />}
                </sup>
                <span>
                  {verseObj.text_vocalized || verseObj.text_plain}
                </span>
                {" "}
              </span>
            );
          })}
        </p>
      ) : (
        <p className="text-center text-zinc-500 py-4">لا توجد آيات في هذا الإصحاح.</p>
      )}
    </div>
  );
}
