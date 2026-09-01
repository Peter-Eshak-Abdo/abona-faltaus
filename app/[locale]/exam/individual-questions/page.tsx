"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Flame,
  Clock,
  HelpCircle,
  ArrowRight,
  Play,
  Award,
  Layers,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import {
  QUIZ_CATEGORIES,
  LEVEL_BADGES,
  COMPREHENSIVE_QUESTIONS_BANK,
  QuizCategoryMeta
} from "@/lib/church-quiz-levels";

export default function IndividualQuestionsHub() {
  const router = useRouter();

  // User Profile & Stats from localStorage
  const [userStats, setUserStats] = useState({
    totalScore: 0,
    currentLevel: 1,
    solvedCount: 0,
    completedBadges: ["1"],
    highestStreak: 0,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "coptic",
    "hymns",
    "history",
    "bible",
    "dogma",
    "rites",
  ]);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [timeMode, setTimeMode] = useState<number>(30); // seconds per question or total
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("church_quiz_user_profile");
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId)
        ? prev.length > 1
          ? prev.filter((c) => c !== catId)
          : prev
        : [...prev, catId]
    );
  };

  const handleStartGame = () => {
    const params = new URLSearchParams();
    params.set("level", selectedLevel.toString());
    params.set("categories", selectedCategories.join(","));
    params.set("count", questionCount.toString());
    params.set("time", timeMode.toString());

    router.push(`/exam/individual-questions/exam-individual?${params.toString()}`);
  };

  const currentBadge =
    LEVEL_BADGES.find((b) => b.level === userStats.currentLevel) || LEVEL_BADGES[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-zinc-900 to-black text-white p-1 sm:p-2 font-sans" dir="rtl">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-1">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
          <div className="flex items-center gap-1">
            <Link
              href="/exam"
              className="p-1 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition flex items-center gap-0.5 text-xs font-bold"
            >
              <ArrowRight size={16} />
              <span>رجوع للمسابقات</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-1">
              <Trophy className="text-amber-400" size={24} />
              مسابقة الفارس الأرثوذكسي الفردية
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
              <span>{userStats.totalScore} نقطة</span>
              <Sparkles size={14} />
            </div>
            <div className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <span>{currentBadge.icon} {currentBadge.nameAr}</span>
            </div>
          </div>
        </div>

        {/* Hero Card & Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-2 bg-linear-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 border border-blue-500/20 shadow-2xl backdrop-blur-md"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="space-y-1 text-center md:text-right">
              <div className="inline-flex items-center gap-0.5 px-1 py-0.25 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Flame size={14} /> نظام المستويات والتحدي التراكمي
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                ارتقِ بمستواك الكنسي واجمع النقاط والأوسمة
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                تحدَّ نفسك في مجالات الكنيسة الستة: القبطي، الألحان، تاريخ الآباء، الإنجيل، العقيدة، والطقوس. كل مستوى يفتح لك أسئلة غامضة وتحديات جديدة!
              </p>
            </div>

            {/* Level Selector Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10">
              {LEVEL_BADGES.map((badge) => {
                const isSelected = selectedLevel === badge.level;
                const isUnlocked = userStats.totalScore >= badge.minScore;

                return (
                  <button
                    key={badge.level}
                    onClick={() => setSelectedLevel(badge.level)}
                    className={`flex flex-col items-center p-1 rounded-xl transition border text-xs font-bold relative ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md shadow-amber-500/20"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <span className="text-xl mb-0.5">{badge.icon}</span>
                    <span className="text-[11px] font-black">{badge.nameAr.split(" ")[0]}</span>
                    <span className="text-[9px] opacity-70">المستوى {badge.level}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Categories Selection */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black flex items-center gap-0.5 text-zinc-200">
              <Layers size={18} className="text-cyan-400" />
              اختر المجالات الكنسية للتحدي:
            </h3>
            <button
              onClick={() =>
                setSelectedCategories(
                  selectedCategories.length === QUIZ_CATEGORIES.length
                    ? ["coptic"]
                    : QUIZ_CATEGORIES.map((c) => c.id)
                )
              }
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              {selectedCategories.length === QUIZ_CATEGORIES.length ? "إلغاء التحديد" : "تحديد الكل"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {QUIZ_CATEGORIES.map((cat) => {
              const isChecked = selectedCategories.includes(cat.id);
              const qCount = COMPREHENSIVE_QUESTIONS_BANK.filter(
                (q) => q.category === cat.id && q.level === selectedLevel
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`cursor-pointer p-1 rounded-2xl border transition-all duration-200 flex items-start gap-1 relative overflow-hidden ${
                    isChecked
                      ? `bg-linear-to-br ${cat.bgGradient} border-white/20 shadow-lg scale-101`
                      : "bg-zinc-900/40 border-zinc-800/80 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="text-2xl p-1 rounded-xl bg-black/40 shrink-0">
                    {cat.icon}
                  </div>
                  <div className="space-y-0.25 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold truncate ${cat.color}`}>
                        {cat.titleAr}
                      </h4>
                      {isChecked && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Rules & Start Button Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-1.5 flex flex-col sm:flex-row items-center justify-between gap-1 shadow-xl">
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-0.5">
              <Clock size={15} className="text-amber-400" />
              <span>مؤقت تفاعلي ذكي لكل سؤال</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Award size={15} className="text-purple-400" />
              <span>نقاط تراكمية وحفظ تلقائي في ملفك</span>
            </div>
            <div className="flex items-center gap-0.5">
              <HelpCircle size={15} className="text-cyan-400" />
              <span>تلميحات غامضة وشرح بعد الإجابة</span>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={selectedCategories.length === 0}
            className="w-full sm:w-auto px-3 py-1 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 text-sm flex items-center justify-center gap-0.5 transition active:scale-98 disabled:opacity-50"
          >
            <Play size={16} />
            <span>انطلق في الامتحان الفردي</span>
          </button>
        </div>
      </div>
    </div>
  );
}
