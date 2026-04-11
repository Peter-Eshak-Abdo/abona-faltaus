"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function QuizHostGame({ quiz, groups, gameState: initialGS }: any) {
  const supabase = createClient();
  const [gs, setGs] = useState(initialGS);
  const [timer, setTimer] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);

  // --- الربط مع الـ JSON بتاعك ---
  const currentQuestion = quiz?.questions?.[gs.current_question_index] || null;
  const questionText = currentQuestion?.text; // كان question_text
  const choices = currentQuestion?.choices || []; // كان options
  const correctIdx = currentQuestion?.correctAnswer; // كان correct_answer
  const qTime = currentQuestion?.timeLimit || 20;

  // 1. إدارة التايمر
  useEffect(() => {
    if (timer <= 0 && gs.phase === 'question') {
      handlePhaseEnd();
      return;
    }
    const interval = setInterval(() => {
      setTimer((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gs.phase]);

  // تحديث التايمر فور تغير المرحلة أو السؤال
  useEffect(() => {
    if (gs.phase === 'question') setTimer(qTime);
    else if (gs.phase === 'result' || gs.phase === 'scoreboard') setTimer(5);
  }, [gs.phase, gs.current_question_index]);

  // 2. تتبع الإجابات
  useEffect(() => {
    if (!currentQuestion?.id) return;
    const channel = supabase.channel('ans-${currentQuestion.id}')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `question_id=eq.${currentQuestion.id}`
      }, () => setAnswersCount(prev => prev + 1))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentQuestion?.id]);

  const goToPhase = async (newPhase: string, nextIndex?: number) => {
    const updateData: any = { phase: newPhase };
    if (typeof nextIndex === 'number') updateData.current_question_index = nextIndex;

    const { data } = await supabase.from("game_state").update(updateData).eq("quiz_id", quiz.id).select().single();
    if (data) {
      setGs(data);
      setAnswersCount(0);
    }
  };

  const handlePhaseEnd = () => {
    if (gs.phase === 'question') goToPhase('result');
    else if (gs.phase === 'result') goToPhase('scoreboard');
    else if (gs.phase === 'scoreboard') {
      if (gs.current_question_index < quiz.questions.length - 1) goToPhase('question', gs.current_question_index + 1);
      else goToPhase('final');
    }
  };

  if (!currentQuestion && gs.phase !== 'final') return <div className="p-1 text-center">تحميل السؤال...</div>;

  if (gs.phase === 'final') {
    const winners = [...groups].sort((a, b) => b.score - a.score).slice(0, 3);
    return (
      <div className="min-h-screen bg-[#1a0b2e] text-white p-1 flex flex-col items-center justify-center font-sans">
        <h1 className="text-2xl font-black mb-4">النتائج النهائية 🏆</h1>
        <div className="flex items-end gap-1 h-64">
          {winners[1] && <div className="bg-silver-500 w-20 bg-gray-400 p-1 flex flex-col items-center rounded-t-lg" style={{ height: '60%' }}>
            <span className="text-[10px] text-center font-bold">{winners[1].group_name}</span>
            <div className="mt-auto text-lg font-black">2</div>
          </div>}
          {winners[0] && <div className="bg-yellow-500 w-24 p-1 flex flex-col items-center rounded-t-lg shadow-[0_0_20px_rgba(234,179,8,0.5)]" style={{ height: '90%' }}>
            <span className="text-xs text-center font-bold">{winners[0].group_name}</span>
            <div className="mt-auto text-2xl font-black">1</div>
          </div>}
          {winners[2] && <div className="bg-orange-700 w-20 p-1 flex flex-col items-center rounded-t-lg" style={{ height: '40%' }}>
            <span className="text-[10px] text-center font-bold">{winners[2].group_name}</span>
            <div className="mt-auto text-lg font-black">3</div>
          </div>}
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-white text-black h-8 px-4">إغلاق المسابقة</Button>
      </div>
    );
  }

  const showChoices = timer <= (qTime - 3); // إظهار الاختيارات بعد 3 ثواني

  return (
    <div className="min-h-screen bg-[#46178f] text-white p-1 flex flex-col items-center font-sans overflow-hidden">
      {/* التايمر */}
      <div className="mb-1 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg font-black bg-black/20">
          {timer}
        </div>
        <p className="text-[9px] opacity-50 uppercase tracking-tighter">{gs.phase}</p>
      </div>

      <AnimatePresence mode="wait">
        {gs.phase === 'question' && (
          <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl flex flex-col gap-1">
            <h1 className="text-xl md:text-3xl text-center font-bold px-1 mb-1 leading-tight">
              {/* {questionText} */}
              {currentQuestion?.text}
            </h1>

            <div className="grid grid-cols-2 gap-1 px-1 transition-all">
              {showChoices ? (
                currentQuestion?.choices.map((opt: string, i: number) => (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={i} className={`p-1 rounded flex justify-between items-center ${['bg-red-500', 'bg-green-600', 'bg-yellow-600', 'bg-blue-500'][i]}`}>
                    <span className="text-sm font-bold">{opt}</span>
                    <span className="opacity-30 text-xs">{i + 1}</span>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 text-center py-1 text-white/50 italic animate-pulse">استعد للاختيارات...</div>
              )}
            </div>

            <div className="mt-1 flex justify-between items-center bg-black/20 p-1 rounded-lg mx-1 text-[10px]">
              <span>إجابات: <b className="text-lg">{answersCount}</b></span>
              <Button onClick={handlePhaseEnd} className="h-6 px-1 text-[10px] bg-white text-black">تخطي</Button>
            </div>
          </motion.div>
        )}

        {gs.phase === 'result' && (
          <motion.div key="r" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-1">
            <p className="text-[10px] mb-1 opacity-70">الإجابة الصحيحة:</p>
            <div className="bg-green-500 p-2 rounded-xl text-xl font-black shadow-lg">
              {/* {choices[correctIdx]} */}
              {currentQuestion?.choices[currentQuestion?.correctAnswer]}
            </div>
            <Button onClick={handlePhaseEnd} className="mt-2 h-7 px-1 bg-blue-600 text-[10px]">عرض الترتيب</Button>
          </motion.div>
        )}

        {gs.phase === 'scoreboard' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xs bg-white/5 rounded p-1">
            <h2 className="text-center text-xs font-black mb-1">المتصدرين 🏆</h2>
            <div className="flex flex-col gap-0.5">
              {groups.sort((a: any, b: any) => b.score - a.score).slice(0, 5).map((g: any, i: number) => (
                <div key={g.id} className="flex justify-between p-1 bg-black/20 rounded text-[10px]">
                  <span>{i + 1}. {g.group_name}</span>
                  <span className="font-bold text-yellow-400">{g.score}</span>
                </div>
              ))}
            </div>
            <Button onClick={handlePhaseEnd} className="w-full mt-2 h-7 text-[10px] bg-blue-500">
              {gs.current_question_index < quiz.questions.length - 1 ? 'السؤال التالي' : 'النتيجة النهائية'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
