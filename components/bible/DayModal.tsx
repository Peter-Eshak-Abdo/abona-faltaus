import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react"
import { shortBookNames } from "@/lib/books";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

type DayModalProps = {
  bibleData: BookObj[];
  currentBookIdx: number;
  currentChapterIdx: number;
  selectedVerses: number[];
  setSelectedVerses: (verses: number[]) => void;
  onClose: () => void;
};

export default function DayModal({
  bibleData,
  currentBookIdx,
  currentChapterIdx,
  selectedVerses,
  setSelectedVerses,
  onClose,
}: DayModalProps) {
  const [dayCodeInput, setDayCodeInput] = useState("");
  const [dayMessage, setDayMessage] = useState("");
  const [isAddingToDay, setIsAddingToDay] = useState(false);

  const handleAddToDay = async () => {
    if (!dayCodeInput || dayCodeInput.length !== 12) {
      setDayMessage("يرجى إدخال كود صحيح مكون من 12 رقم");
      return;
    }

    setIsAddingToDay(true);
    setDayMessage("");

    try {
      const { data: dayData, error: fetchError } = await supabase
        .from('meeting_days')
        .select('title, verses')
        .eq('code', dayCodeInput)
        .single();

      if (fetchError || !dayData) {
        setDayMessage("لم يتم العثور على يوم بهذا الكود");
        setIsAddingToDay(false);
        return;
      }

      const activeBook = bibleData[currentBookIdx];
      const activeChapter = activeBook?.chapters?.[currentChapterIdx];

      if (!activeBook || !activeChapter) {
        setDayMessage("حدث خطأ في تحديد الآيات المختارة");
        setIsAddingToDay(false);
        return;
      }

      const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
      const chapterNum = currentChapterIdx + 1;

      const newVerses = selectedVerses.sort((a, b) => a - b).map(vNum => {
        const vObj = activeChapter.find(v => v.verse === vNum);
        return {
          id: Math.random().toString(36).substring(2, 11),
          text: vObj?.text_vocalized || "",
          ref: `${shortName} ${chapterNum}:${vNum}`,
          wordsConfig: {}
        };
      });

      const updatedVerses = [...(dayData.verses || []), ...newVerses];

      const { error: updateError } = await supabase
        .from('meeting_days')
        .update({ verses: updatedVerses })
        .eq('code', dayCodeInput);

      if (updateError) throw updateError;

      localStorage.setItem("last_day_code", dayCodeInput);
      const meetingName = dayData.title ? ` (${dayData.title})` : "";
      setDayMessage(`✅ تم الإضافة بنجاح إلى اجتماع${meetingName}`);
      setTimeout(() => {
        onClose();
        setDayMessage("");
        setSelectedVerses([]);
      }, 1500);

    } catch (error) {
      console.error(error);
      setDayMessage("حدث خطأ أثناء الإضافة");
    }
    setIsAddingToDay(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          <h3 className="text-lg font-bold mb-1 text-center text-zinc-900 dark:text-zinc-100">إضافة الآيات لاجتماع</h3>
          <p className="text-xs text-zinc-500 mb-4 text-center">أدخل كود اليوم (12 رقم) لإضافة الآيات المختارة إليه.</p>

          {dayMessage && (
            <div className={`p-2.5 mb-3 rounded-xl text-xs font-bold text-center ${dayMessage.startsWith("✅") ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>
              {dayMessage}
            </div>
          )}

          <input
            type="text"
            maxLength={12}
            value={dayCodeInput}
            onChange={e => setDayCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="مثال: 123456789012"
            className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-center tracking-[0.2em] font-black text-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 mb-4"
            dir="ltr"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddToDay}
              disabled={isAddingToDay || dayCodeInput.length !== 12}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 shadow-md"
            >
              {isAddingToDay ? "جاري الإضافة..." : "إضافة الآن"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              إلغاء
            </button>
          </div>
          <div className="mt-3 text-center">
            <Link href="/bible/day" className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">
              لا تملك كود؟ أنشئ اجتماع جديد من هنا
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
