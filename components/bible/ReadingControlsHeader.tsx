"use client";
import Link from "next/link";
import { FaPlay, FaStop, FaSearch, FaStar, FaPlusSquare, FaSpinner, FaArrowRight } from "react-icons/fa";
import { useState } from "react";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

type ReadingControlsHeaderProps = {
  bibleData: BookObj[];
  currentBookIdx: number;
  setCurrentBookIdx: (idx: number) => void;
  currentChapterIdx: number;
  setCurrentChapterIdx: (idx: number) => void;
  fontSize: number;
  setFontSize: (fn: (prev: number) => number) => void;
  setIsSearchOpen: (open: boolean) => void;
};

export default function ReadingControlsHeader({
  bibleData,
  currentBookIdx,
  setCurrentBookIdx,
  currentChapterIdx,
  setCurrentChapterIdx,
  fontSize,
  setFontSize,
  setIsSearchOpen,
}: ReadingControlsHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  if (!bibleData.length) return null;

  const activeBook = bibleData[currentBookIdx];

  return (
    <header className="sticky bg-surface-container-low/95 backdrop-blur-xl z-30 px-1 flex items-center justify-between border-b border-surface-variant/30 flex-col md:flex-row shadow-2xl rounded-4xl pb-0.5">
      <div className="flex gap-0.5 w-full md:w-auto">
        <Link href="/" className="p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline" title="الرجوع للصفحة الرئيسية">
          <FaArrowRight size={18} />
        </Link>
        <select
          className="flex-1 md:flex-none p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          value={currentBookIdx}
          onChange={(e) => {
            setCurrentBookIdx(Number(e.target.value));
            setCurrentChapterIdx(0);
          }}
        >
          {bibleData.map((book, idx) => (
            <option key={`book-opt-${idx}`} value={idx}>
              {book.name}
            </option>
          ))}
        </select>

        <select
          className="w-5 p-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
          value={currentChapterIdx}
          onChange={(e) => setCurrentChapterIdx(Number(e.target.value))}
        >
          {activeBook.chapters.map((_, idx) => (
            <option key={`ch-opt-${idx}`} value={idx}>
              {idx + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-0.5 mt-0.5 px-0.5 z-20 justify-around">
        <button onClick={() => setFontSize(prev => prev + 2)} className="p-0.5 bg-cyan-200 text-on-surface text-xl rounded-lg font-bold">A+</button>
        <button onClick={() => setFontSize(prev => prev - 2)} className="p-0.5 bg-cyan-200 text-on-surface text-sm rounded-lg font-bold">A-</button>

        <Link href="/bible/favorites" className="p-0.5 bg-yellow-100 text-yellow-600 rounded-lg font-bold flex items-center" title="المفضلة">
          <FaStar size={18} />
        </Link>

        <Link href="/bible/day" className="p-0.5 bg-amber-200 text-blue-600 rounded-lg font-bold flex items-center" title="إضافة إلى يوم">
          <FaPlusSquare size={18} />
        </Link>

        <button onClick={() => setIsSearchOpen(true)} className="p-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center">
          <FaSearch size={18} />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isAudioLoading}
          className={`flex-1 sm:flex-none flex items-center gap-0.5 p-0.5 rounded-full font-bold transition-all disabled:opacity-50 text-sm
          ${isPlaying ? 'bg-red-600 text-white' : 'bg-blue-600 text-white shadow-md hover:shadow-lg'}`}
        >
          {isAudioLoading ? <FaSpinner size={18} className="animate-spin" /> : isPlaying ? <FaStop size={18} /> : <FaPlay size={18} />}
          {isAudioLoading ? "جاري التحضير..." : isPlaying ? "إيقاف" : "استمع"}
        </button>
      </div>
    </header>
  );
}
