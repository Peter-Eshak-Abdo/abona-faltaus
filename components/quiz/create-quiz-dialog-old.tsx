"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { createClient } from "@/lib/supabase/client"
import { createQuiz, updateQuiz } from "@/lib/supabase-utils"
import { Plus, Trash2, Check, Clock, X, Upload } from "lucide-react"
import type { Question, Quiz } from "@/types/quiz"
import { motion } from "framer-motion"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// التعديل هنا ليتوافق مع الـ Dashboard
interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void // تم تغييرها من onQuizCreated
  initialData?: Quiz | null // تم تغييرها من editQuiz
}

export default function CreateQuizDialog({ open, onOpenChange, onSuccess, initialData }: CreateQuizDialogProps) {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    if (open) {
      if (initialData) {
        // حالة التعديل
        setTitle(initialData.title)
        setDescription(initialData.description || "")
        setQuestions(initialData.questions || [])
        setShuffleQuestions(initialData.shuffle_questions || false)
        setShuffleChoices(initialData.shuffle_choices || false)
        setIsEditing(true)
      } else {
        // حالة إنشاء جديد (تصفير البيانات)
        setTitle("")
        setDescription("")
        setQuestions([])
        setShuffleQuestions(false)
        setShuffleChoices(false)
        setIsEditing(false)
      }
    }
  }, [open, initialData])

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

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates }
    setQuestions(updatedQuestions)
  }

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].choices[choiceIndex] = value
    setQuestions(updatedQuestions)
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
        questions: questions,
        shuffle_questions: shuffleQuestions,
        shuffle_choices: shuffleChoices,
        created_by: user.id,
        created_at: new Date().toISOString(),
        deleted_at: null,
        is_deleted: false,
      };

      if (isEditing && initialData) {
        await updateQuiz(initialData.id, quizData)
      } else {
        await createQuiz(quizData)
      }

      onSuccess(); // استدعاء دالة النجاح لتحديث القائمة في الـ Dashboard
      onOpenChange(false);
    } catch (error: any) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadTemplate = () => {
    const sampleData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ["ما هو عاصمة مصر؟", "القاهرة", "الإسكندرية", "أسوان", "المنصورة", "1", "20"],
      ["كم عدد أيام الأسبوع؟", "5", "6", "7", "8", "3", "15"],
      ["الشمس تشرق من الشرق", "صح", "خطأ", "", "", "1", "10"]
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    XLSX.writeFile(workbook, "quiz_template.xlsx")
  }

  const exportQuizToExcel = () => {
    if (questions.length === 0) return alert("لا توجد أسئلة للتصدير")

    const exportData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ...questions.map((question) => {
        const correctIndex = question.correctAnswer + 1
        if (question.type === "true-false") {
          return [question.text, question.choices[0] || "صح", question.choices[1] || "خطأ", "", "", correctIndex.toString(), question.timeLimit.toString()]
        } else {
          return [question.text, question.choices[0] || "", question.choices[1] || "", question.choices[2] || "", question.choices[3] || "", correctIndex.toString(), question.timeLimit.toString()]
        }
      })
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    const sanitizedTitle = (title || "Quiz").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 21)
    XLSX.utils.book_append_sheet(workbook, worksheet, `${sanitizedTitle}_Questions`)
    XLSX.writeFile(workbook, `${title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") || "quiz"}.xlsx`)
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

        const importedQuestions: Question[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (row.length >= 6) {
            const questionText = row[0]?.toString().trim()
            const choice1 = row[1]?.toString().trim()
            const choice2 = row[2]?.toString().trim()
            const choice3 = row[3]?.toString().trim() || ""
            const choice4 = row[4]?.toString().trim() || ""
            const correctStr = row[5]?.toString().trim()
            const timeLimitStr = row[6]?.toString().trim()

            if (!questionText || !choice1 || !choice2 || !correctStr) continue

            const correctAnswer = parseInt(correctStr) - 1
            const timeLimit = timeLimitStr ? parseInt(timeLimitStr) : 20
            const isTrueFalse = !choice3 && !choice4
            const type = isTrueFalse ? "true-false" : "multiple-choice"
            const choices = isTrueFalse ? ["صح", "خطأ"] : [choice1, choice2, choice3, choice4]

            if (correctAnswer >= 0 && correctAnswer < choices.length) {
              importedQuestions.push({
                id: Date.now().toString() + i,
                type,
                text: questionText,
                choices,
                correctAnswer,
                timeLimit,
              })
            }
          }
        }
        setQuestions([...questions, ...importedQuestions])
      } catch (error) {
        alert("خطأ في قراءة ملف Excel. تأكد من الصيغة الصحيحة.")
      }
    }
    reader.readAsArrayBuffer(file)
  }


  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-1 z-50" dir="rtl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-zinc-950 rounded-2xl border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-1 border-b flex justify-between items-center bg-gray-50 dark:bg-zinc-900 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة'}
          </h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-1 overflow-y-auto space-y-1 flex-1">
          <div className="grid grid-cols-1 gap-1">
            <input
              type="text"
              className="w-full rounded-xl border-2 p-1 text-xl font-bold focus:border-blue-500 outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اكتب اسم المسابقة هنا..."
            />
            <textarea
              className="w-full rounded-xl border-2 p-1 font-medium focus:border-blue-500 outline-none resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر للمسابقة..."
            />
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-1">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-blue-600 border-blue-200">
              <Upload size={16} className="ml-1" /> استيراد Excel
            </Button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleExcelImport} className="hidden" />
            {/* أضف باقي الأزرار هنا بنفس النمط */}
          </div>

          {/* Settings */}
          <div className="flex gap-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <label className="flex items-center gap-1 cursor-pointer font-bold text-blue-800 dark:text-blue-300">
              <Checkbox checked={shuffleQuestions} onCheckedChange={(c) => setShuffleQuestions(!!c)} />
              ترتيب عشوائي للأسئلة
            </label>
            <label className="flex items-center gap-1 cursor-pointer font-bold text-blue-800 dark:text-blue-300">
              <Checkbox checked={shuffleChoices} onCheckedChange={(c) => setShuffleChoices(!!c)} />
              ترتيب عشوائي للاختيارات
            </label>
          </div>

          {/* Questions List */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">الأسئلة ({questions.length})</h3>
              <button onClick={addQuestion} className="bg-blue-600 text-white p-1 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-700">
                <Plus size={18} /> إضافة سؤال
              </button>
            </div>

            <Accordion type="multiple" className="space-y-1">
              {questions.map((q, idx) => (
                <AccordionItem key={q.id} value={q.id} className="border-2 rounded-xl px-1 bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="flex justify-between items-center w-full">
                    <AccordionTrigger className="hover:no-underline flex-1 py-1">
                      <span className="font-bold text-right w-full">السؤال {idx + 1}: {q.text || "سؤال جديد..."}</span>
                    </AccordionTrigger>
                    <button onClick={() => removeQuestion(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded-full ml-1">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <AccordionContent className="pb-1 space-y-1 border-t pt-1">
                    {/* تفاصيل السؤال: النوع، الوقت، الاختيارات */}
                    <div className="grid grid-cols-2 gap-1">
                      <select
                        className="p-1 border-2 rounded-lg outline-none focus:border-blue-500"
                        value={q.type}
                        onChange={(e) => updateQuestion(idx, { type: e.target.value as any })}
                      >
                        <option value="multiple-choice">اختيارات</option>
                        <option value="true-false">صح/خطأ</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <Clock size={18} className="text-gray-400" />
                        <input
                          type="number"
                          className="w-20 p-1 border-2 rounded-lg"
                          value={q.timeLimit}
                          onChange={(e) => updateQuestion(idx, { timeLimit: +e.target.value })}
                        />
                        <span className="text-sm font-bold">ثانية</span>
                      </div>
                    </div>
                    <textarea
                      className="w-full p-1 border-2 rounded-lg font-bold"
                      value={q.text}
                      onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                      placeholder="اكتب السؤال..."
                    />
                    {/* خيارات الإجابة */}
                    <div className="space-y-2">
                      {q.choices.map((choice, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1">
                          <input
                            type="text"
                            className={`flex-1 p-1 border-2 rounded-lg ${q.correctAnswer === cIdx ? 'border-green-500 bg-green-50' : ''}`}
                            value={choice}
                            onChange={(e) => updateChoice(idx, cIdx, e.target.value)}
                            placeholder={`اختيار ${cIdx + 1}`}
                          />
                          <button
                            onClick={() => updateQuestion(idx, { correctAnswer: cIdx })}
                            className={`p-1 rounded-lg border-2 ${q.correctAnswer === cIdx ? 'bg-green-500 text-white border-green-500' : 'text-gray-400'}`}
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Footer */}
        <div className="p-1 border-t bg-gray-50 dark:bg-zinc-900 rounded-b-2xl flex justify-end gap-1">
          <button onClick={() => onOpenChange(false)} className="p-1 font-bold text-gray-500 hover:text-gray-700">إلغاء</button>
          <button
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className="p-1 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : (isEditing ? "حفظ التعديلات" : "إنشاء المسابقة 🚀")}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

// مكون زر بسيط لاستخدامه داخل الدياولج
function Button({ children, variant = "primary", size = "md", ...props }: any) {
  const base = "font-bold rounded-lg transition-all flex items-center justify-center ";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border-2 border-gray-200 hover:bg-gray-50",
    destructive: "bg-red-500 text-white hover:bg-red-600"
  };
  const sizes: any = { sm: "p-1 text-sm", md: "p-1", lg: "p-1" };
  return <button className={base + variants[variant] + " " + sizes[size]} {...props}>{children}</button>;
}
