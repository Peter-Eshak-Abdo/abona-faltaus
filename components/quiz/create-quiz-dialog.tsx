"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getFirebaseServices } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
import { Plus, Trash2, Check, Shuffle, X, Upload, Download } from "lucide-react"
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
  const {auth} = getFirebaseServices();
  const [user] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setQuestions([])
      setShuffleQuestions(false)
      setShuffleChoices(false)
      setIsEditing(false)
    } else if (editQuiz) {
      setTitle(editQuiz.title || "")
      setDescription(editQuiz.description || "")
      setQuestions(editQuiz.questions || [])
      setShuffleQuestions(editQuiz.shuffleQuestions || false)
      setShuffleChoices(editQuiz.shuffleChoices || false)
      setIsEditing(true)
    }
  }, [open, editQuiz])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: "multiple-choice",
      text: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 20,
    }
    setQuestions((prev) => [...prev, newQuestion])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...updates }
      return copy
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    setQuestions((prev) => {
      const copy = [...prev]
      const q = copy[questionIndex]
      q.choices = [...q.choices]
      q.choices[choiceIndex] = value
      copy[questionIndex] = q
      return copy
    })
  }

  const downloadTemplate = () => {
    const sampleData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ["ما هو عاصمة مصر؟", "القاهرة", "الإسكندرية", "أسوان", "المنصورة", "1", "20"],
      ["كم عدد أيام الأسبوع؟", "5", "6", "7", "8", "3", "15"],
      ["الشمس تشرق من الشرق", "صح", "خطأ", "", "", "1", "10"],
    ]
    const ws = XLSX.utils.aoa_to_sheet(sampleData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Template")
    XLSX.writeFile(wb, "quiz_template.xlsx")
  }

  const exportQuizToExcel = () => {
    if (questions.length === 0) {
      alert("لا توجد أسئلة للتصدير")
      return
    }

    const exportData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ...questions.map((q) => {
        const correctIndex = (q.correctAnswer ?? 0) + 1
        if (q.type === "true-false") {
          return [q.text, q.choices[0] ?? "صح", q.choices[1] ?? "خطأ", "", "", String(correctIndex), String(q.timeLimit ?? 20)]
        }
        return [q.text, q.choices[0] ?? "", q.choices[1] ?? "", q.choices[2] ?? "", q.choices[3] ?? "", String(correctIndex), String(q.timeLimit ?? 20)]
      }),
    ]
    const ws = XLSX.utils.aoa_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    const sanitizedTitle = (title || "quiz").replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_").slice(0, 40)
    XLSX.utils.book_append_sheet(wb, ws, `${sanitizedTitle}_Questions`)
    XLSX.writeFile(wb, `${sanitizedTitle || "quiz"}.xlsx`)
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 }) as string[][]
        const imported: Question[] = []
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.length < 2) continue
          const questionText = (row[0] || "").toString().trim()
          const choice1 = (row[1] || "").toString().trim()
          const choice2 = (row[2] || "").toString().trim()
          const choice3 = (row[3] || "").toString().trim()
          const choice4 = (row[4] || "").toString().trim()
          const correctStr = (row[5] || "").toString().trim()
          const timeLimitStr = (row[6] || "").toString().trim()
          if (!questionText || !choice1 || !choice2 || !correctStr) continue
          const correctIndex = Math.max(0, parseInt(correctStr, 10) - 1)
          const timeLimit = Number.isFinite(Number(timeLimitStr)) ? parseInt(timeLimitStr, 10) : 20
          const isTF = !choice3 && !choice4
          const type = isTF ? "true-false" : "multiple-choice"
          const choices = isTF ? ["صح", "خطأ"] : [choice1, choice2, choice3 || "", choice4 || ""]
          if (correctIndex < 0 || correctIndex >= choices.length) continue
          imported.push({
            id: `${Date.now()}_${i}`,
            type,
            text: questionText,
            choices,
            correctAnswer: correctIndex,
            timeLimit: timeLimit || 20,
          })
        }
        if (imported.length > 0) {
          setQuestions((prev) => [...prev, ...imported])
        } else {
          alert("لم يتم استيراد أي سؤال — تحقق من تنسيق الملف")
        }
      } catch (err) {
        console.error("Error parsing Excel file:", err)
        alert("خطأ في قراءة ملف Excel. تأكد من الصيغة.")
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const validateAndSubmit = async () => {
    if (!user) {
      alert("يجب تسجيل الدخول أولاً")
      return
    }
    if (!title.trim()) {
      alert("يجب إدخال اسم المسابقة")
      return
    }
    if (questions.length === 0) {
      alert("يجب إضافة سؤال واحد على الأقل")
      return
    }

    const emptyText = questions.map((q, i) => ({ q, i })).filter(({ q }) => !q.text.trim()).map(({ i }) => i + 1)
    if (emptyText.length) {
      alert(`يجب إدخال نص للأسئلة التالية: ${emptyText.join(", ")}`)
      return
    }

    const incomplete = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.type !== "true-false" && !q.choices.every((c) => c.trim())).map(({ i }) => i + 1)
    if (incomplete.length) {
      alert(`بعض أسئلة الاختيارات غير مكتملة: ${incomplete.join(", ")}`)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && editQuiz) {
        // dynamic import to avoid circular dependencies maybe
        const { updateQuiz } = await import("@/lib/firebase-utils")
        await updateQuiz(editQuiz.id, {
          title: title.trim(),
          description: description.trim(),
          questions,
          shuffleQuestions,
          shuffleChoices,
        })
        alert("تم تحديث المسابقة بنجاح!")
      } else {
        await createQuiz({
          title: title.trim(),
          description: description.trim(),
          createdBy: user.uid,
          questions,
          isActive: false,
          shuffleQuestions,
          shuffleChoices,
        })
        alert("تم إنشاء المسابقة بنجاح!")
      }
      // cleanup & notify parent
      setTitle("")
      setDescription("")
      setQuestions([])
      setShuffleChoices(false)
      setShuffleQuestions(false)
      setIsEditing(false)
      onQuizCreated()
      onOpenChange(false)
    } catch (err) {
      console.error("Error saving quiz:", err)
      alert("حدث خطأ أثناء حفظ المسابقة. حاول مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    Boolean(title.trim()) &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim() && (q.type === "true-false" || q.choices.every((c) => c.trim())))

  if (typeof window === "undefined" || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center md:top-2 p-1 z-50">
      <div className="bg-white dark:bg-black rounded-2xl p-1 border border-white/30 dark:border-white/20 shadow-2xl  max-w-8xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-lg font-semibold">{isEditing ? "تعديل المسابقة" : "انشئ المسابقة الجديدة"}</h5>
          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => onOpenChange(false)} title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-1 p-1">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المسابقة</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background p-2 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اضف اسم المسابقة ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">وصف المسابقة</label>
            <textarea
              className="w-full rounded-md border border-input bg-background p-2 focus:outline-none"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اضف وصف للمسابقة ..."
            />
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center rounded-md border p-2">
                <Upload size={16} className="ml-1" /> استيراد Excel
              </button>
              <button type="button" onClick={downloadTemplate} className="inline-flex items-center rounded-md border p-2">
                <Download size={16} className="ml-1" /> نموذج Excel
              </button>
              <button type="button" onClick={exportQuizToExcel} className="inline-flex items-center rounded-md border p-2">
                <Download size={16} className="ml-1" /> تصدير
              </button>
            </div>
            <input ref={fileInputRef} title="title" type="file" accept=".xlsx,.xls" onChange={handleExcelImport} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <Checkbox id="shuffleQuestions" checked={shuffleQuestions} onCheckedChange={(v: boolean) => setShuffleQuestions(v)} />
              <Shuffle /> الاسئلة عشوائية
            </label>
            <label className="flex items-center gap-2">
              <Checkbox id="shuffleChoices" checked={shuffleChoices} onCheckedChange={(v: boolean) => setShuffleChoices(v)} />
              <Shuffle /> ترتيب الاختيارات عشوائي
            </label>
          </div>

          <div className="flex justify-between items-center">
            <h6>عدد الاسئلة ({questions.length})</h6>
            <button type="button" className="inline-flex items-center rounded-md border p-2" onClick={addQuestion}>
              <Plus size={16} /> اضف سؤال
            </button>
          </div>

          <Accordion type="multiple" className="w-full">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div key={question.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <AccordionItem value={question.id} className="border rounded-lg mb-2">
                    <div className="flex justify-between items-center p-2 border-b">
                      <p className="text-lg font-bold flex-1">سؤال {index + 1}: {question.text.slice(0, 60)}{question.text.length > 60 ? "..." : ""}</p>
                      <button type="button" title="title" onClick={() => removeQuestion(index)} className="rounded-md p-1 bg-red-600 text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <AccordionTrigger className="px-2 py-1">تفاصيل السؤال</AccordionTrigger>
                    <AccordionContent className="px-2 py-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label>نوع السؤال</label>
                          <select name="name" title="title" value={question.type} onChange={(e) => updateQuestion(index, {
                            type: e.target.value as "true-false" | "multiple-choice",
                            choices: e.target.value === "true-false" ? ["صح", "خطأ"] : ["", "", "", ""],
                            correctAnswer: 0,
                          })} className="w-full p-2 border rounded">
                            <option value="multiple-choice">اختيارات</option>
                            <option value="true-false">صح و غلط</option>
                          </select>
                        </div>
                        <div>
                          <label>وقت السؤال (بالثواني)</label>
                          <input type="number" title="title" min={5} max={300} value={question.timeLimit} onChange={(e) => updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 20 })} className="w-full p-2 border rounded" />
                        </div>
                      </div>

                      <div className="mt-2">
                        <label>نص السؤال</label>
                        <textarea rows={2} title="title" value={question.text} onChange={(e) => updateQuestion(index, { text: e.target.value })} className="w-full p-2 border rounded" />
                      </div>

                      <div className="mt-2">
                        <label>الاختيارات</label>
                        {question.choices.map((choice, ci) => (
                          <div key={ci} className="flex gap-2 items-center mt-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ci === 0 ? "green" : ci === 1 ? "red" : ci === 2 ? "blue" : "yellow" }} />
                            <input type="text" placeholder={`اختيار ${ci + 1}`} value={choice} onChange={(e) => updateChoice(index, ci, e.target.value)} disabled={question.type === "true-false"} className="flex-1 p-2 border rounded" />
                            <button type="button" onClick={() => updateQuestion(index, { correctAnswer: ci })} className={`p-2 rounded ${question.correctAnswer === ci ? "bg-green-600 text-white" : "border"}`} title="اجعل الإجابة صحيحة">
                              <Check />
                            </button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </Accordion>

          {questions.length === 0 && <p className="text-center">مفيش اي سؤال مضاف</p>}
        </div>

        <div className="flex justify-end gap-2 p-2 border-t">
          <button onClick={() => onOpenChange(false)} className="p-2 rounded border">الغاء</button>
          <button onClick={validateAndSubmit} disabled={isSubmitting || !isValid} className="p-2 rounded bg-blue-600 text-white">
            {isSubmitting ? (isEditing ? "جاري التحديث ..." : "جاري الانشاء ...") : (isEditing ? "تحديث المسابقة" : "إنشاء مسابقة")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
