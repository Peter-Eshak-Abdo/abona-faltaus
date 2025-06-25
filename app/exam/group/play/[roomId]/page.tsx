"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/lib/socket";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timePerQuestion?: number;
}

export default function PlayPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;


    socket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    socket.on("exam-started", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[TEAM] exam-started event received", { question, index, totalQuestions, timePerQuestion });
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setTimeLeft(timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    socket.on("question", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[TEAM] question event received", { question, index, totalQuestions, timePerQuestion });
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setTimeLeft(timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    socket.on("answer-result", (result: { correct: boolean }) => {
      console.log("[TEAM] answer-result event received", result);
      if (result.correct) {
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
      // if (timerRef.current) clearInterval(timerRef.current);
      socket.off("room-error");
      socket.off("exam-started");
      socket.off("question");
      socket.off("answer-result");
      socket.off("exam-finished");
    };
  }, [roomId, score]);

  const handleAnswerSubmit = () => {
    if (selectedAnswer !== null && currentQuestion && socket) {
      socket.emit("submit-answer", {
        roomId,
        questionId: currentQuestion.id,
        answer: selectedAnswer
      });
    }
  };

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
                          className={`list-group-item list-group-item-action ${selectedAnswer === index ? "active" : ""}`}
                          onClick={() => setSelectedAnswer(index)}
                        >
                          {option}
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-muted">لا توجد خيارات متاحة</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary mt-4 w-100"
                    onClick={handleAnswerSubmit}
                    disabled={selectedAnswer === null}
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
