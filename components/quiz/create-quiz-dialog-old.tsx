"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { createClient } from "@/lib/supabase/client" // <-- إضافة Supabase Client
import { createQuiz, updateQuiz } from "@/lib/supabase-utils" // <-- من ملف utils الجديد
import { Plus, Trash2, Check, Shuffle, Clock, X, Upload, Download } from "lucide-react"
import type { Question, Quiz } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuizCreated: () => void
  editQuiz?: Quiz | null
}

export function CreateQuizDialog({ open, onOpenChange, onQuizCreated, editQuiz }: CreateQuizDialogProps) {
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
    // جلب بيانات المستخدم
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    if (!open) {
      setTitle("")
      setDescription("")
      setQuestions([])
      setShuffleQuestions(false)
      setShuffleChoices(false)
      setIsEditing(false)
    } else if (editQuiz) {
      setTitle(editQuiz.title)
      setDescription(editQuiz.description)
      setQuestions(editQuiz.questions)
      setShuffleQuestions(editQuiz.shuffle_questions || false)
      setShuffleChoices(editQuiz.shuffle_choices || false)
      setIsEditing(true)
    }
  }, [open, editQuiz])

  // ... (نفس دوال إضافة وتحديث وحذف الأسئلة واستيراد الإكسيل بدون تغيير لأنها React States عادية) ...
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID() || Date.now().toString(),
      type: "multiple-choice",
      text: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 20,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates }
    setQuestions(updatedQuestions)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].choices[choiceIndex] = value
    setQuestions(updatedQuestions)
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

  const validateAndSubmit = async () => {
    if (!user) return alert("يجب تسجيل الدخول أولاً")
    if (!title.trim()) return alert("يجب إدخال اسم المسابقة")
    if (questions.length === 0) return alert("يجب إضافة سؤال واحد على الأقل")

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return alert(`السؤال رقم ${i + 1} فارغ!`);
      const validChoices = q.choices.filter(c => c.trim() !== "");
      if (q.type === "multiple-choice" && validChoices.length < 2) {
        return alert(`السؤال رقم ${i + 1} يجب أن يحتوي على خيارين على الأقل`);
      }
    }

    setIsSubmitting(true)
    try {
      const quizData = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          ...q,
          choices: q.choices.map(c => c.trim())
        })),
        shuffle_questions: shuffleQuestions,
        shuffle_choices: shuffleChoices,
        created_by: user.id, // استخدمنا الـ id الخاص بـ Supabase
        created_at: new Date().toISOString()
      };

      if (isEditing && editQuiz) {
        // تحديث في Supabase
        await updateQuiz(editQuiz.id, quizData)
        alert("تم تحديث المسابقة بنجاح!")
      } else {
        // إنشاء في Supabase
        await createQuiz(quizData)
      }

      onQuizCreated()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving quiz:", error)
      alert("حدث خطأ: " + (error?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false)
    }
  }

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-1 z-50 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-black rounded-2xl p-1 border border-white/30 shadow-2xl max-w-4xl w-full my-1">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-2xl font-bold">{isEditing ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة'}</h5>
          <button type="button" className="text-red-500 hover:bg-red-50 p-1 rounded-full" onClick={() => onOpenChange(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-1">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المسابقة</label>
            <input type="text" className="w-full rounded-xl border-2 p-1 font-bold text-lg focus:border-blue-500 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اسم المسابقة..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">وصف المسابقة</label>
            <textarea className="w-full rounded-xl border-2 p-1 font-bold focus:border-blue-500 outline-none resize-none" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف للمسابقة..." />
          </div>

          <div>
            <div className="flex flex-wrap gap-1 mb-1">
              <button type="button" className="flex items-center gap-1 rounded-lg border-2 border-blue-600 p-1 text-blue-600 hover:bg-blue-50 font-bold" onClick={() => fileInputRef.current?.click()}>
                <Upload size={9} /> استيراد من Excel
              </button>
              <button type="button" className="flex items-center gap-1 rounded-lg border-2 border-green-600 p-1 text-green-600 hover:bg-green-50 font-bold" onClick={downloadTemplate}>
                <Download size={9} /> نموذج فارغ
              </button>
              <button type="button" className="flex items-center gap-1 rounded-lg border-2 border-amber-600 p-1 text-amber-600 hover:bg-amber-50 font-bold" onClick={exportQuizToExcel}>
                <Download size={9} /> تصدير للإكسيل
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleExcelImport} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 p-1 rounded-xl border">
            <label className="flex items-center gap-1 cursor-pointer font-semibold">
              <Checkbox checked={shuffleQuestions} onCheckedChange={(checked: boolean) => setShuffleQuestions(checked)} />
              <Shuffle size={9} className="text-blue-600" /> ترتيب الأسئلة عشوائي
            </label>
            <label className="flex items-center gap-1 cursor-pointer font-semibold">
              <Checkbox checked={shuffleChoices} onCheckedChange={(checked: boolean) => setShuffleChoices(checked)} />
              <Shuffle size={9} className="text-blue-600" /> ترتيب الاختيارات عشوائي
            </label>
          </div>

          <div className="flex justify-between items-center bg-blue-50 p-1 rounded-xl border border-blue-100">
            <h6 className="text-xl font-bold text-blue-900">الأسئلة ({questions.length})</h6>
            <button type="button" className="flex items-center gap-1 rounded-lg bg-blue-600 text-white p-1 font-bold hover:bg-blue-700 shadow-md" onClick={addQuestion}>
              <Plus size={9} /> إضافة سؤال
            </button>
          </div>

          <Accordion type="multiple" className="w-full space-y-1">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div key={question.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <AccordionItem value={question.id} className="border-2 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center p-1 bg-gray-50 border-b">
                      <p className="text-lg font-bold text-gray-800">سؤال {index + 1}: {question.text.slice(0, 40)}{question.text.length > 40 ? '...' : ''}</p>
                      <button type="button" className="text-red-600 hover:bg-red-100 p-1 rounded-lg" onClick={() => removeQuestion(index)}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <AccordionTrigger className="px-1 hover:no-underline bg-white">
                      <span className="text-sm font-bold text-blue-600">عرض تفاصيل السؤال</span>
                    </AccordionTrigger>
                    <AccordionContent className="p-1 space-y-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        <div>
                          <label className="block text-sm font-bold mb-1">نوع السؤال</label>
                          <select className="w-full rounded-lg border-2 p-1 outline-none focus:border-blue-500" value={question.type}
                            onChange={(e) => updateQuestion(index, {
                              type: e.target.value as "true-false" | "multiple-choice",
                              choices: e.target.value === "true-false" ? ["صح", "خطأ"] : ["", "", "", ""],
                              correctAnswer: 0,
                            })}>
                            <option value="multiple-choice">اختيارات متعددة</option>
                            <option value="true-false">صح أم خطأ</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-bold mb-1">
                            <Clock size={8} /> وقت السؤال بالثواني
                          </label>
                          <input type="number" min="5" max="300" className="w-full rounded-lg border-2 p-1 outline-none focus:border-blue-500"
                            value={question.timeLimit} onChange={(e) => updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 20 })} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-1">نص السؤال</label>
                        <textarea className="w-full rounded-lg border-2 p-1 outline-none focus:border-blue-500 resize-none font-semibold text-lg" rows={2}
                          value={question.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-bold">الاختيارات (اضغط ✔️ لتحديد الإجابة الصحيحة)</label>
                        {question.choices.map((choice, choiceIndex) => {
                          const isCorrect = question.correctAnswer === choiceIndex;
                          const colors = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
                          return (
                            <div key={choiceIndex} className="flex items-center gap-1">
                              <div className={`w-4 h-4 rounded-full ${colors[choiceIndex % 4]}`} />
                              <input type="text" className={`flex-1 rounded-lg border-2 p-1 outline-none font-semibold transition-colors ${isCorrect ? 'border-green-500 bg-green-50' : 'focus:border-blue-500'}`}
                                value={choice} placeholder={`اختيار ${choiceIndex + 1}`}
                                onChange={(e) => updateChoice(index, choiceIndex, e.target.value)} disabled={question.type === "true-false"} />
                              <button type="button" onClick={() => updateQuestion(index, { correctAnswer: choiceIndex })}
                                className={`p-1 rounded-lg border-2 transition-colors ${isCorrect ? "bg-green-500 border-green-500 text-white shadow-md" : "border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500"}`}>
                                <Check size={8} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </Accordion>

          <div className="flex justify-end gap-1 pt-1 border-t">
            <button type="button" className="p-1 rounded-xl font-bold text-gray-600 hover:bg-gray-100" onClick={() => onOpenChange(false)}>
              إلغاء
            </button>
            <button type="button" className="p-1 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg disabled:opacity-50" onClick={validateAndSubmit} disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : (isEditing ? "تحديث المسابقة" : "إنشاء المسابقة 🚀")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
