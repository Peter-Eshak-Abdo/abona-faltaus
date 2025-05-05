"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("[ADMIN] Connected to socket server");
      // Get exam settings from localStorage
      const settings = localStorage.getItem("examGroupSettings");
      if (settings) {
        const { roomId: savedRoomId } = JSON.parse(settings);
        if (savedRoomId === roomId) {
          newSocket.emit("join-room", { roomId, isAdmin: true });
        }
      }
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
    });

    newSocket.on("answer-submitted", ({ teamId, isCorrect }) => {
      setTeams(prev => prev.map(team => {
        if (team.id === teamId) {
          return { ...team, score: team.score + (isCorrect ? 1 : 0) };
        }
        return team;
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId]);

  const handleNextQuestion = () => {
    if (socket) {
      socket.emit("next-question", { roomId });
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
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الامتحان</h2>
            </div>
            <div className="card-body">
              {currentQuestion ? (
                <div>
                  <h5 className="mb-4">{currentQuestion.text}</h5>
                  <div className="list-group">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`list-group-item ${index === currentQuestion.correctAnswer ? "list-group-item-success" : ""}`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-primary mt-4 w-100"
                    onClick={handleNextQuestion}
                  >
                    السؤال التالي
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
