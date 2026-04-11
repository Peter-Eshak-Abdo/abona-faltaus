"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { createClient } from "@/lib/supabase/client"
import { createQuiz, updateQuiz } from "@/lib/supabase-utils"
import { Plus, Trash2, Check, Clock, X, Upload, Eye, EyeOff, LayoutDashboard, Settings2 } from "lucide-react"
import type { Question, Quiz } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: Quiz | null
}

const KAHOOT_COLORS = ["bg-red-500", "bg-green-500", "bg-amber-500", "bg-blue-500"];

export default function CreateQuizDialog({ open, onOpenChange, onSuccess, initialData }: CreateQuizDialogProps) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showAnswersInPreview, setShowAnswersInPreview] = useState(false);

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setQuestions(initialData.questions || []);
        setShuffleQuestions(initialData.shuffle_questions || false);
        setShuffleChoices(initialData.shuffle_choices || false);
        setIsEditing(true);
      } else {
        setTitle(""); setDescription(""); setQuestions([]);
        setShuffleQuestions(false); setShuffleChoices(false); setIsEditing(false);
      }
    }
  }, [open, initialData]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      text: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 20,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: any) => {
    const updated = [...questions];
    let q = { ...updated[index], ...updates };

    // منطق تحويل النوع (صح/خطأ)
    if (updates.type === "true-false") {
      q.choices = ["خطأ", "صح"];
      q.correctAnswer = 0;
    } else if (updates.type === "multiple-choice" && q.choices.length === 2) {
      q.choices = ["", "", "", ""];
    }

    updated[index] = q;
    setQuestions(updated);
  }

  const validateAndSubmit = async () => {
    if (!user) return alert("يجب تسجيل الدخول أولاً")
    if (!title.trim()) return alert("يجب إدخال اسم المسابقة")
    if (questions.length === 0) return alert("يجب إضافة سؤال واحد على الأقل")

    setIsSubmitting(true)
    try {
      const quizData = {
        title: title.trim(),
        description: description.trim(),
        questions,
        shuffle_questions: shuffleQuestions,
        shuffle_choices: shuffleChoices,
        created_by: user.id,
        created_at: new Date().toISOString(),
        is_deleted: false,
        deleted_at: null,
      };

      if (isEditing && initialData) await updateQuiz(initialData.id, quizData)
      else await createQuiz(quizData)

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ");
    } finally { setIsSubmitting(false) }
  }

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-1 z-50 font-sans" dir="rtl">
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header Custom */}
        <div className="p-1 border-b bg-white dark:bg-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <h2 className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'تعديل المسابقة' : 'مسابقة جديدة'}
            </h2>
            <div className="flex bg-zinc-100 dark:bg-zinc-700 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("edit")}
                className={`p-1 rounded-lg flex items-center gap-1 font-bold transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600' : 'text-zinc-500'}`}
              >
                <Settings2 size={18} /> التعديل
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`p-1 rounded-lg flex items-center gap-1 font-bold transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600' : 'text-zinc-500'}`}
              >
                <Eye size={18} /> مراجعة سريعة
              </button>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="bg-zinc-100 hover:bg-red-100 hover:text-red-500 p-1 rounded-full transition-colors text-zinc-500">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-1 space-y-1">
          {activeTab === "edit" ? (
            <>
              {/* Basic Info */}
              <div className="space-y-1">
                <input
                  type="text"
                  className="w-full text-3xl font-black bg-transparent border-b-4 border-zinc-200 focus:border-blue-500 outline-none transition-all pb-2 dark:text-white"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان المسابقة..."
                />
                <div className="flex gap-1 items-center">
                   <div className="flex-1">
                      <textarea
                        className="w-full bg-white dark:bg-zinc-800 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 p-1 font-medium focus:border-blue-500 outline-none"
                        rows={1} value={description} onChange={(e) => setDescription(e.target.value)}
                        placeholder="وصف بسيط..."
                      />
                   </div>
                   <div className="flex gap-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <label className="flex items-center gap-1 cursor-pointer font-bold text-blue-700 dark:text-blue-300">
                      <Checkbox checked={shuffleQuestions} onCheckedChange={(c) => setShuffleQuestions(!!c)} />
                      أسئلة عشوائية
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer font-bold text-blue-700 dark:text-blue-300">
                      <Checkbox checked={shuffleChoices} onCheckedChange={(c) => setShuffleChoices(!!c)} />
                      خيارات عشوائية
                    </label>
                   </div>
                </div>
              </div>

              {/* Questions Editor */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-zinc-700 dark:text-zinc-300">الأسئلة ({questions.length})</h3>
                  <button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center gap-1 transition-transform active:scale-95">
                    <Plus size={20} /> إضافة سؤال
                  </button>
                </div>

                <Accordion type="multiple" className="space-y-1">
                  {questions.map((q, idx) => (
                    <AccordionItem key={q.id} value={q.id} className="border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
                      <div className="flex items-center px-1 bg-zinc-50/50 dark:bg-zinc-800/50">
                        <span className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-black text-zinc-600 dark:text-zinc-300">{idx+1}</span>
                        <AccordionTrigger className="flex-1 p-1 hover:no-underline">
                          <span className="font-bold text-lg text-right truncate max-w-[500px]">{q.text || "سؤال جديد يحتاج نص..."}</span>
                        </AccordionTrigger>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                      </div>
                      <AccordionContent className="p-1 space-y-1 border-t border-zinc-100 dark:border-zinc-700">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-1">
                            <label className="text-sm font-black text-zinc-500">نوع السؤال</label>
                            <select
                              className="w-full p-1 rounded-xl border-2 border-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 font-bold outline-none focus:border-blue-500"
                              value={q.type} onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                            >
                              <option value="multiple-choice">اختيارات متعددة</option>
                              <option value="true-false">صح / خطأ</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-black text-zinc-500">الوقت (ثواني)</label>
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-xl">
                              <Clock size={12} className="text-zinc-400" />
                              <input type="number" className="bg-transparent font-bold w-full outline-none" value={q.timeLimit} onChange={(e) => updateQuestion(idx, { timeLimit: +e.target.value })} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-black text-zinc-500">نص السؤال</label>
                          <textarea
                            className="w-full p-1 rounded-xl border-2 border-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 font-bold focus:border-blue-500 outline-none"
                            value={q.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                            placeholder="ما هو السؤال؟"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          {q.choices.map((choice, cIdx) => (
                            <div key={cIdx} className={`flex items-center gap-1 p-1 rounded-2xl transition-all border-2 ${q.correctAnswer === cIdx ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent bg-zinc-50 dark:bg-zinc-900/50'}`}>
                              <div className={`w-8 h-8 rounded-lg ${KAHOOT_COLORS[cIdx]} flex items-center justify-center text-white font-black`}>
                                {String.fromCharCode(65 + cIdx)}
                              </div>
                              <input
                                type="text" className="flex-1 bg-transparent p-1 font-bold outline-none"
                                value={choice} onChange={(e) => {
                                  const newChoices = [...q.choices];
                                  newChoices[cIdx] = e.target.value;
                                  updateQuestion(idx, { choices: newChoices });
                                }}
                                disabled={q.type === 'true-false'}
                                placeholder={`اختيار ${cIdx + 1}`}
                              />
                              <button
                                onClick={() => updateQuestion(idx, { correctAnswer: cIdx })}
                                className={`p-1 rounded-xl transition-all ${q.correctAnswer === cIdx ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'}`}
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>
          ) : (
            /* PREVIEW MODE */
            <div className="space-y-1">
               <div className="flex justify-between items-center bg-blue-600 p-1 rounded-2xl text-white shadow-lg">
                  <div>
                    <h3 className="text-xl font-black">مراجعة الأسئلة قبل البدء</h3>
                    <p className="opacity-80 font-bold">تأكد من صحة الإجابات والوقت المحدد</p>
                  </div>
                  <button
                    onClick={() => setShowAnswersInPreview(!showAnswersInPreview)}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 p-1 rounded-xl font-black transition-all border border-white/40"
                  >
                    {showAnswersInPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showAnswersInPreview ? "إخفاء الإجابات" : "إظهار الإجابات"}
                  </button>
               </div>

               <div className="grid grid-cols-1 gap-1">
                  {questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 p-1 rounded-3xl border-2 border-zinc-100 dark:border-zinc-700 relative overflow-hidden">
                       <div className="flex justify-between mb-1">
                          <span className="bg-zinc-100 dark:bg-zinc-700 p-1 rounded-full text-sm font-black text-zinc-500">سؤال {i+1}</span>
                          <span className="flex items-center gap-1 text-zinc-400 font-bold"><Clock size={10}/> {q.timeLimit}ث</span>
                       </div>
                       <h4 className="text-xl font-black mb-1">{q.text}</h4>
                       <div className="grid grid-cols-2 gap-1">
                          {q.choices.map((c, ci) => (
                            <div key={ci} className={`p-1 rounded-2xl border-2 font-bold flex items-center justify-between ${showAnswersInPreview && q.correctAnswer === ci ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-zinc-50 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500'}`}>
                               {c}
                               {showAnswersInPreview && q.correctAnswer === ci && <Check size={12} />}
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-1 border-t bg-white dark:bg-zinc-800 flex justify-end gap-1">
          <button onClick={() => onOpenChange(false)} className="p-1 font-black text-zinc-500 hover:bg-zinc-100 rounded-2xl transition-colors">إلغاء</button>
          <button
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className="p-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : (isEditing ? "حفظ التعديلات ✨" : "نشر المسابقة 🚀")}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
