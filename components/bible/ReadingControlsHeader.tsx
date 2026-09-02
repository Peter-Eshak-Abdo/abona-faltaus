"use client";
import Link from "next/link";
import { FaPlay, FaStop, FaSearch, FaStar, FaPlusSquare, FaSpinner, FaArrowRight } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { useTranslations } from "next-intl";
import type { BookObj, VerseObj } from "@/lib/bible-utils";

type ReadingControlsHeaderProps = {
  bibleData: BookObj[];
  currentBookIdx: number;
  setCurrentBookIdx: (idx: number) => void;
  currentChapterIdx: number;
  setCurrentChapterIdx: (idx: number) => void;
  fontSize: number;
  setFontSize: (fn: (prev: number) => number) => void;
  setIsSearchOpen: (open: boolean) => void;
  language?: "ar" | "cop";
  onLanguageChange?: (lang: "ar" | "cop") => void;
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
  language = "ar",
  onLanguageChange,
}: ReadingControlsHeaderProps) {
  const t = useTranslations('Bible');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
  };

  useEffect(() => {
    stopAudio();
  }, [currentBookIdx, currentChapterIdx]);

  const toggleAudio = async () => {
    if (isPlaying || isAudioLoading) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);

    const activeBook = bibleData[currentBookIdx];
    const activeChapter = activeBook?.chapters?.[currentChapterIdx] || [];
    let textToRead = `${activeBook?.name || ""}، ${t('chapter')} ${currentChapterIdx + 1}. `;
    textToRead += activeChapter.map(v => v.text_vocalized).join(". ");

    const cacheKey = `audio_offline_${currentBookIdx}_${currentChapterIdx}`;

    try {
      let audioBlob = await localforage.getItem<Blob>(cacheKey);

      if (!audioBlob) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToRead }),
        });

        if (!response.ok) {
          throw new Error('TTS server unavailable');
        }

        audioBlob = await response.blob();
        await localforage.setItem(cacheKey, audioBlob);
      }

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Server TTS failed, falling back to Web Speech API...", err);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = "ar-EG";

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith("ar"));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => stopAudio();

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } else {
        alert(t('audioNotSupported'));
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

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
        {onLanguageChange && (
          <div className="flex bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => onLanguageChange("ar")}
              className={`px-1.5 py-0.5 rounded-md transition ${language === "ar" ? "bg-blue-600 text-white shadow" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              عربي
            </button>
            <button
              onClick={() => onLanguageChange("cop")}
              className={`px-1.5 py-0.5 rounded-md transition ${language === "cop" ? "bg-amber-600 text-white shadow" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              ⲘⲉⲧⲢⲉⲙⲛ̀ⲭⲏⲙⲓ (قبطي)
            </button>
          </div>
        )}

        <button onClick={() => setFontSize(prev => prev + 2)} className="p-0.5 bg-cyan-200 text-on-surface text-xl rounded-lg font-bold">A+</button>
        <button onClick={() => setFontSize(prev => prev - 2)} className="p-0.5 bg-cyan-200 text-on-surface text-sm rounded-lg font-bold">A-</button>

        <Link href="/bible/favorites" className="p-0.5 bg-yellow-100 text-yellow-600 rounded-lg font-bold flex items-center" title={t('favorites')}>
          <FaStar size={18} />
        </Link>

        <Link href="/bible/day" className="p-0.5 bg-amber-200 text-blue-600 rounded-lg font-bold flex items-center" title={t('addToDay')}>
          <FaPlusSquare size={18} />
        </Link>

        <button onClick={() => setIsSearchOpen(true)} className="p-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center" title={t('searchBtn')}>
          <FaSearch size={18} />
        </button>

        <button
          onClick={toggleAudio}
          disabled={isAudioLoading}
          className={`flex-1 sm:flex-none flex items-center gap-0.5 p-0.5 rounded-full font-bold transition-all disabled:opacity-50 text-sm
          ${isPlaying ? 'bg-red-600 text-white' : 'bg-blue-600 text-white shadow-md hover:shadow-lg'}`}
        >
          {isAudioLoading ? <FaSpinner size={18} className="animate-spin" /> : isPlaying ? <FaStop size={18} /> : <FaPlay size={18} />}
          {isAudioLoading ? t('listening') : isPlaying ? t('stop') : t('listen')}
        </button>
      </div>
    </header>
  );
}
