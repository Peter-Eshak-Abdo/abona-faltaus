"use client"
import { useState, useEffect, use } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

const COLORS = [
  { color: "bg-red-500", icon: "▲", hover: "bg-red-600" },
  { color: "bg-green-500", icon: "■", hover: "bg-green-600" },
  { color: "bg-blue-500", icon: "◆", hover: "bg-blue-600" },
  { color: "bg-yellow-500", icon: "●", hover: "bg-yellow-600" },
]

export default function PlayPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;

  const [gameState, setGameState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const teamId = localStorage.getItem(`team_id_${quizId}`);

    const fetchData = async () => {
      try {
        const [resPlay, resTeam] = await Promise.all([
          fetch(`/api/quizzes/${quizId}/play-data`),
          supabase.from("quiz_groups").select("*").eq("id", teamId).single()
        ]);

        if (resTeam.data) setTeam(resTeam.data);
        if (resPlay.ok) {
          const { gameState: gs, currentQuestion: q } = await resPlay.json();
          setGameState(gs);
          if (q) {
            setCurrentQuestion(q);
            setTimer(q.timeLimit + 4);
          }
        }
      } catch (err) {
        console.error("Failed to load play data:", err);
      }
    };

    fetchData();

    const channel = supabase.channel(`game-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
        async (payload: any) => {
          setGameState(payload.new);
          setHasAnswered(false);
          try {
            const resPlay = await fetch(`/api/quizzes/${quizId}/play-data`);
            if (resPlay.ok) {
              const { currentQuestion: q } = await resPlay.json();
              if (q) {
                setCurrentQuestion(q);
                setTimer((q?.timeLimit || 20) + 4);
              }
            }
          } catch (err) {
            console.error("Error refreshing question on update:", err);
          }
        }).subscribe();

    // تحديث السكور الخاص بالفريق Live
    const channelTeam = supabase.channel(`t-${teamId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_groups', filter: `id=eq.${teamId}` },
      (p: any) => setTeam(p.new)).subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(channelTeam); };
  }, [quizId]);

  // تايمر ديناميكي يعتمد على وقت السؤال
  useEffect(() => {
    if (gameState?.phase !== 'question' || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameState?.phase]);

  const submitAnswer = async (choiceIndex: number) => {
    if (hasAnswered || gameState.phase !== 'question' || !team) return;
    setHasAnswered(true);

    const timeTaken = Math.max(0, (currentQuestion?.timeLimit || 20) - timer);

    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          questionIndex: gameState.current_question_index ?? 0,
          choiceIndex,
          timeTaken,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("❌ خطأ في إرسال الإجابة:", errData);
      }
    } catch (err) {
      console.error("❌ تعذر الاتصال بالسيرفر:", err);
    }
  };

  if (!gameState || !currentQuestion) {
    return (
      <div className="min-h-[100dvh] bg-[#46178f] flex flex-col items-center justify-center text-white p-2 text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">في انتظار بداية الجولة...</h2>
        <p className="text-white/60 text-sm mt-2">تأكد إن الأدمن بدأ المسابقة</p>
      </div>
    );
  }

  if (gameState?.phase === 'final') {
    return (
      <div className="min-h-[100dvh] bg-[#46178f] text-white flex flex-col items-center justify-center p-1 text-center font-sans">
        <h2 className="text-3xl sm:text-5xl font-black mb-0.5 text-yellow-400">انتهت المسابقة! 🏁</h2>
        <div className="bg-white/10 p-1.5 rounded-3xl w-full max-w-sm border-2 border-white/20 shadow-2xl backdrop-blur-sm">
          <p className="text-2xl font-black mb-0.5">{team?.group_name}</p>
          <div className="flex flex-wrap gap-0.5 justify-center p-0.5 bg-black/30 rounded-xl mb-0.5">
            {team?.members?.map((name: string, i: number) => (
              <span key={i} className="bg-white/10 px-0.5 py-1 rounded text-xs font-bold">{name}</span>
            ))}
          </div>
          <p className="text-6xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] leading-none">{team?.score}</p>
          <p className="text-base font-bold opacity-60 mt-0.5">نقطة</p>
        </div>
      </div>
    );
  }
  // اللاعب ينتظر 3 ثواني قبل ظهور الأزرار
  const showButtons = timer <= (currentQuestion?.timeLimit || 20);

  return (
    <div className="min-h-[100dvh] w-full bg-slate-900 font-sans p-0.5 sm:p-1 overflow-hidden flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {gameState?.phase === 'question' && !hasAnswered ? (
          showButtons ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[80dvh] grid grid-cols-2 gap-0.25 sm:gap-0.5">
              {COLORS.slice(0, currentQuestion?.choices?.length).map((c, i) => (
                <button key={i} onClick={() => submitAnswer(i)} className={`${c.color} flex items-center justify-center rounded-2xl active:scale-95 transition-transform shadow-[0_6px_0_rgba(0,0,0,0.3)]`}>
                  <span className="text-6xl sm:text-8xl text-white drop-shadow-lg">{c.icon}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white py-2">
              <div className="w-16 h-16 border-8 border-t-transparent border-white rounded-full animate-spin mb-0.5"></div>
              <h2 className="text-2xl sm:text-3xl font-black animate-pulse">اقرأ السؤال 🧐</h2>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white bg-[#46178f] rounded-3xl p-2 py-4">
            <h2 className="text-3xl sm:text-5xl font-black">{hasAnswered ? "تم الإرسال! ✅" : "استعد..."}</h2>
            <p className="text-base sm:text-lg opacity-60 mt-0.5 font-bold">بص على الشاشة الرئيسية</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
