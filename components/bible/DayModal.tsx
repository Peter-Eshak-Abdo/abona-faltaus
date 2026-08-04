import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react"
import { shortBookNames } from "@/lib/books";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function DayModal({ onClose }: { onClose: () => void }) {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [dayCodeInput, setDayCodeInput] = useState("");
  const [dayMessage, setDayMessage] = useState("");
  const [isAddingToDay, setIsAddingToDay] = useState(false);
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);


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
        .select('verses')
        .eq('code', dayCodeInput)
        .single();

      if (fetchError || !dayData) {
        setDayMessage("لم يتم العثور على يوم بهذا الكود");
        setIsAddingToDay(false);
        return;
      }

      const activeBook = bibleData[currentBookIdx];
      const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
      const chapterNum = currentChapterIdx + 1;
      const activeChapter = activeBook.chapters[currentChapterIdx];

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
      setDayMessage("تمت الإضافة بنجاح!");
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
      <div className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-1 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-surface rounded-3xl p-1 w-full max-w-sm shadow-2xl border border-surface-variant/30"
        >
          <h3 className="text-xl font-bold mb-0.5 text-center text-on-surface">إضافة الآيات ليوم</h3>
          <p className="text-sm text-on-surface-variant mb-1 text-center">أدخل كود اليوم المكون من 12 رقم لإضافة الآيات إليه.</p>
          <input
            type="text"
            maxLength={12}
            value={dayCodeInput}
            onChange={e => setDayCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="مثال: 123456789012"
            className="w-full p-1 border border-surface-variant rounded-xl text-center tracking-[0.2em] font-bold text-lg bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-on-surface mb-1"
            dir="ltr"
          />
          <div className="flex gap-1">
            <button
              onClick={handleAddToDay}
              disabled={isAddingToDay || dayCodeInput.length !== 12}
              className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-bold py-1 rounded-xl transition-colors disabled:opacity-50"
            >
              {isAddingToDay ? "جاري الإضافة..." : "إضافة الآن"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-1 rounded-xl transition-colors"
            >
              إلغاء
            </button>
          </div>
          <div className="mt-1 text-center">
            <Link href="/bible/day" className="text-primary text-sm font-bold hover:underline">
              لا تملك كود؟ أنشئ يوم جديد من هنا
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
