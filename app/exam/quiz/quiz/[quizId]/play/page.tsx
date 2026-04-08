"use client"
import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"

const KAHOOT_COLORS = [
  { color: "bg-red-500", icon: "▲", hover: "bg-red-600" },
  { color: "bg-blue-500", icon: "◆", hover: "bg-blue-600" },
  { color: "bg-yellow-500", icon: "●", hover: "bg-yellow-600" },
  { color: "bg-green-500", icon: "■", hover: "bg-green-600" },
]

export default function PlayPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;
  const supabase = createClient();

  const [gameState, setGameState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    setTeamId(localStorage.getItem(`team_id_${quizId}`));

    const fetchInitial = async () => {
      const { data: gs } = await supabase.from("game_state").select("*").eq("quiz_id", quizId).single();
      setGameState(gs);
      if (gs) fetchQuestion(gs.current_question_index);
    };

    fetchInitial();

    const channel = supabase.channel(`game-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
      (payload) => {
        const newState = payload.new;
        setGameState(newState);
        setHasAnswered(false); // ريست مع كل مرحلة جديدة

        // ريست التايمر عند بداية سؤال جديد
        if (newState.phase === 'question') {
          setTimer(20);
        }

        fetchQuestion(newState.current_question_index);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [quizId]);

  useEffect(() => {
    if (gameState?.phase !== 'question' || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gameState?.phase]);

  const fetchQuestion = async (index: number) => {
    const { data } = await supabase.from("questions").select("*").eq("quiz_id", quizId).order('id');
    if (data && data[index]) setCurrentQuestion(data[index]);
  };

  const submitAnswer = async (choiceIndex: number) => {
    if (hasAnswered || gameState.phase !== 'question') return;
    setHasAnswered(true);

    const isCorrect = choiceIndex === currentQuestion.correct_answer;

    // 1. حساب السكور فوراً لو صح
    if (isCorrect) {
      // حساب بونص سرعة: كل ما جاوب أسرع ياخد نقاط أكتر (مثال: 1000 نقطة كحد أقصى)
      const points = Math.max(500, 1000 - (20 - timer) * 20);
      await supabase.rpc('increment_team_score', {
        team_id: teamId,
        points: points
      });
    }

    // 2. تسجيل الإجابة في جدول answers للـ Statistics
    await supabase.from("answers").insert({
      quiz_id: quizId,
      question_id: currentQuestion.id,
      team_id: teamId,
      answer_index: choiceIndex,
      is_correct: isCorrect
    });
  };

  if (!gameState || !currentQuestion) return <div className="h-screen bg-[#46178f] flex items-center justify-center text-white">مستني الأدمن يبدأ...</div>;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 font-bold">
      <AnimatePresence mode="wait">
        {gameState.phase === 'question' && !hasAnswered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid grid-cols-2 grid-rows-2 p-1 gap-1">
            {currentQuestion.options.map((option: string, i: number) => (
              <button
                key={i}
                onClick={() => submitAnswer(i)}
                className={`${KAHOOT_COLORS[i].color} ${KAHOOT_COLORS[i].hover} text-white flex flex-col items-center justify-center rounded-lg transition-transform active:scale-95`}
              >
                <span className="text-6xl mb-1">{KAHOOT_COLORS[i].icon}</span>
                <span className="text-2xl px-1">{option}</span>
              </button>
            ))}
          </motion.div>
        )}

        {hasAnswered && gameState.phase === 'question' && (
          <div className="h-full flex flex-col items-center justify-center text-white bg-purple-800">
            <div className="animate-pulse text-4xl">تم استلام إجابتك!</div>
            <p className="mt-1 opacity-70 text-xl">استنى النتيجة على شاشة الأدمن</p>
          </div>
        )}

        {gameState.phase === 'result' && (
          <div className={`h-full flex flex-col items-center justify-center text-white ${hasAnswered ? 'bg-blue-600' : 'bg-gray-600'}`}>
             <h2 className="text-5xl mb-1 text-center px-1">انتهى وقت السؤال!</h2>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
