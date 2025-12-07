"use client";
import { useMemo, useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  abbrev: string;
  bookName: string;
  chapter: number;
  verses: string[];
  font?: string;
  oldTestament: string[]; // array of abbrevs
  newTestament: string[]; // array of abbrevs
  bookNames: Record<string, string>;
  chaptersCount: number;
};

export default function ClientChapterViewer({
  abbrev,
  bookName,
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
    // sync with localStorage if any
    const saved = localStorage.getItem("fontSize");
    if (!font && saved) setFontSize(saved);
  }, [font]);

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const fontSizeClass = { sm: "text-xl", base: "text-2xl md:text-2xl", lg: "text-4xl md:text-3xl" }[fontSize] || "text-lg";

  // const allBooks = useMemo(() => [...oldTestament, ...newTestament], [oldTestament, newTestament]);

  const goToBook = (newAbbrev: string) => {
    router.push(`/bible/${newAbbrev}/1?font=${fontSize}`);
    setBookMenuOpen(false);
  };

  const goToChapter = (ch: number) => {
    router.push(`/bible/${abbrev}/${ch}?font=${fontSize}`);
    setChapMenuOpen(false);
  };

  const copyVerse = async (idx: number) => {
    const text = `${bookName} ${chapter}:${idx + 1} — ${verses[idx]}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("تم نسخ الآية");
    } catch {
      toast("فشل النسخ");
    }
  };

  const shareVerse = async (idx: number) => {
    const text = `${bookName} ${chapter}:${idx + 1} — ${verses[idx]}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${bookName} ${chapter}:${idx + 1}`, text });
      } catch {
        // user cancelled أو خطأ
      }
    } else {
      // fallback => WhatsApp
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(wa, "_blank");
    }
  };

  function toast(msg: string) {
    // بسيط جدًا - يمكنك استبداله بمكتبة إشعارات
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
      if (diff > 50) {
        // Swipe left: go to previous chapter
        if (chapter > 1) {
          goToChapter(chapter - 1);
        } else {
          toast("لا يوجد إصحاح سابق");
        }
      } else if (diff < -50) {
        // Swipe right: go to next chapter
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
      {/* Top small controls (مثل الصورة اللي بعتها) */}
      <div className="absolute top-4 left-4 z-40 flex gap-1 items-center">
        {/* Book dropdown */}
        <div className="relative">
          <button
            onClick={() => setBookMenuOpen((s) => !s)}
            className="p-1 bg-white/80 backdrop-blur-sm border rounded-md shadow-sm text-sm"
            aria-expanded={bookMenuOpen}
            type="button"
          >
            {bookName} ▾
          </button>
          {bookMenuOpen && (
            <div className="absolute mt-1 w-56 max-h-72 overflow-auto bg-white rounded-md shadow-lg border p-1 z-50">
              <div className="text-xs font-semibold mb-1">العهد القديم</div>
              {oldTestament.map((b) => (
                <button
                  key={b}
                  onClick={() => goToBook(b)}
                  type="button"
                  className={`w-full text-left p-1 rounded hover:bg-gray-100 ${b === abbrev ? "bg-blue-50 font-medium" : ""}`}
                >
                  {bookNames[b] || b}
                </button>
              ))}
              <hr className="my-1" />
              <div className="text-xs font-semibold mb-1">العهد الجديد</div>
              {newTestament.map((b) => (
                <button
                  key={b}
                  onClick={() => goToBook(b)}
                  className={`w-full text-left p-1 rounded hover:bg-gray-100 ${b === abbrev ? "bg-green-50 font-medium" : ""}`}
                  type="button"
                >
                  {bookNames[b] || b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chapter dropdown */}
        <div className="relative">
          <button
            onClick={() => setChapMenuOpen((s) => !s)}
            className="p-1 bg-white/80 backdrop-blur-sm border rounded-md shadow-sm text-sm"
            aria-expanded={chapMenuOpen}
            type="button"
          >
            إصحاح {chapter} ▾
          </button>
          {chapMenuOpen && (
            <div className="absolute mt-1 w-40 max-h-60 overflow-auto bg-white rounded-md shadow-lg border p-1 z-50">
              {Array.from({ length: chaptersCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToChapter(i + 1)}
                  className={`w-full text-left p-1 rounded hover:bg-gray-100 ${i + 1 === chapter ? "bg-blue-50 font-medium" : ""}`}
                  type="button"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font controls */}
        <div className="flex items-center gap-1 bg-white/80 border rounded-md p-1">
          <button onClick={() => setFontSize("sm")} className={`rounded ${fontSize === "sm" ? "bg-blue-500 text-white" : ""}`} type="button">A-</button>
          <button onClick={() => setFontSize("base")} className={`rounded ${fontSize === "base" ? "bg-blue-500 text-white" : ""}`} type="button">A</button>
          <button onClick={() => setFontSize("lg")} className={`rounded ${fontSize === "lg" ? "bg-blue-500 text-white" : ""}`} type="button">A+</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-2 text-xs text-gray-500">
        <Link href="/bible" className="hover:text-blue-600">الكتاب المقدس</Link> /{" "}
        <Link href={`/bible/${abbrev}`} className="hover:text-blue-600">{bookName}</Link> / <span className="text-gray-700">إصحاح {chapter}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold mb-1 text-center">{bookName} - إصحاح {chapter}</h1>

      {/* الآيات */}
      <div className="space-y-1 md:space-y-1 mb-1">
        {verses.map((verse, idx) => {
          const isSelected = selectedVerse === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedVerse(isSelected ? null : idx)}
              className={`rounded-lg transition-all cursor-pointer ${isSelected ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"}`}
            >
              <div className={`flex items-start gap-1 ${fontSizeClass} leading-relaxed text-gray-800`}>
                <div className="shrink-0 text-blue-600 font-semibold">{idx + 1}</div>
                <div className="flex-1 font-bold">{verse}</div>
              </div>

              {/* small per-verse actions (visible when selected) */}
              {isSelected && (
                <div className="flex gap-1">
                  <button onClick={() => copyVerse(idx)} className="p-0.5 text-sm border rounded shadow-sm" type="button">نسخ</button>
                  <button onClick={() => shareVerse(idx)} className="p-0.5 text-sm border rounded shadow-sm" type="button">مشاركة</button>
                  <button onClick={() => {
                    const text = `${bookName} ${chapter}:${idx + 1} — ${verses[idx]}`;
                    const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(wa, "_blank");
                  }} className="p-0.5 text-sm border rounded shadow-sm" type="button">واتساب</button>
                  <button onClick={() => { setSelectedVerse(null); }} className="p-0.5 text-sm border rounded shadow-sm" type="button">إغلاق</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination (سابق / التالي) */}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-40">
        {chapter > 1 && (
          <Link
            href={`/bible/${abbrev}/${chapter - 1}?font=${fontSize}`}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-1 rounded-lg shadow"
          >
            ← السابق
          </Link>
        )}
        {chapter < chaptersCount && (
          <Link
            href={`/bible/${abbrev}/${chapter + 1}?font=${fontSize}`}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white p-1 rounded-lg shadow"
          >
            التالي →
          </Link>
        )}
      </div>
    </div>
  );
}
