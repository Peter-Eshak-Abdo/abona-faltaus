"use client"
import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient();

  const [gameState, setGameState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [team, setTeam] = useState<string | any>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const teamId = localStorage.getItem(`team_id_${quizId}`);

    const fetchData = async () => {
      const { data: gs } = await supabase.from("game_state").select("*").eq("quiz_id", quizId).single();
      const { data: qData } = await supabase.from("quizzes").select("questions").eq("id", quizId).single();
      const { data: tData } = await supabase.from("quiz_groups").select("*").eq("id", teamId).single();

      setTeam(tData);
      setGameState(gs);
      if (gs && qData) {
        const q = qData.questions[gs.current_question_index];
        setCurrentQuestion({...q, correct_answer: q.correctAnswer});
        setTimer(q.timeLimit + 4);
      }
    };

    fetchData();

    const channel = supabase.channel(`game-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
        async (payload) => {
          setGameState(payload.new);
          setHasAnswered(false);
          const { data: qData } = await supabase.from("quizzes").select("questions").eq("id", quizId).single();
          const q = qData?.questions[payload.new.current_question_index];
          setCurrentQuestion({ ...q, correct_answer: q.correctAnswer });
          setTimer((q?.timeLimit || 20)+4);
        }).subscribe();

    return () => { supabase.removeChannel(channel); };
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

    const isCorrect = choiceIndex === currentQuestion.correct_answer;

    if (isCorrect) {
      // نقاط تعتمد على سرعة الاستجابة
      const points = Math.max(500, Math.floor(1000 * (timer / currentQuestion.timeLimit)));
      await supabase.rpc('increment_team_score', { team_id: team.id, points: points });
    }

    await supabase.from("answers").insert({
      quiz_id: quizId,
      question_id: gameState.current_question_index.toString() || currentQuestion.id,
      team_id: team.id,
      answer_index: choiceIndex,
      is_correct: isCorrect
    });
  };

  if (!gameState || !currentQuestion) {
    return (
      <div className="h-screen bg-[#46178f] flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">في انتظار بداية الجولة...</h2>
        <p className="text-white/60 text-sm mt-2">تأكد إن الأدمن بدأ المسابقة</p>
      </div>
    );
  }

  if (gameState?.phase === 'final') {
    return (
      <div className="h-screen bg-[#46178f] text-white flex flex-col items-center justify-center p-1 text-center">
        <h2 className="text-2xl font-black mb-1">انتهت المسابقة! 🏁</h2>
        <div className="bg-white/10 p-1 rounded-2xl border border-white/20">
          <p className="text-sm opacity-70">فريقك: {team?.group_name}</p>
          <div className="flex flex-wrap gap-1 justify-center p-1 bg-black/20 rounded-lg max-h-[60px] overflow-y-auto custom-scrollbar">
            {team?.members?.map((name: string, index: number) => (
                <span key={index} className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-slate-300">
                  {name}
                </span>
              ))}
          </div>
          <p className="text-6xl font-black text-white mt-4 drop-shadow-lg">{team?.score} <span className="text-lg opacity-50">نقطة</span></p>        </div>
      </div>
    );
  }

  // اللاعب ينتظر 3 ثواني قبل ظهور الأزرار
  const showButtons = timer <= (currentQuestion?.timeLimit || 20);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-bold p-1">
      <AnimatePresence mode="wait">
        {gameState.phase === 'question' && !hasAnswered ? (
          showButtons ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full grid grid-cols-2 gap-1">
              {COLORS.slice(0, currentQuestion?.choices?.length).map((c, i) => (
                <button key={i} onClick={() => submitAnswer(i)} className={`${c.color} text-white flex flex-col items-center justify-center rounded-lg active:scale-95 transition-transform`}>
                  <span className="text-4xl">{c.icon}</span>
                  <span className="text-xs mt-1">{currentQuestion.choices[i]}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            // <div className="h-full flex flex-col items-center justify-center text-white text-center">
            //   <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-1"></div>
            //   <h2 className="text-xl">ركز في السؤال...</h2>
              // </div>
            <div className="h-full flex items-center justify-center text-white text-3xl animate-pulse">اقرأ السؤال 🧐</div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white bg-[#46178f]">
            <h2 className="text-2xl">{hasAnswered ? "تم الإرسال! ✅" : "استعد..."}</h2>
            <p className="text-sm opacity-50 mt-1">انتظر النتيجة على الشاشة</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
