"use client";
import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import "../../exam.model.css";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  type: "mcq" | "tf";
  category: string;
};

type GroupResult = {
  group: number;
  score: number;
  total: number;
};

function GroupedQuestionsContent() {
  const searchParams = useSearchParams()!;
  const router = useRouter();

  const totalQuestions = Number(searchParams.get("questions") || 10);
  const totalGroups = Number(searchParams.get("groups") || 1);
  const timePerGroup = Number(searchParams.get("time") || 10);
  const selectedCategories = useMemo(() => searchParams.get("categories")?.split(",") || [], [searchParams]);

  const [questionsPool, setQuestionsPool] = useState<Question[][]>([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(timePerGroup * 60);
  const [timerActive, setTimerActive] = useState(true);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<{ [key: number]: boolean }>({});
  const [categoriesCount, setCategoriesCount] = useState<{ [key: string]: number }>({});
  const [shareImageURL, setShareImageURL] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const currentQuestions = questionsPool[currentGroup] || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  useEffect(() => {
    if (hasLoaded) return;
    const loadQuestions = async () => {
      try {
        const res = await fetch("/exam/simple.json");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        const counts: { [key: string]: number } = {};
        const allQuestions: Question[] = [];

        data.forEach((category: { category: string; questions: { question: string; options?: string[]; answer: boolean | string; type: "mcq" | "tf" }[] }) => {
          if (!category || !category.category || !category.questions) return;
          if (!selectedCategories.includes(category.category)) return;

          counts[category.category] = category.questions.length;

          if (selectedCategories.includes(category.category)) {
            category.questions.forEach((q: { question: string; options?: string[]; answer: boolean | string; type: "mcq" | "tf" }) => {
              if (!q) return;

              if (q.type === "tf") {
                allQuestions.push({
                  id: allQuestions.length + 1,
                  text: q.question || "",
                  options: ["صح", "خطأ"],
                  correctAnswer: q.answer ? "صح" : "خطأ",
                  type: q.type,
                  category: category.category
                });
              } else {
                allQuestions.push({
                  id: allQuestions.length + 1,
                  text: q.question || "",
                  options: q.options || [],
                  correctAnswer: String(q.answer) || "",
                  type: q.type,
                  category: category.category
                });
              }
            });
          }
        });

        const actualCounts = allQuestions.reduce((acc, q) => {
          acc[q.category] = (acc[q.category] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });
        setCategoriesCount(actualCounts);

        if (allQuestions.length === 0) {
          throw new Error("No questions found for selected categories");
        }

        // التصحيح الرئيسي هنا: إنشاء مجموعة أسئلة لكل مجموعة
        const pool: Question[][] = [];
        for (let i = 0; i < totalGroups; i++) {
          const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
          pool.push(shuffled.slice(0, totalQuestions));
        }
        setQuestionsPool(pool); // حفظ كل المجموعات

      } catch (error) {
        console.error("Error loading questions:", error);
        setQuestionsPool([]);
      } finally {
        setIsLoading(false);
        setTimerActive(true);
      }
    };
    loadQuestions().then(() => setHasLoaded(true));
  }, [hasLoaded, selectedCategories, totalGroups, totalQuestions]);

  // إتمام المجموعة الحالية
  const finishCurrentGroup = useCallback(() => {
    const currentQs = questionsPool[currentGroup];
    let correct = 0;

    currentQs.forEach((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correct++;
      setQuestionStatus(prev => ({ ...prev, [q.id]: isCorrect }));
    });

    setGroupResults((prev) => [
      ...prev,
      { group: currentGroup + 1, score: correct, total: currentQs.length }
    ]);

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF69B4', '#00FF00']
    });

    if (currentGroup + 1 >= totalGroups) {
      setQuizFinished(true);
    } else {
      setCurrentGroup(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimeLeft(timePerGroup * 60);
      setTimerActive(true);
    }
  }, [questionsPool, currentGroup, selectedAnswers, totalGroups, setQuizFinished, setCurrentGroup, setCurrentQuestionIndex, setSelectedAnswers, setTimeLeft, setTimerActive, setGroupResults, setQuestionStatus, timePerGroup]);

  // إدارة المؤقت الزمني
  useEffect(() => {
    if (!timerActive || quizFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishCurrentGroup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, quizFinished, finishCurrentGroup]);

  // التعامل مع الزر التالي/إنهاء
  const handleNextOrFinish = () => {
    if (currentQuestionIndex === currentQuestions.length - 1) {
      finishCurrentGroup();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // عرض أزرار الترقيم
  const renderPagination = () => (
    <div className="flex flex-wrap gap-2 justify-center my-3">
      {currentQuestions.map((q, index) => {
        const answered = selectedAnswers[q.id];
        const status = questionStatus[q.id];
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        if (currentQuestionIndex === index) {
          variant = "default";
        } else if (answered) {
          variant = status ? "default" : "destructive";
        }
        return (
          <Button
            key={q.id}
            size="sm"
            variant={variant}
            className="rounded-full"
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  );

  const handleAnswer = (option: string) => {
    if (!currentQuestion) return;

    const isCorrect = option === currentQuestion.correctAnswer;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: option
    }));

    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: isCorrect
    }));
  };

  useEffect(() => {
    setTimeLeft(timePerGroup * 60);
  }, [currentGroup, timePerGroup]);

  const generateShareImage = async () => {
    const element = document.getElementById("result-share-box");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#18181b",
      onclone: (clonedDoc) => {
        const el = clonedDoc.getElementById("result-share-box");
        if (el) {
          el.querySelectorAll("*").forEach((node: any) => {
            const style = window.getComputedStyle(node);
            if (style.color?.includes("lab") || style.backgroundColor?.includes("lab")) {
              node.style.color = "#ffffff";
              node.style.backgroundColor = "transparent";
            }
          });
        }
      },
    });
    const dataUrl = canvas.toDataURL("image/png");
    setShareImageURL(dataUrl);

    // مشاركة عبر Web Share API (للأجهزة التي تدعمه)
    if (navigator.canShare && navigator.canShare({ files: [] })) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "result.png", { type: "image/png" });
        navigator.share({
          title: "نتيجتي في الامتحان 🎉",
          text: "جرب تطبيق الاختبارات هذا!",
          files: [file],
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-3 relative">
      <div className="absolute w-full top-0 left-0">
        <div className="wave-animation"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={quizFinished ? "done" : currentGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded shadow w-full md:w-3/4"
        >
          {quizFinished ? (
            <div id="result-share-box" className="text-center">
              <audio autoPlay>
                <source src="/exam/success.mp3" type="audio/mpeg" />
              </audio>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-500 text-white p-4 rounded shadow-xl border-2 border-green-500"
              >
                <h2 className="text-2xl mb-4 font-bold">🏆 النتائج النهائية</h2>

                {groupResults.map((group) => (
                  <div key={group.group} className="my-3 text-lg">
                    <span className="font-bold">المجموعة {group.group}: </span>
                    <span className="text-yellow-500">
                      {group.score}/{group.total}
                    </span>
                  </div>
                ))}

                <div className="mt-4">
                  <h5 className="text-lg mb-3">توزيع الأسئلة:</h5>
                  <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(categoriesCount).map(([cat, count]) => (
                      <span key={cat} className="bg-blue-500 text-white px-2 py-1 rounded">
                        {cat}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5"
                >
                  <Image
                    src="/exam/celebration.gif"
                    alt="احتفال"
                    width={125}
                    height={125}
                    className="w-1/2 mx-auto rounded-full shadow"
                  />
                </motion.div>

                <div className="mt-4 flex flex-col items-center gap-2">
                  <Button
                    onClick={generateShareImage}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    مشاركة نتيجتي
                  </Button>

                  {shareImageURL && (
                    <a
                      href={shareImageURL}
                      download="my_exam_result.png"
                      className="text-sm text-blue-500 underline"
                    >
                      تحميل الصورة
                    </a>
                  )}
                </div>

                <Button
                  onClick={() => router.push("/exam")}
                  variant="secondary"
                  className="mt-4 px-5 py-2 text-lg"
                >
                  العودة للرئيسية
                </Button>
              </motion.div>
            </div>
          ) : (currentQuestion && (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500">
                  المجموعة {currentGroup + 1} - سؤال {currentQuestionIndex + 1} من {currentQuestions.length}
                </span>
                <div className={`px-2 py-1 rounded ${timeLeft < 60 ? 'bg-red-500' : 'bg-yellow-500'} text-black`}>
                  الوقت المتبقي: {formatTime(timeLeft)}
                </div>
              </div>

              <div className="mb-2">
                <span className="bg-gray-500 text-white px-2 py-1 rounded">
                  {currentQuestion.category}
                </span>
              </div>

              <div className="mb-4">
                <h2 className="text-lg">{currentQuestion.text}</h2>
                {currentQuestion.type === "mcq" && (
                  <small className="text-gray-500">اختر الإجابة الصحيحة</small>
                )}
              </div>

              <div className="grid gap-3 mb-4">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className={`text-left ${selectedAnswers[currentQuestion.id] === option ? "bg-blue-500 text-white" : ""}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {renderPagination()}

              <div className="flex justify-between">
                <Button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  variant="secondary"
                >
                  السابق
                </Button>

                <Button
                  onClick={handleNextOrFinish}
                  variant="default"
                >
                  {currentQuestionIndex === currentQuestions.length - 1 ? "إنهاء المجموعة" : "التالي"}
                </Button>
              </div>
            </>
          )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function GroupedQuestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">جاري التحميل...</div>}>
      <GroupedQuestionsContent />
    </Suspense>
  );
}
