"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaShareAlt, FaStar, FaPlay, FaStop, FaSearch, FaTimes, FaHeart, FaSpinner, FaPlusSquare } from "react-icons/fa";
import { bookNames, shortBookNames } from "@/lib/books";
import BibleSearch from "@/components/BibleSearch";
import Link from "next/link";
import { loadBible } from "@/lib/bible-utils";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleReaderPage() {
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
  const touchStartPos = useRef({ x: 0, y: 0 });

  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [searchResults, setSearchResults] = useState<
    { bookIndex: number; chapterIndex: number; verseNumber: number; text: string; bookName: string; chapterNum: number }[]
  >([]);

  // حالات خاصة بالإضافة إلى يوم
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayCodeInput, setDayCodeInput] = useState("");
  const [isAddingToDay, setIsAddingToDay] = useState(false);
  const [dayMessage, setDayMessage] = useState("");

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
      }, 2500);
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

        if (!data || data.length === 0) {
          setLoadingStatus("جاري تحميل الكتاب المقدس (لأول مرة)...");
          const data = await loadBible((p) => setLoadProgress(p));
          await localforage.setItem("offline_bible_data", data);
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

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let searchPredicate: (text: string) => boolean;

    if (lowerCaseSearchTerm.startsWith('^')) {
      const actualTerm = lowerCaseSearchTerm.substring(1);
      searchPredicate = (text) => text.toLowerCase().startsWith(actualTerm);
    } else if (lowerCaseSearchTerm.endsWith('$')) {
      const actualTerm = lowerCaseSearchTerm.slice(0, -1);
      searchPredicate = (text) => text.toLowerCase().endsWith(actualTerm);
    } else {
      searchPredicate = (text) => text.toLowerCase().includes(lowerCaseSearchTerm);
    }

    const results: { bookIndex: number; chapterIndex: number; verseNumber: number; text: string; bookName: string; chapterNum: number }[] = [];
    bibleData.forEach((book, bookIdx) => {
      book.chapters.forEach((chapter, chapterIdx) => {
        chapter.forEach((verseObj, verseIdx) => {
          if (searchPredicate(verseObj.text_plain)) {
            results.push({
              bookIndex: bookIdx,
              chapterIndex: chapterIdx,
              verseNumber: verseObj.verse,
              text: verseObj.text_plain,
              bookName: book.name,
              chapterNum: chapterIdx + 1,
            });
          }
        });
      });
    });
    setSearchResults(results);
  };

  const handleSelectSearchResult = (bookIdx: number, chapterIdx: number, verseNumber: number) => {
    setCurrentBookIdx(bookIdx);
    setCurrentChapterIdx(chapterIdx);
    setIsSearchOpen(false);

    setTimeout(() => {
      toggleVerseSelection(verseNumber);
      const verseKey = `${bookIdx}-${chapterIdx}-${verseNumber}`;
      const verseElement = verseRefs.current[verseKey];

      if (verseElement) {
        verseElement.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        document.getElementById(`verse-${verseNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  };

  const formatCitation = () => {
    const activeBook = bibleData[currentBookIdx];
    const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
    const chapterNum = currentChapterIdx + 1;

    const sorted = [...selectedVerses].sort((a, b) => a - b);
    let blocks: number[][] = [];
    let temp = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        temp.push(sorted[i]);
      } else {
        blocks.push(temp);
        temp = [sorted[i]];
      }
    }
    if (temp.length > 0) blocks.push(temp);

    const parts = blocks.map(b => {
      if (b.length >= 3) return `${b[0]}-${b[b.length - 1]}`;
      if (b.length === 2) return `${b[1]}،${b[0]}`;
      return `${b[0]}`;
    });

    return `(${shortName} ${chapterNum} : ${parts.join(" ، ")})`;
  };

  const getSelectedText = () => {
    const activeChapter = bibleData[currentBookIdx].chapters[currentChapterIdx];
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const textArr = sortedVerses.map(vNum => {
      const vObj = activeChapter.find(v => v.verse === vNum);
      return vObj ? `(${vNum}) ${vObj.text_vocalized}` : "";
    });
    return `${textArr.join(" ")}\n${formatCitation()}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSelectedText());
    setSelectedVerses([]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "آيات من موقع ابونا فلتاؤس تفاحة", text: getSelectedText() });
    } else {
      handleCopy();
      alert("تم النسخ للحافظة!");
    }
  };

  const toggleFavorite = async () => {
    let newFavs = [...favorites];
    let addedFavs: { book_idx: number; chapter_idx: number; verse_num: number; user_id?: string }[] = [];
    let removedFavs: any[] = [];

    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    selectedVerses.forEach(vNum => {
      const exists = newFavs.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === vNum);

      if (exists) {
        newFavs = newFavs.filter(f => !(f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === vNum));
        removedFavs.push(vNum);
      } else {
        newFavs.push({ bIdx: currentBookIdx, cIdx: currentChapterIdx, vNum });
        if (userId) {
          addedFavs.push({ book_idx: currentBookIdx, chapter_idx: currentChapterIdx, verse_num: vNum, user_id: userId });
        }
      }
    });

    setFavorites(newFavs);
    await localforage.setItem("bible_favorites", newFavs);
    setSelectedVerses([]);

    if (userId) {
      if (addedFavs.length > 0) {
        await supabase.from("bible_favorites").upsert(addedFavs, { onConflict: 'user_id, book_idx, chapter_idx, verse_num' });
      }
      for (const vNum of removedFavs) {
        await supabase.from("bible_favorites")
          .delete()
          .match({ book_idx: currentBookIdx, chapter_idx: currentChapterIdx, verse_num: vNum, user_id: userId });
      }
    }
  }

  const handleAddToDay = async () => {
    if (!dayCodeInput || dayCodeInput.length !== 12) {
      setDayMessage("يرجى إدخال كود صحيح مكون من 12 رقم");
      return;
    }

    setIsAddingToDay(true);
    setDayMessage("");

    try {
      const { data: dayData, error: fetchError } = await supabase
        .from('meeting_days')
        .select('verses')
        .eq('code', dayCodeInput)
        .single();

      if (fetchError || !dayData) {
        setDayMessage("لم يتم العثور على يوم بهذا الكود");
        setIsAddingToDay(false);
        return;
      }

      const activeBook = bibleData[currentBookIdx];
      const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
      const chapterNum = currentChapterIdx + 1;
      const activeChapter = activeBook.chapters[currentChapterIdx];

      const newVerses = selectedVerses.sort((a, b) => a - b).map(vNum => {
        const vObj = activeChapter.find(v => v.verse === vNum);
        return {
          id: Math.random().toString(36).substring(2, 11),
          text: vObj?.text_vocalized || "",
          ref: `${shortName} ${chapterNum}:${vNum}`,
          wordsConfig: {}
        };
      });

      const updatedVerses = [...(dayData.verses || []), ...newVerses];

      const { error: updateError } = await supabase
        .from('meeting_days')
        .update({ verses: updatedVerses })
        .eq('code', dayCodeInput);

      if (updateError) throw updateError;

      localStorage.setItem("last_day_code", dayCodeInput);
      setDayMessage("تمت الإضافة بنجاح!");
      setTimeout(() => {
        setIsDayModalOpen(false);
        setDayMessage("");
        setSelectedVerses([]);
      }, 1500);

    } catch (error) {
      console.error(error);
      setDayMessage("حدث خطأ أثناء الإضافة");
    }
    setIsAddingToDay(false);
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };

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
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-1 z-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-1"
        >
          <div className="text-6xl mb-1">📖</div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">جاري مزامنة الكتاب المقدس</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">يتم الآن تجهيز نسخة الأوفلاين الخاصة بك...</p>
          </div>

          <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border dark:border-zinc-700">
            <motion.div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-blue-700"
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-bold text-blue-600">{loadProgress}%</span>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-arabic leading-relaxed text-zinc-700 dark:text-zinc-300"
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-xs text-zinc-400">هذه العملية تحدث مرة واحدة فقط</p>
        </motion.div>
      </div>
    );
  }

  if (!bibleData.length) return null;

  const activeBook = bibleData[currentBookIdx];
  const activeChapter = activeBook.chapters[currentChapterIdx] || [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-1 text-zinc-900 dark:text-zinc-100">
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-1 shadow-sm flex flex-wrap gap-1 items-center justify-between">

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
      </div>

      <div className="space-y-0 text-xl md:text-2xl leading-loose font-arabic px-1 max-w-8xl mx-auto" style={{ fontSize: `${fontSize}px` }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {activeChapter.length > 0 ? (
          activeChapter.map((verseObj, index) => {
            const uniqueKey = `book-${currentBookIdx}-ch-${currentChapterIdx}-v-${verseObj.verse}-${index}`;
            const isSelected = selectedVerses.includes(verseObj.verse);
            const isFav = favorites.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === verseObj.verse);
            return (
              <div
                key={uniqueKey}
                id={`verse-${verseObj.verse}`}
                ref={(el) => { verseRefs.current[`${currentBookIdx}-${currentChapterIdx}-${verseObj.verse}`] = el }}
                onClick={() => toggleVerseSelection(verseObj.verse)}
                className={`flex gap-0.5 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-blue-100 dark:bg-blue-900 shadow-md transform scale-[1.01]' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                ${isFav ? 'bg-yellow-500/10 border-r-4 border-yellow-500 shadow-md' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
              `}>
                <span className={`font-bold shrink-0 select-none ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'} ${isFav ? 'text-yellow-600' : 'text-blue-600'}`}>
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

      <AnimatePresence>
        {selectedVerses.length > 0 && !isDayModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-2 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 bg-white dark:bg-zinc-800 shadow-2xl rounded-2xl p-1 border border-zinc-200 dark:border-zinc-700 z-50 flex gap-1"
          >
            <button onClick={() => setIsDayModalOpen(true)} className="flex flex-col items-center p-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaPlusSquare size={10} />
              <span className="text-sm font-bold mt-1">يوم</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaShareAlt size={10} />
              <span className="text-sm font-bold mt-1">مشاركة</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center p-1 text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaCopy size={10} />
              <span className="text-sm font-bold mt-1">نسخ</span>
            </button>
            <button onClick={toggleFavorite} className="flex flex-col items-center p-1 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaStar size={10} />
              <span className="text-sm font-bold mt-1">مفضلة</span>
            </button>
            <div className="w-[1px] bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
            <button onClick={() => setSelectedVerses([])} className="flex flex-col items-center p-1 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaTimes size={10} />
              <span className="text-sm font-bold mt-1">إلغاء</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDayModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-1 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-1 text-center">إضافة الآيات ليوم</h3>
              <p className="text-sm text-zinc-500 mb-1 text-center">أدخل كود اليوم المكون من 12 رقم لإضافة الآيات إليه.</p>

              <input
                type="text"
                maxLength={12}
                value={dayCodeInput}
                onChange={e => setDayCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="مثال: 123456789012"
                className="w-full p-1 border rounded-xl text-center tracking-[0.2em] font-bold text-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500 mb-1"
                dir="ltr"
              />

              {dayMessage && <p className="text-center text-sm font-bold text-red-500 mb-1">{dayMessage}</p>}

              <div className="flex gap-1">
                <button
                  onClick={handleAddToDay}
                  disabled={isAddingToDay || dayCodeInput.length !== 12}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded-xl transition disabled:opacity-50"
                >
                  {isAddingToDay ? "جاري الإضافة..." : "إضافة الآن"}
                </button>
                <button
                  onClick={() => setIsDayModalOpen(false)}
                  className="flex-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold py-1 rounded-xl transition"
                >
                  إلغاء
                </button>
              </div>
              <div className="mt-1 text-center">
                <Link href="/bible/day" className="text-blue-600 text-sm font-bold underline">
                  لا تملك كود؟ أنشئ يوم جديد من هنا
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BibleSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        bibleData={bibleData}
        onGoToVerse={handleSelectSearchResult}
      />
    </div>
  );
}
