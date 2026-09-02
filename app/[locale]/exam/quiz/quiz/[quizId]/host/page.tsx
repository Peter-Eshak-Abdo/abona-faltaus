"use client"
import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"
import { GroupsSection } from "@/components/quiz/GroupsSection"
import QRCodeSection from "@/components/quiz/QRCodeSection"
import { QuizStats } from "@/components/quiz/QuizStats"
import { Button } from "@/components/ui/button"
import { Play, Loader2, RefreshCcw, Lock, KeyRound, ShieldAlert } from "lucide-react"
import QuizHostGame from "@/components/quiz/QuizHostGame"
import { toast } from "sonner"

export default function HostPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;

  const [quiz, setQuiz] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [gameState, setGameState] = useState<any>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  // حالة التحقق من كود المسؤول (Admin Host Code)
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // دالة التحقق من كود الاستضافة
  const verifyHostCode = async (codeToVerify: string, targetQuizId: string) => {
    if (!codeToVerify.trim()) return;
    setIsVerifying(true);
    setVerifyError("");
    try {
      const res = await fetch(`/api/quizzes/verify-admin-code?quizId=${targetQuizId}&code=${encodeURIComponent(codeToVerify.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setIsAuthorized(true);
        sessionStorage.setItem(`quiz_admin_auth_${targetQuizId}`, "true");
        toast.success("تم التحقق من كود المسؤول بنجاح!");
      } else {
        setVerifyError("كود المسؤول غير صحيح. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setVerifyError("حدث خطأ أثناء التحقق من الكود");
    } finally {
      setIsVerifying(false);
    }
  };

  // دالة جلب البيانات (دمجنا فيها كل حاجة)
  const refreshAllData = async () => {
    try {
      setLoading(true);
      const { getQuiz } = await import("@/lib/supabase-utils");
      const qData = await getQuiz(quizId);

      if (qData) {
        setQuiz(qData);
        const actualQuizId = qData.id;

        // التحقق لو المستخدم هو المنشئ أو تم التحقق منه مسبقاً
        const { data: userData } = await supabase.auth.getUser();
        const storedAuth = sessionStorage.getItem(`quiz_admin_auth_${actualQuizId}`);
        const createdBy = (qData as any).created_by || (qData as any).createdBy;
        const adminCode = (qData as any).admin_code;
        if (storedAuth === "true" || (userData?.user?.id && userData.user.id === createdBy) || !adminCode) {
          setIsAuthorized(true);
        }

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

  // شاشة طلب كود المسؤول إذا لم يكن مسجل دخول أو مصرحاً له
  if (!isAuthorized && quiz?.admin_code) {
    return (
      <div className="min-h-screen bg-[#130722] text-white flex items-center justify-center p-1" dir="rtl">
        <div className="bg-white/5 border border-purple-500/30 rounded-3xl p-1 sm:p-1 max-w-md w-full shadow-2xl backdrop-blur-xl text-center space-y-1">
          <div className="w-4 h-4 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30 shadow-inner">
            <KeyRound className="w-3 h-3" />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-purple-100">دخول مسؤول المسابقة</h2>
            <p className="text-sm text-purple-300">
              يرجى إدخال كود المشرف الخاص بمسابقة <span className="font-bold text-white font-mono">"{quiz?.title}"</span> للتحكم بالمسابقة وتشغيلها كمسؤول.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyHostCode(enteredCode, actualQuizId);
            }}
            className="space-y-1"
          >
            <div>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                placeholder="أدخل كود المسؤول..."
                className="w-full text-center text-xl font-mono uppercase tracking-widest bg-purple-950/60 border border-purple-500/40 rounded-2xl py-0.5 px-1 text-white placeholder-purple-400/50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                autoFocus
              />
              {verifyError && (
                <p className="text-xs text-red-400 font-bold mt-2 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {verifyError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isVerifying || !enteredCode.trim()}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 transition-all text-base"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "دخول كمسؤول 🚀"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (isStarted && quiz && gameState) return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />;

  return (
    <div className="min-h-screen bg-[#130722] text-white p-1 sm:p-1 font-sans" dir="rtl">
      <div className="flex justify-between items-center bg-white/5 backdrop-blur-md rounded-3xl p-1 sm:p-1 mb-0.5 border border-white/10 shadow-2xl flex-wrap gap-0.5">
        <div className="flex items-center gap-0.5 flex-wrap">
          <h1 className="text-2xl sm:text-4xl font-black text-purple-200">{quiz?.title}</h1>
          {quiz?.code && (
            <div className="flex items-center gap-0.25 bg-purple-950/80 border border-purple-500/30 px-1 py-0.25 rounded-2xl shadow-inner">
              <span className="text-xs text-purple-300 font-bold">كود المسابقة:</span>
              <span className="text-lg sm:text-xl font-black font-mono tracking-widest text-white" dir="ltr">{quiz.code}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(quiz.code);
                  alert(`تم نسخ الكود: ${quiz.code}`);
                }}
                className="text-xs bg-purple-700 hover:bg-purple-600 px-0.5 py-0.25 rounded-lg text-white font-bold transition-colors"
              >
                نسخ
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-0.5 items-center">
          <Button
            onClick={handleReset}
            variant="destructive"
            className="h-3 px-1 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-2xl transition-all"
          >
            <RefreshCcw className="w-3 h-3 ml-0.5" />
            <span>تصفير</span>
          </Button>
          <Button
            onClick={handleStart}
            className="h-3 px-1 text-sm bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-3 h-3 ml-0.5 fill-current" />
            <span>ابدأ الآن</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0.5 sm:gap-0.5">
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-0.5">
          <QuizStats quiz={quiz} groups={groups} />
          <QRCodeSection quizId={actualQuizId} />
        </div>

        <div className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white/5 border border-white/10 rounded-3xl p-1 sm:p-1 min-h-[300px] shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold pb-0.5 mb-0.5 border-b border-white/10 text-purple-200">
            الفرق المتصلة ({groups.length})
          </h2>
          <GroupsSection groups={groups} handleDeleteGroup={handleDeleteGroup} />
        </div>
      </div>
    </div>
  );
}
