"use client";
import { useState } from "react";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Play, Edit3, Trash2, Clock, Eye, X, Check, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

// مكون مصغر لعرض المراجعة السريعة
function QuickPreviewModal({ quiz, onClose }: { quiz: Quiz, onClose: () => void }) {
  const [showAns, setShowAns] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0.5" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden font-sans">
        <div className="flex justify-between items-center p-0.25 bg-blue-600 text-white">
          <h2 className="text-xl font-black">مراجعة: {quiz.title}</h2>
          <div className="flex gap-0.5">
            <Button onClick={() => setShowAns(!showAns)} variant="secondary" className="h-4 text-xs font-bold text-blue-700">
              {showAns ? "إخفاء الإجابات" : "إظهار الإجابات"}
            </Button>
            <button onClick={onClose} className="bg-white/20 px-1 rounded-lg hover:bg-red-500"><X size={20} /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-0.5 flex flex-col gap-0.5 bg-zinc-50">
          {quiz.questions?.map((q: any, i: number) => (
            <div key={i} className="p-0.5 border-2 border-zinc-200 rounded-xl bg-white shadow-sm">
              <div className="flex justify-between text-xs font-bold text-blue-600 bg-blue-50 p-0.5 rounded-lg">
                <span>سؤال {i + 1}</span>
                <span>المدة: {q.timeLimit} ثانية</span>
              </div>
              <h3 className="text-lg font-black mb-0.5">{q.text}</h3>
              <div className="grid grid-cols-2 gap-0.5">
                {q.choices.map((c: string, ci: number) => (
                  <div key={ci} className={`p-0.5 rounded-lg font-bold text-sm flex justify-between border-2 ${showAns && q.correctAnswer === ci ? 'bg-green-100 border-green-500 text-green-800' : 'bg-zinc-50 border-zinc-100 text-zinc-600'}`}>
                    <span>{c}</span>
                    {showAns && q.correctAnswer === ci && <Check size={18} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// الكارت الأساسي
export function QuizCard({ quiz, onEdit, onDelete, index}: any) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  // حساب الوقت التقديري: (4 ثواني عرض + وقت السؤال + 5 ثواني إجابة + 3 ثواني ترتيب) * عدد الأسئلة + 20 ثانية للنهاية
  const estimatedSeconds = quiz.questions?.reduce((acc: number, q: any) => acc + 4 + (q.timeLimit || 20) + 5 + 3, 0) + 20;
  const mins = Math.floor(estimatedSeconds / 60);
  const secs = estimatedSeconds % 60;
  const rawDate = quiz.created_at || quiz.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const createdDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "غير محدد";

  return (
    <>
      <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 font-sans relative flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-0.5">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-blue-50 dark:bg-blue-950/50 p-0.25 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
              title="مراجعة سريعة"
            >
              <Eye size={18} />
            </button>
            <p>{index+1}</p>
            <div className="flex gap-0.25">
              <button
                onClick={() => onEdit(quiz)}
                className="p-0.25 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded-xl transition-colors"
                title="تعديل"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={() => onDelete(quiz.id)}
                className="p-0.25 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 rounded-xl transition-colors"
                title="حذف"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-0.25 text-zinc-900 dark:text-zinc-100 truncate">{quiz.title}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 line-clamp-2 min-h-[32px]">{quiz.description || "لا يوجد وصف"}</p>

          {/* كود المسابقة */}
          {(quiz.code || quiz.admin_code) && (
            <div className="flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 px-0.5 py-0.25 rounded-2xl mb-0.5">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">كود المسابقة:</span>
              <div className="flex items-center gap-0.25">
                <span className="font-mono font-bold text-sm tracking-widest text-blue-900 dark:text-blue-200" dir="ltr">
                  {quiz.code || quiz.admin_code}
                </span>
                <button
                  onClick={() => {
                    const c = quiz.code || quiz.admin_code;
                    navigator.clipboard.writeText(c);
                    alert(`تم نسخ الكود: ${c}`);
                  }}
                  className="px-0.5 py-0.25 text-xs bg-white dark:bg-zinc-800 border border-blue-300/80 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 font-medium"
                  title="نسخ الكود"
                >
                  نسخ
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-0.25 mb-0.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-0.25 rounded-xl flex items-center gap-0.25">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span className="font-medium">{quiz.questions?.length || 0} سؤال</span>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/60 p-0.25 rounded-xl flex items-center gap-0.25">
              <Clock size={14} className="text-orange-500 shrink-0" />
              <span className="font-medium">{mins} د : {secs} ث</span>
            </div>
            <div className="col-span-2 bg-zinc-50 dark:bg-zinc-800/60 p-0.25 rounded-xl flex items-center gap-0.25">
              <Calendar size={14} className="text-green-500 shrink-0" />
              <span className="font-medium">أُنشئت: {createdDate}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-0.25 h-3 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
        >
          <Play size={16} className="ml-0.25 fill-current" /> بدء المسابقة
        </Button>
      </div>

      {showPreview && <QuickPreviewModal quiz={quiz} onClose={() => setShowPreview(false)} />}
    </>
  );
}
