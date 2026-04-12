"use client";
import { useEffect, useState } from "react";
import { getUserQuizzes, deleteQuiz, createClient } from "@/lib/supabase-utils";
import CreateQuizDialog from "@/components/quiz/create-quiz-dialog-old";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuizCard } from "@/components/quiz/QuizCard";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // جلب البيانات عند فتح الصفحة
  const refreshQuizzes = async () => {
    setLoading(true);
    try {
      // استخدم getSession بدلاً من getUser لو المشكلة استمرت، أو اتأكد من وجود الـ User مرة واحدة
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const data = await getUserQuizzes(session.user.id);
        setQuizzes(data || []);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { refreshQuizzes(); }, []);

  // دالة إنشاء مسابقة جديدة (تصفير الـ State)
  const handleCreateNew = () => {
    setSelectedQuiz(null); // أهم خطوة لحل مشكلتك
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
    <div className="p-1 max-w-7xl mx-auto font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-black text-gray-800">مسابقاتي</h1>
        <Button onClick={handleCreateNew} className="gap-1 bg-blue-600 hover:bg-blue-700 font-bold text-lg rounded-xl">
          <Plus size={20} /> مسابقة جديدة
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-1 font-bold text-gray-500 text-xl animate-pulse">جاري تحميل المسابقات...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CreateQuizDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={refreshQuizzes} initialData={selectedQuiz} />
    </div>
  );
}
