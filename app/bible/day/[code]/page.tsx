// app/bible/day/[code]/page.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaEdit, FaArrowUp, FaArrowDown, FaTrash, FaCheck, FaBold, FaPlus, FaMinus, FaSun, FaMoon, FaChevronRight, FaChevronLeft, FaTimes } from "react-icons/fa";
import Link from "next/link";

type WordConfig = { b?: boolean; c?: string; s?: number };
type VerseItem = { id: string; text: string; ref: string; wordsConfig: Record<number, WordConfig> };

export default function PresentationPage() {
  const { code } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedWord, setSelectedWord] = useState<{ vId: string; wIdx: number } | null>(null);

  const presetColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#000000", "#ffffff"];

  useEffect(() => {
    const fetchDay = async () => {
      const { data, error } = await supabase
        .from("meeting_days")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !data) {
        alert("لم يتم العثور على هذا اليوم");
        router.push("/bible/day");
        return;
      }

      setTitle(data.title);
      setVerses(data.verses || []);
      setLoading(false);

      setTimeout(() => setShowHelp(false), 4000);
    };

    if (code) fetchDay();
  }, [code, router]);

  const saveToDb = async (newVerses: VerseItem[]) => {
    setSaving(true);
    await supabase.from("meeting_days").update({ verses: newVerses }).eq("code", code);
    setSaving(false);
  };

  const moveVerse = (index: number, direction: 1 | -1) => {
    if (index + direction < 0 || index + direction >= verses.length) return;
    const newVerses = [...verses];
    const temp = newVerses[index];
    newVerses[index] = newVerses[index + direction];
    newVerses[index + direction] = temp;
    setVerses(newVerses);
    saveToDb(newVerses);
  };

  const deleteVerse = (index: number) => {
    if (!confirm("هل تريد حذف هذه الآية؟")) return;
    const newVerses = verses.filter((_, i) => i !== index);
    setVerses(newVerses);
    saveToDb(newVerses);
  };

  const toggleWordFormat = (verseId: string, wordIdx: number, type: "b" | "c" | "s", value?: any) => {
    const newVerses = verses.map((v) => {
      if (v.id === verseId) {
        const currentConf = v.wordsConfig[wordIdx] || {};
        const newConf = { ...currentConf };

        if (type === "b") newConf.b = !newConf.b;
        if (type === "c") newConf.c = value;
        if (type === "s") {
          const currentSize = newConf.s || 1;
          newConf.s = Math.max(0.5, currentSize + value);
        }

        return { ...v, wordsConfig: { ...v.wordsConfig, [wordIdx]: newConf } };
      }
      return v;
    });
    setVerses(newVerses);
    saveToDb(newVerses);
  };

  const scrollContainer = (direction: "next" | "prev") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth;
      scrollRef.current.scrollBy({
        left: direction === "next" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const renderFormattedText = (verse: VerseItem, interactive = false) => {
    return verse.text.split(" ").map((word, wIdx) => {
      const conf = verse.wordsConfig?.[wIdx] || {};
      const isSelected = selectedWord?.vId === verse.id && selectedWord?.wIdx === wIdx;

      return (
        <span
          key={wIdx}
          onClick={() => interactive ? setSelectedWord({ vId: verse.id, wIdx }) : undefined}
          className={`
            inline-block mx-1 transition-all leading-normal
            ${interactive ? "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded px-1" : ""}
            ${isSelected ? "bg-blue-200 dark:bg-blue-900 ring-2 ring-blue-500 rounded px-1" : ""}
          `}
          style={{
            color: conf.c || "inherit",
            fontWeight: conf.b ? "900" : "normal",
            fontSize: `${conf.s || 1}em`
          }}
        >
          {word}
        </span>
      );
    });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white font-arabic">جاري التحميل...</div>;
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-1 font-arabic pb-32 text-zinc-900 dark:text-zinc-100">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-zinc-500">تعديل الترتيب والتنسيق</p>
          </div>
          <button
            onClick={() => { setIsEditMode(false); setSelectedWord(null); }}
            className="bg-green-600 hover:bg-green-700 text-white px-1 py-0.5 rounded-xl font-bold flex items-center gap-0.5 shadow-lg transition"
          >
            <FaCheck /> حفظ وعرض
          </button>
        </div>

        <div className="space-y-1">
          {verses.map((verse, index) => (
            <div key={verse.id} className="bg-white dark:bg-zinc-900 p-1 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
              <div className="flex justify-between items-start mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-0.5">
                <span className="text-lg font-bold text-blue-600">{verse.ref}</span>
                <div className="flex gap-0.5">
                  <button onClick={() => moveVerse(index, -1)} disabled={index === 0} className="p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"><FaArrowUp /></button>
                  <button onClick={() => moveVerse(index, 1)} disabled={index === verses.length - 1} className="p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-30 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"><FaArrowDown /></button>
                  <button onClick={() => deleteVerse(index)} className="p-0.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"><FaTrash /></button>
                </div>
              </div>
              <div className="text-2xl md:text-3xl leading-loose select-none font-bold">
                {renderFormattedText(verse, true)}
              </div>
            </div>
          ))}
          {verses.length === 0 && (
            <div className="text-center p-2 text-zinc-500">لا توجد آيات مضافة.</div>
          )}
        </div>

        {selectedWord && (
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 shadow-2xl p-1 rounded-2xl border border-zinc-300 dark:border-zinc-600 flex flex-col md:flex-row items-center gap-1 z-50 animate-fade-in">

            <div className="flex items-center gap-1 border-b md:border-b-0 md:border-l border-zinc-200 dark:border-zinc-700 pb-0.5 md:pb-0 md:pl-1">
              <span className="text-sm text-zinc-500 font-bold">الحجم:</span>
              <button onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "s", 0.2)} className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 transition">
                <FaPlus size={14} />
              </button>
              <button onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "s", -0.2)} className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 transition">
                <FaMinus size={14} />
              </button>
            </div>

            <div className="flex items-center gap-0.5 border-b md:border-b-0 md:border-l border-zinc-200 dark:border-zinc-700 pb-0.5 md:pb-0 md:pl-1">
              <span className="text-sm text-zinc-500 font-bold">عريض:</span>
              <button onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "b")} className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200 transition">
                <FaBold size={14} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-zinc-500 font-bold">اللون:</span>
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "c", c)}
                  className="w-3 h-3 rounded-full border-2 border-zinc-300 shadow-sm transition hover:scale-110"
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative w-3 h-3 rounded-full border-2 border-zinc-300 overflow-hidden shadow-sm hover:scale-110 transition cursor-pointer">
                <input
                  type="color"
                  onChange={(e) => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "c", e.target.value)}
                  className="absolute -top-1 -left-1 w-3 h-3 cursor-pointer"
                />
              </div>
              <button
                onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, "c", undefined)}
                className="w-3 h-3 rounded-full border-2 border-zinc-300 shadow-sm bg-transparent flex items-center justify-center text-xs hover:bg-red-50 transition text-red-500"
                title="إزالة اللون"
              >
                <FaTimes />
              </button>
            </div>

          </div>
        )}
      </div>
    );
  }

  const bgClass = inverted ? "bg-white text-black" : "bg-black text-white";

  return (
    <div className={`h-screen w-full ${bgClass} font-arabic overflow-hidden relative transition-colors duration-500`}>
      <div className="absolute top-1 right-1 z-50 flex gap-1">
        <button
          onClick={() => setIsEditMode(true)}
          className="bg-zinc-500/20 hover:bg-zinc-500/40 backdrop-blur p-1 rounded-full transition shadow-lg"
          title="تعديل العرض"
        >
          <FaEdit size={18} />
        </button>
        <button
          onClick={() => setInverted(!inverted)}
          className="bg-zinc-500/20 hover:bg-zinc-500/40 backdrop-blur p-1 rounded-full transition shadow-lg"
          title="عكس الألوان"
        >
          {inverted ? <FaMoon size={18} /> : <FaSun size={18} />}
        </button>
      </div>

      <div className="absolute top-1.5 left-1.5 z-50 opacity-30 text-sm font-mono tracking-widest pointer-events-none font-bold">
        {code}
      </div>

      {verses.length > 1 && (
        <>
          <button
            onClick={() => scrollContainer("prev")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-40 bg-zinc-500/10 hover:bg-zinc-500/30 p-1 rounded-full transition opacity-50 hover:opacity-100"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={() => scrollContainer("next")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-40 bg-zinc-500/10 hover:bg-zinc-500/30 p-1 rounded-full transition opacity-50 hover:opacity-100"
          >
            <FaChevronRight size={24} />
          </button>
        </>
      )}

      {showHelp && verses.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-1.5 py-0.5 rounded-full backdrop-blur text-sm animate-pulse pointer-events-none">
          اسحب لليمين أو اليسار للتنقل بين الآيات
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory h-full w-full flex-row-reverse items-center hide-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {verses.length === 0 ? (
          <div className="w-full shrink-0 flex flex-col items-center justify-center p-2 mx-auto text-2xl text-zinc-500">
            <p>لا توجد آيات مضافة في هذا اليوم حتى الآن.</p>
            {/* <button onClick={() => setIsEditMode(true)} className="mt-1 text-blue-500 text-lg underline">اضغط هنا للتعديل</button> */}
            <Link href="/bible" className="mt-1 text-blue-500 text-lg underline">ارجع الي صفحة الكتاب المقدس وأضف آيات اولا</Link>
          </div>
        ) : (
          verses.map((verse) => (
            <div key={verse.id} className="snap-center shrink-0 w-full h-full flex flex-col items-center justify-center p-2 md:p-3">
              <div className="max-w-7xl text-center flex flex-col items-center justify-center">
                <h1 className="text-4xl md:text-7xl lg:text-[6rem] leading-normal md:leading-[1.5] font-bold">
                  {renderFormattedText(verse, false)}
                </h1>
                <p className={`mt-2 text-2xl md:text-4xl font-bold opacity-80 ${inverted ? "text-amber-700" : "text-yellow-400"}`}>
                  {verse.ref}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translate(-50%, 20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
}
