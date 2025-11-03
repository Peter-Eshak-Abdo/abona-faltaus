"use client"

import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
import { Plus, Trash2, Check, Shuffle, Clock, X, Upload, Download } from "lucide-react"
import type { Question } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onQuizCreated: () => void
}

export function CreateQuizDialog({ open, onOpenChange, onQuizCreated }: CreateQuizDialogProps) {
  const [user] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = async () => {
    if (!user || !title.trim() || questions.length === 0) return
    setIsSubmitting(true)
    try {
      await createQuiz({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid,
        questions,
        isActive: false,
        shuffleQuestions,
        shuffleChoices,
      })

      setTitle("")
      setDescription("")
      setQuestions([])
      setShuffleQuestions(false)
      setShuffleChoices(false)
      onQuizCreated()
    } catch (error) {
      console.error("Error creating quiz:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    title.trim() &&
    questions.length > 0 &&
    questions.every((q) => q.text.trim() && (q.type === "true-false" || q.choices.every((c) => c.trim())))

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center md:top-10 top-1 p-1 z-[100]">
      <div className="bg-white dark:bg-black rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl  max-w-8xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h5 className="text-lg font-semibold">انشئ المسابقة الجديدة</h5>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)} title="Close">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-1">
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">اسم المسابقة</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-black p-1 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold text-lg text-shadow-lg/20 text-shadow-amber-500/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اضف اسم المسابقة ..."
            />
          </div>
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">وصف المسابقة</label>
            <textarea
              className="w-full resize-none rounded-md border border-input bg-black p-1 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-bold text-lg text-shadow-lg/20 text-shadow-amber-500/50"
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
                className="inline-flex items-center rounded-md border border-secondary p-1 text-black hover:bg-primary hover:text-secondary-foreground"
                onClick={downloadTemplate}
              >
                <Download size={16} className="ml-1" />
                تحميل نموذج Excel
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
                    <AccordionTrigger className="px-4 py-2 hover:no-underline">
                      <div className="flex justify-between items-center w-full">
                        <p className="text-xl font-bold">سؤال {index + 1}: {question.text.slice(0, 50)}{question.text.length > 50 ? '...' : ''}</p>
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-red-600 p-1 text-black hover:bg-red-700 ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeQuestion(index)
                          }}
                          title="احذف السؤال"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
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
                                    ? "red"
                                    : choiceIndex === 1
                                      ? "green"
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
          <button type="button" className="p-1 bg-red-600 border border-red-900 text-red-800 rounded-md hover:bg-red-300" onClick={() => onOpenChange(false)} title="Cancel">
            الغاء
          </button>
          <button type="button" className="p-1 bg-blue-600 border border-blue-900 text-blue-800 rounded-lg font-extrabolder text-xl hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none" onClick={handleSubmit} disabled={!isValid || isSubmitting} title="Create Quiz">
            {isSubmitting ? "جاري الانشاء ..." : "إنشاء مسابقة"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
