"use client";
import { Quiz } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Play, Edit3, Trash2, Clock, List } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (id: string) => void;
}

export function QuizCard({ quiz, onEdit, onDelete }: QuizCardProps) {
  const router = useRouter();

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-1 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-1">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-1 rounded-xl text-blue-600 dark:text-blue-400">
          <List size={24} />
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(quiz)} className="p-1 hover:bg-blue-50 text-blue-600 rounded-lg">
            <Edit3 size={18} />
          </button>
          <button onClick={() => onDelete(quiz.id)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors">{quiz.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1 line-clamp-2 h-10">
        {quiz.description || "لا يوجد وصف لهذه المسابقة."}
      </p>

      <div className="flex items-center gap-1 mb-1 text-sm text-gray-400 font-medium">
        <div className="flex items-center gap-1">
          <Clock size={14} /> {quiz.questions.length} سؤال
        </div>
        <div className="bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">
          ID: {quiz.id.slice(0, 8)}
        </div>
      </div>

      <Button
        onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-1 font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none"
      >
        <Play size={20} className="ml-1 fill-current" /> بدء المسابقة الآن
      </Button>
    </div>
  );
}
