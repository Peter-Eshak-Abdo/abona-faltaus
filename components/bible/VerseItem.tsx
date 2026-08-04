"use client";
import { FaHeart } from "react-icons/fa";
import { useState, useRef,useEffect } from "react";
//-----------------------------------------------------
import localforage from "localforage";
import { loadBible } from "@/lib/bible-utils";


type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function VerseItem() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(24);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<{ bIdx: number, cIdx: number, vNum: number }[]>([]);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  //--------------------------------------------------------------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("جاري الاتصال بالسيرفر...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isBrowserFallback, setIsBrowserFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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

//--------------------------------------------------------------------------------------------------------------------------
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

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };

  if (!bibleData || bibleData.length === 0) null;

  const activeChapter = bibleData[currentBookIdx]?.chapters?.[currentChapterIdx] || [];
  return (
    <div className="space-y-0 text-xl md:text-2xl top-3 leading-loose font-arabic px-1 max-w-8xl mx-auto" style={{ fontSize: `${fontSize}px` }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
  )
}
