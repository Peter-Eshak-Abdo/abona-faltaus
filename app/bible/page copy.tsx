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

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayCodeInput, setDayCodeInput] = useState("");
  const [isAddingToDay, setIsAddingToDay] = useState(false);
  const [dayMessage, setDayMessage] = useState("");

  const tips = [
    // "هذا الإصدار يعمل بالكامل بدون إنترنت بعد التحميل الأول.",
    "يمكنك الضغط مطولاً على الآية لمشاركتها مع أصدقائك.",
    "جرب خاصية البحث السريع للوصول لأي آية في ثوانٍ.",
    "يتم حفظ آخر مكان قرأت فيه تلقائياً لتعود إليه لاحقاً.",
    "يمكنك إضافة الآيات التي لمست قلبك إلى قائمة المفضلة.",
    // "الصوت يعمل بدون إنترنت للمرات القادمة بمجرد استماعه لأول مرة!"
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
      }, 3500);
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
  };

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
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-1 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-1"
        >
          <div className="text-6xl mb-1">📖</div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">جاري مزامنة الكتاب المقدس</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">{loadingStatus}</p>
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
      </div>
    // <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-1 text-zinc-900 dark:text-zinc-100">
    //   <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-1 shadow-sm flex flex-wrap gap-1 items-center justify-between">

    //     <div className="flex gap-1 w-full md:w-auto">
    //       <select
    //         className="flex-1 md:flex-none p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
    //         value={currentBookIdx}
    //         onChange={(e) => {
    //           setCurrentBookIdx(Number(e.target.value));
    //           setCurrentChapterIdx(0);
    //         }}
    //       >
    //         {bibleData.map((book, idx) => (
    //           <option key={`book-opt-${idx}`} value={idx}>
    //             {book.name}
    //           </option>
    //         ))}
    //       </select>
    //       <select
    //         className="w-8 p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
    //         value={currentChapterIdx}
    //         onChange={(e) => setCurrentChapterIdx(Number(e.target.value))}
    //       >
    //         {activeBook.chapters.map((_, idx) => (
    //           <option key={`ch-opt-${idx}`} value={idx}>
    //             إصحاح {idx + 1}
    //           </option>
    //         ))}
    //       </select>
    //     </div>
        // <header
        //   className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-md shadow-[0_4px_20px_rgba(31,31,31,0.04)]">
        //   <div className="h-20 w-full px-1 flex items-center justify-between">
        //     <div className="flex items-center gap-1"><img alt="Logo" className="h-10 w-auto object-contain"
        //       src="https://lh3.googleusercontent.com/aida/AP1WRLuvvpt5WZuH9UmkRJl_yg9q_9zEkdEI8BIKQW7hKxDszaEfF0LZHmTklSnUwaLWzL4JXFcWxwxJhideKh1nNrbvMGQsW4kR75MJGV-8jpaENyoiAQmE4wqOmuhhcyzlkKsBpxMyvJHhH1xKiuWVRY5dDk5elYRzNgG8wVTYVtCD0170avoGLgMevSDsMOh9dedlm71KKKLksRqHpme51g_zvAjngMn6rzAclvvepyaxf9JmklWW9OtKxJI" /><span
        //         className="font-headline-md text-headline-md text-primary hidden sm:block">Abouna Faltaous</span></div>
        //     <nav className="hidden lg:flex items-center gap-1 px-1"
        //       data-active-classNamees="text-primary font-bold bg-primary-fixed/30 rounded-full px-1 py-1"><a
        //         className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all"
        //         data-path="home" href="#">Home</a><a aria-current="page"
        //           className="transition-all text-primary font-bold bg-primary-fixed/30 rounded-full px-1 py-0.5" data-path="bible"
        //           href="#">الكتاب المقدس</a><a
        //             className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all"
        //             data-path="hymns" href="#">الألحان</a><a
        //               className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all"
        //               data-path="chat" href="#">الشات بوت</a></nav>
        //     <div className="flex items-center gap-1 lg:gap-1">
        //       <div className="relative hidden md:flex items-center"><span
        //         className="material-symbols-outlined absolute right-1 text-on-surface-variant">search</span><input
        //           className="bg-surface-container-low border-none rounded-full py-0.5 pr-2 pl-1 w-12 lg:w-16 focus:ring-1 focus:ring-primary transition-all text-body-md font-body-md"
        //           placeholder="بحث..." type="text" /></div>
        //       <div className="flex items-center gap-1"><button
        //         className="w-2 h-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"><span
        //           className="material-symbols-outlined">notifications</span></button>
        //         <div className="w-2 h-2 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        //           <span className="material-symbols-outlined text-on-primary text-[20px]">person</span></div>
        //       //       </div>
        //     </div>
        //   </div>
        // </header>
        // <main className="w-full pt-20">
        //   <div className="flex flex-col w-full h-full relative" id="bible-app">
        //     <div className="flex flex-col md:flex-row w-full flex-grow relative bg-surface-container-low min-h-[calc(100vh-160px)]">
        //       {/* Left Sidebar: Book Navigation */}
        //       <aside className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0 bg-surface border-l border-surface-variant flex flex-col z-10 shadow-lg shadow-surface-variant/20 sticky top-20 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
        //         <div className="p-6 sticky top-0 bg-surface/90 backdrop-blur-md z-20 pb-4">
        //           <div className="flex items-center justify-between mb-6">
        //             <h2 className="font-title-lg text-title-lg text-on-surface">الأسفار</h2>
        //             <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
        //               <span className="material-symbols-outlined">filter_list</span>
        //             </button>
        //           </div>

        //           <div className="flex rounded-full bg-surface-container p-1 mb-6">
        //             <button
        //               className="flex-1 py-2 px-4 rounded-full font-label-sm text-label-sm bg-primary text-on-primary shadow-sm transition-all"
        //               onClick={() => toggleTestament('old')}
        //             >
        //               العهد القديم
        //             </button>
        //             <button
        //               className="flex-1 py-2 px-4 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all"
        //               onClick={() => toggleTestament('new')}
        //             >
        //               العهد الجديد
        //             </button>
        //           </div>

        //           <div className="relative mb-2">
        //             <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        //             <input
        //               className="w-full bg-surface-container rounded-xl py-3 pr-12 pl-4 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
        //               placeholder="بحث في السفر..."
        //               type="text"
        //             />
        //           </div>
        //         </div>

        //         <div className="px-4 pb-20 flex flex-col gap-2" id="books-list">
        //           <div className="group relative rounded-xl hover:bg-primary-container/10 transition-colors p-3 cursor-pointer active-book bg-primary-container text-on-primary-container">
        //             <div className="flex items-center gap-4">
        //               <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center shadow-sm text-primary">
        //                 <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
        //               </div>
        //               <div className="flex flex-col flex-grow">
        //                 <span className="font-headline-md-mobile text-headline-md-mobile">التكوين</span>
        //                 <span className="font-label-sm text-label-sm opacity-80">50 إصحاح</span>
        //               </div>
        //               <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_left</span>
        //             </div>
        //           </div>

        //           <div className="group relative rounded-xl hover:bg-surface-container transition-colors p-3 cursor-pointer">
        //             <div className="flex items-center gap-4">
        //               <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shadow-sm text-on-surface-variant">
        //                 <span className="material-symbols-outlined">directions_walk</span>
        //               </div>
        //               <div className="flex flex-col flex-grow">
        //                 <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface">الخروج</span>
        //                 <span className="font-label-sm text-label-sm text-on-surface-variant">40 إصحاح</span>
        //               </div>
        //             </div>
        //           </div>

        //           <div className="group relative rounded-xl hover:bg-surface-container transition-colors p-3 cursor-pointer">
        //             <div className="flex items-center gap-4">
        //               <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shadow-sm text-on-surface-variant">
        //                 <span className="material-symbols-outlined">temple_hindu</span>
        //               </div>
        //               <div className="flex flex-col flex-grow">
        //                 <span className="font-headline-md-mobile text-headline-md-mobile text-on-surface">اللاويين</span>
        //                 <span className="font-label-sm text-label-sm text-on-surface-variant">27 إصحاح</span>
        //               </div>
        //             </div>
        //           </div>

        //           <div className="h-24 hidden md:block"></div>
        //         </div>
        //       </aside>

        //       {/* Right Content: Reading Canvas */}
        //       <section className="flex-grow flex flex-col relative max-w-4xl mx-auto w-full">
        //         <header className="sticky top-0 bg-surface-container-low/95 backdrop-blur-xl z-30 px-6 py-4 flex items-center justify-between border-b border-surface-variant/30">
        //           <div className="flex items-center gap-3">
        //             <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm">
        //               <span className="material-symbols-outlined">menu</span>
        //             </button>
        //             <div className="flex flex-col">
        //               <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">التكوين ١</h1>
        //               <span className="font-label-sm text-label-sm text-on-surface-variant">بَدْءُ الْخَلِيقَةِ</span>
        //             </div>
        //           </div>

        //           <div className="flex items-center gap-2">
        //             <div className="hidden sm:flex bg-surface rounded-full p-1 shadow-sm">
        //               <button className="p-2 rounded-full bg-secondary-container text-on-secondary-container" id="btn-verse-view" onClick={() => toggleView('verse')} title="عرض آيات">
        //                 <span className="material-symbols-outlined text-[20px]">format_list_numbered_rtl</span>
        //               </button>
        //               <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container" id="btn-para-view" onClick={() => toggleView('para')} title="عرض فقرات">
        //                 <span className="material-symbols-outlined text-[20px]">format_align_right</span>
        //               </button>
        //             </div>

        //             <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors relative group">
        //               <span className="material-symbols-outlined">settings</span>
        //               <div className="absolute top-12 left-0 w-64 bg-surface rounded-2xl shadow-xl p-4 hidden group-hover:flex flex-col gap-4 border border-surface-variant/30">
        //                 <div className="flex flex-col gap-2">
        //                   <span className="font-label-sm text-label-sm text-on-surface-variant px-2">حجم الخط</span>
        //                   <input
        //                     className="w-full accent-primary"
        //                     id="font-size-slider"
        //                     max="32"
        //                     min="16"
        //                     type="range"
        //                     value={fontSize}
        //                     onChange={(e) => setFontSize(Number(e.target.value))}
        //                   />
        //                 </div>
        //                 <div className="flex flex-col gap-2">
        //                   <span className="font-label-sm text-label-sm text-on-surface-variant px-2">تباعد الأسطر</span>
        //                   <div className="flex justify-between px-2 gap-2">
        //                     <button className="flex-1 py-1 bg-surface-container rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors" onClick={() => setLineHeight('1.5')}>
        //                       <span className="material-symbols-outlined text-[16px]">density_small</span>
        //                     </button>
        //                     <button className="flex-1 py-1 bg-primary text-on-primary rounded-md shadow-sm" onClick={() => setLineHeight('1.8')}>
        //                       <span className="material-symbols-outlined text-[16px]">density_medium</span>
        //                     </button>
        //                     <button className="flex-1 py-1 bg-surface-container rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors" onClick={() => setLineHeight('2.2')}>
        //                       <span className="material-symbols-outlined text-[16px]">density_large</span>
        //                     </button>
        //                   </div>
        //                 </div>
        //               </div>
        //             </button>
        //           </div>
        //         </header>

        //         {/* Integrated Controls */}
        //         <div className="flex justify-center flex-wrap gap-2 mt-4 px-4 z-20">
        //           <button onClick={() => setFontSize(prev => prev + 2)} className="p-2 px-3 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors">A+</button>
        //           <button onClick={() => setFontSize(prev => prev - 2)} className="p-2 px-3 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors">A-</button>

        //           <Link href="/bible/favorites" className="p-2 px-3 bg-yellow-100 text-yellow-600 rounded-lg font-bold flex items-center justify-center" title="المفضلة">
        //             <FaStar size={16} />
        //           </Link>

        //           <Link href="/bible/day" className="p-2 px-3 bg-amber-200 text-blue-600 rounded-lg font-bold flex items-center justify-center" title="إضافة إلى يوم">
        //             <FaPlusSquare size={16} />
        //           </Link>

        //           <button onClick={() => setIsSearchOpen(true)} className="p-2 px-3 bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center justify-center">
        //             <FaSearch size={16} />
        //           </button>

        //           <button
        //             onClick={toggleAudio}
        //             disabled={isAudioLoading}
        //             className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold transition-all disabled:opacity-50
        //         ${isPlaying ? 'bg-error text-on-error' : 'bg-primary text-on-primary shadow-md hover:shadow-lg'}`}
        //           >
        //             {isAudioLoading ? (
        //               <FaSpinner size={14} className="animate-spin" />
        //             ) : isPlaying ? (
        //               <FaStop size={14} />
        //             ) : (
        //               <FaPlay size={14} />
        //             )}
        //             {isAudioLoading ? "جاري التحضير..." : isPlaying ? "إيقاف القراءة" : "استماع للاصحاح"}
        //           </button>
        //         </div>

        //         {isTTSLoading && (
        //           <div className="mx-4 mt-3 flex flex-col items-center justify-center p-3 bg-primary-container/20 border border-primary/20 rounded-xl">
        //             <div className="flex items-center gap-2">
        //               <svg className="w-4 h-4 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        //               </svg>
        //               <span className="text-sm font-medium text-primary">
        //                 {ttsLoadingMessage}
        //               </span>
        //             </div>
        //             <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
        //               <div className="bg-primary h-1.5 rounded-full animate-pulse w-full"></div>
        //             </div>
        //           </div>
        //         )}

        //         {/* Reading Content Canvas */}
        //         <article
        //           className="p-6 md:p-12 pb-32 flex flex-col gap-6 font-title-lg text-title-lg text-on-surface transition-all duration-300"
        //           id="reading-canvas"
        //           style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        //           onTouchStart={handleTouchStart}
        //           onTouchEnd={handleTouchEnd}
        //         >
        //           {activeChapter.length > 0 ? (
        //             activeChapter.map((verseObj, index) => {
        //               const uniqueKey = `book-${currentBookIdx}-ch-${currentChapterIdx}-v-${verseObj.verse}-${index}`;
        //               const isSelected = selectedVerses.includes(verseObj.verse);
        //               const isFav = favorites.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === verseObj.verse);

        //               return (
        //                 <div
        //                   key={uniqueKey}
        //                   id={`verse-${verseObj.verse}`}
        //                   ref={(el) => { verseRefs.current[`${currentBookIdx}-${currentChapterIdx}-${verseObj.verse}`] = el }}
        //                   onClick={() => toggleVerseSelection(verseObj.verse)}
        //                   className={`verse-container group relative p-4 -mx-4 rounded-2xl transition-all duration-200 cursor-pointer flex gap-4 items-start
        //                 ${isSelected ? 'bg-secondary-container/20 shadow-[inset_4px_0_0_#fed65b] scale-[1.01]' : 'hover:bg-surface'}
        //                 ${isFav ? 'bg-yellow-500/10 border-r-4 border-yellow-500 shadow-sm' : ''}
        //               `}
        //                 >
        //                   <span className={`inline-block font-bold text-sm shrink-0 select-none ${isSelected ? 'text-primary' : 'text-primary'} ${isFav ? 'text-yellow-600' : ''}`}>
        //                     {verseObj.verse}
        //                     {isFav && <FaHeart className="inline ml-1 text-red-500 text-xs" />}
        //                   </span>
        //                   <span className={`verse-text text-justify font-arabic selection:bg-secondary-fixed selection:text-on-secondary-fixed flex-grow ${isSelected ? 'text-on-surface font-semibold' : 'text-on-surface'}`}>
        //                     {verseObj.text_vocalized}
        //                   </span>
        //                 </div>
        //               );
        //             })
        //           ) : (
        //             <p className="text-center text-on-surface-variant/60">لا توجد آيات في هذا الإصحاح.</p>
        //           )}

        //           <div className="flex justify-center my-8 opacity-30">
        //             <span className="material-symbols-outlined text-primary text-[32px]">cruelty_free</span>
        //           </div>
        //         </article>
        //       </section>
        //     </div>
        //   </div>

        //   {/* Floating Selection Toolbar */}
        //   <AnimatePresence>
        //     {selectedVerses.length > 0 && !isDayModalOpen && (
        //       <motion.div
        //         initial={{ opacity: 0, y: 50, scale: 0.9 }}
        //         animate={{ opacity: 1, y: 0, scale: 1 }}
        //         exit={{ opacity: 0, y: 50, scale: 0.9 }}
        //         className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl z-50 flex items-center gap-1 origin-bottom border border-white/10"
        //       >
        //         <button onClick={() => setIsDayModalOpen(true)} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
        //           <FaPlusSquare size={18} />
        //           <span className="text-[11px] font-bold mt-1.5">يوم</span>
        //         </button>
        //         <button onClick={handleShare} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
        //           <FaShareAlt size={18} />
        //           <span className="text-[11px] font-bold mt-1.5">مشاركة</span>
        //         </button>
        //         <button onClick={handleCopy} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
        //           <FaCopy size={18} />
        //           <span className="text-[11px] font-bold mt-1.5">نسخ</span>
        //         </button>
        //         <button onClick={toggleFavorite} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-yellow-400 hover:bg-white/10 transition-colors">
        //           <FaStar size={18} />
        //           <span className="text-[11px] font-bold mt-1.5">مفضلة</span>
        //         </button>
        //         <div className="w-[1px] h-10 bg-white/20 mx-1"></div>
        //         <button onClick={() => setSelectedVerses([])} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-red-400 hover:bg-white/10 transition-colors">
        //           <FaTimes size={18} />
        //           <span className="text-[11px] font-bold mt-1.5">إلغاء</span>
        //         </button>
        //       </motion.div>
        //     )}
        //   </AnimatePresence>

        //   {/* Day Modal */}
        //   <AnimatePresence>
        //     {isDayModalOpen && (
        //       <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
        //         <motion.div
        //           initial={{ opacity: 0, scale: 0.9 }}
        //           animate={{ opacity: 1, scale: 1 }}
        //           exit={{ opacity: 0, scale: 0.9 }}
        //           className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-variant/30"
        //         >
        //           <h3 className="text-xl font-bold mb-2 text-center text-on-surface">إضافة الآيات ليوم</h3>
        //           <p className="text-sm text-on-surface-variant mb-6 text-center">أدخل كود اليوم المكون من 12 رقم لإضافة الآيات إليه.</p>

        //           <input
        //             type="text"
        //             maxLength={12}
        //             value={dayCodeInput}
        //             onChange={e => setDayCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
        //             placeholder="مثال: 123456789012"
        //             className="w-full p-4 border border-surface-variant rounded-xl text-center tracking-[0.2em] font-bold text-lg bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-on-surface mb-4"
        //             dir="ltr"
        //           />

        //           {dayMessage && <p className="text-center text-sm font-bold text-primary mb-4">{dayMessage}</p>}

        //           <div className="flex gap-3">
        //             <button
        //               onClick={handleAddToDay}
        //               disabled={isAddingToDay || dayCodeInput.length !== 12}
        //               className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        //             >
        //               {isAddingToDay ? "جاري الإضافة..." : "إضافة الآن"}
        //             </button>
        //             <button
        //               onClick={() => setIsDayModalOpen(false)}
        //               className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 rounded-xl transition-colors"
        //             >
        //               إلغاء
        //             </button>
        //           </div>
        //           <div className="mt-4 text-center">
        //             <Link href="/bible/day" className="text-primary text-sm font-bold hover:underline">
        //               لا تملك كود؟ أنشئ يوم جديد من هنا
        //             </Link>
        //           </div>
        //         </motion.div>
        //       </div>
        //     )}
        //   </AnimatePresence>

        //   <BibleSearch
        //     isOpen={isSearchOpen}
        //     onClose={() => setIsSearchOpen(false)}
        //     bibleData={bibleData}
        //     onGoToVerse={handleSelectSearchResult}
        //   />

        //   {/* Synced Audio Player Bar */}
        //   <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-variant shadow-[0_-8px_30px_rgba(31,31,31,0.08)] transform translate-y-0 transition-transform duration-300" id="audio-player">
        //     <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-8">
        //       <div className="flex items-center gap-4 w-full md:w-auto justify-center">
        //         <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
        //           <span className="material-symbols-outlined">replay_10</span>
        //         </button>
        //         <button onClick={toggleAudio} className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all">
        //           {isPlaying ? (
        //             <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
        //           ) : (
        //             <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
        //           )}
        //         </button>
        //         <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
        //           <span className="material-symbols-outlined">forward_10</span>
        //         </button>
        //       </div>
        //       <div className="flex-grow flex items-center gap-4 w-full">
        //         <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-left">0:00</span>
        //         <div className="flex-grow relative h-2 bg-surface-container-high rounded-full cursor-pointer group">
        //           <div className="absolute right-0 top-0 h-full bg-primary rounded-full w-0 relative">
        //             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
        //           </div>
        //         </div>
        //         <span className="font-label-sm text-label-sm text-on-surface-variant w-10">0:00</span>
        //       </div>
        //       <div className="hidden md:flex items-center gap-2">
        //         <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" title="سرعة القراءة">
        //           <span className="font-label-sm font-bold">1x</span>
        //         </button>
        //         <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
        //           <span className="material-symbols-outlined">volume_up</span>
        //         </button>
        //       </div>
        //     </div>
        //   </div>
        // </main>
        {/* <div className="flex justify-center gap-0.5 mb-1">
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
            className="fixed bottom-1 left-1/2 -translate-x-1/2 md:left-1 md:translate-x-0 bg-white dark:bg-zinc-800 shadow-2xl rounded-2xl p-0.5 border border-zinc-200 dark:border-zinc-700 z-50 flex gap-0.5"
          >
            <button onClick={() => setIsDayModalOpen(true)} className="flex flex-col items-center p-0.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaPlusSquare size={12} />
              <span className="text-sm font-bold mt-0.5">يوم</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center p-0.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaShareAlt size={12} />
              <span className="text-sm font-bold mt-0.5">مشاركة</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center p-0.5 text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaCopy size={12} />
              <span className="text-sm font-bold mt-0.5">نسخ</span>
            </button>
            <button onClick={toggleFavorite} className="flex flex-col items-center p-0.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaStar size={12} />
              <span className="text-sm font-bold mt-0.5">مفضلة</span>
            </button>
            <div className="w-[1px] bg-zinc-300 dark:bg-zinc-600 mx-0.5"></div>
            <button onClick={() => setSelectedVerses([])} className="flex flex-col items-center p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaTimes size={12} />
              <span className="text-sm font-bold mt-0.5">إلغاء</span>
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

              {dayMessage && <p className="text-center text-sm font-bold text-green-400 mb-1">{dayMessage}</p>}

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
    </div> */}
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-1 text-zinc-900 dark:text-zinc-100">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/70 backdrop-blur-md shadow-[0_4px_20px_rgba(31,31,31,0.04)]">
        <div className="h-20 w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="Logo"
              className="h-10 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuvvpt5WZuH9UmkRJl_yg9q_9zEkdEI8BIKQW7hKxDszaEfF0LZHmTklSnUwaLWzL4JXFcWxwxJhideKh1nNrbvMGQsW4kR75MJGV-8jpaENyoiAQmE4wqOmuhhcyzlkKsBpxMyvJHhH1xKiuWVRY5dDk5elYRzNgG8wVTYVtCD0170avoGLgMevSDsMOh9dedlm71KKKLksRqHpme51g_zvAjngMn6rzAclvvepyaxf9JmklWW9OtKxJI"
            />
            <span className="font-headline-md text-headline-md text-primary hidden sm:block">Abouna Faltaous</span>
          </div>

          <nav className="hidden lg:flex items-center gap-2 px-2" data-active-classes="text-primary font-bold bg-primary-fixed/30 rounded-full px-3 py-1">
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-3 py-1" href="#">Home</Link>
            <Link aria-current="page" className="transition-all text-primary font-bold bg-primary-fixed/30 rounded-full px-3 py-1" href="#">الكتاب المقدس</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-3 py-1" href="#">الألحان</Link>
            <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all px-3 py-1" href="#">الشات بوت</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <span className="material-symbols-outlined absolute right-3 text-on-surface-variant">search</span>
              <input
                className="bg-surface-container-low border-none rounded-full py-2 pr-10 pl-4 w-36 lg:w-48 focus:ring-1 focus:ring-primary transition-all text-body-md font-body-md text-on-surface"
                placeholder="بحث..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-on-primary text-[20px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Header Selection Bar */}
      <div className="sticky top-20 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-3 shadow-sm flex flex-wrap gap-2 items-center justify-between mt-20">
        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:flex-none p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
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
            className="w-32 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
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
      </div>

      <main className="w-full pt-4">
        <div className="flex flex-col w-full h-full relative" id="bible-app">
          <div className="flex flex-col md:flex-row w-full flex-grow relative bg-surface-container-low min-h-[calc(100vh-160px)]">
            {/* Left Sidebar: Book Navigation */}
            <aside className="w-full md:w-[320px] lg:w-[400px] flex-shrink-0 bg-surface border-l border-surface-variant flex flex-col z-10 shadow-lg shadow-surface-variant/20 sticky top-36 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
              <div className="p-6 sticky top-0 bg-surface/90 backdrop-blur-md z-20 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-title-lg text-title-lg text-on-surface">الأسفار</h2>
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant">
                    <span className="material-symbols-outlined">filter_list</span>
                  </button>
                </div>

                <div className="flex rounded-full bg-surface-container p-1 mb-6">
                  <button
                    className="flex-1 py-2 px-4 rounded-full font-label-sm text-label-sm bg-primary text-on-primary shadow-sm transition-all"
                    onClick={() => toggleTestament('old')}
                  >
                    العهد القديم
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-full font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all"
                    onClick={() => toggleTestament('new')}
                  >
                    العهد الجديد
                  </button>
                </div>

                <div className="relative mb-2">
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    className="w-full bg-surface-container rounded-xl py-3 pr-12 pl-4 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="بحث في السفر..."
                    type="text"
                  />
                </div>
              </div>

              <div className="px-4 pb-20 flex flex-col gap-2" id="books-list">
                <div className="group relative rounded-xl hover:bg-primary-container/10 transition-colors p-3 cursor-pointer active-book bg-primary-container text-on-primary-container">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center shadow-sm text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <span className="font-headline-md-mobile text-headline-md-mobile">التكوين</span>
                      <span className="font-label-sm text-label-sm opacity-80">50 إصحاح</span>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">chevron_left</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Content: Reading Canvas */}
            <section className="flex-grow flex flex-col relative max-w-4xl mx-auto w-full">
              <header className="sticky top-36 bg-surface-container-low/95 backdrop-blur-xl z-30 px-6 py-4 flex items-center justify-between border-b border-surface-variant/30">
                <div className="flex items-center gap-3">
                  <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm">
                    <span className="material-symbols-outlined">menu</span>
                  </button>
                  <div className="flex flex-col">
                    <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">التكوين ١</h1>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">بَدْءُ الْخَلِيقَةِ</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex bg-surface rounded-full p-1 shadow-sm">
                    <button className="p-2 rounded-full bg-secondary-container text-on-secondary-container" id="btn-verse-view" onClick={() => toggleView('verse')} title="عرض آيات">
                      <span className="material-symbols-outlined text-[20px]">format_list_numbered_rtl</span>
                    </button>
                    <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container" id="btn-para-view" onClick={() => toggleView('para')} title="عرض فقرات">
                      <span className="material-symbols-outlined text-[20px]">format_align_right</span>
                    </button>
                  </div>

                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface text-on-surface-variant shadow-sm hover:bg-surface-container transition-colors relative group">
                    <span className="material-symbols-outlined">settings</span>
                    <div className="absolute top-12 left-0 w-64 bg-surface rounded-2xl shadow-xl p-4 hidden group-hover:flex flex-col gap-4 border border-surface-variant/30">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-sm text-label-sm text-on-surface-variant px-2">حجم الخط</span>
                        <input
                          className="w-full accent-primary"
                          id="font-size-slider"
                          max="32"
                          min="16"
                          type="range"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="font-label-sm text-label-sm text-on-surface-variant px-2">تباعد الأسطر</span>
                        <div className="flex justify-between px-2 gap-2">
                          <button className="flex-1 py-1 bg-surface-container rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors" onClick={() => setLineHeight('1.5')}>
                            <span className="material-symbols-outlined text-[16px]">density_small</span>
                          </button>
                          <button className="flex-1 py-1 bg-primary text-on-primary rounded-md shadow-sm" onClick={() => setLineHeight('1.8')}>
                            <span className="material-symbols-outlined text-[16px]">density_medium</span>
                          </button>
                          <button className="flex-1 py-1 bg-surface-container rounded-md hover:bg-primary-container hover:text-on-primary-container transition-colors" onClick={() => setLineHeight('2.2')}>
                            <span className="material-symbols-outlined text-[16px]">density_large</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </header>

              {/* Integrated Controls */}
              <div className="flex justify-center flex-wrap gap-2 mt-4 px-4 z-20">
                <button onClick={() => setFontSize(prev => prev + 2)} className="p-2 px-3 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors">A+</button>
                <button onClick={() => setFontSize(prev => prev - 2)} className="p-2 px-3 bg-surface-container text-on-surface rounded-lg font-bold hover:bg-surface-container-high transition-colors">A-</button>

                <Link href="/bible/favorites" className="p-2 px-3 bg-yellow-100 text-yellow-600 rounded-lg font-bold flex items-center justify-center" title="المفضلة">
                  <FaStar size={16} />
                </Link>

                <Link href="/bible/day" className="p-2 px-3 bg-amber-200 text-blue-600 rounded-lg font-bold flex items-center justify-center" title="إضافة إلى يوم">
                  <FaPlusSquare size={16} />
                </Link>

                <button onClick={() => setIsSearchOpen(true)} className="p-2 px-3 bg-blue-100 text-blue-600 rounded-lg font-bold flex items-center justify-center">
                  <FaSearch size={16} />
                </button>

                <button
                  onClick={toggleAudio}
                  disabled={isAudioLoading}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-full font-bold transition-all disabled:opacity-50
                  ${isPlaying ? 'bg-error text-on-error' : 'bg-primary text-on-primary shadow-md hover:shadow-lg'}`}
                >
                  {isAudioLoading ? (
                    <FaSpinner size={14} className="animate-spin" />
                  ) : isPlaying ? (
                    <FaStop size={14} />
                  ) : (
                    <FaPlay size={14} />
                  )}
                  {isAudioLoading ? "جاري التحضير..." : isPlaying ? "إيقاف القراءة" : "استماع للاصحاح"}
                </button>
              </div>

              {isTTSLoading && (
                <div className="mx-4 mt-3 flex flex-col items-center justify-center p-3 bg-primary-container/20 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      {ttsLoadingMessage}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full animate-pulse w-full"></div>
                  </div>
                </div>
              )}

              {/* Reading Content Canvas */}
              <article
                className="p-6 md:p-12 pb-32 flex flex-col gap-6 font-title-lg text-title-lg text-on-surface transition-all duration-300"
                id="reading-canvas"
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight || 1.8 }}
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
                        ref={(el) => { verseRefs.current[`${currentBookIdx}-${currentChapterIdx}-${verseObj.verse}`] = el }}
                        onClick={() => toggleVerseSelection(verseObj.verse)}
                        className={`verse-container group relative p-4 -mx-4 rounded-2xl transition-all duration-200 cursor-pointer flex gap-4 items-start
                          ${isSelected ? 'bg-secondary-container/20 shadow-[inset_4px_0_0_#fed65b] scale-[1.01]' : 'hover:bg-surface'}
                          ${isFav ? 'bg-yellow-500/10 border-r-4 border-yellow-500 shadow-sm' : ''}
                        `}
                      >
                        <span className={`inline-block font-bold text-sm shrink-0 select-none ${isSelected ? 'text-primary' : 'text-primary'} ${isFav ? 'text-yellow-600' : ''}`}>
                          {verseObj.verse}
                          {isFav && <FaHeart className="inline ml-1 text-red-500 text-xs" />}
                        </span>
                        <span className={`verse-text text-justify font-arabic selection:bg-secondary-fixed selection:text-on-secondary-fixed flex-grow ${isSelected ? 'text-on-surface font-semibold' : 'text-on-surface'}`}>
                          {verseObj.text_vocalized}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-on-surface-variant/60">لا توجد آيات في هذا الإصحاح.</p>
                )}

                <div className="flex justify-center my-8 opacity-30">
                  <span className="material-symbols-outlined text-primary text-[32px]">cruelty_free</span>
                </div>
              </article>
            </section>
          </div>
        </div>

        {/* Floating Selection Toolbar */}
        <AnimatePresence>
          {selectedVerses.length > 0 && !isDayModalOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface/95 backdrop-blur-xl p-2 rounded-2xl shadow-2xl z-50 flex items-center gap-1 origin-bottom border border-white/10"
            >
              <button onClick={() => setIsDayModalOpen(true)} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
                <FaPlusSquare size={18} />
                <span className="text-[11px] font-bold mt-1.5">يوم</span>
              </button>
              <button onClick={handleShare} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
                <FaShareAlt size={18} />
                <span className="text-[11px] font-bold mt-1.5">مشاركة</span>
              </button>
              <button onClick={handleCopy} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
                <FaCopy size={18} />
                <span className="text-[11px] font-bold mt-1.5">نسخ</span>
              </button>
              <button onClick={toggleFavorite} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-yellow-400 hover:bg-white/10 transition-colors">
                <FaStar size={18} />
                <span className="text-[11px] font-bold mt-1.5">مفضلة</span>
              </button>
              <div className="w-[1px] h-10 bg-white/20 mx-1"></div>
              <button onClick={() => setSelectedVerses([])} className="w-14 h-14 flex flex-col items-center justify-center rounded-xl text-red-400 hover:bg-white/10 transition-colors">
                <FaTimes size={18} />
                <span className="text-[11px] font-bold mt-1.5">إلغاء</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Modal */}
        <AnimatePresence>
          {isDayModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-variant/30"
              >
                <h3 className="text-xl font-bold mb-2 text-center text-on-surface">إضافة الآيات ليوم</h3>
                <p className="text-sm text-on-surface-variant mb-6 text-center">أدخل كود اليوم المكون من 12 رقم لإضافة الآيات إليه.</p>

                <input
                  type="text"
                  maxLength={12}
                  value={dayCodeInput}
                  onChange={e => setDayCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="مثال: 123456789012"
                  className="w-full p-4 border border-surface-variant rounded-xl text-center tracking-[0.2em] font-bold text-lg bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-on-surface mb-4"
                  dir="ltr"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToDay}
                    disabled={isAddingToDay || dayCodeInput.length !== 12}
                    className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isAddingToDay ? "جاري الإضافة..." : "إضافة الآن"}
                  </button>
                  <button
                    onClick={() => setIsDayModalOpen(false)}
                    className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <Link href="/bible/day" className="text-primary text-sm font-bold hover:underline">
                    لا تملك كود؟ أنشئ يوم جديد من هنا
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Synced Audio Player Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-variant shadow-[0_-8px_30px_rgba(31,31,31,0.08)] transform translate-y-0 transition-transform duration-300" id="audio-player">
          <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4 w-full md:w-auto justify-center">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">replay_10</span>
              </button>
              <button onClick={toggleAudio} className="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                {isPlaying ? (
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
                ) : (
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                )}
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">forward_10</span>
              </button>
            </div>
            <div className="flex-grow flex items-center gap-4 w-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-left">0:00</span>
              <div className="flex-grow relative h-2 bg-surface-container-high rounded-full cursor-pointer group">
                <div className="absolute right-0 top-0 h-full bg-primary rounded-full w-0 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant w-10">0:00</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" title="سرعة القراءة">
                <span className="font-label-sm font-bold">1x</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">volume_up</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
