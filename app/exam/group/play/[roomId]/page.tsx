"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string | true | false;
  timePerQuestion?: number;
}

export default function PlayPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [, setPaused] = useState(false);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAnswerSubmit = useCallback(() => {
    if (selectedAnswer !== null && currentQuestion && socket) {
      socket.emit("submit-answer", {
        roomId,
        questionId: currentQuestion.id,
        // answer: currentQuestion.options[selectedAnswer]
        answer: selectedAnswer
      });
      setSubmitted(true); // تمنع أي تعديل بعد الإرسال
    }
  }, [selectedAnswer, currentQuestion, roomId]);

  useEffect(() => {
    if (!roomId) return;

    const handleExamStarted = (payload: {
      question?: Question;
      index: number;
      totalQuestions: number;
      timePerQuestion?: number;
    }) => {
      if (!payload.question || !Array.isArray(payload.question.options)) {
        console.warn("Exam started with invalid question data", payload);
        return;
      }
      setSelectedAnswer(null);
      setSubmitted(false);

      setCurrentQuestion(payload.question);

      const t = payload.timePerQuestion || 30;
      setTimeLeft(t);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    };
    socket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    socket.on("exam-started", handleExamStarted);
    socket.on("question", handleExamStarted);

    // socket.on("exam-started", ({ question, index, totalQuestions, timePerQuestion }) => {
    //   console.log("[TEAM] exam-started event received", { question, index, totalQuestions, timePerQuestion });
    //   let opts = question.options;
    //   if (!Array.isArray(opts) || opts.length === 0) {
    //     opts = ["صح", "خطأ"];
    //   }
    //   setCurrentQuestion({ ...question, opts: opts });
    //   setSelectedAnswer(null);
    //   setTimeLeft(timePerQuestion || 30);
    //   if (timerRef.current) clearInterval(timerRef.current);
    //   timerRef.current = setInterval(() => {
    //     setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    //   }, 1000);
    // });

    // socket.on("question", ({ question, index, totalQuestions, timePerQuestion }) => {
    //   console.log("[TEAM] question event received", { question, index, totalQuestions, timePerQuestion });
    //   setSubmitted(false);
    //   let opts = question.options;
    //   if (!Array.isArray(opts) || opts.length === 0) {
    //     opts = ["صح", "خطأ"];
    //   }
    //   setCurrentQuestion({ ...question, opts: opts });
    //   setSelectedAnswer(null);
    //   setTimeLeft(timePerQuestion || 30);
    //   if (timerRef.current) clearInterval(timerRef.current);
    //   timerRef.current = setInterval(() => {
    //     setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    //   }, 1000);
    // });

    socket.on("answer-result", (result: { isCorrect: boolean }) => {
      console.log("[TEAM] answer-result event received", result);
      if (result.isCorrect) {
        setScore(prev => prev + 1);
      }
    });

    socket.on("exam-finished", () => {
      console.log("[TEAM] exam-finished event received");
      if (timerRef.current) clearInterval(timerRef.current);
      alert(`الامتحان انتهى! نتيجتك: ${score}`);
      setCurrentQuestion(null);
      setTimeLeft(null);
    });

    socket.on("exam-paused", () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setPaused(true);
    });

    socket.on("exam-resumed", () => {
      // استكمال المؤقت
      if (timerRef.current) clearInterval(timerRef.current);
      const time = currentQuestion?.timePerQuestion || 30;
      setTimeLeft(time);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
      setPaused(false);
    });

    const savedTeam = localStorage.getItem("currentTeam");
    let team;
    if (savedTeam) {
      team = JSON.parse(savedTeam);
      if (!team.id) {
        team.id = Math.random().toString(36).substring(2, 10);
        localStorage.setItem("currentTeam", JSON.stringify(team));
      }
    } else {
      team = { id: Math.random().toString(36).substring(2, 10), name: "فريق بدون اسم" };
      localStorage.setItem("currentTeam", JSON.stringify(team));
    }
    setTeamName(team.name);

    socket.emit("join-room", { roomId, team });
    return () => {
      socket.off("exam-started", handleExamStarted);
      socket.off("question", handleExamStarted);
      socket.off("room-error");
      socket.off("answer-result");
      socket.off("exam-finished");
    };
  }, [roomId, score, timeLeft, teamName, currentQuestion, handleAnswerSubmit]);

  // useEffect(() => {
  //   if (timeLeft === 0) {
  //     console.log("[TEAM] timeLeft is 0, submitting answer");
  //     handleAnswerSubmit();
  //   }
  // }, [timeLeft, handleAnswerSubmit]);

  // useEffect(() => {
  //   if (timeLeft === 0) {
  //     setSubmitted(true);
  //     setError("انتهى وقت السؤال");
  //   }
  // }, [timeLeft]);

  if (!roomId) {
    return (
      <div className="py-5">
        <Card className="bg-red-100 border-red-500">
          <CardContent>
            خطأ: رقم الغرفة غير موجود
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-5">
        <Card className="bg-red-100 border-red-500">
          <CardContent>
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }
  const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500"];

  const getArabicLetter = (index: number) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د', 'ه', 'و'];
    return arabicLetters[index] || '';
  };

  return (
    <div className="py-5 flex justify-center">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="bg-primary text-white text-center">
            <h2 className="text-lg font-semibold mb-0">الامتحان</h2>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h5 className="text-center">اسم الفريق: {teamName}</h5>
              <h5 className="text-center">النتيجة: {score}</h5>
            </div>
            {currentQuestion ? (
              <div>
                <h5 className="mb-4">{currentQuestion.question}</h5>
                {typeof timeLeft === "number" && (
                  <div className="mb-3 text-center">
                    <span className="bg-yellow-500 text-black px-2 py-1 rounded text-lg">الوقت المتبقي: {timeLeft} ثانية</span>
                  </div>
                )}
                <div className="space-y-2">
                  {currentQuestion && Array.isArray(currentQuestion.options) ? (
                    currentQuestion.options.map((option, index) => (
                      <Button
                        type="button"
                        key={option + index}
                        className={`${colors[index % colors.length]} text-white my-2 scale-90 ${selectedAnswer === index ? "scale-105 text-center rounded-full" : ""}`}
                        onClick={() => setSelectedAnswer(index)}
                        disabled={submitted}
                        variant="default"
                      >
                        {getArabicLetter(index)}. {option}
                      </Button>
                    ))
                  ) : (
                    <div className="text-center text-muted">لا توجد خيارات متاحة</div>
                  )}
                </div>
                <Button
                  type="button"
                  className={`mt-4 w-full ${submitted ? 'bg-green-500' : ''}`}
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null || submitted}
                >
                  إرسال الإجابة
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p>في انتظار بدء الامتحان...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
