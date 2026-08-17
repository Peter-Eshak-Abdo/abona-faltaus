import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { FaCopy, FaShareAlt, FaStar, FaTimes, FaPlusSquare } from "react-icons/fa";
import localforage from "localforage";
import { shortBookNames } from "@/lib/books";

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
        temp = [sorted[i]];
      }
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
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "آيات من موقع ابونا فلتاؤس تفاحة", text: getSelectedText() });
    } else {
      handleCopy();
      alert("تم النسخ للحافظة!");
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
        className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] left-1/2 -translate-x-1/2 bg-inverse-surface/95 backdrop-blur-xl p-0.5 rounded-2xl shadow-2xl z-50 flex items-center origin-bottom border border-white/10"
      >
        <button onClick={() => setIsDayModalOpen(true)} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
          <FaPlusSquare size={18} />
          <span className="text-[11px] font-bold mt-0.5">يوم</span>
        </button>
        <button onClick={handleShare} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
          <FaShareAlt size={18} />
          <span className="text-[11px] font-bold mt-0.5">مشاركة</span>
        </button>
        <button onClick={handleCopy} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-inverse-on-surface hover:bg-white/10 transition-colors">
          <FaCopy size={18} />
          <span className="text-[11px] font-bold mt-0.5">نسخ</span>
        </button>
        <button onClick={toggleFavorite} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-yellow-400 hover:bg-white/10 transition-colors">
          <FaStar size={18} />
          <span className="text-[11px] font-bold mt-0.5">مفضلة</span>
        </button>
        <div className="w-px h-3 bg-black/20"></div>
        <button onClick={() => setSelectedVerses([])} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-red-400 hover:bg-white/10 transition-colors">
          <FaTimes size={18} />
          <span className="text-[11px] font-bold mt-0.5">إلغاء</span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
