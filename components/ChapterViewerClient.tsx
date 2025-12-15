"use client";
import { useMemo, useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { shortBookNames } from "@/lib/books";

type VerseObj = {
  verse: number | null;
  text_vocalized: string;
  text_plain?: string;
};

type Props = {
  abbrev: string;
  bookName: string;
  shortBookName?: string;
  chapter: number;
  verses: VerseObj[]; // الآن مصفوفة من كائنات الآيات
  font?: string;
  oldTestament: string[]; // array of abbrevs
  newTestament: string[]; // array of abbrevs
  bookNames: Record<string, string>;
  chaptersCount: number;
};

export default function ClientChapterViewer({
  abbrev,
  bookName,
  shortBookName,
  chapter,
  verses,
  font = "base",
  oldTestament,
  newTestament,
  bookNames,
  chaptersCount,
}: Props) {
  const router = useRouter();
  const [fontSize, setFontSize] = useState<string>(font);
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const [chapMenuOpen, setChapMenuOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("fontSize");
    if (!font && saved) setFontSize(saved);
  }, [font]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const fontSizeClass = { sm: "text-xl", base: "text-2xl md:text-2xl", lg: "text-4xl md:text-3xl" }[fontSize] || "text-lg";

  const goToBook = (newAbbrev: string) => {
    router.push(`/bible/${newAbbrev}/1?font=${fontSize}`);
    setBookMenuOpen(false);
  };

  const goToChapter = (ch: number) => {
    router.push(`/bible/${abbrev}/${ch}?font=${fontSize}`);
    setChapMenuOpen(false);
  };

  const copyVerse = async (idx: number) => {
    const verseObj = verses[idx];
    const verseText = verseObj?.text_vocalized ?? "";
    const verseNum = verseObj?.verse ?? idx + 1;
    const text = `${verseText} (${shortBookNames[abbrev as keyof typeof shortBookNames]} ${chapter}:${verseNum})`;
    try {
      await navigator.clipboard.writeText(text);
      toast("تم نسخ الآية");
    } catch {
      toast("فشل النسخ");
    }
  };

  const shareVerse = async (idx: number) => {
    const verseObj = verses[idx];
    const verseText = verseObj?.text_vocalized ?? "";
    const verseNum = verseObj?.verse ?? idx + 1;
    const text = `${verseText} (${shortBookNames[abbrev as keyof typeof shortBookNames]} ${chapter}:${verseNum})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${shortBookNames[abbrev as keyof typeof shortBookNames]} ${chapter}:${verseNum}`, text });
      } catch {
        // user cancelled or error
      }
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
    }
  };

  function toast(msg: string) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white p-1 rounded-lg z-50";
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
    }, 1500);
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStartX !== null) {
      const diff = touchStartX - endX;
      if (diff > 100) {
        if (chapter > 1) {
          goToChapter(chapter - 1);
        } else {
          toast("لا يوجد إصحاح سابق");
        }
      } else if (diff < -100) {
        if (chapter < chaptersCount) {
          goToChapter(chapter + 1);
        } else {
          toast("لا يوجد إصحاح تالي");
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="flex-1 p-1 relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="mb-2 text-xs text-gray-500">
        <Link href="/bible" className="hover:text-blue-600">الكتاب المقدس</Link> /{" "}
        <Link href={`/bible/${abbrev}`} className="hover:text-blue-600">{bookName}</Link> / <span className="text-gray-700">إصحاح {chapter}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-1 text-center">{bookName} - إصحاح {chapter}</h1>

      <div className=" top-4 left-4 z-40 flex gap-1 items-center justify-between">
        {/* Book dropdown */}
        <div className="relative">
          <button
            onClick={() => setBookMenuOpen((s) => !s)}
            className="p-0.5 bg-white/80 backdrop-blur-sm border rounded-md shadow-sm text-sm text-black hover:text-gray-800 hover:shadow-md/30 transition-all duration-300 transform hover:scale-105"
            aria-expanded={bookMenuOpen}
            type="button"
          >
            {bookName} ▾
          </button>
          {bookMenuOpen && (
            <div className="absolute mt-1 w-44 max-h-40 overflow-auto bg-white/90 backdrop-blur-sm rounded-md shadow-lg border px-1 z-50">
              <div className="text-2xl font-extrabold mt-0.5">العهد القديم</div>
              {oldTestament.map((b) => (
                <button
                  key={b}
                  onClick={() => goToBook(b)}
                  type="button"
                  className={`w-full pb-0.5 text-start rounded hover:bg-gray-100 ${b === abbrev ? "bg-blue-50 font-bold shadow-xl" : ""}`}
                >
                  {bookNames[b] || b}
                </button>
              ))}
              <hr className="my-0.5" />
              <div className="text-xl font-extrabold">العهد الجديد</div>
              {newTestament.map((b) => (
                <button
                  key={b}
                  onClick={() => goToBook(b)}
                  className={`w-full text-start pb-0.5 rounded hover:bg-gray-100 ${b === abbrev ? "bg-green-50 font-bold shadow-xl" : ""}`}
                  type="button"
                >
                  {bookNames[b] || b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font controls */}
        <div className="flex items-center gap-1 bg-white/80 border rounded-md px-1 py-0.5">
          <button onClick={() => setFontSize("sm")} className={`rounded ${fontSize === "sm" ? "bg-blue-500 text-white" : ""}`} type="button">A-</button>
          <button onClick={() => setFontSize("base")} className={`rounded ${fontSize === "base" ? "bg-blue-500 text-white" : ""}`} type="button">A</button>
          <button onClick={() => setFontSize("lg")} className={`rounded ${fontSize === "lg" ? "bg-blue-500 text-white" : ""}`} type="button">A+</button>
        </div>

        {/* Chapter dropdown */}
        <div className="relative">
          <button
            onClick={() => setChapMenuOpen((s) => !s)}
            className="p-0.5 bg-white/80 backdrop-blur-sm border rounded-md shadow-sm text-sm"
            aria-expanded={chapMenuOpen}
            type="button"
          >
            إصحاح {chapter} ▾
          </button>
          {chapMenuOpen && (
            <div className="absolute w-20 max-h-30 overflow-auto bg-white/90 backdrop-blur-sm rounded-md shadow-lg px-1 border z-50">
              {Array.from({ length: chaptersCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToChapter(i + 1)}
                  className={`w-full text-start pb-0.5 rounded hover:bg-gray-100 ${i + 1 === chapter ? "bg-blue-50 font-bold shadow-xl" : ""}`}
                  type="button"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* الآيات */}
      <div className="mb-1">
        {verses.map((verseObj, idx) => {
          const isSelected = selectedVerse === idx;
          const verseText = verseObj?.text_vocalized ?? "";
          const verseNum = verseObj?.verse ?? idx + 1;
          return (
            <div
              key={idx}
              onClick={() => setSelectedVerse(isSelected ? null : idx)}
              className={`rounded-lg transition-all cursor-pointer ${isSelected ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"}`}
            >
              <div className={`flex items-start ${fontSizeClass} leading-relaxed text-gray-800`}>
                <div className="shrink-0 text-blue-600 font-semibold pe-0.5">{verseNum}</div>
                <div className="flex-1 font-bold">{verseText}</div>
              </div>

              {isSelected && (
                <div className="flex gap-1">
                  <button onClick={() => copyVerse(idx)} className="p-0.5 text-sm border rounded shadow-sm" type="button">نسخ</button>
                  <button onClick={() => {
                    const text = `${verseText} (${shortBookNames[abbrev as keyof typeof shortBookNames]} ${chapter}:${verseNum})`;
                    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(wa, "_blank");
                  }} className="p-0.5 text-sm border rounded shadow-sm" type="button">واتساب</button>
                  <button onClick={() => shareVerse(idx)} className="p-0.5 text-sm border rounded shadow-sm" type="button">مشاركة</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bottom-1-translate-x-1/2 flex justify-evenly gap-1 z-40">
        {chapter > 1 && (
          <Link
            href={`/bible/${abbrev}/${chapter - 1}?font=${fontSize}`}
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-1 rounded-lg shadow"
          >
            → السابق
          </Link>
        )}
        {chapter < chaptersCount && (
          <Link
            href={`/bible/${abbrev}/${chapter + 1}?font=${fontSize}`}
            className="bg-linear-to-r from-green-500 to-green-600 text-white p-1 rounded-lg shadow"
          >
            التالي ←
          </Link>
        )}
      </div>
    </div>
  );
}
