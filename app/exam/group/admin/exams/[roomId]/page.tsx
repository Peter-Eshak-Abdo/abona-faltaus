"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { socket } from "@/lib/socket";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const hasJointed = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    if (hasJointed.current) return;
    hasJointed.current = true;
    const handleTeamsInit = (existingTeams: Team[]) => {
      console.log("🔔 teams-init payload:", existingTeams);
      setTeams(existingTeams);
    };
    const handleTeamJoined = (team: Team) => {
      console.log("🔔 team-joined payload:", team);
      setTeams(prev => [...prev, team]);
    };

    const onExamStarted = (payload: {
      question: Question;
      index: number;
      totalQuestions: number;
      timePerQuestion: number;
    }) => {
      if (!payload.question || !Array.isArray(payload.question.options)) return;
      setCurrentQuestion(payload.question);
      setCurrentIndex(payload.index + 1);
      setTotalQuestions(payload.totalQuestions);
      resetTimer(payload.timePerQuestion);
    };

    const onQuestion = onExamStarted; // نفس المعالجة

    socket.on("room-error", (message) => {
      console.error("Room error:", message);
      setError(message);
    });

    socket.on("teams-init", handleTeamsInit);
    socket.on("team-joined", handleTeamJoined);
    socket.emit("join-room", { roomId, isAdmin: true });

    socket.on("team-left", (teamId) => {
      console.log("team-left payload:", teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    });

    socket.on("exam-started", onExamStarted);
    socket.on("question", onQuestion);

    // socket.on("exam-started", ({ question, index, totalQuestions, timePerQuestion }) => {
    //   console.log("[ADMIN] exam-started event received", { question, index, totalQuestions, timePerQuestion });
    //   setCurrentIndex(index + 1);
    //   setTotalQuestions(totalQuestions);
    //   let opts = question.options;
    //   if (!Array.isArray(opts) || opts.length === 0) {
    //     opts = ["صح", "خطأ"];
    //   }
    //   setCurrentQuestion({ ...question, options: opts });
    //   resetTimer(timePerQuestion);
    // });

    // socket.on("question", ({ question, index, totalQuestions, timePerQuestion }) => {
    //   console.log("[ADMIN] question event received", { question, index, totalQuestions, timePerQuestion });
    //   setCurrentIndex(index + 1);
    //   setTotalQuestions(totalQuestions);
    //   let opts = question.options;
    //   if (!Array.isArray(opts) || opts.length === 0) {
    //     opts = ["صح", "خطأ"];
    //   }
    //   setCurrentQuestion({ ...question, options: opts });
    //   resetTimer(timePerQuestion);
    // });

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

    return () => {
      socket.off("room-error");
      socket.off("teams-init", handleTeamsInit);
      socket.off("team-joined", handleTeamJoined);
      socket.off("team-left");
      socket.off("exam-started", onExamStarted);
      socket.off("question", onQuestion);
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
    <div className="py-5 mx-3">
      <div className="flex">
        <div className="w-4/5">
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white text-center">
              <h2 className="text-lg font-semibold mb-0">الامتحان</h2>
            </CardHeader>
            <CardContent>
              {currentQuestion && (
                <div className="mt-4 p-3 border rounded">
                  <h3>السؤال {currentIndex} من {totalQuestions}</h3>
                  <p className="font-bold text-2xl">{currentQuestion.question}</p>
                  <div className="flex flex-col gap-2">
                    {currentQuestion && Array.isArray(currentQuestion.options) ? (
                      currentQuestion.options.map((opt, i) => (
                        <Button
                          type="button"
                          key={i}
                          className={`${colors[i % colors.length]} text-black text-2xl font-bold my-2`}
                          disabled
                        >
                          {getArabicLetter(i)}. {opt}
                          {/* {String.fromCharCode(65 + i)}. {opt} */}
                        </Button>
                      ))
                    ) : (
                      <div className="text-center text-muted">لا توجد خيارات متاحة</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 text-xl font-bold"
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
                  </Button>
                  <Button type="button" onClick={() => socket.emit("pause-exam", { roomId })} className="bg-yellow-500">⏸️ إيقاف</Button>
                  <Button type="button" onClick={() => socket.emit("resume-exam", { roomId })} className="bg-green-500">▶️ استكمال</Button>
                  {timeLeft !== null && (
                    <div className="mt-3 flex justify-end">
                      <p className="text-red-500 font-bold text-xl">الوقت المتبقي: {timeLeft} ثواني</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-1/5">
          <Card>
            <CardHeader className="bg-primary text-white text-center">
              <h2 className="text-lg font-semibold mb-0">الفرق</h2>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                teams.sort((a, b) => b.score - a.score).map(team => (
                  <motion.div
                    key={team.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-2"
                  >
                    <div className="flex justify-between items-center">
                      <span>{team.name}</span>
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full">{team.score}</span>
                    </div>
                    {team.members && team.members.length > 0 && (
                      <small className="text-gray-500">
                        {team.memberCount} أعضاء: {team.members.join(", ")}
                      </small>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-muted">لا يوجد فرق متصلة</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
