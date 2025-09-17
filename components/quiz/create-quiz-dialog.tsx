"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
import { Plus, Trash2, Check, Shuffle, Clock, X } from "lucide-react"
import type { Question } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-semibold">انشئ المسابقة الجديدة</h5>
          <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)} title="Close">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">اسم المسابقة</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="اضف اسم المسابقة ..."
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">وصف المسابقة</label>
            <textarea
              className="w-full resize-none rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اضف وصف للمسابقة ..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
              />
              <label className="flex items-center" htmlFor="shuffleQuestions">
                <Shuffle className="ml-2" size={16} />
                الاسئلة عشوائية
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                id="shuffleChoices"
                checked={shuffleChoices}
                onChange={(e) => setShuffleChoices(e.target.checked)}
              />
              <label className="flex items-center" htmlFor="shuffleChoices">
                <Shuffle className="ml-2" size={16} />
                ترتيب الاختيارات عشوائي
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h6>عدد الاسئلة ({questions.length})</h6>
            <button type="button" className="inline-flex items-center rounded-md border border-primary px-3 py-1 text-primary hover:bg-primary hover:text-primary-foreground" onClick={addQuestion}>
              <Plus size={16} className="ml-1" />
              اضف سؤال
            </button>
          </div>

          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="border border-border rounded-lg p-4 mb-3"
              >
                <div className="flex justify-between items-start mb-2">
                  <h6>سؤال {index + 1}</h6>
                  <button type="button" className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-white hover:bg-red-700" onClick={() => removeQuestion(index)} title="احذف السؤال">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">نوع السؤال</label>
                    <select
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Clock size={16} /> وقت السؤال (بالثواني)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={question.timeLimit}
                      onChange={(e) =>
                        updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 20 })
                      }
                      title="وقت السؤال (بالثواني)"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">السؤال</label>
                  <textarea
                    className="w-full resize-none rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    rows={2}
                    value={question.text}
                    onChange={(e) => updateQuestion(index, { text: e.target.value })}
                    title="السؤال"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">الاختيارات</label>
                  {question.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center gap-2 mb-2">
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
                        className="flex-1 rounded-md border border-input bg-background p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={choice}
                        placeholder={`اختيار ${choiceIndex + 1}`}
                        onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                        disabled={question.type === "true-false"}
                      />
                      <button
                        type="button"
                        className={`inline-flex items-center rounded-md px-2 py-1 text-sm ${question.correctAnswer === choiceIndex
                            ? "bg-green-600 text-white"
                            : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          }`}
                        onClick={() => updateQuestion(index, { correctAnswer: choiceIndex })}
                        title="اختيار الصحيح"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ))}
                  <small className="text-muted-foreground">اضغط على (صح) لاختيار الاجابة الصحيحة</small>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {questions.length === 0 && <p className="text-center text-muted-foreground">مفيش اي سؤال مضاف</p>}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" onClick={() => onOpenChange(false)} title="Cancel">
            الغاء
          </button>
          <button type="button" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none" onClick={handleSubmit} disabled={!isValid || isSubmitting} title="Create Quiz">
            {isSubmitting ? "جاري الانشاء ..." : "إنشاء مسابقة"}
          </button>
        </div>
      </div>
    </div>
  )
}
