"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getFirebaseServices } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
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
  const { auth } = getFirebaseServices();
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
      setTitle(editQuiz.title)
      setDescription(editQuiz.description)
      setQuestions(editQuiz.questions)
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
    // Create sample data for template
    const sampleData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ["ما هو عاصمة مصر؟", "القاهرة", "الإسكندرية", "أسوان", "المنصورة", "1", "20"],
      ["كم عدد أيام الأسبوع؟", "5", "6", "7", "8", "3", "15"],
      ["الشمس تشرق من الشرق", "صح", "خطأ", "", "", "1", "10"]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")

    // Generate and download the file
    XLSX.writeFile(workbook, "quiz_template.xlsx")
  }

  const exportQuizToExcel = () => {
    if (questions.length === 0) {
      alert("لا توجد أسئلة للتصدير")
      return
    }

    const exportData = [
      ["Question", "Choice1", "Choice2", "Choice3", "Choice4", "Correct", "TimeLimit"],
      ...questions.map((question) => {
        const correctIndex = question.correctAnswer + 1 // 1-based index
        if (question.type === "true-false") {
          return [
            question.text,
            question.choices[0] || "صح",
            question.choices[1] || "خطأ",
            "",
            "",
            correctIndex.toString(),
            question.timeLimit.toString()
          ]
        } else {
          return [
            question.text,
            question.choices[0] || "",
            question.choices[1] || "",
            question.choices[2] || "",
            question.choices[3] || "",
            correctIndex.toString(),
            question.timeLimit.toString()
          ]
        }
      })
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    const sanitizedTitle = (title || "Quiz").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 21)
    const sheetName = `${sanitizedTitle}_Questions`
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    // Generate and download the file
    const fileName = `${title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") || "quiz"}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

        // Assume first row is headers: Question, Choice1, Choice2, Choice3, Choice4, Correct, TimeLimit
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

            const correctAnswer = parseInt(correctStr) - 1 // Assuming 1-based index in Excel
            const timeLimit = timeLimitStr ? parseInt(timeLimitStr) : 20

            // Detect true/false questions if only 2 choices are provided
            const isTrueFalse = !choice3 && !choice4
            const type = isTrueFalse ? "true-false" : "multiple-choice"
            const choices = isTrueFalse ? ["صح", "خطأ"] : [choice1, choice2, choice3, choice4]

            if (correctAnswer >= 0 && correctAnswer < choices.length) {
              const newQuestion: Question = {
                id: Date.now().toString() + i,
                type,
                text: questionText,
                choices,
                correctAnswer,
                timeLimit,
              }
              importedQuestions.push(newQuestion)
            }
          }
        }

        setQuestions([...questions, ...importedQuestions])
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        alert("خطأ في قراءة ملف Excel. تأكد من الصيغة الصحيحة.")
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

    // Check for empty question texts
    const emptyTextQuestions = questions
      .map((q, index) => ({ q, index }))
      .filter(({ q }) => !q.text.trim())
      .map(({ index }) => index + 1)

    if (emptyTextQuestions.length > 0) {
      alert(`يجب إدخال نص للأسئلة التالية: ${emptyTextQuestions.join(', ')}`)
      return
    }

    // Check for incomplete multiple choice questions
    const incompleteChoiceQuestions = questions
      .map((q, index) => ({ q, index }))
      .filter(({ q }) => q.type !== "true-false" && !q.choices.every((c) => c.trim()))
      .map(({ index }) => index + 1)

    if (incompleteChoiceQuestions.length > 0) {
      alert(`يجب إدخال جميع الاختيارات للأسئلة متعددة الاختيارات التالية: ${incompleteChoiceQuestions.join(', ')}`)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && editQuiz) {
        // Update existing quiz
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
        // Create new quiz
        await createQuiz({
          title: title.trim(),
          description: description.trim(),
          createdBy: user.uid,
          questions,
          isActive: false,
          shuffleQuestions,
          shuffleChoices,
        })
      }

      setTitle("")
      setDescription("")
      setQuestions([])
      setShuffleQuestions(false)
      setShuffleChoices(false)
      setIsEditing(false)
      onQuizCreated()
    } catch (error) {
      console.error("Error saving quiz:", error)
      alert(`حدث خطأ في ${isEditing ? 'تحديث' : 'إنشاء'} المسابقة. حاول مرة أخرى.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim() && (q.type === "true-false" || q.choices.every((c) => c.trim())))

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center md:top-2 p-1 z-100">
      <div className="bg-white dark:bg-black rounded-2xl p-1 border border-white/30 dark:border-white/20 shadow-2xl  max-w-8xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-lg font-semibold">{isEditing ? 'تعديل المسابقة' : 'انشئ المسابقة الجديدة'}</h5>
          <button type="button" className="text-red-500 hover:text-red-700" onClick={() => onOpenChange(false)} title="Close">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-1">
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">اسم المسابقة</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-black p-1 text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold text-lg text-shadow-lg/20 text-shadow-amber-500/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اضف اسم المسابقة ..."
            />
          </div>
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">وصف المسابقة</label>
            <textarea
              className="w-full resize-none rounded-md border border-input bg-black p-1 text-black placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold text-lg text-shadow-lg/20 text-shadow-amber-500/50"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اضف وصف للمسابقة ..."
            />
          </div>
          <div className="mb-1">
            <div className="flex gap-1 mb-1">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-primary p-1 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="ml-1" />
                استيراد الأسئلة من Excel
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-primary p-1 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={downloadTemplate}
              >
                <Download size={16} className="ml-1" />
                تحميل نموذج Excel
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-primary p-1 text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={exportQuizToExcel}
              >
                <Download size={16} className="ml-1" />
                تصدير المسابقة إلى Excel
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              className="hidden"
              aria-label="استيراد ملف Excel للأسئلة"
            />
            <small className="text-black block mt-1">
              الصيغة: عمود الأسئلة، الاختيار1، الاختيار2، الاختيار3، الاختيار4، الإجابة الصحيحة (رقم 1-4)، وقت السؤال (بالثواني). للأسئلة صح/خطأ: اترك الاختيار3 والاختيار4 فارغين
            </small>
          </div>

          <div className="grid grid-cols-1 md:grid-cols- gap-1 mb-1">
            <div className="flex items-center">
              <Checkbox id="shuffleQuestions" defaultChecked className="ml-1" checked={shuffleQuestions} onCheckedChange={(checked: boolean) => setShuffleQuestions(checked)} />
              <label className="flex items-center" htmlFor="shuffleQuestions">
                <Shuffle className="ml-1" size={16} />
                الاسئلة عشوائية
              </label>
            </div>
            <div className="flex items-center">
              <Checkbox id="shuffleChoices" defaultChecked className="ml-1" checked={shuffleChoices} onCheckedChange={(checked: boolean) => setShuffleChoices(checked)} />
              <label className="flex items-center" htmlFor="shuffleChoices">
                <Shuffle className="ml-1" size={16} />
                ترتيب الاختيارات عشوائي
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center mb-1">
            <h6>عدد الاسئلة ({questions.length})</h6>
            <button type="button" className="inline-flex items-center rounded-md border p-1 border-primary text-primary hover:font-bold hover:text-lg" onClick={addQuestion}>
              <Plus size={16} className="ml-1" />
              اضف سؤال
            </button>
          </div>

          <Accordion type="multiple" className="w-full">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <AccordionItem value={question.id} className="border border-border rounded-lg mb-1">
                    <div className="flex justify-between items-center p-0.5 border-b border-border">
                      <p className="text-xl font-bold flex-1">سؤال {index + 1}: {question.text.slice(0, 50)}{question.text.length > 50 ? '...' : ''}</p>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md bg-red-600 px-1 text-black hover:bg-red-700 ml-1"
                        onClick={() => removeQuestion(index)}
                        title="احذف السؤال"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <AccordionTrigger className="px-1 hover:no-underline">
                      <span className="text-lg font-medium">تفاصيل السؤال</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-1">
                        <div>
                          <label className="block text-lg font-medium mb-1">نوع السؤال</label>
                          <select
                            className="w-full rounded-md border border-input bg-background px-1 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(index, {
                                type: e.target.value as "true-false" | "multiple-choice",
                                choices: e.target.value === "true-false" ? ["True", "False"] : ["", "", "", ""],
                                correctAnswer: 0,
                              })
                            }
                            title="نوع السؤال"
                          >
                            <option value="multiple-choice">اختيارات</option>
                            <option value="true-false">صح و غلط</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-lg font-medium mb-1">
                            <Clock size={16} /> وقت السؤال (بالثواني)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            className="w-full rounded-md border border-input bg-background px-1 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={question.timeLimit}
                            onChange={(e) =>
                              updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 20 })
                            }
                            title="وقت السؤال (بالثواني)"
                          />
                        </div>
                      </div>

                      <div className="mb-1">
                        <label className="block text-lg font-medium mb-1">السؤال</label>
                        <textarea
                          className="w-full resize-none rounded-md border border-input bg-background px-1 py-0.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          rows={2}
                          value={question.text}
                          onChange={(e) => updateQuestion(index, { text: e.target.value })}
                          title="السؤال"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-medium mb-1">الاختيارات</label>
                        {question.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-center gap-1 mb-1">
                            <div
                              className="rounded-full w-4 h-4"
                              style={{
                                backgroundColor:
                                  choiceIndex === 0
                                    ? "green"
                                    : choiceIndex === 1
                                      ? "red"
                                      : choiceIndex === 2
                                        ? "blue"
                                        : "yellow",
                              }}
                            />
                            <input
                              type="text"
                              className="flex-1 rounded-md border border-input bg-background px-1 py-0.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              value={choice}
                              placeholder={`اختيار ${choiceIndex + 1}`}
                              onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                              disabled={question.type === "true-false"}
                            />
                            <button
                              type="button"
                              className={`inline-flex items-center rounded-md p-1 text-lg ${question.correctAnswer === choiceIndex
                                ? "bg-green-600 text-green-500 hover:bg-green-700 border border-green-500"
                                : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                }`}
                              onClick={() => updateQuestion(index, { correctAnswer: choiceIndex })}
                              title="اختيار الصحيح"
                            >
                              <Check size={24} />
                            </button>
                          </div>
                        ))}
                        <small className="text-muted-foreground">اضغط على (صح) لاختيار الاجابة الصحيحة</small>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </Accordion>

          {questions.length === 0 && <p className="text-center text-muted-foreground">مفيش اي سؤال مضاف</p>}
        </div>
        <div className="flex justify-end gap-1 mt-1">
          <button type="button" className="p-1 bg-red-900 border border-red-900 text-red-900 rounded-md hover:text-red-600 hover:border-red-600 hover:font-bold" onClick={() => onOpenChange(false)} title="Cancel">
            الغاء
          </button>
          <button type="button" className="p-1 bg-blue-600 border border-blue-900 text-blue-800 rounded-lg font-extrabolder text-xl hover:bg-primary/90" onClick={validateAndSubmit} disabled={isSubmitting} title={isEditing ? "Update Quiz" : "Create Quiz"}>
            {isSubmitting ? (isEditing ? "جاري التحديث ..." : "جاري الانشاء ...") : (isEditing ? "تحديث المسابقة" : "إنشاء مسابقة")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
