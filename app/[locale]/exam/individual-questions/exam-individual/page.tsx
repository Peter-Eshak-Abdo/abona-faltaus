"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import Link from "next/link";
import {
  Trophy,
  Sparkles,
  Clock,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Share2,
  Award,
  Zap,
  Flame,
  Volume2
} from "lucide-react";
import {
  COMPREHENSIVE_QUESTIONS_BANK,
  LEVEL_BADGES,
  QUIZ_CATEGORIES,
  QuizLevelQuestion
} from "@/lib/church-quiz-levels";

function IndividualQuizArena() {
  const router = useRouter();
  const searchParams = useSearchParams()!;

  const levelParam = Number(searchParams.get("level") || 1);
  const categoriesParam = useSearchParams().get("categories")?.split(",") || [
    "coptic",
    "hymns",
    "history",
    "bible",
    "dogma",
    "rites",
  ];
  const countParam = Number(searchParams.get("count") || 10);
  const timeLimitParam = Number(searchParams.get("time") || 30);

  const [questions, setQuestions] = useState<QuizLevelQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showMysteryHint, setShowMysteryHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitParam);
  const [timerRunning, setTimerRunning] = useState(true);
  const [userName, setUserName] = useState("");

  // Load questions matching level and categories
  useEffect(() => {
    let pool = COMPREHENSIVE_QUESTIONS_BANK.filter(
      (q) => q.level === levelParam && categoriesParam.includes(q.category)
    );

    // Fallback if pool too small, include adjacent level questions
    if (pool.length === 0) {
      pool = COMPREHENSIVE_QUESTIONS_BANK.filter((q) =>
        categoriesParam.includes(q.category)
      );
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, Math.min(countParam, shuffled.length)));
    setTimeLeft(timeLimitParam);
    setTimerRunning(true);
  }, [levelParam, categoriesParam.join(","), countParam, timeLimitParam]);

  // Load User Name if saved
  useEffect(() => {
    const savedStats = localStorage.getItem("church_quiz_user_profile");
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        if (parsed.userName) setUserName(parsed.userName);
      } catch (e) {}
    }
  }, []);

  const currentQuestion = questions[currentIdx];

  // Timer Countdown
  useEffect(() => {
    if (!timerRunning || isFinished || timeLeft <= 0 || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, isFinished, timeLeft, currentQuestion]);

  const handleTimeOut = () => {
    if (!currentQuestion) return;
    if (!selectedAnswers[currentQuestion.id]) {
      setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: "__TIMEOUT__" }));
      setShowExplanation(true);
      setStreak(0);
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswers[currentQuestion?.id]) return; // already answered

    const isCorrect = option === currentQuestion.correctAnswer;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    setShowExplanation(true);
    setTimerRunning(false);

    if (isCorrect) {
      const addedPoints = currentQuestion.points + (streak >= 3 ? 10 : 0);
      setScore((prev) => prev + addedPoints);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setShowMysteryHint(false);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setTimeLeft(timeLimitParam);
      setTimerRunning(true);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    setTimerRunning(false);

    // Save Score & Progression to LocalStorage
    try {
      const existing = localStorage.getItem("church_quiz_user_profile");
      let stats = existing
        ? JSON.parse(existing)
        : {
            totalScore: 0,
            currentLevel: 1,
            solvedCount: 0,
            completedBadges: ["1"],
            highestStreak: 0,
            userName: userName || "فارس أرثوذكسي",
          };

      stats.totalScore = (stats.totalScore || 0) + score;
      stats.solvedCount = (stats.solvedCount || 0) + questions.length;
      if (maxStreak > (stats.highestStreak || 0)) stats.highestStreak = maxStreak;

      // Check level upgrades
      LEVEL_BADGES.forEach((b) => {
        if (stats.totalScore >= b.minScore && !stats.completedBadges.includes(String(b.level))) {
          stats.completedBadges.push(String(b.level));
          stats.currentLevel = Math.max(stats.currentLevel, b.level);
        }
      });

      if (userName) stats.userName = userName;

      localStorage.setItem("church_quiz_user_profile", JSON.stringify(stats));
    } catch (e) {
      console.error(e);
    }

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const handleShare = async () => {
    const el = document.getElementById("quiz-result-card");
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#18181b",
        onclone: (clonedDoc) => {
          const target = clonedDoc.getElementById("quiz-result-card");
          if (target) {
            target.querySelectorAll("*").forEach((node: any) => {
              const style = window.getComputedStyle(node);
              if (style.color?.includes("lab") || style.backgroundColor?.includes("lab")) {
                node.style.color = "#ffffff";
                node.style.backgroundColor = "transparent";
              }
            });
          }
        },
      });
      if (navigator.share) {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], "church-quiz-score.png", { type: "image/png" });
          navigator.share({
            title: `نتيجة مسابقة الفارس الأرثوذكسي ✝️`,
            text: `حققت ${score} نقطة في المستوى ${levelParam}! جرب واختبر معلوماتك الكنسية الآن.`,
            files: [file],
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-2">
        <div className="text-center space-y-2">
          <div className="animate-spin text-amber-400 mx-auto text-3xl">⏳</div>
          <p className="text-lg font-bold">جاري تحميل ميدان المسابقة...</p>
        </div>
      </div>
    );
  }

  const categoryMeta = QUIZ_CATEGORIES.find((c) => c.id === currentQuestion?.category);
  const currentBadge = LEVEL_BADGES.find((b) => b.level === levelParam) || LEVEL_BADGES[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-zinc-900 to-black text-white p-1 sm:p-2 font-sans flex flex-col justify-between" dir="rtl">
      {/* Top HUD Bar */}
      <div className="max-w-4xl mx-auto w-full space-y-1">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
          <Link
            href="/exam/individual-questions"
            className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-0.5"
          >
            <ArrowRight size={15} />
            <span>إنهاء / خروج</span>
          </Link>

          <div className="flex items-center gap-1">
            {streak >= 2 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.25 px-1 py-0.25 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black"
              >
                <Flame size={14} className="animate-bounce" />
                <span>سلسلة صحيحة x{streak}</span>
              </motion.div>
            )}

            <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
              <Zap size={14} />
              <span>{score} نقطة</span>
            </div>
          </div>
        </div>

        {/* Progress & Timer Bar */}
        {!isFinished && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold">
                السؤال {currentIdx + 1} من {questions.length}
              </span>
              <span className="flex items-center gap-0.5 font-mono text-amber-400 font-bold">
                <Clock size={13} /> {timeLeft} ثانية
              </span>
            </div>

            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-blue-500 to-amber-500"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Question / Result Area */}
      <main className="max-w-4xl mx-auto w-full my-auto py-2">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-1.5 sm:p-2.5 shadow-2xl space-y-2 backdrop-blur-md"
            >
              {/* Category & Badge Header */}
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xl p-1 rounded-xl bg-black/40 border border-white/10">
                    {categoryMeta?.icon}
                  </span>
                  <div>
                    <h3 className={`text-xs sm:text-sm font-black ${categoryMeta?.color}`}>
                      {categoryMeta?.titleAr}
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      المستوى {currentQuestion.level} ({currentBadge.nameAr})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {currentQuestion.mysteryHint && !showMysteryHint && !showExplanation && (
                    <button
                      onClick={() => setShowMysteryHint(true)}
                      className="px-1 py-0.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/20 transition flex items-center gap-0.5"
                    >
                      <HelpCircle size={13} />
                      <span>كشف التلميح الغامض 🔮</span>
                    </button>
                  )}
                  <span className="px-1 py-0.5 rounded-lg bg-zinc-800 text-[11px] font-bold text-amber-400">
                    +{currentQuestion.points} نقطة
                  </span>
                </div>
              </div>

              {/* Mystery Hint Box */}
              {showMysteryHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-1 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs leading-relaxed"
                >
                  <span className="font-black text-purple-400 ml-0.5">🔮 التلميح الكنسي:</span>
                  {currentQuestion.mysteryHint}
                </motion.div>
              )}

              {/* Question Text */}
              <h2 className="text-base sm:text-xl font-black text-white leading-relaxed text-right">
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const hasAnswered = !!selectedAnswers[currentQuestion.id];

                  let btnStyle = "bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-100";
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-600/30 border-rose-500 text-rose-200";
                    } else {
                      btnStyle = "opacity-40 bg-zinc-900 border-zinc-800 text-zinc-500";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={hasAnswered}
                      className={`p-1.5 rounded-2xl border-2 text-right transition-all font-bold text-xs sm:text-sm flex items-center justify-between gap-1 ${btnStyle}`}
                    >
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle size={18} className="text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Step */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1"
                >
                  <div className="text-xs text-zinc-300 leading-relaxed">
                    <span className="font-black text-amber-400 ml-0.5">💡 الشرح الكنسي:</span>
                    {currentQuestion.explanation || "إجابة مباركة وسليمة!"}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-0.5"
                  >
                    <span>
                      {currentIdx + 1 < questions.length ? "السؤال التالي ⬅️" : "عرض النتيجة النهائية 🏆"}
                    </span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Results & Score Card */
            <motion.div
              id="quiz-result-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-linear-to-b from-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-2 sm:p-3 text-center space-y-2 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
                <Trophy size={32} />
              </div>

              <div className="space-y-0.5">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  مبروك يا بطل! أنهيت التحدي بنجاح
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  تم حفظ النقاط في ملفك الشخصي لترقية رتبتك الكنسية!
                </p>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-1 max-w-lg mx-auto py-1">
                <div className="p-1 rounded-2xl bg-zinc-800/60 border border-zinc-700">
                  <span className="text-xs text-zinc-400 block">مجموع النقاط</span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">+{score}</span>
                </div>
                <div className="p-1 rounded-2xl bg-zinc-800/60 border border-zinc-700">
                  <span className="text-xs text-zinc-400 block">أعلى سلسلة</span>
                  <span className="text-lg sm:text-xl font-black text-orange-400">x{maxStreak}</span>
                </div>
                <div className="p-1 rounded-2xl bg-zinc-800/60 border border-zinc-700">
                  <span className="text-xs text-zinc-400 block">المستوى</span>
                  <span className="text-lg sm:text-xl font-black text-cyan-400">
                    {currentBadge.icon} {currentBadge.nameAr.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 pt-1">
                <button
                  onClick={handleShare}
                  className="w-full sm:w-auto px-2 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-0.5 shadow-md"
                >
                  <Share2 size={15} />
                  <span>مشاركة النتيجة 📲</span>
                </button>
                <Link
                  href="/exam/individual-questions"
                  className="w-full sm:w-auto px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-0.5 shadow-md"
                >
                  <RotateCcw size={15} />
                  <span>تحدي مستوى آخر 🔄</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="text-center text-[10px] text-zinc-500 py-0.5">
        مسابقة الفارس الأرثوذكسي — منصة أبونا فلتاؤس
      </footer>
    </div>
  );
}

export default function ExamIndividualPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="animate-spin text-amber-400 text-2xl">⏳</div>
        </div>
      }
    >
      <IndividualQuizArena />
    </Suspense>
  );
}
