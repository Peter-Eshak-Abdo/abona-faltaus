"use client";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaBookOpen } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function StitchWidgets({ showMenu }: { showMenu: boolean }) {
  const t = useTranslations("Home");
  const [verse, setVerse] = useState({
    text: "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.",
    ref: "(يوحنا 3: 16)",
  });
  const [activePrayer, setActivePrayer] = useState("");

  useEffect(() => {
    const fetchRandomVerse = async () => {
      // فحص الكاش المؤقت لآية اليوم
      const cached = localStorage.getItem("daily_verse_cache");
      if (cached) {
        try {
          const { item, timestamp } = JSON.parse(cached);
          // تجديد كل ساعتين
          if (Date.now() - timestamp < 2 * 60 * 60 * 1000 && item?.text) {
            setVerse(item);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const { count } = await supabase
          .from("bible_verses")
          .select("*", { count: "exact", head: true });

        if (count) {
          const randomOffset = Math.floor(Math.random() * count);
          const { data } = await supabase
            .from("bible_verses")
            .select("vocalized_text, book_name, chapter_number, verse_number")
            .range(randomOffset, randomOffset)
            .single();

          if (data) {
            const DB_TO_ARABIC: Record<string, string> = {
              "01-Genesis": "التكوين", "02-Exodus": "الخروج", "03-Leviticus": "اللاويين",
              "04-Numbers": "العدد", "05-Deuteronomy": "التثنية", "06-Joshua": "يشوع",
              "07-Judges": "القضاة", "08-Ruth": "راعوث", "09-1-Samuel": "صموئيل الأول",
              "10-2-Samuel": "صموئيل الثاني", "11-1-Kings": "الملوك الأول", "12-2-Kings": "الملوك الثاني",
              "13-1-Chronicles": "أخبار الأيام الأول", "14-2-Chronicles": "أخبار الأيام الثاني",
              "15-Ezra": "عزرا", "16-Nehmiah": "نحميا", "17-tobit__deu": "طوبيا",
              "18-judith__deu": "يهوديت", "19-1-Esther": "أستير", "19-2-esther-the-rest__deu": "تتمة أستير",
              "20-Job": "أيوب", "21-1-Psalms": "المزامير", "21-2-Psalm-151__Deu": "مزمور 151",
              "22-Proverbs": "الأمثال", "23-Ecclesiastes": "الجامعة", "24-Song-of-Songs": "نشيد الأنشاد",
              "25-wisdom__deu": "الحكمة", "26-sirach__deu": "يشوع بن سيراخ", "27-Isiah": "إشعياء",
              "28-Jeremiah": "إرميا", "29-Lamentations": "مراثي إرميا", "30-baruch__deu": "باروخ",
              "31-Ezekiel": "حزقيال", "32-1-Daniel": "دانيال", "32-2-daniel-the-rest__deu": "تتمة دانيال",
              "33-Hosea": "هوشع", "34-Joel": "يوئيل", "35-Amos": "عاموس", "36-Obadiah": "عوبديا",
              "37-Jonah": "يونان", "38-Micah": "ميخا", "39-Nahum": "ناحوم", "40-Habakuk": "حبقوق",
              "41-Zephaniah": "صفنيا", "42-Haggai": "حجي", "43-Zechariah": "زكريا", "44-Malachi": "ملاخي",
              "45-first-maccabees__deu": "المكابيين الأول", "46-second-maccabees__deu": "المكابيين الثاني",
              "47-Matthew": "إنجيل متى", "48-Mark": "إنجيل مرقس", "49-Luke": "إنجيل لوقا",
              "50-John": "إنجيل يوحنا", "51-Acts": "أعمال الرسل", "52-Romans": "رسالة رومية",
              "53-1-Corinthians": "رسالة كورنثوس الأولى", "54-2-Corinthians": "رسالة كورنثوس الثانية",
              "55-Galatians": "رسالة غلاطية", "56-Ephesians": "رسالة أفسس", "57-Philipians": "رسالة فيلبي",
              "58-Colossians": "رسالة كولوسي", "59-1-thessalonians": "رسالة تسالونيكي الأولى",
              "60-2-thessalonians": "رسالة تسالونيكي الثانية", "61-1-Timothy": "رسالة تيموثاوس الأولى",
              "62-2-Timothy": "رسالة تيموثاوس الثانية", "63-Titus": "رسالة تيطس", "64-Phillemon": "رسالة فليمون",
              "65-Hebrews": "رسالة عبرانيين", "66-James": "رسالة يعقوب", "67-1-Peter": "رسالة بطرس الأولى",
              "68-2-Peter": "رسالة بطرس الثانية", "69-1-John": "رسالة يوحنا الأولى",
              "70-2-John": "رسالة يوحنا الثانية", "71-3-John": "رسالة يوحنا الثالثة",
              "72-Jude": "رسالة يهوذا", "73-Revelation": "سفر الرؤيا"
            };
            const arabicBookName = DB_TO_ARABIC[data.book_name] || data.book_name.replace(/^\d+-/, "");
            const newVerse = {
              text: data.vocalized_text,
              ref: `(${arabicBookName} ${data.chapter_number} : ${data.verse_number})`,
            };
            setVerse(newVerse);
            localStorage.setItem("daily_verse_cache", JSON.stringify({ item: newVerse, timestamp: Date.now() }));
          }
        }
      } catch (error) {
        console.error("Error fetching verse:", error);
      }
    };

    fetchRandomVerse();
  }, []);

  useEffect(() => {
    const checkPrayerTime = () => {
      const hour = new Date().getHours();
      if (hour >= 21 || hour < 6) setActivePrayer("نصف الليل");
      else if (hour >= 6 && hour < 9) setActivePrayer("باكر");
      else if (hour >= 9 && hour < 12) setActivePrayer("الثالثة");
      else if (hour >= 12 && hour < 15) setActivePrayer("السادسة");
      else if (hour >= 15 && hour < 17) setActivePrayer("التاسعة");
      else if (hour >= 17 && hour < 18) setActivePrayer("الغروب");
      else if (hour >= 18 && hour < 21) setActivePrayer("النوم");
    };
    checkPrayerTime();
    const interval = setInterval(checkPrayerTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const prayers = [
    { id: "باكر", label: "باكر", time: "06:00 ص" },
    { id: "الثالثة", label: "الساعة الثالثة", time: "09:00 ص" },
    { id: "السادسة", label: "الساعة السادسة", time: "12:00 م" },
    { id: "التاسعة", label: "الساعة التاسعة", time: "03:00 م" },
    { id: "الغروب", label: "الغروب", time: "05:00 م" },
    { id: "النوم", label: "النوم", time: "06:00 م" },
    { id: "نصف الليل", label: "نصف الليل", time: "09:00 م" },
  ];

  return (
    <>
      {/* Desktop Widgets */}
      <div className="hidden lg:flex absolute inset-0 z-10 pointer-events-none justify-between p-0.5 items-center">
        {/* Right Widget: Daily Verse */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, x: 48, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.9 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-[320px] pointer-events-auto hover:scale-[1.02] transition-transform duration-700"
            >
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-0.5 shadow-lg flex flex-col gap-0.5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <FaBookOpen size={16} />
                  </div>
                  <span className="font-bold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-widest">{t("dailyVerse")}</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-relaxed text-right relative z-10">
                  "{verse.text}"
                </p>
                <div className="flex justify-end mt-0.5">
                  <span className="font-bold text-xs text-blue-600 bg-blue-500/10 px-1 py-0.5 rounded-full">{verse.ref}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Widget: Prayer Status */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, x: -48, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -48, scale: 0.9 }}
              transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="w-17 pointer-events-auto hover:scale-[1.02] transition-transform duration-700"
            >
              <div className="bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl p-1.5 shadow-lg flex flex-col gap-1 relative overflow-hidden">
                <Link href="/agpeya" className="flex items-center justify-between gap-0.5 mb-0.5 hover:opacity-80 transition">
                  <div className="flex items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <FaSun size={16} />
                    </div>
                    <span className="font-bold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-widest">{t("prayerTimes")}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold">{t("openPrayer")}</span>
                </Link>

                {prayers.map((prayer) => {
                  const isActive = activePrayer === prayer.id;
                  return (
                    <Link
                      href="/agpeya"
                      key={prayer.id}
                      className={`flex items-center justify-between py-0.5 border-b border-gray-200/50 dark:border-gray-700/50 relative hover:bg-amber-500/10 rounded-lg transition ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/10 rounded-lg px-0.5' : 'px-0.5'}`}
                    >
                      {isActive && <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-1.5 bg-blue-600 rounded-l-full"></div>}
                      <span className={`text-sm ${isActive ? 'text-blue-600 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>{prayer.label}</span>
                      <span className={`text-xs ${isActive ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-400'}`}>{prayer.time}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Widget: Prayer Status */}
      <AnimatePresence>
        {!showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="lg:hidden absolute top-9 left-1.5 right-1.5 z-10 pointer-events-auto"
          >
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-lg rounded-3xl p-0.5 shadow-lg border border-gray-200/30 dark:border-gray-700/30">
              <Link href="/agpeya" className="flex items-center justify-between gap-0.5 mb-0.5 hover:opacity-80">
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <FaSun size={12} />
                  </div>
                  <span className="font-bold text-xs text-gray-600 dark:text-gray-300 uppercase tracking-widest">{t("prayerTimes")}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-bold">{t("openPrayer")}</span>
              </Link>
              <div className="flex overflow-x-auto gap-0.5 pb-0.5 scrollbar-none">
                {prayers.map((prayer) => {
                  const isActive = activePrayer === prayer.id;
                  return (
                    <Link
                      href="/agpeya"
                      key={prayer.id}
                      className={`flex-none p-0.5 rounded-xl border text-center transition-all ${isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                        : "bg-white/40 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      <div className={`text-xs font-bold ${isActive ? "text-white" : ""}`}>{prayer.label}</div>
                      <div className={`text-[10px] ${isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{prayer.time}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Widget: Daily Verse */}
      <AnimatePresence>
        {!showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="lg:hidden absolute bottom-1 left-1.5 right-1.5 z-10 pointer-events-auto"
          >
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-lg rounded-3xl p-0.5 shadow-lg border border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center gap-0.5 mb-0.5">
                <FaSun className="text-amber-500" size={16} />
                <span className="font-bold text-xs text-amber-500 uppercase tracking-wider">{t("dailyVerse")}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-0.5 leading-relaxed">
                "{verse.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">{verse.ref}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
