"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {  FaStar, FaPlay, FaStop, FaSearch, FaSpinner, FaPlusSquare } from "react-icons/fa";
import localforage from "localforage";
import { loadBible } from "@/lib/bible-utils";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleSidebar() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("جاري الاتصال بالسيرفر...");
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isBrowserFallback, setIsBrowserFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [ttsLoadingMessage, setTtsLoadingMessage] = useState("");
  const [favorites, setFavorites] = useState<{ bIdx: number, cIdx: number, vNum: number }[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const isInitialized = useRef(false);
  const [dayCodeInput, setDayCodeInput] = useState("");

  const tips = [
    "هذا الإصدار يعمل بالكامل بدون إنترنت بعد التحميل الأول.",
    "يمكنك الضغط مطولاً على الآية لمشاركتها مع أصدقائك.",
    "جرب خاصية البحث السريع للوصول لأي آية في ثوانٍ.",
    "يتم حفظ آخر مكان قرأت فيه تلقائياً لتعود إليه لاحقاً.",
    "يمكنك إضافة الآيات التي لمست قلبك إلى قائمة المفضلة.",
    "الصوت يعمل بدون إنترنت للمرات القادمة بمجرد استماعه لأول مرة!"
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        setLoadProgress(0);
        setLoadingStatus("جاري فحص البيانات المحفوظة...");

        let data = await localforage.getItem<BookObj[]>("offline_bible_data");
        let shouldRefresh = false;

        if (!data || data.length === 0) {
          setLoadingStatus("جاري تحميل الكتاب المقدس (لأول مرة)...");
          const data = await loadBible((p) => setLoadProgress(p));
          await localforage.setItem("offline_bible_data", data);
          shouldRefresh = true;
        } else {
          setLoadProgress(100);
        }

        setBibleData(data || []);

        const lastRead = localStorage.getItem("bible_last_read");
        if (lastRead && data) {
          const { bIdx, cIdx } = JSON.parse(lastRead);
          if (data[bIdx]?.chapters[cIdx]) {
            setCurrentBookIdx(bIdx);
            setCurrentChapterIdx(cIdx);
          }
        }

        const favs = await localforage.getItem<any[]>("bible_favorites");
        if (favs) setFavorites(favs);

        const savedDayCode = localStorage.getItem("last_day_code");
        if (savedDayCode) setDayCodeInput(savedDayCode);

        setIsLoading(false);
        isInitialized.current = true;

        if (shouldRefresh) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        setLoadingStatus("حدث خطأ، يرجى التأكد من الإنترنت وإعادة المحاولة.");
      }
    };

    initData();
  }, []);

  useEffect(() => {
    const savedSize = localStorage.getItem("bible_font_size");
    if (savedSize) {
      setFontSize(parseInt(savedSize));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bible_font_size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    if (isInitialized.current && bibleData.length > 0) {
      localStorage.setItem("bible_last_read", JSON.stringify({ bIdx: currentBookIdx, cIdx: currentChapterIdx }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSelectedVerses([]);
      stopAudio();
    }
  }, [currentBookIdx, currentChapterIdx, bibleData.length]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
    setIsBrowserFallback(false);
  };

  const toggleAudio = async () => {
    if (isPlaying || isAudioLoading) {
      stopAudio();
      setIsTTSLoading(false);
      return;
    }

    setIsAudioLoading(true);

    const cacheKey = `audio_offline_${currentBookIdx}_${currentChapterIdx}`;

    const activeBook = bibleData[currentBookIdx];
    const activeChapter = activeBook.chapters[currentChapterIdx];
    let textToRead = `${activeBook.name}، الإصحَاحُ ${currentChapterIdx + 1}. `;
    textToRead += activeChapter.map(v => v.text_vocalized).join(". ");

    try {
      let audioBlob = await localforage.getItem<Blob>(cacheKey);

      if (!audioBlob) {
        setIsTTSLoading(true);
        setTtsLoadingMessage("جاري تجهيز الملف الصوتي لأول مرة... قد يستغرق بضع ثوانٍ (سيعمل لاحقاً بدون إنترنت)");

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToRead }),
        });

        if (!response.ok) {
          throw new Error('السيرفر غير متاح أو الخدمة متوقفة');
        }

        audioBlob = await response.blob();
        await localforage.setItem(cacheKey, audioBlob);
      }

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsTTSLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
      setIsPlaying(true);
      setIsTTSLoading(false);

    } catch (error) {
      setIsTTSLoading(false);
      console.warn('Network TTS failed, triggering Level 3 Offline Fallback (Web Speech API)...', error);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ar-EG';

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onend = () => {
          setIsPlaying(false);
          setIsBrowserFallback(false);
        };

        utterance.onerror = () => {
          stopAudio();
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsBrowserFallback(true);
      } else {
        alert("نظام قراءة النصوص غير مدعوم على هذا الجهاز بالكامل بالوضع الحالي.");
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  if (!bibleData.length) return null;

  const activeBook = bibleData[currentBookIdx];

  return (
    <aside className="w-auto shrink-0 bg-surface border-l border-surface-variant flex flex-col z-10 shadow-lg shadow-surface-variant/20 sticky top-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar p-0.5 h-min">

      <div className="flex gap-1 w-full md:w-auto">
          <select
            className="flex-1 md:flex-none p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="w-8 p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={currentChapterIdx}
            onChange={(e) => setCurrentChapterIdx(Number(e.target.value))}
          >
            {activeBook.chapters.map((_, idx) => (
              <option key={`ch-opt-${idx}`} value={idx}>
                إصحاح {idx + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center gap-0.5 mb-1">
          <button onClick={() => setFontSize(prev => prev + 2)} className="p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">A+</button>
          <button onClick={() => setFontSize(prev => prev - 2)} className="p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">A-</button>
          <Link href="/bible/favorites" className="p-0.5 bg-yellow-100 text-yellow-600 rounded-lg font-bold" title="المفضلة">
            <FaStar size={8} />
          </Link>
          <Link href="/bible/day" className="text-blue-600 bg-amber-200 text-sm rounded-lg font-bold p-0.5" title="إضافة إلى يوم">
            <FaPlusSquare size={8} />
          </Link>
          <button onClick={() => setIsSearchOpen(true)} className="p-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold">
            <FaSearch size={8} />
          </button>

          <button
            onClick={toggleAudio}
            disabled={isAudioLoading}
            className={`mx-auto flex items-center gap-0.5 p-0.5 rounded-full font-bold transition-all disabled:opacity-50
              ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
          >
            {isAudioLoading ? (
              <FaSpinner size={8} className="animate-spin" />
            ) : isPlaying ? (
                <FaStop size={8} />
            ) : (
                  <FaPlay size={8} />
            )}
            {isAudioLoading ? "جاري التحضير..." : isPlaying ? "إيقاف القراءة" : "استماع للاصحاح"}
          </button>
        </div>
        {isTTSLoading && (
          <div className="flex flex-col items-center justify-center p-1 my-1 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/30 dark:border-blue-800">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-600 animate-spin dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {ttsLoadingMessage}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1 dark:bg-blue-700 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        )}
    </aside>
  );
}
