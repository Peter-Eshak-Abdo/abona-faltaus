"use client"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { VolumeX, Volume2 } from "lucide-react"

// const playAudio = (path: string, loop: boolean = false, isMuted: boolean = false) => {
//   if (typeof window !== "undefined" && !isMuted) {
//     const audio = new Audio(path);
//     audio.loop = loop;
//     audio.play().catch((e) => console.log("Audio ignored:", e));
//     return audio;
//   }
//   return null;
// };

const AnimatedNumber = ({ from, to }: { from: number, to: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // ننتظر نص ثانية قبل ما العداد يبدأ يزيد
    const timeout = setTimeout(() => {
      animate(from, to, {
        duration: 1.5,
        onUpdate(v) { if (nodeRef.current) nodeRef.current.textContent = Math.round(v).toString(); }
      });
    }, 500);
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
  const [isIntro, setIsIntro] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [displayGroups, setDisplayGroups] = useState(groups);
  const [podiumStep, setPodiumStep] = useState(0);
  const prevGroupsRef = useRef(groups); // حفظ المجموع القديم للأنيميشن
  const currentQuestion = quiz?.questions?.[gs.current_question_index] || null;
  const qTime = currentQuestion?.timeLimit || 20;
  const isMutedRef = useRef(isMuted);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeAudiosRef = useRef<HTMLAudioElement[]>([]);

  // دالة إيقاف الصوت عند ظهور الإجابة أو انتهاء التايمر
  // const stopMusic = () => {
  //   if (audioRef.current) {
  //     audioRef.current.pause();
  //     audioRef.current.currentTime = 0;
  //   }
  // };

  const playAudio = (path: string, loop: boolean = false) => {
    if (typeof window !== "undefined") {
      const audio = new Audio(path);
      audio.loop = loop;
      audio.muted = isMutedRef.current;

      audio.play().catch((e) => console.log("Audio ignored:", e));

      // حفظ الصوت في الـ Ref عشان نقدر نتحكم فيه لاحقاً
      activeAudiosRef.current.push(audio);

      // تنظيف المصفوفة لما الصوت يخلص لوحده
      audio.onended = () => {
        activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
      };
      return audio;
    }
    return null;
  };

  const stopAllMusic = () => {
    // إيقاف الصوت الأساسي
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // إيقاف كل التأثيرات الصوتية المتطايرة (التايمر، المقدمة، الخ)
    activeAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudiosRef.current = []; // تفريغ المصفوفة
  };

  useEffect(() => {
    isMutedRef.current = isMuted;
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }    // كتم أو تشغيل التأثيرات الصوتية الحالية فوراً
    activeAudiosRef.current.forEach(audio => {
      audio.muted = isMuted;
    });
  }, [isMuted]);
  // التحكم في التشغيل والإيقاف الآمن جداً
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (gs.phase === 'question' && !isIntro) {
      audio.volume = 0.7;
      // بنمسك الـ Promise عشان نمنع الـ AbortError
      if (!audio.src.includes('question-music.mp3')) {
        audio.src = "/sounds/question-music.mp3";
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("تم تجاهل التشغيل التلقائي:", error);
        });
      }
    } else {
      stopAllMusic();
      // audio.pause();
      // audio.currentTime = 0; // تصفير الصوت لما السؤال يخلص
    }
  }, [gs.phase, isIntro]);

  // useEffect(() => {
  //   // stopMusic();

  //   let localAudio: HTMLAudioElement | null = null;// الاحتفاظ بنسخة محلية لضمان إيقافها

  //   if (gs.phase === 'question' && !isIntro) {
  //     localAudio = new Audio("/sounds/question-music.mp3");
  //     // audioRef.current = new Audio("/sounds/question-music.mp3");
  //     localAudio.loop = true;
  //     localAudio.volume = 0.7;
  //     localAudio.muted = isMutedRef.current; // يأخذ حالة الكتم الحالية عند التشغيل
  //     localAudio.play().catch(e => console.log("Audio play error", e));
  //     audioRef.current = localAudio; // تخزين المرجع في الريف
  //   }
  //   return () => {
  //     if (localAudio) {
  //       localAudio.pause();
  //       localAudio.currentTime = 0;
  //     }
  //   };
  //   // return () => stopMusic();
  // }, [gs.phase, isIntro]);

  // حفظ الفرق قبل التحديث لعرضها في السكوربورد
  useEffect(() => {
    if (gs.phase !== 'scoreboard') {
      prevGroupsRef.current = groups;
    }
  }, [gs.phase, groups]);

  // إدارة التايمر والصوت في آخر 5 ثواني
  useEffect(() => {
    if (gs.phase !== 'question') return;

    if (timer <= 0 && !isIntro) {
      handlePhaseEnd();
      return;
    }

    const interval = setInterval(() => {
      setTimer((p) => {
        const newTime = p > 0 ? p - 1 : 0;
        if (newTime <= 5 && newTime > 0) playAudio('/sounds/tick.mp3', false); // صوت التايمر آخر 5 ثواني
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

  // تحديث التايمر فور تغير المرحلة أو السؤال
  useEffect(() => {
    if (gs.phase === 'question') {
      setIsIntro(true);
      setTimer(4); // مدة عرض السؤال في المنتصف
      playAudio('/sounds/intro.mp3', false); // صوت حماسي للسؤال
      const timeout = setTimeout(() => { setIsIntro(false); setTimer(qTime); }, 4000);
      return () => clearTimeout(timeout);
    } else {
      setTimer(5);
      setIsIntro(false);
    }
  }, [gs.phase, gs.current_question_index, qTime]);

  // تأخير تحديث السكوربورد لعمل أنيميشن الصعود والنزول
  useEffect(() => {
    if (gs.phase === 'scoreboard') {
      playAudio('/sounds/score-up.mp3', false);
      const t = setTimeout(() => setDisplayGroups(groups), 1500); // يعرض القديم لثانية ونص ثم يطبق الجديد
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

  // تتبع الإجابات
  useEffect(() => {
    if (!currentQuestion || gs.phase !== 'question') return;
    // أولاً: نجلب عدد الإجابات اللي اتسجلت بالفعل للسؤال ده (عشان لو حد جاوب بسرعة)
    const fetchInitialAnswers = async () => {
      const { count, error } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quiz.id).eq('question_id', gs.current_question_index.toString());
      if (count !== null) setAnswersCount(count);
    };

    fetchInitialAnswers();

    // الاستماع للإجابات الجديدة لايف
    const channel = supabase.channel(`ans-${gs.current_question_index}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'answers',
        filter: `quiz_id=eq.${quiz.id}`
      }, (payload) => {
        if (String(payload.new.question_id) === String(gs.current_question_index)) {
        // if (payload.new.question_id === gs.current_question_index.toString()) {
          setAnswersCount(prev => {
            const newCount = prev + 1;
            if (newCount >= groups.length) setTimer(0);
            return newCount;
          });
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gs.phase, gs.current_question_index, quiz.id, groups.length, currentQuestion]);

  const goToPhase = async (newPhase: string, nextIndex?: number) => {
    const updateData: any = { phase: newPhase, current_question_index: nextIndex ?? gs.current_question_index };
    const { data } = await supabase.from("game_state").update(updateData).eq("quiz_id", quiz.id).select().single();
    if (data) {
      setGs(data);
      if (newPhase === 'question') {
        setAnswersCount(0);
      }
    }
  };

  const handlePhaseEnd = () => {
    stopAllMusic(); // وقف الموسيقى فوراً
    if (gs.phase === 'question') {
      goToPhase('result');
    } else if (gs.phase === 'result') {
      if (gs.current_question_index >= quiz.questions.length - 1) {
        goToPhase('final');
      } else {
        goToPhase('scoreboard');
      }
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
              <span className="text-[3vw] font-black text-center truncate w-full">{winners[2].group_name}</span>
              <div className="flex flex-wrap justify-center gap-1 opacity-80 text-[1.5vw]">{winners[2].members?.slice(0, 5).map((m: any, i: number) => <span key={i}>{m}</span>)}</div>
              <div className="mt-auto text-[6vw] font-black text-white/40">3</div>
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
              className={`flex items-center justify-center text-center font-black leading-tight px-1 drop-shadow-xl ${isIntro ? "flex-1 text-[8vw]" : "h-[30vh] text-[6vw]"}`}>
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
          <motion.div key="r" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center w-full p-1">
            <span className="text-[4vw] opacity-70 font-black mb-1 uppercase tracking-widest">الإجابة الصحيحة</span>
            <div className="bg-green-500 w-full p-1 rounded-[3vw] text-[8vw] font-black text-center shadow-[0_10px_0_#15803d] border-4 border-white">
              {currentQuestion?.choices[currentQuestion?.correctAnswer]}
            </div>
            <Button onClick={handlePhaseEnd} className="mt-1 h-[8vh] px-1 text-[4vh] font-black bg-blue-600 rounded-full shadow-xl">
              {gs.current_question_index >= quiz.questions.length - 1 ? 'النتيجة النهائية!' : 'عرض الترتيب'}
            </Button>
          </motion.div>
        )}

        {/* السكوربورد مع الأنيميشن */}
        {gs.phase === 'scoreboard' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto p-1">
            <h2 className="text-[5vw] font-black mb-1 text-yellow-400 drop-shadow-lg">المتصدرين 🏆</h2>
            <div className="w-full flex flex-col gap-1">
              <AnimatePresence>
                {displayGroups.sort((a: any, b: any) => b.score - a.score).slice(0, 5).map((g: any, i: number) => {
                  const oldGroupData = prevGroupsRef.current.find((pg: any) => pg.id === g.id);
                  const oldScore = oldGroupData ? oldGroupData.score : 0;

                  return (
                    <motion.div layout key={g.id} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex justify-between items-center p-1 bg-black/40 rounded-2xl border-l-[1vw] border-yellow-500 text-[4vw] font-black shadow-lg">
                      <div className="flex items-center gap-1">
                        <span className="text-white/50 w-[5vw]">{i + 1}.</span>
                        <span>{g.group_name}</span>
                      </div>
                      <span className="text-yellow-400"><AnimatedNumber from={oldScore} to={g.score} /></span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
            <Button onClick={handlePhaseEnd} className="w-full max-w-2xl mt-1 h-[8vh] text-[4vh] font-black bg-blue-500 rounded-full shadow-xl">
              {gs.current_question_index < quiz.questions.length - 1 ? 'السؤال القادم' : 'إلى النهاية!'}
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
