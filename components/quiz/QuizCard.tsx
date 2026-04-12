"use client";
import { useState } from "react";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Play, Edit3, Trash2, Clock, Eye, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

// مكون مصغر لعرض المراجعة السريعة
function QuickPreviewModal({ quiz, onClose }: { quiz: Quiz, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-1" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-0.5 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">مراجعة: {quiz.title}</h2>
          <button onClick={onClose} className="bg-white/20 p-0.5 rounded hover:bg-red-500"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-0.5 flex flex-col gap-0.5">
          {quiz.questions.map((q, i) => (
            <div key={i} className="p-0.5 border-2 border-zinc-100 rounded-xl bg-zinc-50 dark:bg-zinc-800">
              <div className="flex justify-between text-xs font-bold text-zinc-400">
                <span>سؤال {i + 1}</span>
                <span>{q.timeLimit} ثانية</span>
              </div>
              <h3 className="text-lg font-black mb-0.5">{q.text}</h3>
              <div className="grid grid-cols-2 gap-0.5">
                {q.choices.map((c, ci) => (
                  <div key={ci} className={`p-0.5 rounded font-bold text-xs flex justify-between ${q.correctAnswer === ci ? 'bg-green-100 border border-green-500 text-green-700' : 'bg-white border border-zinc-200 text-zinc-500'}`}>
                    <span>{c}</span>
                    {q.correctAnswer === ci && <Check size={14} />}
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

  return (
    <>
      <div className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex justify-between items-start mb-1">
          {/* زر المراجعة الجديد مكان الـ List */}
          <button onClick={() => setShowPreview(true)} className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors" title="مراجعة سريعة">
            <Eye size={20} />
          </button>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(quiz)} className="p-1 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit3 size={18} /></button>
            <button onClick={() => onDelete(quiz.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-600 truncate">{quiz.title}</h3>

        <div className="flex items-center gap-1 mb-1 text-xs text-gray-400 font-medium">
          <Clock size={12} /> {quiz.questions.length} سؤال
        </div>

        <Button onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-1 font-bold text-lg">
          <Play size={12} className="ml-1 fill-current" /> بدء المسابقة
        </Button>
      </div>

      {showPreview && <QuickPreviewModal quiz={quiz} onClose={() => setShowPreview(false)} />}
    </>
  );
}
