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
  const [isIntro, setIsIntro] = useState(true);

  const currentQuestion = quiz?.questions?.[gs.current_question_index] || null;
  const qTime = currentQuestion?.timeLimit || 20;

  useEffect(() => {
    if (gs.phase === 'question' && !isIntro && groups.length > 0 && answersCount >= groups.length) {
      handlePhaseEnd();
    }
  }, [answersCount, groups.length, gs.phase, isIntro]);

  // 1. إدارة التايمر
  useEffect(() => {
    if (gs.phase !== 'question') return;

    if (timer <= 0 && !isIntro) {
      handlePhaseEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimer((p) => (p > 0 ? p - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, gs.phase, isIntro]);

  // تحديث التايمر فور تغير المرحلة أو السؤال
  useEffect(() => {
    if (gs.phase === 'question') {
      setIsIntro(true);
      setTimer(4); // مدة عرض السؤال في المنتصف
      const timeout = setTimeout(() =>{ setIsIntro(false); setTimer(qTime);}, 4000);
      return () => clearTimeout(timeout);
    } else {
      setTimer(5);
      setIsIntro(false);
    }
  }, [gs.phase, gs.current_question_index, qTime]);

  // 2. تتبع الإجابات
  useEffect(() => {
    if (!currentQuestion?.id) return;
    const channel = supabase.channel('ans-${gs.current_question_index}')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `question_id=eq.${quiz.id}`
      }, () => setAnswersCount(prev => prev + 1))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [quiz.id,gs.phase, gs.current_question_index]);

  const goToPhase = async (newPhase: string, nextIndex?: number) => {
    const updateData: any = { phase: newPhase , current_question_index: nextIndex ?? gs.current_question_index };
    // if (typeof nextIndex === 'number') updateData.current_question_index = nextIndex;

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

  const progress = gs.phase === 'question' ? Math.min(100, (timer / qTime) * 100) : 100;
  const isDanger = timer < 5 && gs.phase === 'question';

  if (!currentQuestion && gs.phase !== 'final') return <div className="p-1 text-center">تحميل السؤال...</div>;

  if (gs.phase === 'final') {
    const winners = [...groups].sort((a, b) => b.score - a.score).slice(0, 3);
    return (
      <div className="h-screen w-screen bg-[#1a0b2e] text-white p-1 flex flex-col items-center justify-end font-sans pb-1">
        <h1 className="text-4xl md:text-[5vw] font-black mb-auto mt-1 text-yellow-400">النتائج النهائية 🏆</h1>
        <div className="flex items-end justify-center gap-1 w-full h-[80vh] max-w-6xl">
          {winners[1] && (
            <div className="bg-gray-400 w-1/3 p-1 flex flex-col items-center rounded-t-xl" style={{ height: '70%' }}>
              <img src={winners[1].saint_image || '/placeholder.png'} className="w-8 h-12 md:w-14 md:h-20 rounded-full object-cover mb-1 shadow-lg" />
              <span className="text-sm md:text-2xl font-black text-center truncate w-full">{winners[1].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 mt-1 opacity-80 text-[10px] md:text-sm">{winners[1].members?.slice(0, 3).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-4xl md:text-7xl font-black text-white/50">2</div>
              <div className="text-xl md:text-3xl font-black">{winners[1].score}</div>
            </div>
          )}
          {winners[0] && (
            <div className="bg-yellow-500 w-1/3 p-1 flex flex-col items-center rounded-t-xl shadow-[0_0_40px_rgba(234,179,8,0.6)] z-10" style={{ height: '100%' }}>
              <img src={winners[0].saint_image || '/placeholder.png'} className="w-11 h-16 md:w-21 md:h-28 rounded-full object-cover shadow-xl border-4 border-white mb-1" />
              <span className="text-lg md:text-4xl font-black text-center w-full ">{winners[0].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 mt-1 opacity-90 text-[10px] md:text-base">{winners[0].members?.slice(0, 5).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-6xl md:text-9xl font-black text-white/50">1</div>
              <div className="text-3xl md:text-5xl font-black">{winners[0].score}</div>
            </div>
          )}
          {winners[2] && (
            <div className="bg-orange-700 w-1/3 p-1 flex flex-col items-center rounded-t-xl" style={{ height: '50%' }}>
              <img src={winners[2].saint_image || '/placeholder.png'} className="w-7 h-10 md:w-11 md:h-16 rounded-full object-cover mb-1 shadow-lg" />
              <span className="text-xs md:text-xl font-black text-center truncate w-full">{winners[2].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 mt-1 opacity-80 text-[10px] md:text-xs">{winners[2].members?.slice(0, 3).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-3xl md:text-6xl font-black text-white/50">3</div>
              <div className="text-lg md:text-2xl font-black">{winners[2].score}</div>
            </div>
          )}
        </div>
        <Button onClick={() => window.location.reload()} className="absolute top-2 left-2 bg-white/20 text-white hover:bg-white/40 h-4 px-1 text-xs">إغلاق</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#46178f] text-white p-1 flex flex-col items-center font-sans overflow-hidden">
      {/* التايمر */}
      {/* <div className="mb-1 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-lg font-black bg-black/20">
          {timer}
        </div>
        <p className="text-[9px] opacity-50 uppercase tracking-tighter">{gs.phase}</p>
      </div> */}
      {gs.phase === 'question' && !isIntro && (
        <div className="w-full h-8 md:h-12 bg-black/30 rounded-full mb-1 relative overflow-hidden flex items-center">
          <motion.div
            animate={{ width: `${progress}%`, backgroundColor: timer < 5 ? "#ef4444" : "#3b82f6" }}
            transition={{ width: { duration: 1, ease: "linear" } }}
            className="absolute top-0 left-0 h-full"
          />
          <span className="relative z-10 w-full text-center text-xl md:text-3xl font-black drop-shadow-md">{timer} ثانية</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {gs.phase === 'question' && (
          <motion.div key="q" className="flex-1 flex flex-col w-full h-full">
            <motion.div layout transition={{ duration: 0.5 }} className={`flex items-center justify-center px-2 text-center font-black leading-tight ${isIntro ? "flex-1 text-5xl md:text-[6vw]" : "h-[35vh] text-3xl md:text-[4vw]"}`}>
              {currentQuestion?.text}
            </motion.div>

            {!isIntro && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex-1 grid grid-cols-2 gap-1 p-1 h-[60vh]">
                {currentQuestion?.choices.map((opt: any, i: number) => (
                  <div key={i} className={`rounded-xl flex flex-col justify-center items-center p-2 text-center shadow-lg ${['bg-red-500','bg-green-500', 'bg-blue-500','bg-yellow-500' ][i]}`}>
                    <span className="text-4xl md:text-[4vw] font-black drop-shadow-lg">{opt}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {!isIntro && (
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xl md:text-2xl font-black">
                <span className="bg-black/40 px-4 py-1 rounded-full">إجابات: {answersCount} / {groups.length}</span>
                <Button onClick={handlePhaseEnd} className="bg-white text-black text-lg md:text-2xl px-6 h-10">تخطي</Button>
              </div>
            )}
          </motion.div>
        )}

        {gs.phase === 'result' && (
          <motion.div key="r" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-1">
            <p className="text-[10px] mb-1 opacity-70">الإجابة الصحيحة:</p>
            <div className="bg-green-500 p-1 rounded-xl text-xl font-black shadow-lg">
              {/* {choices[correctIdx]} */}
              {currentQuestion?.choices[currentQuestion?.correctAnswer]}
            </div>
            <Button onClick={handlePhaseEnd} className="mt-1 h-7 px-1 bg-blue-600 text-[10px]">عرض الترتيب</Button>
          </motion.div>
        )}

        {gs.phase === 'scoreboard' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xs p-1">
            <h2 className="text-center text-xs font-black mb-1 italic">TOP 5 LEADERBOARD 🏆</h2>
            <div className="flex flex-col gap-1">
              {groups.sort((a: any, b: any) => b.score - a.score).slice(0, 5).map((g: any, i: number) => (
                <div key={g.id} className="flex justify-between items-center p-1 bg-black/20 rounded border-l-2 border-yellow-500">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">{i + 1}. {g.group_name}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {g.members?.slice(0, 3).map((name: string, idx: number) => (
                        <span key={idx} className="text-[8px] opacity-60">· {name}</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-black text-yellow-400 text-sm">{g.score}</span>
                </div>
              ))}
            </div>
            <Button onClick={handlePhaseEnd} className="w-full mt-1 h-8 bg-blue-500 text-xs">
              {gs.current_question_index < quiz.questions.length - 1 ? 'السؤال التالي' : 'النتيجة النهائية'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
