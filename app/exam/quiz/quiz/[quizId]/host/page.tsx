"use client"
import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { GroupsSection } from "@/components/quiz/groups-section"
import QRCodeSection from "@/components/quiz/qr-code-section"
import { QuizStats } from "@/components/quiz/quiz-stats"
import { Button } from "@/components/ui/button"
import { Play, Loader2, RefreshCcw } from "lucide-react"
import QuizHostGame from "@/components/quiz/quiz-host-game"

export default function HostPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;
  const supabase = createClient();

  const [quiz, setQuiz] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات (دمجنا فيها كل حاجة)
  const refreshAllData = async () => {
    try {
      setLoading(true);
      // نطلب المسابقة فقط لأن الأسئلة جواها كـ JSON
      const { data: qData, error: qError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (qError) throw qError;

      if (qData) {
        // هنا qData.questions هو الـ Array اللي فيه الأسئلة
        setQuiz(qData);
      }

      // جلب حالة اللعبة والفرق (نفس الكود القديم)
      const { data: gs } = await supabase.from("game_state").select("*").eq("quiz_id", quizId).single();
      setGameState(gs);

      const { data: grps } = await supabase.from("quiz_groups").select("*").eq("quiz_id", quizId);
      setGroups(grps || []);

    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // الاستدعاء عند فتح الصفحة
  useEffect(() => {
    refreshAllData(); // <--- هنا بننادي الدالة الأساسية

    // مراقبة الفرق (موجودة عندك)
    const groupsChannel = supabase.channel(`groups-${quizId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_groups', filter: `quiz_id=eq.${quizId}` },
        () => {
          supabase.from("quiz_groups").select("*").eq("quiz_id", quizId).then(({ data }) => setGroups(data || []));
        })
      .subscribe();

    // 2. جديد: مراقبة حالة اللعبة (Game State)
    const gameStateChannel = supabase.channel(`state-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
        (payload) => {
          setGameState(payload.new); // تحديث الحالة فوراً عند حدوث تغيير من أي مكان
        })
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(gameStateChannel);
    };
  }, [quizId]);

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
    const { error } = await supabase.from("game_state").update(newState).eq("quiz_id", quizId);

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
    await supabase.from("answers").delete().eq("quiz_id", quizId);
    await supabase.from("quiz_groups").delete().eq("quiz_id", quizId);
    await supabase.from("game_state").update({ phase: 'lobby', is_active: false, current_question_index: 0 }).eq("quiz_id", quizId);
    window.location.reload();
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1a0b2e]"><Loader2 className="animate-spin text-purple-500" /></div>;
  if (isStarted && quiz && gameState) return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />;

  return (
    <div className="min-h-screen bg-[#1a0b2e] text-white p-1 font-sans" dir="rtl">
      <div className="flex justify-between items-center bg-white/5 rounded-xl p-1 mb-1 border border-white/10 shadow-lg">
        <h1 className="text-7xl font-black px-1 text-purple-300">{quiz?.title}</h1>
        <div className="flex gap-1">
          <Button onClick={handleReset} variant="destructive" className="h-5 px-1 text-[9px] bg-red-600/20 text-red-400 border border-red-500/30 hover:text-red-300">
            <RefreshCcw className="w-3 h-3 ml-1" />
            <p className="text-xl">تنظيف</p>
          </Button>
          <Button onClick={handleStart} className="h-7 px-1 text-[9px] bg-green-600 hover:bg-green-700 font-bold hover:shadow-lg hover:text-green-300">
            <Play className="w-3 h-3 ml-1 fill-current" />
            <p className="text-xl">ابدأ الآن</p>
          </Button>
        </div> 
      </div>

      <div className="grid grid-cols-12 gap-1">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-1">
          <QuizStats quiz={quiz} groups={groups} />
          <QRCodeSection quizId={quizId} />
        </div>

        <div className="col-span-12 lg:col-span-9 bg-white/5 border border-white/10 rounded-xl p-1 min-h-50">
          <h2 className="text-3xl font-bold p-1 border-b border-white/5">الفرق المتصلة ({groups.length})</h2>
          <GroupsSection groups={groups} handleDeleteGroup={handleDeleteGroup} />
        </div>
      </div>
    </div>
  );
}
