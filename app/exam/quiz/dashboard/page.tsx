"use client";
import { useEffect, useState, useCallback } from "react";
import { getUserQuizzes, deleteQuiz, createQuiz, getQuiz } from "@/lib/supabase-utils";
import { supabase } from "@/lib/supabase";
import CreateQuizDialog from "@/components/quiz/CreateQuizDialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  History,
  Copy,
  Trash2,
  Edit3,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { QuizCard } from "@/components/quiz/QuizCard";
import {
  getLocalQuizList,
  cacheQuizList,
  syncPendingQuizzes,
  getPendingQuizzes,
} from "@/lib/offline-quiz-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Quiz } from "@/types/quiz";

type QuizHistoryItem = { id: string; code: string; title: string };

export default function Dashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // حالة الدخول بالكود (10 أرقام)
  const [codeInput, setCodeInput] = useState("");
  const [isEnteringCode, setIsEnteringCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);

  // تحميل التاريخ المحفوظ محلياً
  useEffect(() => {
    const saved = localStorage.getItem("my_quizzes_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (id: string, code: string, title: string) => {
    let updated = [...history];
    const index = updated.findIndex((h) => h.id === id || h.code === code);
    if (index > -1) {
      updated[index] = { id, code, title };
    } else {
      updated.unshift({ id, code, title });
    }
    setHistory(updated);
    localStorage.setItem("my_quizzes_history", JSON.stringify(updated));
  };

  const removeFromHistory = (itemToRemove: QuizHistoryItem) => {
    const updated = history.filter((h) => h.id !== itemToRemove.id && h.code !== itemToRemove.code);
    setHistory(updated);
    localStorage.setItem("my_quizzes_history", JSON.stringify(updated));
  };

  // مراقبة حالة الشبكة
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // عند عودة الإنترنت، ارفع المسابقات المعلقة
  useEffect(() => {
    if (!isOnline) return;
    syncAllPending();
  }, [isOnline]);

  // تحديث عداد المسابقات المعلقة
  const refreshPendingCount = useCallback(async () => {
    const pending = await getPendingQuizzes();
    setPendingCount(pending.length);
  }, []);

  // رفع المسابقات المعلقة
  const syncAllPending = async () => {
    const pending = await getPendingQuizzes();
    if (pending.length === 0) return;

    setIsSyncing(true);
    try {
      const { synced, failed } = await syncPendingQuizzes(async (quizData) => {
        await createQuiz(quizData);
      });

      if (synced > 0) {
        toast.success(`✅ تم رفع ${synced} مسابقة للسيرفر بنجاح!`);
        await refreshQuizzes();
      }
      if (failed > 0) {
        toast.error(`⚠️ فشل رفع ${failed} مسابقة، سيتم إعادة المحاولة لاحقاً`);
      }
    } finally {
      setIsSyncing(false);
      await refreshPendingCount();
    }
  };

  // جلب البيانات عند فتح الصفحة
  const refreshQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      let combinedQuizzes: any[] = [];
      const savedHistory = localStorage.getItem("my_quizzes_history");
      const localHistory: QuizHistoryItem[] = savedHistory ? JSON.parse(savedHistory) : [];

      if (isOnline || navigator.onLine) {
        const { data: { session } } = await supabase.auth.getSession();
        let userQuizzes: any[] = [];

        if (session?.user) {
          userQuizzes = (await getUserQuizzes(session.user.id)) || [];
        }

        // جلب تفاصيل المسابقات المحفوظة في تاريخ الكود المحلي إن لم تكن مكررة
        const idsAndCodesToFetch = localHistory.map((h) => h.id || h.code).filter(Boolean);
        let historyQuizzes: any[] = [];

        if (idsAndCodesToFetch.length > 0) {
          // نبحث بالـ id أو بالكود
          const { data: byId } = await supabase
            .from("quizzes")
            .select("*")
            .in("id", idsAndCodesToFetch);

          const { data: byCode } = await supabase
            .from("quizzes")
            .select("*")
            .in("code", idsAndCodesToFetch);

          historyQuizzes = [...(byId || []), ...(byCode || [])];
        }

        // دمج النتائج بدون تكرار
        const quizMap = new Map();
        [...userQuizzes, ...historyQuizzes].forEach((q) => {
          if (q?.id) quizMap.set(q.id, q);
        });

        combinedQuizzes = Array.from(quizMap.values());
        setQuizzes(combinedQuizzes);
        await cacheQuizList(combinedQuizzes);
      } else {
        // أوفلاين: نقرأ من الكاش المحلي
        const cached = await getLocalQuizList();
        setQuizzes(cached);
      }
    } catch (error) {
      console.error(error);
      const cached = await getLocalQuizList();
      if (cached.length > 0) {
        setQuizzes(cached);
        toast.info("📱 يتم عرض المسابقات المحفوظة محلياً");
      }
    } finally {
      setLoading(false);
      await refreshPendingCount();
    }
  }, [isOnline]);

  useEffect(() => {
    refreshQuizzes();
  }, []);

  // دالة الدخول بالكود (من 8 إلى 10 أرقام)
  const handleEnterByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = codeInput.trim();
    if (cleanCode.length < 8 || cleanCode.length > 10) {
      setCodeError("الكود يجب أن يكون بين 8 إلى 10 أرقام");
      return;
    }

    setIsEnteringCode(true);
    setCodeError("");

    try {
      const quiz = await getQuiz(cleanCode);
      if (!quiz) {
        setCodeError("لم يتم العثور على مسابقة بهذا الكود. تأكد من صحة الأرقام.");
        return;
      }

      // حفظ في التاريخ المحلي
      saveToHistory(quiz.id, cleanCode, quiz.title);
      toast.success(`تم العثور على مسابقة: ${quiz.title}`);
      router.push(`/exam/quiz/quiz/${quiz.id}/host`);
    } catch (err) {
      console.error(err);
      setCodeError("حدث خطأ أثناء البحث عن المسابقة");
    } finally {
      setIsEnteringCode(false);
    }
  };

  // دالة إنشاء مسابقة جديدة
  const handleCreateNew = () => {
    setSelectedQuiz(null);
    setIsDialogOpen(true);
  };

  // دالة التعديل
  const handleEdit = (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsDialogOpen(true);
  };

  // دالة الحذف
  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المسابقة؟")) {
      await deleteQuiz(id);
      const updatedHistory = history.filter((h) => h.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem("my_quizzes_history", JSON.stringify(updatedHistory));
      refreshQuizzes();
    }
  };

  return (
    <div className="p-0.5 max-w-8xl mx-auto font-sans" dir="rtl">
      {/* قسم الترويسة الرئيسي */}
      <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
        <div className="flex items-center gap-0.5">
          <Link
            href="/"
            className="p-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition shadow-sm"
            title="رجوع"
          >
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-0.5">
              لوحة تحكم المسابقات
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
              أنشئ مسابقتك وشارك الكود أو ادخل كأدمن من أي جهاز بكود الـ 10 أرقام
            </p>
          </div>

          {!isOnline && (
            <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-full text-xs font-bold">
              <WifiOff size={13} />
              أوفلاين
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-full text-xs font-bold">
              {pendingCount} في انتظار الرفع
            </span>
          )}
        </div>

        <div className="flex gap-0.5 items-center flex-wrap">
          {isOnline && pendingCount > 0 && (
            <Button
              onClick={syncAllPending}
              disabled={isSyncing}
              variant="outline"
              className="gap-0.5 text-xs sm:text-sm rounded-xl h-3 px-1"
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {isSyncing ? "جاري الرفع..." : "رفع الأوفلاين"}
            </Button>
          )}
          <Button
            onClick={handleCreateNew}
            className="gap-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl h-3 px-1 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            <Plus size={18} /> مسابقة جديدة
          </Button>
        </div>
      </div>

      {/* قسم الدخول المباشر بكود المسابقة (8 - 10 أرقام) */}
      <div className="bg-linear-to-r from-blue-50/80 to-indigo-50/80 dark:from-zinc-900 dark:to-zinc-800/80 p-1 rounded-3xl border border-blue-100 dark:border-zinc-800 shadow-sm mb-1">
        <div className="max-w-xl mx-auto text-center space-y-0.5">
          <div className="flex items-center justify-center gap-0.5 text-blue-600 dark:text-blue-400 font-bold text-lg">
            <KeyRound size={20} />
            <h2>دخول مسابقة كأدمن بكود (8 - 10 أرقام)</h2>
          </div>
          <p className="text-xs text-zinc-500 font-medium">
            اكتب كود أي مسابقة للدخول وإدارتها مباشرة من هذا الجهاز دون الحاجة لتسجيل دخول
          </p>

          <form onSubmit={handleEnterByCode} className="flex flex-col sm:flex-row gap-0.5 mt-0.5">
            <input
              type="text"
              maxLength={10}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="مثال: 84920153"
              dir="ltr"
              className="flex-1 px-1 py-0.5 border-2 border-blue-200 dark:border-zinc-700 rounded-2xl text-center tracking-[0.2em] font-black text-lg bg-white dark:bg-zinc-800 outline-none focus:border-blue-500 transition-colors"
            />
            <Button
              type="submit"
              disabled={isEnteringCode || codeInput.length < 8 || codeInput.length > 10}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-1 h-3 rounded-2xl text-sm shadow-md transition disabled:opacity-50"
            >
              {isEnteringCode ? "جاري البحث..." : "دخول كأدمن"}
            </Button>
          </form>

          {codeError && (
            <p className="text-red-500 text-xs font-bold text-center mt-1">{codeError}</p>
          )}
        </div>
      </div>

      {!isOnline && (
        <div className="mb-1 p-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-0.5 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
          <WifiOff size={16} className="shrink-0" />
          <span>أنت أوفلاين. يمكنك إنشاء مسابقات وستُرفع تلقائياً عند عودة الاتصال.</span>
        </div>
      )}

      {/* قائمة المسابقات */}
      {loading ? (
        <div className="text-center py-0.5 font-bold text-zinc-400 text-lg animate-pulse">
          جاري تحميل المسابقات...
        </div>
      ) : (
        <div className="space-y-0.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-0.5">
            {quizzes.map((quiz,i) => (
              <QuizCard
                key={quiz.id}
                index={i}
                quiz={quiz}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {quizzes.length === 0 && (
            <div className="text-center py-0.5 text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-1">
              <Sparkles className="mx-auto text-blue-500 mb-0.5" size={24} />
              <p className="text-lg font-bold text-zinc-700 dark:text-zinc-200 mb-1">
                لا توجد مسابقات بعد
              </p>
              <p className="text-xs text-zinc-500 mb-1 max-w-sm mx-auto">
                اضغط على "مسابقة جديدة" لإنشاء مسابقة بكود 10 أرقام، أو ادخل كود مسابقة موجودة بالأعلى
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-1 h-3 text-sm"
              >
                إنشاء أول مسابقة
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateQuizDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={refreshQuizzes}
        initialData={selectedQuiz}
      />
    </div>
  );
}
