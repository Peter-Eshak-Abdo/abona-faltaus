"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaShareAlt, FaStar, FaPlay, FaStop, FaSearch, FaTimes, FaHeart } from "react-icons/fa";
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
  const [favorites, setFavorites] = useState<{ bIdx: number, cIdx: number, vNum: number }[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const isInitialized = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  let synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  const tips = [
    "هذا الإصدار يعمل بالكامل بدون إنترنت بعد التحميل الأول.",
    "يمكنك الضغط مطولاً على الآية لمشاركتها مع أصدقائك.",
    "جرب خاصية البحث السريع للوصول لأي آية في ثوانٍ.",
    "يتم حفظ آخر مكان قرأت فيه تلقائياً لتعود إليه لاحقاً.",
    "يمكنك إضافة الآيات التي لمست قلبك إلى قائمة المفضلة."
  ];

  // تحديث النصائح كل 2.5 ثانية
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // 1. دالة موحدة لتحميل البيانات (تبحث أوفلاين أولاً ثم أونلاين)
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        setLoadProgress(0);
        setLoadingStatus("جاري فحص البيانات المحفوظة...");

        // الخطوة الأولى: محاولة التحميل من ذاكرة الجهاز (LocalForage)
        let data = await localforage.getItem<BookObj[]>("offline_bible_data");

        if (!data || data.length === 0) {
          // الخطوة الثانية: لو مفيش داتا، حمل من Supabase باستخدام الدالة الجديدة
          setLoadingStatus("جاري تحميل الكتاب المقدس (لأول مرة)...");

          // استدعاء الدالة مع الـ Progress
          const data = await loadBible((p) => setLoadProgress(p));

          // حفظ البيانات في الجهاز للأبد
          await localforage.setItem("offline_bible_data", data);
        } else {
          // لو الداتا موجودة أصلاً، خلي الـ Progress 100% فوراً
          setLoadProgress(100);
        }

        setBibleData(data || []);

        // استرجاع آخر مكان قراءة
        const lastRead = localStorage.getItem("bible_last_read");
        if (lastRead && data) {
          const { bIdx, cIdx } = JSON.parse(lastRead);
          if (data[bIdx]?.chapters[cIdx]) {
            setCurrentBookIdx(bIdx);
            setCurrentChapterIdx(cIdx);
          }
        }

        // تحميل المفضلة
        const favs = await localforage.getItem<any[]>("bible_favorites");
        if (favs) setFavorites(favs);

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

  // حفظ آخر قراءة وإلغاء التحديد عند تغيير الإصحاح
  useEffect(() => {
    if (isInitialized.current && bibleData.length > 0) {
      localStorage.setItem("bible_last_read", JSON.stringify({ bIdx: currentBookIdx, cIdx: currentChapterIdx }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSelectedVerses([]); // مسح التحديد
      if (!isPlaying) stopAudio();
    }
  }, [currentBookIdx, currentChapterIdx]);

  // دالة الشواهد الذكية (حسب طلبك بالظبط)
  const formatCitation = () => {
    const activeBook = bibleData[currentBookIdx];
    const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
    const chapterNum = currentChapterIdx + 1;

    // ترتيب الأرقام تصاعدياً
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    let blocks: number[][] = [];
    let temp = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        temp.push(sorted[i]); // لو متتاليين ضيفهم في نفس البلوك
      } else {
        blocks.push(temp);
        temp = [sorted[i]];
      }
    }
    if (temp.length > 0) blocks.push(temp);

    const parts = blocks.map(b => {
      if (b.length >= 3) return `${b[0]}-${b[b.length - 1]}`; // مت 3 : 5-9
      if (b.length === 2) return `${b[1]}،${b[0]}`; // مت 3 : 6،5
      return `${b[0]}`; // مت 3 : 5
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
    setSelectedVerses([]); // إخفاء بعد النسخ
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "آيات من موثع ابونا فلتاؤس تفاحة", text: getSelectedText() });
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
        // إزالة من المفضلة
        newFavs = newFavs.filter(f => !(f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === vNum));
        removedFavs.push(vNum);
      } else {
        // إضافة للمفضلة
        newFavs.push({ bIdx: currentBookIdx, cIdx: currentChapterIdx, vNum });
        if (userId) {
          addedFavs.push({ book_idx: currentBookIdx, chapter_idx: currentChapterIdx, verse_num: vNum, user_id: userId });
        }
      }
    });

    setFavorites(newFavs);
    await localforage.setItem("bible_favorites", newFavs); // حفظ أوفلاين
    setSelectedVerses([]); // إخفاء التحديد

    // مزامنة مع Supabase لو فيه نت وهو مسجل دخول
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

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };

  // القراءة الصوتية للإصحاح بالكامل
  const toggleAudio = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
    } else {
      const activeBook = bibleData[currentBookIdx];
      const activeChapter = activeBook.chapters[currentChapterIdx];

      let textToRead = `${activeBook.name}، الإصحَاحُ ${currentChapterIdx + 1}. `;
      textToRead += activeChapter.map(v => v.text_vocalized).join(". ");

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "ar-SA";
      // محاولة اختيار صوت جوجل لو متاح
      const voices = synth.getVoices();
      const arabicVoice = voices.find(v => v.lang.includes("ar") && v.name.includes("Google"));
      if (arabicVoice) utterance.voice = arabicVoice;

      utterance.onend = () => setIsPlaying(false);
      synth.speak(utterance);
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    // if (synth) synth.cancel();
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // دوال التنقل (السابق والتالي)
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

  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    // touchStartX = e.targetTouches[0].clientX;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartPos.current.x - touchEndX;
    const diffY = Math.abs(touchStartPos.current.y - touchEndY);

    // لو الحركة الأفقية أكبر من 70 والحركة الرأسية صغيرة (عشان نفرق بين السوايب والـ Scroll)
    if (Math.abs(diffX) > 70 && diffY < 50) {
      if (diffX > 0) handlePrevChapter(); // سحب يسار -> تالي
      else handleNextChapter(); // سحب يمين -> سابق
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-1 z-[100]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center space-y-1"
        >
          {/* أيقونة أو لوجو بسيط */}
          <div className="text-6xl mb-1">📖</div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">جاري مزامنة الكتاب المقدس</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">يتم الآن تجهيز نسخة الأوفلاين الخاصة بك...</p>
          </div>

          {/* Progres Bar */}
          <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border dark:border-zinc-700">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-700"
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-bold text-blue-600">{loadProgress}%</span>

          {/* مميزات التطبيق (Tips) */}
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
      {/* شريط التحكم العلوي (Sticky) */}
      <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-1 shadow-sm flex flex-wrap gap-1 items-center justify-between">

        <div className="flex gap-1 w-full md:w-auto">
          {/* اختيار السفر */}
          <select
            className="flex-1 md:flex-none p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={currentBookIdx}
            onChange={(e) => {
              setCurrentBookIdx(Number(e.target.value));
              setCurrentChapterIdx(0); // لما يغير السفر نرجعه للإصحاح الأول
            }}
          >
            {bibleData.map((book, idx) => (
              <option key={`book-opt-${idx}`} value={idx}>
                {book.name}
              </option>
            ))}
          </select>

          {/* اختيار الإصحاح */}
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

        {/* 1. أزرار التحكم في الخط فوق الآيات */}
        <div className="flex justify-center gap-1 mb-1">
          <button onClick={() => setFontSize(prev => prev + 2)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">A+</button>
          <button onClick={() => setFontSize(prev => prev - 2)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">A-</button>
          <Link href="/bible/favorites" className="p-1 bg-yellow-100 text-yellow-600 rounded-lg font-bold" title="المفضلة">
            <FaStar size={10} />
          </Link>
          <button onClick={() => setIsSearchOpen(true)} className="p-1 bg-blue-100 text-blue-600 rounded-lg font-bold">
            <FaSearch size={10} />
          </button>
        <button
          onClick={toggleAudio}
          className={`mx-auto flex items-center gap-1 p-1 rounded-full font-bold transition-all ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
        >
          {isPlaying ? <FaStop /> : <FaPlay />}
          {isPlaying ? "ايقاف القراءة" : "استماع للاصحاح"}
        </button>
        </div>
      </div>

      {/* منطقة عرض الآيات */}
      {/* <div className="max-w-7xl mx-auto p-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}> */}
        {/* <h1 className="text-3xl font-extrabold text-center mb-1 text-blue-800 dark:text-blue-400">
          {activeBook.name} - الإصحاح {currentChapterIdx + 1}
        </h1> */}
      {/* </div> */}

      <div className="space-y-0 text-xl md:text-2xl leading-loose font-arabic px-1 max-w-8xl mx-auto" style={{ fontSize: `${fontSize}px` }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {activeChapter.length > 0 ? (
          activeChapter.map((verseObj, index) => {
            const uniqueKey = `book-${currentBookIdx}-ch-${currentChapterIdx}-v-${verseObj.verse}-${index}`;
            const isSelected = selectedVerses.includes(verseObj.verse);
            const isFav = favorites.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === verseObj.verse);
            return (
              <div key={uniqueKey} id={`verse-${verseObj.verse}`} onClick={() => toggleVerseSelection(verseObj.verse)} className={`flex gap-0.5 rounded-lg cursor-pointer transition-all duration-200
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

      {/* الـ Floating Action Bar عند تحديد الآيات */}
      <AnimatePresence>
        {selectedVerses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-2 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 bg-white dark:bg-zinc-800 shadow-2xl rounded-2xl p-1 border border-zinc-200 dark:border-zinc-700 z-50 flex gap-1"
          >
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
      <BibleSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        bibleData={bibleData}
        onGoToVerse={(bIdx, cIdx, vNum) => {
          setCurrentBookIdx(bIdx);
          setCurrentChapterIdx(cIdx);
          setIsSearchOpen(false);
          // عمل Scroll ناعم للآية بعد ثانية عشان يلحق يعمل Render
          setTimeout(() => {
            document.getElementById(`verse-${vNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            toggleVerseSelection(vNum); // نعلم عليها عشان يلاحظها
          }, 500);
        }}
      />
    </div >
  );
}
