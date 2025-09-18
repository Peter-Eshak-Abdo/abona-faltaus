"use client";
import "../../exam.model.css";
import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  type: "mcq" | "tf";
  category: string;
};

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const totalQuestions = Number(searchParams.get("questions") || 10);
  const timeLimit = Number(searchParams.get("time") || 30);
  const selectedCategories = useMemo(() => searchParams.get("categories")?.split(",") || [], [searchParams]);
  const [userName, setUserName] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<{ [key: number]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [categoriesCount, setCategoriesCount] = useState<{ [key: string]: number }>({});

  const [shareImageURL, setShareImageURL] = useState<string | null>(null);

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (hasLoaded) return;        // إذا سبق التحميل فلا تعيد
    const loadQuestions = async () => {
      try {
        const res = await fetch("/exam/simple.json");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();

        // التحقق من وجود البيانات وهيكلتها بشكل صحيح
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
        }

        const counts: { [key: string]: number } = {};
        const allQuestions: Question[] = [];

        data.forEach((category: { category: string; questions: { question: string; options?: string[]; answer: boolean | string; type: "mcq" | "tf" }[] }) => {
          if (!category || !category.category || !category.questions) return;

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

        setCategoriesCount(counts);

        if (allQuestions.length === 0) {
          throw new Error("No questions found for selected categories");
        }

        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(totalQuestions, shuffled.length));

        setQuestions(selected);
      } catch (error) {
        console.error("Error loading questions:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
        setTimerActive(true);
      }
    };
    loadQuestions().then(() => setHasLoaded(true));
  }, [hasLoaded, selectedCategories, totalQuestions]);

  const changeQuestion = useCallback((newIndex: number) => {
    setTimeout(() => {
      setCurrentQuestionIndex(prev => {
        const nextIndex = Math.max(0, Math.min(newIndex, questions.length - 1));
        if (prev !== nextIndex) {
          console.log('Changing question from', prev, 'to', nextIndex);
          return nextIndex;
        }
        return prev;
      });
    }, 300);
  }, [questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswer = useCallback((option: string) => {
    if (!questions[currentQuestionIndex]) return;

    const currentId = questions[currentQuestionIndex].id;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentId]: option
    }));
    setQuestionStatus(prev => ({
      ...prev,
      [currentId]: true
    }));
  }, [currentQuestionIndex, questions]);

  const handleFinishQuiz = useCallback(() => {
    setTimerActive(false);
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizFinished(true);

    const runConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    };

    runConfetti();
  }, [questions, selectedAnswers]);

  const renderPagination = useCallback(() => (
    <div className="d-flex flex-wrap gap-2 justify-content-center my-3">
      {questions.map((q, index) => {
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
            type="button"
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  ), [questions, selectedAnswers, questionStatus, currentQuestionIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft, timerActive, handleFinishQuiz]);

  const generateShareImage = async () => {
    const element = document.getElementById("result-share-box");
    if (!element) return;

    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL("image/png");
    setShareImageURL(dataUrl);

    if (navigator.canShare && navigator.canShare({ files: [] })) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "result.png", { type: "image/png" });
        navigator.share({
          title: `${userName} - نتيجتي في الامتحان 🎉`,
          text: `أنا ${userName} وحصلت على ${score} من ${questions.length} في الامتحان! جرب أنت كمان!`,
          files: [file],
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="bg-red-100 border-red-500 text-center">
          <CardContent>
            <h4 className="text-xl font-semibold">لا توجد أسئلة متاحة</h4>
            <p>الرجاء التأكد من:</p>
            <ul className="text-left">
              <li>صحة ملف الأسئلة (simple.json)</li>
              <li>اختيار الفئات الصحيحة</li>
              <li>اتصال الإنترنت</li>
            </ul>
            <Button
              onClick={() => router.push('/exam')}
              variant="outline"
              className="bg-yellow-500 mt-3"
            >
              العودة إلى صفحة الامتحانات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const currentQuestion = questions[currentQuestionIndex];


  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-3 relative">
      <div className="absolute w-full top-0 left-0">
        <div className="wave-animation"></div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded shadow w-full md:w-3/4"
        >
          {quizFinished ? (
            <div id="result-share-box" className="text-center">
              <audio autoPlay>
                <source src="/exam/success.mp3" type="audio/mpeg" />
              </audio>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-green-500 text-white p-4 rounded shadow-xl border-2 border-green-500"
              >
                {!userName ? (
                  <div className="mb-4">
                    <h3 className="text-lg mb-3">أدخل اسمك للمشاركة</h3>
                    <Input
                      type="text"
                      className="mb-2"
                      placeholder="اسمك"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <Button
                      onClick={() => setUserName(userName)}
                      variant="secondary"
                      disabled={!userName.trim()}
                    >
                      متابعة
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl">🎉 مبروك {userName}!</h2>
                    <p className="text-lg mt-3">
                      لقد أجبت على <span className="font-bold">{score}</span> من {" "}
                      <span className="font-bold">{questions.length}</span> سؤال بشكل صحيح
                    </p>

                    <div className="mt-3">
                      <h5 className="text-base">توزيع الأسئلة:</h5>
                      <div className="flex flex-wrap justify-center gap-2">
                        {Object.entries(categoriesCount).map(([cat]) => (
                          <span key={cat} className="bg-blue-500 text-white px-2 py-1 rounded">
                            {cat}: {questions.filter(q => q.category === cat).length}
                          </span>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4"
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
                      onClick={() => router.push('/exam')}
                      variant="secondary"
                      className="mt-3"
                    >
                      العودة إلى صفحة الامتحانات
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-gray-500 ${questionStatus[currentQuestion.id] ? "text-blue-500" : "text-red-500"
                  }`}>
                  سؤال {currentQuestionIndex + 1} من {questions.length}
                </span>

                {timeLimit > 0 && (
                  <div className={`px-2 py-1 rounded ${timeLeft < 60 ? 'bg-red-500' : 'bg-yellow-500'
                    } text-black`}>
                    الوقت المتبقي: {formatTime(timeLeft)}
                  </div>
                )}
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
                    className={`text-left ${selectedAnswers[currentQuestion.id] === option ? "bg-blue-500 text-white" : ""
                      }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={() => changeQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  variant="secondary"
                >
                  السابق
                </Button>

                <Button
                  onClick={() => {
                    if (currentQuestionIndex === questions.length - 1) {
                      handleFinishQuiz();
                    } else {
                      changeQuestion(currentQuestionIndex + 1);
                    }
                  }}
                  variant="default"
                >
                  {currentQuestionIndex === questions.length - 1 ? "إنهاء الامتحان" : "التالي"}
                </Button>
              </div>
              {renderPagination()}
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function IndividualQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
