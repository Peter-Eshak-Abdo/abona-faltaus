"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaShareAlt, FaStar, FaPlay, FaStop, FaSearch, FaTimes, FaHeart } from "react-icons/fa";
import { shortBookNames } from "@/lib/books";
import BibleSearch from "@/components/BibleSearch";
import Link from "next/link";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

// دالة توحيد الحروف العربية للبحث
const normalizeArabic = (text: string) => {
  return text
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[\u064B-\u065F\u0640]/g, "") // إزالة التشكيل
    .toLowerCase();
};

export default function BibleReaderPage() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // States الجديدة
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<{ bIdx: number, cIdx: number, vNum: number }[]>([]);

  const isInitialized = useRef(false);
  let synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  // 1. تحميل البيانات
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      let data = await localforage.getItem<BookObj[]>("offline_bible_data");
      if (!data || data.length === 0) {
        const res = await fetch("/api/bible-sync");
        data = await res.json();
        await localforage.setItem("offline_bible_data", data);
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

      // تحميل المفضلة
      const favs = await localforage.getItem<any[]>("bible_favorites");
      if (favs) setFavorites(favs);

      setIsLoading(false);
      isInitialized.current = true;
    };
    initData();
  }, []);

  // 2. حفظ آخر قراءة وإلغاء التحديد عند تغيير الإصحاح
  useEffect(() => {
    if (isInitialized.current && bibleData.length > 0) {
      localStorage.setItem("bible_last_read", JSON.stringify({ bIdx: currentBookIdx, cIdx: currentChapterIdx }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      setSelectedVerses([]); // مسح التحديد
      stopAudio(); // وقف الصوت لو شغال
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
      navigator.share({ title: "آيات من الكتاب المقدس", text: getSelectedText() });
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
    if (!synth) return;
    if (isPlaying) {
      stopAudio();
    } else {
      const activeBook = bibleData[currentBookIdx];
      const activeChapter = activeBook.chapters[currentChapterIdx];

      let textToRead = `${activeBook.name}، الإصحَاحُ ${currentChapterIdx + 1}. `;
      textToRead += activeChapter.map(v => v.text_vocalized).join(". ");

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "ar-SA"; // لاختيار أفضل صوت عربي
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
    if (synth) synth.cancel();
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
    touchStartX = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 70) handleNextChapter(); // سحب شمال -> التالي
    if (touchEndX - touchStartX > 70) handlePrevChapter(); // سحب يمين -> السابق
  };

  if (isLoading) return <div className="p-8 text-center">جاري التحميل...</div>;
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
              <option key={book.abbrev + idx} value={idx}>
                {book.name}
              </option>
            ))}
          </select>

          {/* اختيار الإصحاح */}
          <select
            className="w-24 p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={currentChapterIdx}
            onChange={(e) => setCurrentChapterIdx(Number(e.target.value))}
          >
            {activeBook.chapters.map((_, idx) => (
              <option key={idx} value={idx}>
                إصحاح {idx + 1}
              </option>
            ))}
          </select>
        </div>

        {/* 1. أزرار التحكم في الخط فوق الآيات */}
        <div className="flex justify-center gap-1 mb-1">
          <button onClick={() => setFontSize(prev => prev + 2)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">A+</button>
          <button onClick={() => setFontSize(prev => prev - 2)} className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded">A-</button>
        </div>
        <Link href="/bible/favorites" className="p-1 bg-yellow-100 text-yellow-600 rounded-lg font-bold" title="المفضلة">
          <FaStar size={10} />
        </Link>
        <button onClick={() => setIsSearchOpen(true)} className="p-1 bg-blue-100 text-blue-600 rounded-lg font-bold">
          <FaSearch size={10} />
        </button>
      </div>

      {/* منطقة عرض الآيات */}
      <div className="max-w-7xl mx-auto p-0.5" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        <h1 className="text-3xl font-extrabold text-center mb-1 text-blue-800 dark:text-blue-400">
          {activeBook.name} - الإصحاح {currentChapterIdx + 1}
        </h1>
        <button
          onClick={toggleAudio}
          className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
        >
          {isPlaying ? <FaStop /> : <FaPlay />}
          {isPlaying ? "إيقاف القراءة" : "استماع للإصحاح"}
        </button>
      </div>

      <div className="space-y-0 text-xl md:text-2xl leading-loose font-arabic" style={{ fontSize: `${fontSize}px` }}>
        {activeChapter.length > 0 ? (
          activeChapter.map((verseObj) => {
            const isSelected = selectedVerses.includes(verseObj.verse);
            const isFav = favorites.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === verseObj.verse);
            return (
              <div key={verseObj.verse} id={`verse-${verseObj.verse}`} onClick={() => toggleVerseSelection(verseObj.verse)} className={`flex gap-0.5 rounded-lg cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-blue-100 dark:bg-blue-900 shadow-md transform scale-[1.01]' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
              `}>
                <span className={`font-bold shrink-0 select-none ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'}`}>
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 bg-white dark:bg-zinc-800 shadow-2xl rounded-2xl p-1 border border-zinc-200 dark:border-zinc-700 z-50 flex gap-1"
          >
            <button onClick={handleShare} className="flex flex-col items-center p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaShareAlt size={10} />
              <span className="text-[10px] font-bold mt-1">مشاركة</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center p-1 text-green-600 hover:bg-green-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaCopy size={10} />
              <span className="text-[10px] font-bold mt-1">نسخ</span>
            </button>
            <button onClick={toggleFavorite} className="flex flex-col items-center p-1 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaStar size={10} />
              <span className="text-[10px] font-bold mt-1">مفضلة</span>
            </button>
            <div className="w-[1px] bg-zinc-300 dark:bg-zinc-600 mx-1"></div>
            <button onClick={() => setSelectedVerses([])} className="flex flex-col items-center p-1 text-red-500 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-xl transition">
              <FaTimes size={10} />
              <span className="text-[10px] font-bold mt-1">إلغاء</span>
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
          }, 300);
        }}
      />
    </div >
  );
}
