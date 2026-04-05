"use client";

import { useState, useEffect, useRef } from "react";
import localforage from "localforage";
import Link from "next/link";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function BibleReaderPage() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // الـ State الخاص بالسفر والإصحاح الحالي (Index)
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);

  // لمنع الحفظ في الـ LocalStorage أثناء التحميل الأول
  const isInitialized = useRef(false);

  useEffect(() => {
    const loadBibleFromStorage = async () => {
      try {
        setIsLoading(true);
        // 1. محاولة جلب البيانات من IndexedDB (الأوفلاين)
        let data: BookObj[] | null = await localforage.getItem("offline_bible_data");

        // 2. لو المستخدم فتح الصفحة دي قبل ما الـ Sync يخلص، نسحبها من الـ API كاحتياطي
        if (!data || data.length === 0) {
          console.log("البيانات غير موجودة في الأوفلاين، جاري الجلب من السيرفر...");
          const res = await fetch("/api/bible-sync");
          data = await res.json();
          // نحفظها للأوفلاين عشان المرات الجاية
          await localforage.setItem("offline_bible_data", data);
          await localforage.setItem("bible_fully_downloaded", true);
        }

        setBibleData(data || []);

        // 3. استرجاع "آخر قراءة" من الـ LocalStorage
        const lastRead = localStorage.getItem("bible_last_read");
        if (lastRead) {
          const { bIdx, cIdx } = JSON.parse(lastRead);
          // التأكد إن الأرقام سليمة ومش برا الحدود
          if (data && data[bIdx] && data[bIdx].chapters[cIdx]) {
            setCurrentBookIdx(bIdx);
            setCurrentChapterIdx(cIdx);
          }
        }

        isInitialized.current = true;
      } catch (error) {
        console.error("حدث خطأ أثناء تحميل الكتاب المقدس:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBibleFromStorage();
  }, []);

  // Effect لحفظ "آخر قراءة" كل ما المستخدم يغير السفر أو الإصحاح
  useEffect(() => {
    if (isInitialized.current && bibleData.length > 0) {
      localStorage.setItem(
        "bible_last_read",
        JSON.stringify({ bIdx: currentBookIdx, cIdx: currentChapterIdx })
      );
      // التمرير لأعلى الصفحة عند تغيير الإصحاح
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentBookIdx, currentChapterIdx, bibleData]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400 font-bold">جاري تجهيز الكتاب المقدس...</p>
      </div>
    );
  }

  if (bibleData.length === 0) {
    return (
      <div className="p-8 text-center text-red-500">
        عذراً، فشل تحميل البيانات. تأكد من اتصالك بالإنترنت لأول مرة فقط.
      </div>
    );
  }

  const activeBook = bibleData[currentBookIdx];
  const activeChapter = activeBook?.chapters[currentChapterIdx] || [];

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

        {/* أزرار التنقل السريع */}
        <div className="flex gap-1 w-full md:w-auto justify-between">
          <button
            onClick={handlePrevChapter}
            disabled={currentBookIdx === 0 && currentChapterIdx === 0}
            className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-md disabled:opacity-50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            السابق
          </button>
          <button
            onClick={handleNextChapter}
            disabled={currentBookIdx === bibleData.length - 1 && currentChapterIdx === activeBook.chapters.length - 1}
            className="px-1 py-0.5 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
          >
            التالي
          </button>
        </div>
      </div>

      {/* منطقة عرض الآيات */}
      <div className="max-w-7xl mx-auto p-0.5">
        {/* <h1 className="text-3xl font-extrabold text-center mb-1 text-blue-800 dark:text-blue-400">
          {activeBook.name} - الإصحاح {currentChapterIdx + 1}
        </h1> */}

        <div className="space-y-0 text-xl md:text-2xl leading-loose font-arabic">
          {activeChapter.length > 0 ? (
            activeChapter.map((verseObj) => (
              <div key={verseObj.verse} className="flex gap-0.5">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg select-none shrink-0 mt-1">
                  {verseObj.verse}
                </span>
                <p className="text-justify">{verseObj.text_vocalized || verseObj.text_plain}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-zinc-500">لا توجد آيات في هذا الإصحاح.</p>
          )}
        </div>
      </div>

      {/* أزرار سفلية إضافية للتنقل (لراحة المستخدم على الموبايل) */}
      <div className="max-w-4xl mx-auto p-1 flex justify-between mt-1 border-t border-zinc-200 dark:border-zinc-800 pt-1">
        <button
          onClick={handlePrevChapter}
          disabled={currentBookIdx === 0 && currentChapterIdx === 0}
          className="text-blue-600 dark:text-blue-400 font-bold disabled:opacity-50 flex items-center gap-1"
        >
          الإصحاح السابق
        </button>
        <button
          onClick={handleNextChapter}
          disabled={currentBookIdx === bibleData.length - 1 && currentChapterIdx === activeBook.chapters.length - 1}
          className="text-blue-600 dark:text-blue-400 font-bold disabled:opacity-50 flex items-center gap-1"
        >
          الإصحاح التالي
        </button>
      </div>
    </div>
  );
}
