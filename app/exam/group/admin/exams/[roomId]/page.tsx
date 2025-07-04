"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";

interface Team {
  id: string;
  name: string;
  memberCount?: number;
  members?: string[];
  socketId: string;
  score: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string | true | false;
}

export default function AdminExamPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!roomId) return;

    socket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    socket.on("teams-init", (existingTeams) => {
      console.log("team-joined payload:", existingTeams);
      setTeams(existingTeams);
    });

    socket.on("team-joined", (team) => {
      console.log("team-joined payload:", team);
      setTeams(prev => [...prev, team]);
    });

    socket.on("team-left", (teamId) => {
      console.log("team-left payload:", teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    });

    socket.on("exam-started", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[ADMIN] exam-started event received", { question, index, totalQuestions, timePerQuestion });
      setCurrentIndex(index + 1);
      setTotalQuestions(totalQuestions);
      let opts = question.options;
      if (!Array.isArray(opts) || opts.length === 0) {
        opts = ["صح", "خطأ"];
      }
      setCurrentQuestion({ ...question, options: opts });
      resetTimer(timePerQuestion);
    });

    socket.on("question", ({ question, index, totalQuestions, timePerQuestion }) => {
      console.log("[ADMIN] question event received", { question, index, totalQuestions, timePerQuestion });
      setCurrentIndex(index + 1);
      setTotalQuestions(totalQuestions);
      let opts = question.options;
      if (!Array.isArray(opts) || opts.length === 0) {
        opts = ["صح", "خطأ"];
      }
      setCurrentQuestion({ ...question, options: opts });
      resetTimer(timePerQuestion);
    });

    socket.on("answer-submitted", ({ teamId, isCorrect }) => {
      console.log("[ADMIN] answer-submitted event received", { teamId, isCorrect });
      setTeams(prev => prev.map(team => {
        if (team.id === teamId) {
          return { ...team, score: team.score + (isCorrect ? 1 : 0) };
        }
        return team;
      }));
    });
    socket.on("exam-finished", () => {
      console.log("[ADMIN] exam-finished event received");
      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.setItem("examResults", JSON.stringify(teams));
      setCurrentQuestion(null);
      setTimeLeft(null);
      // setTeams([]);
      router.push(`/exam/group/admin/exams/${roomId}/results`);
    });

    socket.emit("join-room", { roomId, isAdmin: true });

    return () => {
      socket.off("room-error");
      socket.off("teams-init");
      socket.off("team-joined");
      socket.off("team-left");
      socket.off("exam-started");
      socket.off("question");
      socket.off("answer-submitted");
      socket.off("exam-finished");
    };

  }, [roomId, router, teams]);

  useEffect(() => {
    if (timeLeft === 0) {
      console.log("[ADMIN] timeLeft is 0, moving to next question");
      socket.emit("next-question", { roomId });
    }
  }, [timeLeft, roomId]);
  useEffect(() => {
    if (currentQuestion && currentQuestion.options.length === 0) {
      console.log("[ADMIN] currentQuestion has no options, moving to next question");
      socket.emit("next-question", { roomId });
    }
  }, [currentQuestion, roomId]);
  function resetTimer(seconds = 30) {
    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
  }

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
    <div className="py-5 mx-3">
      <div className="row">
        <div className=" col-lg-10 col-md-8">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الامتحان</h2>
            </div>
            <div className="card-body">
              {currentQuestion && (
                <div className="mt-4 p-3 border rounded">
                  <h3>السؤال {currentIndex} من {totalQuestions}</h3>
                  <p className="fw-bolder fs-1">{currentQuestion.question}</p>
                  <div className="d-flex flex-column gap-2">
                    {currentQuestion && Array.isArray(currentQuestion.options) ? (
                      currentQuestion.options.map((opt, i) => (
                        <button type="button" key={i} className={`btn ${colors[i % colors.length]} text-black fs-1 fw-bolder my-2`} disabled>
                          {getArabicLetter(i)}. {opt}
                          {/* {String.fromCharCode(65 + i)}. {opt} */}
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-muted">لا توجد خيارات متاحة</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary mt-3 fs-3 fw-bold"
                    onClick={() => {
                      if (currentIndex < totalQuestions) {
                        socket.emit("next-question", { roomId });
                      } else {
                        // router.push(`/exam/group/admin/exams/${roomId}/results`);
                      }
                    }}
                  // onClick={() => socket.emit("next-question", { roomId })}
                  // disabled={currentIndex >= totalQuestions}
                  >
                    {currentIndex < totalQuestions ? "السؤال التالي" : "عرض النتائج"}
                  </button>
                  <button type="button" onClick={() => socket.emit("pause-exam", { roomId })} className="btn btn-warning">⏸️ إيقاف</button>
                  <button type="button" onClick={() => socket.emit("resume-exam", { roomId })} className="btn btn-success">▶️ استكمال</button>
                  {timeLeft !== null && (
                    <div className="mt-3 justify-content-end d-flex">
                      <p className="text-danger fw-bolder fs-3">الوقت المتبقي: {timeLeft} ثواني</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">الفرق</h2>
            </div>
            <div className="card-body">
              {teams.sort((a, b) => b.score - a.score).map(team => (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="list-group-item"
                >
                  {/* {Array.isArray(teams) && teams.length > 0 ? (
                    teams.map(team => (
                      <div key={team.id}>
                        <div className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{team.name.name}</span>
                          <span className="badge bg-primary rounded-pill">{team.score}</span>
                        </div>
                        {team.name.members && (
                          <small className="text-muted">{team.name.memberCount} أعضاء : {team.name.members.join(", ")}</small>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted">لا يوجد فرق متصلة</div>
                  )} */}
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{team.name}</span>
                    <span className="badge bg-primary rounded-pill">{team.score}</span>
                  </div>
                  {team.members && (
                    <small className="text-muted">{team.memberCount} أعضاء : {team.members.join(", ")}</small>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
