"use client";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { loadBible } from "@/lib/bible-utils";

// Components
import BibleLoading from "@/components/bible/BibleLoading";
import BibleHeader from "@/components/bible/BibleHeader";
import SelectionToolbar from "@/components/bible/SelectionToolbar";
import DayModal from "@/components/bible/DayModal";
import AudioPlayerBottomBar from "@/components/bible/AudioPlayerBottomBar";
import ReadingControlsHeader from "@/components/bible/ReadingControlsHeader";
import VerseItem from "@/components/bible/VerseItem";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleReaderPage() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("جاري الاتصال بالسيرفر...");
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isBrowserFallback, setIsBrowserFallback] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [favorites, setFavorites] = useState<{ bIdx: number; cIdx: number; vNum: number }[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const isInitialized = useRef(false);

  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayCodeInput, setDayCodeInput] = useState("");
  const [lineHeight, setLineHeight] = useState("1.8");

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
          data = (await loadBible((p) => setLoadProgress(p))) as BookObj[];
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

        if (shouldRefresh) window.location.reload();
      } catch (error) {
        console.error("Error during initialization:", error);
        setLoadingStatus("حدث خطأ، يرجى التأكد من الإنترنت وإعادة المحاولة.");
      }
    };

    initData();
  }, []);

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

  if (isLoading) {
    return <BibleLoading loadingStatus={loadingStatus} loadProgress={loadProgress} tipIndex={tipIndex} tips={["يمكنك الضغط مطولاً على الآية لمشاركتها مع أصدقائك.",
      "جرب خاصية البحث السريع للوصول لأي آية في ثوانٍ.",
      "يتم حفظ آخر مكان قرأت فيه تلقائياً لتعود إليه لاحقاً.",
      "يمكنك إضافة الآيات التي لمست قلبك إلى قائمة المفضلة.",]} />;
  }

  if (!bibleData.length) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-1 text-zinc-900 dark:text-zinc-100">
      <BibleHeader />

      <main className="w-full pt-1">
        <div className="flex flex-col w-full h-full relative" id="bible-app">
          <div className="flex flex-col md:flex-row w-full grow relative bg-surface-container-low min-h-[calc(100vh-160px)]">
            {/* <BibleSidebar /> */}

            <section className="grow flex flex-col relative max-w-8xl mx-auto w-full">
              <ReadingControlsHeader />

              <article
                className="p-1 pb-1 flex flex-col gap-1 font-title-lg text-title-lg text-on-surface transition-all duration-300"
                id="reading-canvas"
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight || 1.8 }}
              >
                <VerseItem />
              </article>
            </section>
          </div>
        </div>

        {/* Dynamic Toolbars with Handlers */}
        <SelectionToolbar />

        {isDayModalOpen && (
          <DayModal onClose={() => setIsDayModalOpen(false)} />
        )}

        <AudioPlayerBottomBar />
      </main>
    </div>
  );
}
