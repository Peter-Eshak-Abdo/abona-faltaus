"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VolumeX, Volume2 } from "lucide-react"

const AnimatedNumber = ({ from, to }: { from: number, to: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // ننتظر ثانية قبل ما العداد يبدأ يزيد ليتزامن مع حركة ترتيب الفرق
    const timeout = setTimeout(() => {
      animate(from, to, {
        duration: 1.5,
        onUpdate(v) { if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString(); }
      });
    }, 1000);
    if (nodeRef.current) nodeRef.current.textContent = from.toString();
    return () => clearTimeout(timeout);
  }, [from, to]);
  return <span ref={nodeRef}>{from}</span>;
};

export default function QuizHostGame({ quiz, groups, gameState: initialGS }: any) {
  const supabase = createClient();
  const [gs, setGs] = useState(initialGS);
  const [timer, setTimer] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [answerDistribution, setAnswerDistribution] = useState<number[]>([0, 0, 0, 0]); // لحفظ توزيع الإجابات
  const [isIntro, setIsIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [displayGroups, setDisplayGroups] = useState(groups);
  const [podiumStep, setPodiumStep] = useState(0);
  const prevGroupsRef = useRef(groups);

  const currentQuestion = quiz?.questions?.[gs.current_question_index] || null;
  const qTime = currentQuestion?.timeLimit || 20;
  const isMutedRef = useRef(isMuted);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeAudiosRef = useRef<HTMLAudioElement[]>([]);

  const playAudio = (path: string, loop: boolean = false) => {
    if (typeof window !== "undefined") {
      const audio = new Audio(path);
      audio.loop = loop;
      audio.muted = isMutedRef.current;
      audio.play().catch((e) => console.log("Audio ignored:", e));
      activeAudiosRef.current.push(audio);
      audio.onended = () => {
        activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
      };
      return audio;
    }
    return null;
  };

  const stopAllMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    activeAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudiosRef.current = [];
  };

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) audioRef.current.muted = isMuted;
    activeAudiosRef.current.forEach(audio => { audio.muted = isMuted });
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (gs.phase === 'question' && !isIntro) {
      audio.volume = 0.7;
      if (!audio.src.includes('question-music.mp3')) {
        audio.src = "/sounds/question-music.mp3";
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log("تم تجاهل التشغيل:", error));
      }
    } else stopAllMusic();
  }, [gs.phase, isIntro]);

  // تجميد الاسكور القديم في بداية السؤال فقط عشان نقارن بيه في السكوربورد
  useEffect(() => {
    if (gs.phase === 'question' && isIntro) {
      prevGroupsRef.current = groups;
    }
  }, [gs.phase, isIntro, groups]);

  // إدارة التايمر للسؤال
  useEffect(() => {
    if (gs.phase !== 'question') return;
    if (timer <= 0 && !isIntro) {
      handlePhaseEnd();
      return;
    }
    const interval = setInterval(() => {
      setTimer((p) => {
        const newTime = p > 0 ? p - 1 : 0;
        if (newTime <= 5 && newTime > 0) playAudio('/sounds/tick.mp3', false);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, gs.phase, isIntro]);

  // التخطي التلقائي عند إجابة كل الفرق
  useEffect(() => {
    if (gs.phase === 'question' && !isIntro && groups.length > 0 && answersCount >= groups.length) {
      handlePhaseEnd();
    }
  }, [answersCount, groups.length, gs.phase, isIntro]);

  // إعداد التايمر للمرحلة الجديدة
  useEffect(() => {
    if (gs.phase === 'question') {
      setIsIntro(true);
      setTimer(4);
      playAudio('/sounds/intro.mp3', false);
      const timeout = setTimeout(() => { setIsIntro(false); setTimer(qTime); }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [gs.phase, gs.current_question_index, qTime]);

  // الانتقال التلقائي بعد 5 ثواني للـ Result و Scoreboard
  useEffect(() => {
    if (gs.phase === 'result' || gs.phase === 'scoreboard') {
      const autoSkip = setTimeout(() => {
        handlePhaseEnd();
      }, 5000); // 5 ثواني وتنتقل للمرحلة اللي بعدها
      return () => clearTimeout(autoSkip);
    }
  }, [gs.phase]);

  // جلب إحصائيات الإجابات في مرحلة النتيجة
  useEffect(() => {
    if (gs.phase === 'result') {
      const fetchDistribution = async () => {
        const { data } = await supabase
          .from('answers')
          .select('selected_option')
          .eq('quiz_id', quiz.id)
          .eq('question_id', gs.current_question_index.toString());

        if (data) {
          const dist = [0, 0, 0, 0];
          data.forEach((ans: any) => {
            if (ans.selected_option !== null && ans.selected_option < 4) {
              dist[ans.selected_option]++;
            }
          });
          setAnswerDistribution(dist);
        }
      };
      fetchDistribution();
    }
  }, [gs.phase, gs.current_question_index, quiz.id]);

  // أنيميشن السكوربورد: نعرض القديم أولاً، وبعد ثانية نعرض الجديد لتبدأ الحركة
  useEffect(() => {
    if (gs.phase === 'scoreboard') {
      playAudio('/sounds/score-up.mp3', false);
      setDisplayGroups(prevGroupsRef.current); // عرض الترتيب القديم أولاً
      const t = setTimeout(() => {
        setDisplayGroups(groups); // تحديث للترتيب الجديد بعد ثانية لتفعيل الأنيميشن
      }, 1000);
      return () => clearTimeout(t);
    } else {
      setDisplayGroups(groups);
    }
  }, [gs.phase, groups]);

  // تتابع المرحلة النهائية (التشويق)
  useEffect(() => {
    if (gs.phase === 'final') {
      const t1 = setTimeout(() => { setPodiumStep(1); playAudio('/sounds/podium3.mp3', false); }, 5000); // يظهر الثالث
      const t2 = setTimeout(() => { setPodiumStep(2); playAudio('/sounds/podium2.m4a', false); }, 10000); // يظهر الثاني
      const t3 = setTimeout(() => { setPodiumStep(3); playAudio('/sounds/podium1.mp3', true); }, 15000); // يظهر الأول
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [gs.phase]);

  // تتبع عدد الإجابات أثناء السؤال
  useEffect(() => {
    if (!currentQuestion || gs.phase !== 'question') return;
    const fetchInitialAnswers = async () => {
      const { count } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id).eq('question_id', gs.current_question_index.toString());
      if (count !== null) setAnswersCount(count);
    };
    fetchInitialAnswers();

    const channel = supabase.channel(`ans-${gs.current_question_index}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'answers', filter: `quiz_id=eq.${quiz.id}` }, (payload) => {
        if (String(payload.new.question_id) === String(gs.current_question_index)) {
          setAnswersCount(prev => prev + 1);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gs.phase, gs.current_question_index, quiz.id, currentQuestion]);

  const goToPhase = async (newPhase: string, nextIndex?: number) => {
    const updateData: any = { phase: newPhase, current_question_index: nextIndex ?? gs.current_question_index };
    const { data } = await supabase.from("game_state").update(updateData).eq("quiz_id", quiz.id).select().single();
    if (data) {
      setGs(data);
      if (newPhase === 'question') setAnswersCount(0);
    }
  };

  const handlePhaseEnd = () => {
    stopAllMusic();
    if (gs.phase === 'question') goToPhase('result');
    else if (gs.phase === 'result') {
      if (gs.current_question_index >= quiz.questions.length - 1) goToPhase('final');
      else goToPhase('scoreboard');
    } else if (gs.phase === 'scoreboard') {
      goToPhase('question', gs.current_question_index + 1);
    }
  };

  const progress = gs.phase === 'question' ? Math.min(100, (timer / qTime) * 100) : 100;
  const isDanger = timer < 5 && gs.phase === 'question' && !isIntro;

  if (!currentQuestion && gs.phase !== 'final') return <div className="h-screen flex items-center justify-center text-[5vw] bg-[#1a0b2e] text-white">جاري التحميل...</div>;

  // --- شاشة النهاية التشويقية ---
  if (gs.phase === 'final') {
    const winners = [...groups].sort((a, b) => b.score - a.score).slice(0, 3);
    return (
      <div className="h-screen w-screen bg-[#0a0412] text-white p-1 flex flex-col items-center justify-end font-sans pb-1 overflow-hidden relative">
        <AnimatePresence>
          {podiumStep === 0 && (
            <motion.div exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black z-50">
              <h1 className="text-[6vw] font-black animate-pulse text-purple-400">جاري تجميع النتائج...</h1>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: podiumStep > 0 ? 1 : 0, y: 0 }} className="text-[6vw] font-black mb-auto mt-1 text-yellow-400 z-10">
          أبطال المسابقة 🏆
        </motion.h1>

        <div className="flex items-end justify-center gap-1 w-full h-[75vh] max-w-7xl z-10">
          {/* المركز الثالث */}
          {winners[2] && (
            <motion.div initial={{ y: "100%" }} animate={{ y: podiumStep >= 1 ? 0 : "100%" }} transition={{ type: "spring", bounce: 0.3 }}
              className="bg-orange-800 w-1/3 p-1 flex flex-col items-center rounded-t-2xl shadow-lg border-t-4 border-orange-500" style={{ height: '50%' }}>
              <img src={winners[2].saint_image || '/placeholder.png'} className="w-[6vw] h-[7vw] rounded-full object-cover mb-1 shadow-2xl border-2 border-white" />
              <span className="text-[2vw] font-black text-center truncate w-full">{winners[2].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 opacity-80 text-[1.5vw]">{winners[2].members?.slice(0, 5).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-[5vw] font-black text-white/40">3</div>
              <div className="text-[3vw] font-black text-orange-300">{winners[2].score}</div>
            </motion.div>
          )}

          {/* المركز الأول */}
          {winners[0] && (
            <motion.div initial={{ y: "100%" }} animate={{ y: podiumStep >= 3 ? 0 : "100%" }} transition={{ type: "spring", bounce: 0.4 }}
              className="bg-yellow-500 w-1/3 p-1 flex flex-col items-center rounded-t-2xl shadow-[0_0_50px_rgba(234,179,8,0.8)] border-t-8 border-white z-20" style={{ height: '95%' }}>
              <img src={winners[0].saint_image || '/placeholder.png'} className="w-[9vw] h-[10vw] rounded-full object-cover mb-1 shadow-2xl border-4 border-white" />
              <span className="text-[4vw] font-black text-center truncate w-full drop-shadow-lg">{winners[0].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 opacity-90 text-[1.8vw]">{winners[0].members?.slice(0, 5).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-[8vw] font-black text-white/50 drop-shadow-md">1</div>
              <div className="text-[4vw] font-black text-white">{winners[0].score}</div>
            </motion.div>
          )}

          {/* المركز الثاني */}
          {winners[1] && (
            <motion.div initial={{ y: "100%" }} animate={{ y: podiumStep >= 2 ? 0 : "100%" }} transition={{ type: "spring", bounce: 0.3 }}
              className="bg-gray-400 w-1/3 p-1 flex flex-col items-center rounded-t-2xl shadow-lg border-t-4 border-gray-200" style={{ height: '70%' }}>
              <img src={winners[1].saint_image || '/placeholder.png'} className="w-[6vw] h-[7vw] rounded-full object-cover mb-1 shadow-2xl border-2 border-white" />
              <span className="text-[3.5vw] font-black text-center truncate w-full">{winners[1].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 opacity-80 text-[1.5vw]">{winners[1].members?.slice(0, 5).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-[7vw] font-black text-white/40">2</div>
              <div className="text-[3vw] font-black text-gray-100">{winners[1].score}</div>
            </motion.div>
          )}
        </div>
        <Button onClick={() => window.location.reload()} className="absolute top-2 right-2 bg-white/10 text-white hover:bg-white/30 h-10 px-4 text-xl">إغلاق</Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#46178f] text-white p-1 flex flex-col items-center font-sans overflow-hidden">

      {/* مؤشر رقم السؤال */}
      <div className="absolute top-2 right-2 bg-black/40 px-4 py-2 rounded-full text-[2.5vh] font-black shadow-lg z-50">
        {gs.current_question_index + 1} of {quiz.questions?.length || 0}
      </div>

      {/* الشريط التقدمي والتايمر في الأعلى */}
      {gs.phase === 'question' && !isIntro && (
        <div className="w-full h-[6vh] bg-black/40 rounded-xl mb-1 relative overflow-hidden flex items-center shadow-inner">
          <motion.div
            initial={{ width: "100%" }}
            animate={{
              width: `${progress}%`,
              backgroundColor: timer < 5 ? "#ef4444" : "#10b981",
              x: isDanger ? [0, -5, 5, -5, 0] : 0
            }}
            transition={{ width: { duration: 1, ease: "linear" }, x: { repeat: Infinity, duration: 0.1 } }}
            className="absolute top-0 left-0 h-full"
          />
          <span className="relative z-10 w-full text-center text-[4vh] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{timer}</span>
        </div>
      )}

      {/* زر التخطي وعدد الإجابات تحت الشريط مباشرة */}
      {gs.phase === 'question' && !isIntro && (
        <div className="w-full flex justify-between items-center px-1 mb-1">
          <span className="bg-black/30 px-1 py-1 rounded-lg text-[3vh] font-black">إجابات: <span className="text-yellow-400">{answersCount}</span> / {groups.length}</span>
          <Button onClick={handlePhaseEnd} className="bg-white text-black hover:bg-gray-200 text-[3vh] h-[6vh] px-1 font-black shadow-lg">تخطي</Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {gs.phase === 'question' && (
          <motion.div key="q" className="flex-1 flex flex-col w-full h-full">
            <motion.h1 layout transition={{ duration: 0.5, type: "spring" }}
              className={`flex items-center justify-center text-center font-black leading-tight px-1 drop-shadow-xl ${isIntro ? "flex-1 text-[8vw]" : "h-[30vh] text-[5vw]"}`}>
              {currentQuestion?.text}
            </motion.h1>

            {!isIntro && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="flex-1 grid grid-cols-2 gap-1 p-1">
                {currentQuestion?.choices.map((opt: any, i: number) => (
                  <div key={i} className={`rounded-2xl flex items-center justify-center p-1 text-center shadow-[0_8px_0_rgba(0,0,0,0.2)] border-2 border-white/10 ${['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500'][i]}`}>
                    <span className="text-[5vw] font-black drop-shadow-lg">{opt}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* عرض الإجابة الصحيحة بخط عملاق */}
        {gs.phase === 'result' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col w-full h-full">
            <div className="h-[10vh] flex items-center justify-center">
              <span className="text-[4vw] opacity-80 font-black uppercase tracking-widest text-center">النتيجة</span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-1 p-1 w-full max-w-6xl mx-auto">
              {currentQuestion?.choices.map((opt: any, i: number) => {
                const isCorrect = i === currentQuestion.correctAnswer;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: isCorrect ? 1.05 : 0.95,
                      opacity: isCorrect ? 1 : 0.6
                    }}
                    className={`relative rounded-2xl flex flex-col items-center justify-center p-1 text-center border-4 transition-all duration-500
                        ${['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][i]}
                        ${isCorrect ? 'border-white shadow-[0_0_40px_rgba(255,255,255,0.5)] z-10' : 'border-transparent shadow-none'}
                      `}
                  >
                    {/* علامة الصح للاختيار الصحيح */}
                    {isCorrect && <div className="absolute -top-6 -right-6 bg-white rounded-full p-1 text-green-500 shadow-xl text-4xl">✅</div>}

                    <span className="text-[3.5vw] font-black drop-shadow-lg mb-1">{opt}</span>

                    {/* عدد الفرق التي اختارت هذه الإجابة */}
                    <div className="bg-black/50 px-2 py-1 rounded-full text-[2.5vw] font-black flex items-center gap-1 mt-auto">
                      👤 {answerDistribution[i] || 0}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="p-1 flex justify-end">
              <Button onClick={handlePhaseEnd} className="h-[8vh] px-1 text-[3vh] font-black bg-white text-black hover:bg-gray-200 rounded-full shadow-xl">
                التالي ❯
              </Button>
            </div>
          </motion.div>
        )}

        {/* السكوربورد مع الأنيميشن */}
        {gs.phase === 'scoreboard' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-1">
            <h2 className="text-[5vw] font-black mb-1 text-white drop-shadow-lg bg-white/20 px-1 py-1 rounded-lg">Scoreboard</h2>
            <div className="w-full flex flex-col gap-1 relative">
              <AnimatePresence>
                {[...displayGroups].sort((a: any, b: any) => b.score - a.score).slice(0, 5).map((g: any, i: number) => {
                  const oldGroupData = prevGroupsRef.current.find((pg: any) => pg.id === g.id);
                  const oldScore = oldGroupData ? oldGroupData.score : 0;

                  return (
                    <motion.div
                      layout
                      key={g.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="flex justify-between items-center p-1 bg-[#46178f]/80 rounded-sm border-l-[1vw] border-yellow-500 text-[3.5vw] font-black shadow-[0_4px_0_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex items-center gap-1">
                        <span className="bg-white/10 w-[5vw] h-[5vw] flex items-center justify-center rounded-full text-white/80">{i + 1}</span>
                        <span>{g.group_name}</span>
                      </div>
                      <span className="text-white">
                        <AnimatedNumber from={oldScore} to={g.score} />
                      </span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            <Button onClick={handlePhaseEnd} className="absolute bottom-6 right-6 h-[8vh] px-1 text-[3vh] font-black bg-white text-black hover:bg-gray-200 rounded-full shadow-xl">
              التالي ❯
            </Button>
          </motion.div>
        )}

        <div className="fixed bottom-2 left-2 z-50">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 bg-white/20 backdrop-blur-lg border-2 border-white/30 rounded-full hover:scale-110 transition-all shadow-2xl"
          >
            {isMuted ? (
              <VolumeX className="text-red-500" size={18} />
            ) : (
              <Volume2 className="text-white" size={18} />
            )}
          </button>
          <audio ref={audioRef} src="/sounds/question-music.mp3" loop />
        </div>
      </AnimatePresence>
    </div>
  );
}
