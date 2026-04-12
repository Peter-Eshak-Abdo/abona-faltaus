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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-1" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden font-sans">
        <div className="flex justify-between items-center p-0.5 bg-blue-600 text-white">
          <h2 className="text-xl font-black">مراجعة: {quiz.title}</h2>
          <div className="flex gap-1">
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
export function QuizCard({ quiz, onEdit, onDelete }: any) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  // حساب الوقت التقديري: (4 ثواني عرض + وقت السؤال + 5 ثواني إجابة + 3 ثواني ترتيب) * عدد الأسئلة + 20 ثانية للنهاية
  const estimatedSeconds = quiz.questions?.reduce((acc: number, q: any) => acc + 4 + (q.timeLimit || 20) + 5 + 3, 0) + 20;
  const mins = Math.floor(estimatedSeconds / 60);
  const secs = estimatedSeconds % 60;
  const createdDate = new Date(quiz.createdAt).toLocaleDateString('ar-EG');

  return (
    <>
      <div className="group bg-white dark:bg-zinc-900 border-2 border-zinc-100 p-1 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 font-sans relative">
        <div className="flex justify-between items-start mb-1">
          <button onClick={() => setShowPreview(true)} className="bg-blue-50 p-1 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="مراجعة سريعة">
            <Eye size={24} />
          </button>
          <div className="flex gap-1">
            <button onClick={() => onEdit(quiz)} className="p-1 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"><Edit3 size={20} /></button>
            <button onClick={() => onDelete(quiz.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 size={20} /></button>
          </div>
        </div>

        <h3 className="text-2xl font-black mb-1 text-zinc-800 truncate">{quiz.title}</h3>
        <p className="text-sm font-bold text-zinc-500 mb-1 line-clamp-2 h-10">{quiz.description || "لا يوجد وصف"}</p>

        <div className="grid grid-cols-2 gap-1 mb-1 text-xs font-bold text-zinc-600">
          <div className="bg-zinc-50 p-1 rounded-lg flex items-center gap-1"><Clock size={14} className="text-blue-500" /> {quiz.questions?.length || 0} سؤال</div>
          <div className="bg-zinc-50 p-1 rounded-lg flex items-center gap-1"><Clock size={14} className="text-orange-500" /> {mins} د : {secs} ث</div>
          <div className="col-span-2 bg-zinc-50 p-1 rounded-lg flex items-center gap-1"><Calendar size={14} className="text-green-500" /> أُنشئت: {createdDate}</div>
        </div>

        <Button onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-1 font-black text-lg shadow-[0_4px_0_#1d4ed8] active:translate-y-1 active:shadow-none transition-all">
          <Play size={20} className="ml-1 fill-current" /> بدء المسابقة
        </Button>
      </div>

      {showPreview && <QuickPreviewModal quiz={quiz} onClose={() => setShowPreview(false)} />}
    </>
  );
}
