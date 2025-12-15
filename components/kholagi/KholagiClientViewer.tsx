"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  title: string;
  chapter: number;
  chaptersCount: number;
  lines: string[]; // like verses
};

export default function KholagiClientViewer({ slug, title, chapter, chaptersCount, lines }: Props) {
  const router = useRouter();
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kholagiFont");
    if (saved === "sm" || saved === "base" || saved === "lg") setFontSize(saved);
  }, []);
  useEffect(() => localStorage.setItem("kholagiFont", fontSize), [fontSize]);

  const fontSizeClass = fontSize === "sm" ? "text-lg md:text-xl" : fontSize === "base" ? "text-2xl md:text-2xl" : "text-4xl md:text-3xl";

  const goToChapter = (ch: number) => {
    router.push(`/kholagi/${slug}/${ch}`);
    setSelectedLine(null);
  };

  const copyLine = async (idx: number) => {
    const text = `${lines[idx]} (${title} ${chapter}:${idx + 1})`;
    try {
      await navigator.clipboard.writeText(text);
      ephemeralToast("تم نسخ");
    } catch {
      ephemeralToast("فشل النسخ");
    }
  };

  const shareLine = async (idx: number) => {
    const text = `${lines[idx]} (${title} ${chapter}:${idx + 1})`;
    if (navigator.share) {
      try { await navigator.share({ title: `${title} ${chapter}:${idx + 1}`, text }); } catch { }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  function ephemeralToast(msg: string) {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "fixed bottom-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white p-1 rounded-lg z-50";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStartX == null) { setTouchStartX(null); return; }
    const diff = touchStartX - endX;
    if (diff > 100) {
      // swipe left -> prev
      if (chapter > 1) goToChapter(chapter - 1);
      else ephemeralToast("لا يوجد فصل سابق");
    } else if (diff < -100) {
      if (chapter < chaptersCount) goToChapter(chapter + 1);
      else ephemeralToast("لا يوجد فصل تالي");
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="mb-1 text-xs text-gray-500">
        <Link href="/" className="hover:text-blue-600">الرئيسية</Link> / <Link href="/kholagi" className="hover:text-blue-600">الخولاجي</Link> / <span className="text-gray-700">{title} / فصل {chapter}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-1">{title} — فصل {chapter}</h1>

      <div className="flex gap-1 items-center justify-center mb-1">
        <div className="flex items-center gap-1 bg-white/80 border rounded-md px-1 py-0.5">
          <button onClick={() => setFontSize("sm")} className={`rounded px-2 ${fontSize === "sm" ? "bg-blue-500 text-white" : ""}`}>A-</button>
          <button onClick={() => setFontSize("base")} className={`rounded px-2 ${fontSize === "base" ? "bg-blue-500 text-white" : ""}`}>A</button>
          <button onClick={() => setFontSize("lg")} className={`rounded px-2 ${fontSize === "lg" ? "bg-blue-500 text-white" : ""}`}>A+</button>
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen((s) => !s)} className="p-1 border rounded">الفصول ▾</button>
          {menuOpen && (
            <div className="absolute mt-1 max-h-44 overflow-auto bg-white shadow rounded p-1 z-50 border">
              {Array.from({ length: chaptersCount }).map((_, i) => (
                <button key={i} onClick={() => { goToChapter(i + 1); setMenuOpen(false); }} className={`w-full text-start py-1 ${i + 1 === chapter ? "font-bold bg-gray-100" : "hover:bg-gray-50"} rounded`}>{i + 1}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-1">
        {lines.map((line, idx) => {
          const isSel = selectedLine === idx;
          return (
            <div key={idx} onClick={() => setSelectedLine(isSel ? null : idx)} className={`rounded-lg p-1 transition cursor-pointer ${isSel ? "bg-blue-50 ring-2 ring-blue-200" : "hover:bg-gray-50"}`}>
              <div className={`${fontSizeClass} leading-relaxed text-gray-800 flex items-start gap-1`}>
                <div className="shrink-0 text-blue-600 font-semibold">{idx + 1}</div>
                <div className="flex-1 whitespace-pre-wrap">{line}</div>
              </div>

              {isSel && (
                <div className="mt-1 flex gap-1">
                  <button type="button" onClick={() => copyLine(idx)} className="p-1 border rounded text-sm">نسخ</button>
                  <button type="button" onClick={() => shareLine(idx)} className="p-1 border rounded text-sm">مشاركة</button>
                  <button type="button" onClick={() => {
                    const text = `${lines[idx]} (${title} ${chapter}:${idx + 1})`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }} className="p-1 border rounded text-sm">واتساب</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between gap-1">
        {chapter > 1 ? (
          <Link href={`/kholagi/${slug}/${chapter - 1}`} className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-1 rounded-lg shadow">← السابق</Link>
        ) : <div />}
        {chapter < chaptersCount ? (
          <Link href={`/kholagi/${slug}/${chapter + 1}`} className="bg-linear-to-r from-green-500 to-green-600 text-white p-1 rounded-lg shadow">التالي →</Link>
        ) : <div />}
      </div>
    </div>
  );
}
