"use client";
import Link from "next/link";
import { FaPlay, FaStop, FaSearch, FaStar, FaPlusSquare, FaSpinner } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { loadBible } from "@/lib/bible-utils";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function ReadingControlsHeader() {

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
    <header className="sticky top-6 bg-surface-container-low/95 backdrop-blur-xl z-30 px-1 py-0.5 flex items-center justify-between border-b border-surface-variant/30" >
      <div className="flex gap-1 w-full md:w-auto">
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

      <div className="flex justify-center flex-wrap gap-0.5 mt-1 px-1 z-20">
        <button onClick={() => setFontSize(prev => prev + 2)} className="px-0.5 py-0.5 bg-surface-container text-on-surface rounded-lg font-bold">A+</button>
        <button onClick={() => setFontSize(prev => prev - 2)} className="px-0.5 py-0.5 bg-surface-container text-on-surface rounded-lg font-bold">A-</button>

        <Link href="/bible/favorites" className="px-0.5 py-0.5 bg-yellow-100 text-yellow-600 rounded-lg font-bold flex items-center justify-center" title="المفضلة">
          <FaStar size={18} />
        </Link>

        <Link href="/bible/day" className="px-0.5 py-0.5 bg-amber-200 text-blue-600 rounded-lg font-bold flex items-center justify-center" title="إضافة إلى يوم">
          <FaPlusSquare size={18} />
        </Link>

        <button onClick={() => setIsSearchOpen(true)} className="px-0.5 py-0.5 bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center justify-center">
          <FaSearch size={18} />
        </button>

        <button
          onClick={toggleAudio}
          disabled={isAudioLoading}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-0.5 px-0.5 py-0.5 rounded-full font-bold transition-all disabled:opacity-50
          ${isPlaying ? 'bg-red-600 text-white' : 'bg-blue-600 text-white shadow-md hover:shadow-lg'}`}
        >
          {isAudioLoading ? <FaSpinner size={18} className="animate-spin" /> : isPlaying ? <FaStop size={18} /> : <FaPlay size={18} />}
          {isAudioLoading ? "جاري التحضير..." : isPlaying ? "إيقاف القراءة" : "استماع للاصحاح"}
        </button>
      </div>
    </header>
  );
}
