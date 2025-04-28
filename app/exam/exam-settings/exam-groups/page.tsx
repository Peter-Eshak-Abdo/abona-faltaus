"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
};

function GroupedQuestionsContent() {
  const searchParams = useSearchParams();
  const totalQuestions = Number(searchParams.get("questions") || 10);
  const totalGroups = Number(searchParams.get("groups") || 1);
  const timePerGroup = Number(searchParams.get("time") || 10);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timePerGroup * 60);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetch("/questions.json");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();

        const processedQuestions = [
          ...data.trueFalse.map((q: { question: string; correct: boolean }, idx: number) => ({
            id: idx + 1,
            text: q.question,
            options: ["صح", "خطأ"],
            correctAnswer: q.correct ? "صح" : "خطأ"
          })),
          ...data.multipleChoice.map((q: { question: string; correct: number; choices: string[] }, idx: number) => ({
            id: idx + 1000,
            text: q.question,
            options: q.choices,
            correctAnswer: q.choices[q.correct]
          })),
          ...data.complete.map((q: { question: string; correct: boolean }, idx: number) => ({
            id: idx + 2000,
            text: q.question,
            options: ["اكمل الإجابة في الحقل أدناه"],
            correctAnswer: q.correct
          }))
        ];

        const shuffled = processedQuestions.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, totalQuestions);

        setQuestions(selected);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setIsLoading(false);
      }
    };

    loadQuestions();

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishGroup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalQuestions, timePerGroup]);

  const handleAnswer = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questions[currentQuestion].id]: option
    });
  };

  const handleFinishGroup = () => {
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizFinished(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGroup}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl"
        >
          {quizFinished ? (
            <div className="text-center">
              <h2 className="text-xl font-bold">النتيجة النهائية للمجموعة {currentGroup + 1}</h2>
              <p className="text-lg mt-4">لقد أجبت على {score} من {questions.length} سؤال بشكل صحيح</p>
              {currentGroup < totalGroups - 1 ? (
                <button
                  onClick={() => {
                    setCurrentGroup(prev => prev + 1);
                    setCurrentQuestion(0);
                    setQuizFinished(false);
                    setTimeRemaining(timePerGroup * 60);
                    setSelectedAnswers({});
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  متابعة للمجموعة التالية
                </button>
              ) : (
                <p className="mt-4 text-xl font-bold">لقد انتهيت من جميع المجموعات!</p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="text-gray-500">المجموعة {currentGroup + 1} - سؤال {currentQuestion + 1} من {questions.length}</span>
                <h2 className="text-xl font-bold mt-2">{questions[currentQuestion]?.text}</h2>
              </div>

              <div className="space-y-3 mb-6">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors
                      ${selectedAnswers[questions[currentQuestion].id] === option
                        ? "bg-blue-100 border-blue-500"
                        : "hover:bg-gray-50"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <span className="text-gray-600">الوقت المتبقي: {formatTime(timeRemaining)}</span>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(prev - 1, 0))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  السابق
                </button>

                <button
                  onClick={() => {
                    if (currentQuestion === questions.length - 1) {
                      handleFinishGroup();
                    } else {
                      setCurrentQuestion(prev => prev + 1);
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {currentQuestion === questions.length - 1 ? "إنهاء المجموعة" : "التالي"}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function GroupedQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <GroupedQuestionsContent />
    </Suspense>
  );
}
