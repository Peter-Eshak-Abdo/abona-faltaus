"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  timePerQuestion?: number;
}

export default function PlayPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [teamName, setTeamName] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

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

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      transports: ["polling"],
      // transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("join-room", { roomId, team });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("خطأ في الاتصال بالخادم");
    });

    newSocket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    newSocket.on("exam-started", (data) => {
      console.log("[TEAM] exam-started event received", data);
      setCurrentQuestion(data.question);
      setTimeLeft(data.timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    newSocket.on("question", (question) => {
      console.log("[TEAM] question event received", question);
      // setCurrentQuestion(question);
      const q: Question = question.question;
      setCurrentQuestion(q);
      // setCurrentIndex(question.index + 1);

      setTimeLeft(question.timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    newSocket.on("answer-result", (result: { correct: boolean }) => {
      console.log("[TEAM] answer-result event received", result);
      if (result.correct) {
        setScore(prev => prev + 1);
      }
    });

    newSocket.on("exam-finished", () => {
      console.log("[TEAM] exam-finished event received");
      if (timerRef.current) clearInterval(timerRef.current);
      alert(`الامتحان انتهى! نتيجتك: ${score}`);
      setCurrentQuestion(null);
      setTimeLeft(null);
    });

    setSocket(newSocket);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      newSocket.close();
    };
  }, [roomId, score] );

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
                  <h5 className="mb-4">{currentQuestion.text}</h5>
                  {typeof timeLeft === "number" && (
                    <div className="mb-3 text-center">
                      <span className="badge bg-warning text-dark fs-5">الوقت المتبقي: {timeLeft} ثانية</span>
                    </div>
                  )}
                  <div className="list-group">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        className={`list-group-item list-group-item-action ${selectedAnswer === index ? "active" : ""}`}
                        onClick={() => setSelectedAnswer(index)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button
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
