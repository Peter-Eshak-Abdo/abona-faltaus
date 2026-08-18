"use client";
import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import { loadBible } from "@/lib/bible-utils";

// Components
import BibleLoading from "@/components/bible/BibleLoading";
import BibleSearch from "@/components/bible/BibleSearch";
import SelectionToolbar from "@/components/bible/SelectionToolbar";
import DayModal from "@/components/bible/DayModal";
import ReadingControlsHeader from "@/components/bible/ReadingControlsHeader";
import VerseItem from "@/components/bible/VerseItem";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleReaderPage() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("جاري الاتصال بالسيرفر...");
  const [loadProgress, setLoadProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Shared reading state (lifted up so all children stay in sync)
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [lineHeight, setLineHeight] = useState("1.8");
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<{ bIdx: number; cIdx: number; vNum: number }[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isInitialized = useRef(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        setLoadProgress(0);
        setLoadingStatus("جاري فحص البيانات المحفوظة...");

        let data = await localforage.getItem<BookObj[]>("offline_bible_data");
        let shouldRefresh = false;

        if (!data || data.length === 0) {
          setLoadingStatus("جاري تحميل الكتاب المقدس (لأول مرة لتصفحه بدون إنترنت)...");
          data = (await loadBible((p) => setLoadProgress(p))) as BookObj[];
          if (data && data.length > 0) {
            await localforage.setItem("offline_bible_data", data);
          }
        } else {
          setLoadProgress(100);
        }

        if (data && data.length > 0) {
          setBibleData(data);

          const lastRead = localStorage.getItem("bible_last_read");
          if (lastRead) {
            try {
              const { bIdx, cIdx } = JSON.parse(lastRead);
              if (data[bIdx]?.chapters[cIdx]) {
                setCurrentBookIdx(bIdx);
                setCurrentChapterIdx(cIdx);
              }
            } catch (e) {
              console.error("Failed to parse last read:", e);
            }
          }
        }

        const favs = await localforage.getItem<any[]>("bible_favorites");
        if (favs) setFavorites(favs);

        const savedSize = localStorage.getItem("bible_font_size");
        if (savedSize) setFontSize(parseInt(savedSize));

        const savedLineHeight = localStorage.getItem("bible_line_height");
        if (savedLineHeight) setLineHeight(savedLineHeight);

        setIsLoading(false);
        isInitialized.current = true;
      } catch (error) {
        console.error("Error during initialization:", error);
        // حتى لو حصل خطأ أثناء التحميل، نحاول نقرأ من الكاش لو موجود
        const fallbackData = await localforage.getItem<BookObj[]>("offline_bible_data");
        if (fallbackData && fallbackData.length > 0) {
          setBibleData(fallbackData);
          setIsLoading(false);
        } else {
          setLoadingStatus("حدث خطأ، يرجى التأكد من الإنترنت وإعادة المحاولة.");
        }
      }
    };

    initData();
  }, []);

  // Persist the last-read position so it's restored on next visit
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem("bible_last_read", JSON.stringify({ bIdx: currentBookIdx, cIdx: currentChapterIdx }));
  }, [currentBookIdx, currentChapterIdx]);

  // Persist font size so it's restored on next visit
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem("bible_font_size", String(fontSize));
  }, [fontSize]);

  // Persist line height so it's restored on next visit
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem("bible_line_height", String(lineHeight));
  }, [lineHeight]);

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };

  const handleGoToVerse = (bookIdx: number, chapterIdx: number, verseNum: number) => {
    setCurrentBookIdx(bookIdx);
    setCurrentChapterIdx(chapterIdx);
    setIsSearchOpen(false);

    // Wait for the chapter to render, then scroll to the verse
    setTimeout(() => {
      const canvas = document.getElementById("reading-canvas");
      const verseEl = document.getElementById(`verse-${verseNum}`);
      if (canvas && verseEl) {
        const canvasTop = canvas.getBoundingClientRect().top;
        const verseTop = verseEl.getBoundingClientRect().top;
        canvas.scrollTop += verseTop - canvasTop - canvas.clientHeight / 2 + verseEl.clientHeight / 2;
      } else {
        verseEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  };

  if (isLoading) {
    return <BibleLoading loadingStatus={loadingStatus} loadProgress={loadProgress} tipIndex={tipIndex} tips={["يمكنك الضغط مطولاً على الآية لمشاركتها مع أصدقائك.",
      "جرب خاصية البحث السريع للوصول لأي آية في ثوانٍ.",
      "يتم حفظ آخر مكان قرأت فيه تلقائياً لتعود إليه لاحقاً.",
      "يمكنك إضافة الآيات التي لمست قلبك إلى قائمة المفضلة.",]} />;
  }

  if (!bibleData.length) return null;

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-zinc-50/70 dark:bg-zinc-950/70 text-zinc-900 dark:text-zinc-100">
      <main className="w-full pt-1 h-full">
        <div className="flex flex-col w-full relative h-full" id="bible-app">
          <div className="flex flex-col w-full bg-surface-container-low">
            <ReadingControlsHeader
              bibleData={bibleData}
              currentBookIdx={currentBookIdx}
              setCurrentBookIdx={setCurrentBookIdx}
              currentChapterIdx={currentChapterIdx}
              setCurrentChapterIdx={setCurrentChapterIdx}
              fontSize={fontSize}
              setFontSize={setFontSize}
              setIsSearchOpen={setIsSearchOpen}
            />

            <section className="grow flex flex-col relative max-w-8xl mx-auto w-full">
              {/* Reading canvas: flex-1 + overflow-y-auto so the whole chapter is readable on iOS */}
              <article
                className="p-0.25 flex flex-col gap-0.25 font-title-lg text-title-lg text-on-surface transition-all duration-300 overflow-y-auto max-h-[calc(100dvh-130px)] flex-1 -webkit-overflow-scrolling-touch"
                id="reading-canvas"
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight || 1.8 }}
              >
                <VerseItem
                  bibleData={bibleData}
                  currentBookIdx={currentBookIdx}
                  setCurrentBookIdx={setCurrentBookIdx}
                  currentChapterIdx={currentChapterIdx}
                  setCurrentChapterIdx={setCurrentChapterIdx}
                  selectedVerses={selectedVerses}
                  toggleVerseSelection={toggleVerseSelection}
                  favorites={favorites}
                  fontSize={fontSize}
                />
                <div className="h-24" />
              </article>
            </section>
          </div>
        </div>

        {/* Dynamic Toolbars with Handlers */}
        <SelectionToolbar
          bibleData={bibleData}
          currentBookIdx={currentBookIdx}
          currentChapterIdx={currentChapterIdx}
          selectedVerses={selectedVerses}
          setSelectedVerses={setSelectedVerses}
          favorites={favorites}
          setFavorites={setFavorites}
          isDayModalOpen={isDayModalOpen}
          setIsDayModalOpen={setIsDayModalOpen}
        />

        {isDayModalOpen && (
          <DayModal
            bibleData={bibleData}
            currentBookIdx={currentBookIdx}
            currentChapterIdx={currentChapterIdx}
            selectedVerses={selectedVerses}
            setSelectedVerses={setSelectedVerses}
            onClose={() => setIsDayModalOpen(false)}
          />
        )}

        <BibleSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          bibleData={bibleData}
          onGoToVerse={handleGoToVerse}
        />
      </main>
    </div>
  );
}
