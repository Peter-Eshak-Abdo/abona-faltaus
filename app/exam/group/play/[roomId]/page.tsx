"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";

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
        answer: currentQuestion.options[selectedAnswer]
        // answer: selectedAnswer
      });
      setSubmitted(true); // تمنع أي تعديل بعد الإرسال
    }
  }, [selectedAnswer, currentQuestion, roomId]);

  useEffect(() => {
    if (!roomId) return;

    socket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    socket.on("exam-started", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[TEAM] exam-started event received", { question, index, totalQuestions, timePerQuestion });
      let opts = question.options;
      if (!Array.isArray(opts) || opts.length === 0) {
        opts = ["صح", "خطأ"];
      }
      setCurrentQuestion({ ...question, options: opts });
      setSelectedAnswer(null);
      setTimeLeft(timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    socket.on("question", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[TEAM] question event received", { question, index, totalQuestions, timePerQuestion });
      setSubmitted(false);
      let opts = question.options;
      if (!Array.isArray(opts) || opts.length === 0) {
        opts = ["صح", "خطأ"];
      }
      setCurrentQuestion({ ...question, options: opts });
      setSelectedAnswer(null);
      setTimeLeft(timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

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
      socket.off("room-error");
      socket.off("exam-started");
      socket.off("question");
      socket.off("answer-result");
      socket.off("exam-finished");
    };
  }, [roomId, score, timeLeft, teamName, currentQuestion, handleAnswerSubmit]);

  useEffect(() => {
    if (timeLeft === 0) {
      console.log("[TEAM] timeLeft is 0, submitting answer");
      handleAnswerSubmit();
    }
  }, [timeLeft, handleAnswerSubmit]);

  // useEffect(() => {
  //   if (timeLeft === 0) {
  //     setSubmitted(true);
  //     setError("انتهى وقت السؤال");
  //   }
  // }, [timeLeft]);

  if (!roomId) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          خطأ: رقم الغرفة غير موجود
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  const colors = ["bg-primary", "bg-danger", "bg-success", "bg-warning"];

  const getArabicLetter = (index: number) => {
    const arabicLetters = ['أ', 'ب', 'ج', 'د', 'ه', 'و'];
    return arabicLetters[index] || '';
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الامتحان</h2>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="text-center">اسم الفريق: {teamName}</h5>
                <h5 className="text-center">النتيجة: {score}</h5>
              </div>
              {currentQuestion ? (
                <div>
                  <h5 className="mb-4">{currentQuestion.question}</h5>
                  {typeof timeLeft === "number" && (
                    <div className="mb-3 text-center">
                      <span className="badge bg-warning text-dark fs-5">الوقت المتبقي: {timeLeft} ثانية</span>
                    </div>
                  )}
                  <div className="list-group">
                    {currentQuestion && Array.isArray(currentQuestion.options) ? (
                      currentQuestion.options.map((option, index) => (
                        <button
                          type="button"
                          key={option + index}
                          className={`list-group-item ${colors[index % colors.length]} my-2 list-group-item-action scale-90 ${selectedAnswer === index ? "active scale-105 fs-5 text-center rounded-full" : ""}`}
                          onClick={() => setSelectedAnswer(index)}
                          disabled={submitted}
                        >
                          {getArabicLetter(index)}. {option}
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-muted">لا توجد خيارات متاحة</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn btn-primary mt-4 w-100 btn ${submitted ? 'btn-success' : 'btn-primary'}`}
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null || submitted}
                  >
                    إرسال الإجابة
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p>في انتظار بدء الامتحان...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
