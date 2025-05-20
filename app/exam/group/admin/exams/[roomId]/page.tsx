"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Team {
  id: string;
  name: string;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export default function AdminExamPage() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("[ADMIN] Connected to socket server");
      newSocket.emit("join-room", { roomId, isAdmin: true, adminId: localStorage.getItem("adminId") });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("خطأ في الاتصال بالخادم");
    });

    newSocket.on("room-error", (message) => {
      setError(message);
    });

    newSocket.on("team-joined", (team) => {
      setTeams(prev => [...prev, team]);
    });

    newSocket.on("team-left", (teamId) => {
      setTeams(prev => prev.filter(t => t.id !== teamId));
    });

    newSocket.on("exam-started", (data) => {
      console.log("[ADMIN] exam-started event received", data);
      setCurrentQuestion(data.question);
      setTimeLeft(data.timePerQuestion || 30);
      setTotalQuestions(data.totalQuestions);
      setCurrentIndex(1); // أول سؤال
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    newSocket.on("question", (question) => {
      setCurrentQuestion(question);
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(question.timePerQuestion || 30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
    });

    newSocket.on("answer-submitted", ({ teamId, isCorrect }) => {
      setTeams(prev => prev.map(team => {
        if (team.id === teamId) {
          return { ...team, score: team.score + (isCorrect ? 1 : 0) };
        }
        return team;
      }));
    });
    newSocket.on("exam-finished", () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentQuestion(null);
      setTimeLeft(null);
      setTeams([]);
    });

    setSocket(newSocket);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      newSocket.close();
    };
  }, [roomId]);

  // const handleNextQuestion = () => {
  //   if (socket) {
  //     socket.emit("next-question", { roomId });
  //   }
  // };

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
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الامتحان</h2>
            </div>
            <div className="card-body">
              {currentQuestion && (
                <div className="mt-4 p-3 border rounded">
                  <h5>السؤال {currentIndex} من {totalQuestions}</h5>
                  <p className="fw-bold">{currentQuestion.text}</p>
                  <div className="d-flex flex-column gap-2">
                    {currentQuestion.options.map((opt, i) => (
                      <button key={i} className="btn btn-outline-primary" disabled>
                        {String.fromCharCode(65 + i)}. {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary mt-3"
                    onClick={() => socket && socket.emit("next-question", { roomId })}
                    disabled={currentIndex >= totalQuestions}
                  >
                    {currentIndex < totalQuestions ? "السؤال التالي" : "عرض النتائج"}
                  </button>
                  {timeLeft !== null && (
                    <div className="mt-3">
                      <p className="text-danger">الوقت المتبقي: {timeLeft} ثواني</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الفرق</h2>
            </div>
            <div className="card-body">
              <div className="list-group">
                {teams.map(team => (
                  <div key={team.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{team.name}</span>
                    <span className="badge bg-primary rounded-pill">{team.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
