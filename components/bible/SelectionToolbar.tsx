import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaCopy, FaShareAlt, FaStar, FaTimes, FaPlusSquare, FaComments, FaBookOpen } from "react-icons/fa";
import localforage from "localforage";
import { shortBookNames } from "@/lib/books";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

type SelectionToolbarProps = {
  bibleData: BookObj[];
  currentBookIdx: number;
  currentChapterIdx: number;
  selectedVerses: number[];
  setSelectedVerses: (verses: number[]) => void;
  favorites: { bIdx: number; cIdx: number; vNum: number }[];
  setFavorites: (favs: { bIdx: number; cIdx: number; vNum: number }[]) => void;
  isDayModalOpen: boolean;
  setIsDayModalOpen: (open: boolean) => void;
};

export default function SelectionToolbar({
  bibleData,
  currentBookIdx,
  currentChapterIdx,
  selectedVerses,
  setSelectedVerses,
  favorites,
  setFavorites,
  isDayModalOpen,
  setIsDayModalOpen,
}: SelectionToolbarProps) {
  const router = useRouter();
  const t = useTranslations('Bible');

  const formatCitation = () => {
    const activeBook = bibleData[currentBookIdx];
    if (!activeBook) return "";
    const shortName = shortBookNames[activeBook.abbrev as keyof typeof shortBookNames] || activeBook.name;
    const chapterNum = currentChapterIdx + 1;

    const sorted = [...selectedVerses].sort((a, b) => a - b);
    let blocks: number[][] = [];
    let temp = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        temp.push(sorted[i]);
      } else {
        blocks.push(temp);
      }
      temp = [sorted[i]];
    }
    if (temp.length > 0) blocks.push(temp);

    const parts = blocks.map(b => {
      if (b.length >= 3) return `${b[0]}-${b[b.length - 1]}`;
      if (b.length === 2) return `${b[1]}،${b[0]}`;
      return `${b[0]}`;
    });

    return `(${shortName} ${chapterNum} : ${parts.join(" ، ")})`;
  };

  const getSelectedText = () => {
    const activeChapter = bibleData[currentBookIdx]?.chapters?.[currentChapterIdx] || [];
    const sortedVerses = [...selectedVerses].sort((a, b) => a - b);
    const textArr = sortedVerses.map(vNum => {
      const vObj = activeChapter.find(v => v.verse === vNum);
      return vObj ? `(${vNum}) ${vObj.text_vocalized}` : "";
    });
    return `${textArr.join(" ")}\n${formatCitation()}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSelectedText());
    setSelectedVerses([]);
    toast.success(t('copied'));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: t('title'), text: getSelectedText() });
    } else {
      handleCopy();
    }
  };

  const handleExplain = () => {
    const text = getSelectedText();
    const prompt = `من فضلك فسر لي هذه الآية تفسيراً كنسياً وتأملياً مع ذكر الشواهد المرتبطة:\n${text}`;
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleAddToPrep = () => {
    const text = getSelectedText();
    try {
      const currentDraft = localStorage.getItem("prep_draft_content") || "";
      const updated = currentDraft ? `${currentDraft}\n\n📌 **شاهد كتابي:**\n${text}` : `📌 **شاهد كتابي:**\n${text}`;
      localStorage.setItem("prep_draft_content", updated);
      toast.success(t('prepSuccess'));
      setSelectedVerses([]);
    } catch {
      toast.error(t('prepError'));
    }
  };

  const toggleFavorite = async () => {
    let newFavs = [...favorites];
    let addedFavs: { book_idx: number; chapter_idx: number; verse_num: number; user_id?: string }[] = [];
    let removedFavs: any[] = [];

    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    selectedVerses.forEach(vNum => {
      const exists = newFavs.some(f => f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === vNum);

      if (exists) {
        newFavs = newFavs.filter(f => !(f.bIdx === currentBookIdx && f.cIdx === currentChapterIdx && f.vNum === vNum));
        removedFavs.push(vNum);
      } else {
        newFavs.push({ bIdx: currentBookIdx, cIdx: currentChapterIdx, vNum });
        if (userId) {
          addedFavs.push({ book_idx: currentBookIdx, chapter_idx: currentChapterIdx, verse_num: vNum, user_id: userId });
        }
      }
    });

    setFavorites(newFavs);
    await localforage.setItem("bible_favorites", newFavs);
    setSelectedVerses([]);

    if (userId) {
      if (addedFavs.length > 0) {
        await supabase.from("bible_favorites").upsert(addedFavs, { onConflict: 'user_id, book_idx, chapter_idx, verse_num' });
      }
      for (const vNum of removedFavs) {
        await supabase.from("bible_favorites")
          .delete()
          .match({ book_idx: currentBookIdx, chapter_idx: currentChapterIdx, verse_num: vNum, user_id: userId });
      }
    }
  };

  if (selectedVerses.length === 0 || isDayModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] left-1/2 -translate-x-1/2 bg-[#2d1b18]/95 backdrop-blur-xl px-0.5 py-0.5 rounded-2xl shadow-2xl z-50 flex items-center origin-bottom border border-amber-500/20 gap-1 max-w-[95vw] overflow-x-auto"
      >
        <button onClick={handleExplain} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-cyan-300 hover:bg-white/10 transition-colors" title={t('explain')}>
          <FaComments size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('explain')}</span>
        </button>
        <button onClick={handleAddToPrep} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-amber-300 hover:bg-white/10 transition-colors" title={t('prepNote')}>
          <FaBookOpen size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('prepNote')}</span>
        </button>
        <button onClick={() => setIsDayModalOpen(true)} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-stone-200 hover:bg-white/10 transition-colors" title={t('meeting')}>
          <FaPlusSquare size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('meeting')}</span>
        </button>
        <button onClick={handleShare} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-stone-200 hover:bg-white/10 transition-colors" title={t('share')}>
          <FaShareAlt size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('share')}</span>
        </button>
        <button onClick={handleCopy} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-stone-200 hover:bg-white/10 transition-colors" title={t('copy')}>
          <FaCopy size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('copy')}</span>
        </button>
        <button onClick={toggleFavorite} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-yellow-400 hover:bg-white/10 transition-colors" title={t('favorites')}>
          <FaStar size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('favorites')}</span>
        </button>
        <div className="w-px h-6 bg-white/20 mx-0.5"></div>
        <button onClick={() => setSelectedVerses([])} className="px-0.5 py-0.5 flex flex-col items-center justify-center rounded-xl text-red-400 hover:bg-white/10 transition-colors" title={t('cancelSelection')}>
          <FaTimes size={16} />
          <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">{t('cancelSelection')}</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
