"use client";
import "../wave.model.css";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import Image from "next/image";

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
  const selectedCategories = searchParams.get("categories")?.split(",") || [];

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
  }, [hasLoaded]);

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
            className={`btn btn-sm rounded-circle ${currentQuestionIndex === index
              ? "btn-primary"
              : answered
                ? status
                  ? "btn-success"
                  : "btn-danger"
                : "btn-outline-secondary"
              }`}
            onClick={() => setCurrentQuestionIndex(index)}
            style={{ width: 36, height: 36 }}
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-danger text-center">
          <h4>لا توجد أسئلة متاحة</h4>
          <p>الرجاء التأكد من:</p>
          <ul className="text-start">
            <li>صحة ملف الأسئلة (simple.json)</li>
            <li>اختيار الفئات الصحيحة</li>
            <li>اتصال الإنترنت</li>
          </ul>
          <button
            onClick={() => router.push('/exam')}
            className="btn btn-warning mt-3"
          >
            العودة إلى صفحة الامتحانات
          </button>
        </div>
      </div>
    );
  }
  const currentQuestion = questions[currentQuestionIndex];


  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 p-3 position-relative">
      <div className="position-absolute w-100 top-0 start-0">
        <div className="wave-animation"></div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-4 rounded shadow w-100 w-md-75"
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
                className="bg-success text-white p-4 rounded shadow-xl border-2 border-success"
              >
                <h2 className="h4">🎉 مبروك!</h2>
                <p className="h5 mt-3">
                  لقد أجبت على <span className="fw-bold">{score}</span> من {" "}
                  <span className="fw-bold">{questions.length}</span> سؤال بشكل صحيح
                </p>

                <div className="mt-3">
                  <h5 className="h6">توزيع الأسئلة:</h5>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {Object.entries(categoriesCount).map(([cat]) => (
                      <span key={cat} className="badge bg-info text-dark">
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
                    className="w-50 mx-auto rounded-circle shadow"
                  />
                </motion.div>

                {/* <div id="result-share-box" className="bg-white p-4 rounded shadow text-center border max-w-md mx-auto">
                  <h2 className="text-2xl font-bold text-green-600">🎉 نتيجتي في الامتحان</h2>
                  <p className="text-lg mt-2">
                    أحرزت <span className="font-bold text-blue-600">{score}</span> من{" "}
                    <span className="font-bold">{questions.length}</span> سؤال!
                  </p>

                  <p className="mt-4 text-gray-600 text-sm">
                    جرب أنت كمان برنامج الاختبارات الرائع!
                  </p>

                  <p className="text-xs text-gray-400">powered by YourAppName.com</p>
                </div> */}

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
                  onClick={() => router.push('/exam')}
                  className="btn btn-light mt-3"
                >
                  العودة إلى صفحة الامتحانات
                </button>
              </motion.div>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className={`text-muted ${questionStatus[currentQuestion.id] ? "text-primary" : "text-danger"
                  }`}>
                  سؤال {currentQuestionIndex + 1} من {questions.length}
                </span>

                {timeLimit > 0 && (
                  <div className={`badge ${timeLeft < 60 ? 'bg-danger' : 'bg-warning'
                    } text-dark`}>
                    الوقت المتبقي: {formatTime(timeLeft)}
                  </div>
                )}
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

              <div className="d-flex justify-content-between">
                <button
                  onClick={() => changeQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                >
                  السابق
                </button>

                <button
                  onClick={() => {
                    if (currentQuestionIndex === questions.length - 1) {
                      handleFinishQuiz();
                    } else {
                      changeQuestion(currentQuestionIndex + 1);
                    }
                  }}
                  className="btn btn-primary"
                >
                  {currentQuestionIndex === questions.length - 1 ? "إنهاء الامتحان" : "التالي"}
                </button>
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
