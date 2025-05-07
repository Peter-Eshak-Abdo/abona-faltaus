"use client";
import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import "../../individual-questions/wave.model.css";
import html2canvas from "html2canvas";

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
    <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
      {currentQuestions.map((q, index) => {
        const answered = selectedAnswers[q.id];
        const status = questionStatus[q.id];
        return (
          <button
            key={q.id}
            className={`btn btn-sm rounded-circle pagination-btn ${currentQuestionIndex === index
              ? "btn-primary"
              : answered
                ? status
                  ? "btn-success"
                  : "btn-danger"
                : "btn-outline-secondary"
              }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
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

    const canvas = await html2canvas(element);
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
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 p-3 position-relative">
      <div className="position-absolute w-100 top-0 start-0">
        <div className="wave-animation"></div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={quizFinished ? "done" : currentGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded shadow w-100 w-md-75"
        >
          {quizFinished ? (
            <div id="result-share-box" className="text-center">
              <audio autoPlay>
                <source src="/exam/success.mp3" type="audio/mpeg" />
              </audio>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-success text-white p-4 rounded-3 shadow-lg border border-3 border-success"
              >
                <h2 className="h2 mb-4 fw-bold">🏆 النتائج النهائية</h2>

                {groupResults.map((group) => (
                  <div key={group.group} className="my-3 fs-5">
                    <span className="fw-bold">المجموعة {group.group}: </span>
                    <span className="text-warning">
                      {group.score}/{group.total}
                    </span>
                  </div>
                ))}

                <div className="mt-4">
                  <h5 className="h5 mb-3">توزيع الأسئلة:</h5>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    {Object.entries(categoriesCount).map(([cat, count]) => (
                      <span key={cat} className="badge bg-info text-dark">
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
                    className="w-50 mx-auto rounded-circle shadow"
                  />
                </motion.div>

                <div className="mt-4 flex flex-col items-center gap-2">
                  <button
                    onClick={generateShareImage}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    مشاركة نتيجتي
                  </button>

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

                <button
                  onClick={() => router.push("/exam")}
                  className="btn btn-light mt-4 px-5 py-2 fs-5"
                >
                  العودة للرئيسية
                </button>
              </motion.div>
            </div>
          ) : (currentQuestion && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">
                  المجموعة {currentGroup + 1} - سؤال {currentQuestionIndex + 1} من {currentQuestions.length}
                </span>
                <div className={`badge ${timeLeft < 60 ? 'bg-danger' : 'bg-warning'} text-dark`}>
                  الوقت المتبقي: {formatTime(timeLeft)}
                </div>
              </div>

              <div className="mb-2">
                <span className="badge bg-secondary">
                  {currentQuestion.category}
                </span>
              </div>

              <div className="mb-4">
                <h2 className="h5">{currentQuestion.text}</h2>
                {currentQuestion.type === "mcq" && (
                  <small className="text-muted">اختر الإجابة الصحيحة</small>
                )}
              </div>

              <div className="d-grid gap-3 mb-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`btn btn-outline-primary text-start ${selectedAnswers[currentQuestion.id] === option ? "active" : ""
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {renderPagination()}

              <div className="d-flex justify-content-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                >
                  السابق
                </button>

                <button
                  onClick={handleNextOrFinish}
                  className="btn btn-primary"
                >
                  {currentQuestionIndex === currentQuestions.length - 1 ? "إنهاء المجموعة" : "التالي"}
                </button>
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
