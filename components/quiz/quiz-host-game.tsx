"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function QuizHostGame({ quiz, groups, gameState: initialGS }: any) {
  const supabase = createClient();
  const [gs, setGs] = useState(initialGS);
  const [timer, setTimer] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);

  // حماية: التأكد من وجود أسئلة قبل البدء
  const currentQuestion = quiz?.questions ? quiz.questions[gs.current_question_index] : null;

  // 1. إدارة التايمر
  useEffect(() => {
    if (timer <= 0 && gs.phase === 'question') {
      handlePhaseEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, gs.phase]);

  // 2. تتبع الإجابات لايف (Subscription)
  useEffect(() => {
    if (!currentQuestion?.id) return;

    const channel = supabase.channel('host-answers-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `question_id=eq.${currentQuestion.id}`
      }, () => {
        setAnswersCount(prev => prev + 1);
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentQuestion?.id]);

  // 3. التحكم في المراحل
  const goToPhase = async (newPhase: string, nextIndex?: number) => {
    const updateData: any = {
        phase: newPhase,
        phase_start_time: new Date().toISOString()
    };

    if (typeof nextIndex === 'number') {
        updateData.current_question_index = nextIndex;
    }

    const { data, error } = await supabase
      .from("game_state")
      .update(updateData)
      .eq("quiz_id", quiz.id)
      .select()
      .single();

    if (!error && data) {
      setGs(data);
      setAnswersCount(0); // تصفير العداد للمرحلة الجديدة

      // تعيين وقت التايمر حسب المرحلة
      if (newPhase === 'question') {
        const q = quiz.questions[data.current_question_index];
        setTimer(q?.timeLimit || 20);
      } else {
        setTimer(15); // وقت تلقائي لنتائج والترتيب
      }
    }
  };

  const handlePhaseEnd = () => {
    if (gs.phase === 'question') goToPhase('result');
    else if (gs.phase === 'result') goToPhase('scoreboard');
    else if (gs.phase === 'scoreboard') {
      if (gs.current_question_index < quiz.questions.length - 1) {
        goToPhase('question', gs.current_question_index + 1);
      } else {
        goToPhase('final');
      }
    }
  };

  if (!currentQuestion && gs.phase !== 'final') {
    return <div className="p-20 text-center">خطأ: لا توجد أسئلة محملة</div>;
  }

  return (
    <div className="min-h-screen bg-[#46178f] text-white p-1 overflow-hidden flex flex-col items-center">
      {/* Timer UI */}
      <div className="mb-1 flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-3xl font-black">
          {timer}
        </div>
        <p className="mt-1 font-bold uppercase tracking-widest opacity-70">{gs.phase}</p>
      </div>

      <AnimatePresence mode="wait">
        {gs.phase === 'question' && (
          <motion.div key="q" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-6xl">
            <h1 className="text-4xl md:text-6xl text-center font-bold mb-1 leading-tight">
              {currentQuestion.question_text}
            </h1>

            {/* عرض صورة السؤال لو وجدت */}
            {currentQuestion.image_url && (
                <div className="mb-1 flex justify-center">
                    <img src={currentQuestion.image_url} className="max-h-64 rounded-xl shadow-2xl" />
                </div>
            )}

            <div className="grid grid-cols-2 gap-1">
              {['red', 'blue', 'yellow', 'green'].map((color, i) => (
                <div key={i} className={`p-1 rounded-lg text-2xl font-bold flex items-center justify-between
                  ${color === 'red' ? 'bg-red-500' : color === 'blue' ? 'bg-blue-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  <span>{currentQuestion.options[i]}</span>
                  <span className="opacity-40 text-4xl">{i+1}</span>
                </div>
              ))}
            </div>

            <div className="mt-1 flex justify-between items-center bg-black/30 p-1 rounded-2xl">
                <div className="text-2xl">الإجابات: <span className="text-4xl font-black">{answersCount}</span></div>
                <Button onClick={handlePhaseEnd} className="bg-white text-black hover:bg-zinc-200">تخطي السؤال</Button>
            </div>
          </motion.div>
        )}

        {gs.phase === 'result' && (
          <motion.div key="r" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <h2 className="text-3xl mb-1">الإجابة الصحيحة:</h2>
            <div className="bg-green-500 p-1 rounded-3xl text-5xl font-black shadow-2xl">
              {currentQuestion.options[currentQuestion.correct_answer]}
            </div>
            <Button onClick={handlePhaseEnd} className="mt-1 p-1 text-xl">عرض الترتيب</Button>
          </motion.div>
        )}

        {gs.phase === 'scoreboard' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl bg-white/10 rounded-3xl p-1 backdrop-blur-md">
            <h2 className="text-4xl font-black text-center mb-1">لوحة المتصدرين 🏆</h2>
            <div className="space-y-1">
              {groups.sort((a:any, b:any) => b.score - a.score).map((g:any, i:number) => (
                <div key={g.id} className="flex justify-between p-1 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-xl font-bold">{i+1}. {g.group_name}</span>
                  <span className="text-2xl font-black text-yellow-400">{g.score}</span>
                </div>
              ))}
            </div>
            <Button onClick={handlePhaseEnd} className="w-full mt-1 py-1 text-xl bg-blue-600">
                {gs.current_question_index < quiz.questions.length - 1 ? 'السؤال التالي' : 'النتيجة النهائية'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
