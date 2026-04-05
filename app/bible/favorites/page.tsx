"use client";

import { useState, useEffect } from "react";
import localforage from "localforage";
import Link from "next/link";
import { FaTrash, FaBookOpen, FaArrowRight } from "react-icons/fa";
import { supabase } from "@/lib/supabase"; // تأكد من مسار السوبابيز عندك

type FavItem = { bIdx: number; cIdx: number; vNum: number };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [bibleData, setBibleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // 1. جلب الكتاب المقدس عشان نجيب نص الآية
      const bData = await localforage.getItem<any[]>("offline_bible_data");
      if (bData) setBibleData(bData);

      // 2. جلب المفضلة من الأوفلاين أولاً للسرعة
      const localFavs = await localforage.getItem<FavItem[]>("bible_favorites") || [];
      setFavorites(localFavs);

      // 3. (اختياري) مزامنة مع Supabase لو المستخدم عامل تسجيل دخول
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const { data: onlineFavs } = await supabase.from("bible_favorites").select("*");
        if (onlineFavs) {
          const syncedFavs = onlineFavs.map((f: { book_idx: any; chapter_idx: any; verse_num: any; }) => ({ bIdx: f.book_idx, cIdx: f.chapter_idx, vNum: f.verse_num }));
          setFavorites(syncedFavs);
          await localforage.setItem("bible_favorites", syncedFavs); // تحديث الأوفلاين
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const removeFavorite = async (bIdx: number, cIdx: number, vNum: number) => {
    // 1. مسح من الـ State
    const newFavs = favorites.filter(f => !(f.bIdx === bIdx && f.cIdx === cIdx && f.vNum === vNum));
    setFavorites(newFavs);

    // 2. مسح من الأوفلاين
    await localforage.setItem("bible_favorites", newFavs);

    // 3. مسح من Supabase
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      await supabase.from("bible_favorites")
        .delete()
        .match({ book_idx: bIdx, chapter_idx: cIdx, verse_num: vNum, user_id: session.session.user.id });
    }
  };

  if (isLoading) return <div className="p-8 text-center">جاري تحميل المفضلة...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-1 md:p-2 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-1 mb-1">
          <Link href="/bible" className="p-1 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition">
            <FaArrowRight />
          </Link>
          <h1 className="text-3xl font-extrabold text-blue-800 dark:text-blue-400">الآيات المفضلة</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-2 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border dark:border-zinc-800">
            <FaBookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>لا توجد آيات في المفضلة حتى الآن.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {favorites.map((fav, i) => {
              const book = bibleData[fav.bIdx];
              const verseObj = book?.chapters[fav.cIdx]?.find((v: any) => v.verse === fav.vNum);
              if (!book || !verseObj) return null;

              return (
                <div key={i} className="bg-white dark:bg-zinc-900 p-1 rounded-2xl shadow-sm border dark:border-zinc-800 flex flex-col md:flex-row gap-1 justify-between items-start md:items-center">
                  <div>
                    <div className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">
                      {book.name} - إصحاح {fav.cIdx + 1} : {fav.vNum}
                    </div>
                    <p className="font-arabic text-lg text-justify leading-loose">
                      {verseObj.text_vocalized}
                    </p>
                  </div>

                  <div className="flex gap-1 w-full md:w-auto mt-1 md:mt-0">
                    {/* زرار الذهاب للآية بيحفظ المكان في localStorage ويوديه لصفحة الكتاب */}
                    <button
                      onClick={() => {
                        localStorage.setItem("bible_last_read", JSON.stringify({ bIdx: fav.bIdx, cIdx: fav.cIdx }));
                        window.location.href = "/bible";
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition font-bold text-sm"
                    >
                      <FaBookOpen /> اقرأ
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.bIdx, fav.cIdx, fav.vNum)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition font-bold text-sm"
                    >
                      <FaTrash /> إزالة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
