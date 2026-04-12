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
  const [team, setTeam] = useState<any>(null);
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
        setCurrentQuestion({ ...q, correct_answer: q.correctAnswer });
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
          setCurrentQuestion({ ...q, correct_answer: q?.correctAnswer });
          setTimer((q?.timeLimit || 20) + 4);
        }).subscribe();

    // تحديث السكور الخاص بالفريق Live
    const channelTeam = supabase.channel(`t-${teamId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quiz_groups', filter: `id=eq.${teamId}` },
      (p) => setTeam(p.new)).subscribe();

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

    const isCorrect = choiceIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      // نقاط تعتمد على سرعة الاستجابة
      const points = Math.max(500, Math.floor(1000 * (timer / currentQuestion.timeLimit)));
      // التحديث المباشر أضمن لعدم ضياع النقاط
      const newScore = (team.score || 0) + points;
      await supabase.from('quiz_groups').update({ score: newScore }).eq('id', team.id);
    } else {
      // لو جاوب غلط، ممكن تبعت إجابة عشان الـ Host يعدّه
      await supabase.from("answers").insert({
        quiz_id: quizId,
        question_id: gameState.current_question_index.toString(),
        team_id: team.id,
        answer_index: choiceIndex,
        is_correct: false
      });
      return;
    }

    await supabase.from("answers").insert({
      quiz_id: quizId,
      question_id: gameState.current_question_index.toString(),
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
      <div className="h-screen bg-[#46178f] text-white flex flex-col items-center justify-center p-1 text-center font-sans">
        <h2 className="text-[10vw] font-black mb-1 text-yellow-400">انتهت المسابقة! 🏁</h2>
        <div className="bg-white/10 p-1 rounded-3xl w-full max-w-sm border-2 border-white/20 shadow-2xl backdrop-blur-sm">
          <p className="text-[6vw] font-black mb-1">{team?.group_name}</p>
          <div className="flex flex-wrap gap-1 justify-center p-1 bg-black/30 rounded-xl mb-1">
            {team?.members?.map((name: string, i: number) => (
              <span key={i} className="bg-white/10 px-1 py-1 rounded text-xs font-bold">{name}</span>
            ))}
          </div>
          <p className="text-[15vw] font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] leading-none">{team?.score}</p>
          <p className="text-xl font-bold opacity-60 mt-1">نقطة</p>
        </div>
      </div>
    );
  }
  // اللاعب ينتظر 3 ثواني قبل ظهور الأزرار
  const showButtons = timer <= (currentQuestion?.timeLimit || 20);

  return (
    <div className="h-screen w-screen bg-slate-900 font-sans p-1 overflow-hidden">
      <AnimatePresence mode="wait">
        {gameState?.phase === 'question' && !hasAnswered ? (
          showButtons ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full grid grid-cols-2 gap-1">
              {COLORS.slice(0, currentQuestion?.choices?.length).map((c, i) => (
                <button key={i} onClick={() => submitAnswer(i)} className={`${c.color} flex items-center justify-center rounded-2xl active:scale-95 transition-transform shadow-[0_6px_0_rgba(0,0,0,0.3)]`}>
                  <span className="text-[20vw] text-white drop-shadow-lg">{c.icon}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white">
              <div className="w-[15vw] h-[15vw] border-8 border-t-transparent border-white rounded-full animate-spin mb-1"></div>
              <h2 className="text-[8vw] font-black animate-pulse">اقرأ السؤال 🧐</h2>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white bg-[#46178f]">
            <h2 className="text-[10vw] font-black">{hasAnswered ? "تم الإرسال! ✅" : "استعد..."}</h2>
            <p className="text-[5vw] opacity-60 mt-1 font-bold">بص على الشاشة الرئيسية</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
