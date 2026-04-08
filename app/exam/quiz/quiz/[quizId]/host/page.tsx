"use client"

import { useEffect, useState, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { GroupsSection } from "@/components/quiz/groups-section"
import { QRCodeSection } from "@/components/quiz/qr-code-section"
import { QuizStats } from "@/components/quiz/quiz-stats"
import { Button } from "@/components/ui/button"
import { Play, Loader2, Users, Trash2, RefreshCcw } from "lucide-react"
import QuizHostGame from "@/components/quiz/quiz-host-game"
import type { Group, Quiz } from "@/types/quiz"

export default function HostPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;
  const supabase = createClient();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [qrSize, setQrSize] = useState(200);
  const [isStarted, setIsStarted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join` : "";

  const autoCleanupOldGroups = async () => {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("quiz_groups")
        .delete()
        .eq("quiz_id", quizId)
        .lt("created_at", threeHoursAgo);

      if (error) console.error("Cleanup Error:", error); // تسجيل الخطأ بدون إيقاف التطبيق
    } catch (err) {
      console.error("Cleanup Exception:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // 1. التنظيف (معزول عن مسار التحميل الأساسي)
      await autoCleanupOldGroups();

      // 2. تحميل المسابقة والأسئلة
      const { data: q, error: qError } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
      if (qError) console.error("Quiz Error:", qError);

      const { data: qs, error: qsError } = await supabase.from("questions").select("*").eq("quiz_id", quizId);
      if (qsError) console.error("Questions Error:", qsError);

      if (q && isMounted) setQuiz({ ...q, questions: qs || [] } as Quiz);

      // 3. تحميل حالة اللعبة
      const { data: gs, error: gsError } = await supabase.from("game_state").select("*").eq("quiz_id", quizId).single();
      if (!gs && isMounted) {
        const { data: newGs } = await supabase.from("game_state").insert({ quiz_id: quizId, phase: 'lobby', is_active: false, current_question_index: 0 }).select().single();
        setGameState(newGs);
      } else if (isMounted) {
        setGameState(gs);
        if (gs?.phase !== 'lobby' && gs?.is_active) setIsStarted(true);
      }

      // 4. تحميل الفرق
      const { data: grps } = await supabase.from("quiz_groups").select("*").eq("quiz_id", quizId);
      if (isMounted) setGroups(grps || []);
    };

    loadData();

    // 5. الاستماع للفرق الجديدة لايف
    const channel = supabase.channel('host-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_groups', filter: `quiz_id=eq.${quizId}` },
        async () => {
          const { data } = await supabase.from("quiz_groups").select("*").eq("quiz_id", quizId);
          if (isMounted) setGroups(data || []);
        }).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [quizId]);

  const handleStart = async () => {
    if (groups.length === 0) return alert("لا يوجد فرق متصلة!");
    if (!quiz?.questions || quiz.questions.length === 0) return alert("لا توجد أسئلة في هذه المسابقة!");

    const { error } = await supabase.from("game_state").update({ is_active: true, phase: 'question', current_question_index: 0 }).eq("quiz_id", quizId);
    if (!error) setIsStarted(true);
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`حذف فريق ${name}؟`)) return;
    await supabase.from("quiz_groups").delete().eq("id", id);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleResetQuiz = async () => {
    if (!confirm("تأكيد تصفير المسابقة بالكامل؟")) return;
    setIsResetting(true);
    try {
      await Promise.all([
        supabase.from("answers").delete().eq("quiz_id", quizId),
        supabase.from("quiz_groups").delete().eq("quiz_id", quizId),
        supabase.from("game_state").update({ phase: 'lobby', is_active: false, current_question_index: 0 }).eq("quiz_id", quizId)
      ]);
      setGroups([]);
      setIsStarted(false);
      alert("تم التنظيف!");
    } catch (error) {
      alert("خطأ أثناء التنظيف");
    } finally {
      setIsResetting(false);
    }
  };

  if (!quiz || !gameState) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

  if (isStarted) return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />;

  return (
    <div className="min-h-screen bg-[#1a0b2e] text-white p-1 font-sans" dir="rtl">

      {/* Header */}
      <div className="flex justify-between items-center bg-white/5 rounded-xl p-1 mb-1 shadow-sm">
        <h1 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 px-1">
          {quiz.title}
        </h1>
        <div className="flex gap-1">
          {/* زر التصفير */}
          <Button
            onClick={handleResetQuiz}
            disabled={isResetting}
            variant="destructive"
            className="p-1 h-auto text-xs bg-red-600 hover:bg-red-700 flex gap-1 items-center"
          >
            {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
            تنظيف
          </Button>

          <Button onClick={handleStart} className="bg-green-500 hover:bg-green-600 p-1 h-auto text-xs font-bold flex items-center gap-1">
            ابدأ <Play className="w-3 h-3 fill-current" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">

        {/* العمود الأيمن: البيانات والكود */}
        <div className="lg:col-span-4 flex flex-col gap-1">
          <QuizStats quiz={quiz} groups={groups} />

          <div className="bg-white/5 border border-white/10 p-1 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-bold m-1">كود الانضمام السريع</p>
            <p className="text-xl font-black tracking-widest text-yellow-400 p-1 bg-black/30 rounded-lg inline-block m-1">
              {quizId.slice(0, 6).toUpperCase()}
            </p>
          </div>

          <QRCodeSection joinUrl={joinUrl} qrSize={qrSize} setQrSize={setQrSize} />
        </div>

        {/* العمود الأيسر: الفرق */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-xl p-1 flex flex-col">
          <div className="flex justify-between items-center p-1 bg-black/20 rounded-lg m-1">
            <div className="flex items-center gap-1">
              <Users className="text-purple-400 w-4 h-4" />
              <h2 className="text-sm font-bold">الفرق ({groups.length})</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-1">
            {groups.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 p-1 mt-1">
                <span className="text-2xl m-1 animate-pulse">⌛</span>
                <p className="text-xs font-bold m-1">في انتظار الأبطال...</p>
              </div>
            ) : (
              <GroupsSection
                groups={groups}
                handleDeleteGroup={handleDeleteGroup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
