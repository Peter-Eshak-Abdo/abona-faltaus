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
      className="space-y-0 text-xl md:text-2xl leading-loose font-arabic px-0.5 max-w-8xl mx-auto"
      style={{ fontSize: `${fontSize}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {activeChapter.length > 0 ? (
        activeChapter.map((verseObj, index) => {
          const uniqueKey = `book-${currentBookIdx}-ch-${currentChapterIdx}-v-${verseObj.verse}-${index}`;
          const isSelected = selectedVerses.includes(verseObj.verse);
          const isFav = favorites.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === verseObj.verse);
          return (
            <div
              key={uniqueKey}
              id={`verse-${verseObj.verse}`}
              onClick={() => toggleVerseSelection(verseObj.verse)}
              className={`flex gap-0.25 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-blue-100 dark:bg-blue-900 shadow-md transform scale-[1.01]' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                ${isFav ? 'bg-yellow-500/10 border-r-4 border-yellow-500 shadow-md' : ''}
              `}>
              <span className={`font-bold shrink-0 select-none ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'} ${isFav ? 'text-yellow-600' : ''}`}>
                {verseObj.verse}
                {isFav && <FaHeart className="inline ml-0.5 text-red-500 text-sm" />}
              </span>
              <p className={`text-justify font-arabic ${isSelected ? 'text-black dark:text-white font-semibold' : 'text-zinc-800 dark:text-zinc-300'}`}>
                {verseObj.text_vocalized}
              </p>
            </div>
          );
        })) : (
        <p className="text-center text-zinc-500">لا توجد آيات في هذا الإصحاح.</p>
      )}
    </div>
  )
}
