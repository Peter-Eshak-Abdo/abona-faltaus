"use client"
import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { GroupsSection } from "@/components/quiz/GroupsSection"
import QRCodeSection from "@/components/quiz/QRCodeSection"
import { QuizStats } from "@/components/quiz/QuizStats"
import { Button } from "@/components/ui/button"
import { Play, Loader2, RefreshCcw } from "lucide-react"
import QuizHostGame from "@/components/quiz/QuizHostGame"

export default function HostPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;

  const [quiz, setQuiz] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات (دمجنا فيها كل حاجة)
  const refreshAllData = async () => {
    try {
      setLoading(true);
      // نطلب المسابقة سواء كانت بالـ id أو بالكود
      let query = supabase.from("quizzes").select("*");
      if (quizId.length === 10 && /^\d+$/.test(quizId)) {
        query = query.eq("code", quizId);
      } else {
        query = query.eq("id", quizId);
      }

      const { data: qData, error: qError } = await query.maybeSingle();

      if (qError) throw qError;

      if (qData) {
        setQuiz(qData);
        const actualQuizId = qData.id;

        // جلب حالة اللعبة والفرق
        const { data: gs } = await supabase.from("game_state").select("*").eq("quiz_id", actualQuizId).single();
        setGameState(gs);

        const { data: grps } = await supabase.from("quiz_groups").select("*").eq("quiz_id", actualQuizId);
        setGroups(grps || []);
      }

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualQuizId = quiz?.id || quizId;

  // الاستدعاء عند فتح الصفحة
  useEffect(() => {
    refreshAllData();

    // مراقبة الفرق
    const groupsChannel = supabase.channel(`groups-${actualQuizId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_groups', filter: `quiz_id=eq.${actualQuizId}` },
        () => {
          supabase.from("quiz_groups").select("*").eq("quiz_id", actualQuizId).then((res: any) => setGroups(res.data || []));
        })
      .subscribe();

    // 2. جديد: مراقبة حالة اللعبة (Game State)
    const gameStateChannel = supabase.channel(`state-${actualQuizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${actualQuizId}` },
        (payload: any) => {
          setGameState(payload.new);
        })
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(gameStateChannel);
    };
  }, [actualQuizId]);

  // دالة حذف الفريق
  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`هل تريد طرد فريق ${name}؟`)) return;
    const { error } = await supabase.from("quiz_groups").delete().eq("id", id);
    if (!error) setGroups(prev => prev.filter(g => g.id !== id));
  };

  // دالة البدء
  const handleStart = async () => {
    if (!quiz?.questions?.length) return alert("خطأ: لا توجد أسئلة محملة!");
    if (groups.length === 0) return alert("يجب وجود فريق واحد على الأقل!");
    const newState = { is_active: true, phase: 'question', current_question_index: 0 };

    // تحديث قاعدة البيانات
    const { error } = await supabase.from("game_state").update(newState).eq("quiz_id", actualQuizId);

    if (!error) {
      // تحديث الحالة محلياً عشان QuizHostGame يستلم البيانات الجديدة فوراً
      setGameState((prev: any) => ({ ...prev, ...newState }));
      setIsStarted(true);
    }
  };

  // دالة التصفير
  const handleReset = async () => {
    if (!confirm("تصفير المسابقة؟")) return;
    setLoading(true);
    await supabase.from("answers").delete().eq("quiz_id", actualQuizId);
    await supabase.from("quiz_groups").delete().eq("quiz_id", actualQuizId);
    await supabase.from("game_state").update({ phase: 'lobby', is_active: false, current_question_index: 0 }).eq("quiz_id", actualQuizId);
    window.location.reload();
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1a0b2e]"><Loader2 className="animate-spin text-purple-500" /></div>;
  if (isStarted && quiz && gameState) return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />;

  return (
    <div className="min-h-screen bg-[#130722] text-white p-4 sm:p-6 font-sans" dir="rtl">
      <div className="flex justify-between items-center bg-white/5 backdrop-blur-md rounded-3xl p-4 sm:p-6 mb-6 border border-white/10 shadow-2xl flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl sm:text-4xl font-black text-purple-200">{quiz?.title}</h1>
          {quiz?.code && (
            <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner">
              <span className="text-xs text-purple-300 font-bold">كود المسابقة:</span>
              <span className="text-lg sm:text-xl font-black font-mono tracking-widest text-white" dir="ltr">{quiz.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quiz.code);
                  alert(`تم نسخ الكود: ${quiz.code}`);
                }}
                className="text-xs bg-purple-700 hover:bg-purple-600 px-2.5 py-1 rounded-lg text-white font-bold transition-colors"
              >
                نسخ
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Button
            onClick={handleReset}
            variant="destructive"
            className="h-11 px-4 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-2xl transition-all"
          >
            <RefreshCcw className="w-4 h-4 ml-1.5" />
            <span>تصفير</span>
          </Button>
          <Button
            onClick={handleStart}
            className="h-11 px-6 text-sm bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 ml-1.5 fill-current" />
            <span>ابدأ الآن</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
          <QuizStats quiz={quiz} groups={groups} />
          <QRCodeSection quizId={actualQuizId} />
        </div>

        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-6 min-h-[300px] shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold pb-3 mb-3 border-b border-white/10 text-purple-200">
            الفرق المتصلة ({groups.length})
          </h2>
          <GroupsSection groups={groups} handleDeleteGroup={handleDeleteGroup} />
        </div>
      </div>
    </div>
  );
}
