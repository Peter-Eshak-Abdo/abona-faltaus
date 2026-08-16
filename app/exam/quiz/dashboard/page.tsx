"use client";
import { useEffect, useState, useCallback } from "react";
import { getUserQuizzes, deleteQuiz, createQuiz } from "@/lib/supabase-utils";
import { supabase } from "@/lib/supabase";
import CreateQuizDialog from "@/components/quiz/CreateQuizDialog";
import { Button } from "@/components/ui/button";
import { Plus, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { QuizCard } from "@/components/quiz/QuizCard";
import {
  getLocalQuizList,
  cacheQuizList,
  syncPendingQuizzes,
  getPendingQuizzes,
} from "@/lib/offline-quiz-store";
import { toast } from "sonner";
import type { Quiz } from "@/types/quiz";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

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
      if (isOnline || navigator.onLine) {
        // نحاول من الإنترنت
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const data = await getUserQuizzes(session.user.id);
          const list = data || [];
          setQuizzes(list);
          await cacheQuizList(list); // كاش للأوفلاين
        }
      } else {
        // أوفلاين: نقرأ من الكاش المحلي
        const cached = await getLocalQuizList();
        setQuizzes(cached);
      }
    } catch (error) {
      console.error(error);
      // fallback للكاش لو حصل خطأ
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

  useEffect(() => { refreshQuizzes(); }, []);

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
      refreshQuizzes();
    }
  };

  return (
    <div className="p-1 max-w-8xl mx-auto font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-1 flex-wrap gap-0.5">
        <div className="flex items-center gap-0.5">
          <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100">مسابقاتي</h1>
          {!isOnline && (
            <span className="flex items-center gap-0.5 px-0.5 py-0.25 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 rounded-full text-xs font-bold">
              <WifiOff size={12} />
              وضع أوفلاين
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-0.5 px-0.5 py-0.25 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-full text-xs font-bold">
              {pendingCount} في انتظار الرفع
            </span>
          )}
        </div>
        <div className="flex gap-0.25 items-center">
          {isOnline && pendingCount > 0 && (
            <Button
              onClick={syncAllPending}
              disabled={isSyncing}
              variant="outline"
              className="gap-0.5 text-sm"
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {isSyncing ? "جاري الرفع..." : "رفع الأوفلاين"}
            </Button>
          )}
          <Button onClick={handleCreateNew} className="gap-1 bg-blue-600 hover:bg-blue-700 font-bold text-lg rounded-xl">
            <Plus size={20} /> مسابقة جديدة
          </Button>
        </div>
      </div>

      {!isOnline && (
        <div className="mb-1 p-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-0.5 text-sm text-amber-700 dark:text-amber-300">
          <WifiOff size={16} />
          <span>أنت أوفلاين. يمكنك إنشاء مسابقات وستُرفع تلقائياً عند عودة الاتصال.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-1 font-bold text-gray-500 text-xl animate-pulse">جاري تحميل المسابقات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-400">
              <p className="text-xl mb-0.5">لا توجد مسابقات بعد</p>
              <p className="text-sm">اضغط على "مسابقة جديدة" لإنشاء أول مسابقة</p>
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
