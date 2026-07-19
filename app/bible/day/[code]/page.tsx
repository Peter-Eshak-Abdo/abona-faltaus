"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaEdit, FaArrowUp, FaArrowDown, FaTrash, FaCheck, FaPalette, FaBold } from "react-icons/fa";

type WordConfig = { b?: boolean; c?: string };
type VerseItem = { id: string; text: string; ref: string; wordsConfig: Record<number, WordConfig> };

export default function PresentationPage() {
  const { code } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedWord, setSelectedWord] = useState<{ vId: string; wIdx: number } | null>(null);

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#000000", "#ffffff"];

  useEffect(() => {
    const fetchDay = async () => {
      const { data, error } = await supabase
        .from('meeting_days')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        alert("لم يتم العثور على هذا اليوم");
        router.push('/bible/day');
        return;
      }

      setTitle(data.title);
      setVerses(data.verses || []);
      setLoading(false);
    };

    if (code) fetchDay();
  }, [code, router]);

  const saveToDb = async (newVerses: VerseItem[]) => {
    setSaving(true);
    await supabase.from('meeting_days').update({ verses: newVerses }).eq('code', code);
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
    if(!confirm("هل تريد حذف هذه الآية؟")) return;
    const newVerses = verses.filter((_, i) => i !== index);
    setVerses(newVerses);
    saveToDb(newVerses);
  };

  const toggleWordFormat = (verseId: string, wordIdx: number, type: 'b' | 'c', value?: string) => {
    const newVerses = verses.map(v => {
      if (v.id === verseId) {
        const currentConf = v.wordsConfig[wordIdx] || {};
        const newConf = { ...currentConf };
        if (type === 'b') newConf.b = !newConf.b;
        if (type === 'c') newConf.c = value;
        return { ...v, wordsConfig: { ...v.wordsConfig, [wordIdx]: newConf } };
      }
      return v;
    });
    setVerses(newVerses);
    saveToDb(newVerses);
    setSelectedWord(null);
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
            inline-block mx-1 transition-all
            ${conf.b ? 'font-black' : ''}
            ${interactive ? 'cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded px-1' : ''}
            ${isSelected ? 'bg-blue-200 dark:bg-blue-900 ring-2 ring-blue-500 rounded px-1' : ''}
          `}
          style={{ color: conf.c || 'inherit' }}
        >
          {word}
        </span>
      );
    });
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white">جاري التحميل...</div>;
  }

  if (isEditMode) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-1 font-arabic pb-2 text-zinc-900 dark:text-zinc-100">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold">تعديل الترتيب والتنسيق</h1>
          <button
            onClick={() => { setIsEditMode(false); setSelectedWord(null); }}
            className="bg-green-600 text-white px-1 py-0.5 rounded-lg font-bold flex items-center gap-1"
          >
            <FaCheck /> حفظ وعرض
          </button>
        </div>

        <div className="space-y-1">
          {verses.map((verse, index) => (
            <div key={verse.id} className="bg-white dark:bg-zinc-900 p-1 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-blue-600">{verse.ref}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveVerse(index, -1)} disabled={index === 0} className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded disabled:opacity-30"><FaArrowUp /></button>
                  <button onClick={() => moveVerse(index, 1)} disabled={index === verses.length - 1} className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded disabled:opacity-30"><FaArrowDown /></button>
                  <button onClick={() => deleteVerse(index)} className="p-1 bg-red-100 text-red-600 rounded"><FaTrash /></button>
                </div>
              </div>
              <div className="text-xl leading-loose select-none">
                {renderFormattedText(verse, true)}
              </div>
            </div>
          ))}
        </div>

        {selectedWord && (
          <div className="fixed bottom-1 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 shadow-2xl p-1 rounded-2xl border border-zinc-300 dark:border-zinc-600 flex items-center gap-1 z-50">
            <button onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, 'b')} className="p-1 bg-zinc-100 dark:bg-zinc-700 rounded-xl hover:bg-zinc-200">
              <FaBold size={10} />
            </button>
            <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-600"></div>
            <div className="flex gap-1">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, 'c', c)}
                  className="w-3 h-3 rounded-full border-2 border-zinc-300 shadow-sm"
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                onClick={() => toggleWordFormat(selectedWord.vId, selectedWord.wIdx, 'c', undefined)}
                className="w-3 h-3 rounded-full border-2 border-zinc-300 shadow-sm bg-transparent flex items-center justify-center text-xs"
              >
                ✖
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white font-arabic overflow-hidden relative">
      <div className="absolute top-1 right-1 z-50 flex gap-1">
        <button onClick={() => setIsEditMode(true)} className="bg-white/20 hover:bg-white/30 backdrop-blur p-1 rounded-full transition">
          <FaEdit size={10} />
        </button>
      </div>
      <div className="absolute top-1 left-1 z-50 opacity-50 text-sm">
        الكود: {code}
      </div>

      <div
        className="flex overflow-x-auto snap-x snap-mandatory h-full w-full flex-row-reverse items-center hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {verses.length === 0 ? (
          <div className="w-full shrink-0 flex items-center justify-center text-2xl text-zinc-500">
            لا توجد آيات مضافة في هذا اليوم حتى الآن.
          </div>
        ) : (
          verses.map((verse) => (
            <div key={verse.id} className="snap-center shrink-0 w-full h-full flex flex-col items-center justify-center p-1 md:p-3">
              <div className="max-w-6xl text-center">
                <h1 className="text-4xl md:text-7xl lg:text-8xl leading-normal md:leading-normal font-bold text-white">
                  {renderFormattedText(verse, false)}
                </h1>
                <p className="mt-1 text-2xl md:text-4xl text-yellow-400 font-bold opacity-80">
                  {verse.ref}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
