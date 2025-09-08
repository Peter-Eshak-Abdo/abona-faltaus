"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
import { Plus, Trash2, Check, Shuffle, Clock } from "lucide-react"
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
      timeLimit: 30,
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
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">انشئ المسابقة الجديدة</h5>
            <button type="button" className="btn-close" onClick={() => onOpenChange(false)} title="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">اسم المسابقة</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="اضف اسم المسابقة ..."
              />
            </div>
            <div className="mb-3">
              <label className="form-label">وصف المسابقة</label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اضف وصف للمسابقة ..."
              />
            </div>

            <div className="row mb-4">
              <div className="col-md-6 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="shuffleQuestions"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shuffleQuestions">
                  <Shuffle className="me-2" size={16} />
                  الاسئلة عشوائية
                </label>
              </div>
              <div className="col-md-6 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="shuffleChoices"
                  checked={shuffleChoices}
                  onChange={(e) => setShuffleChoices(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="shuffleChoices">
                  <Shuffle className="me-2" size={16} />
                  ترتيب الاختيارات عشوائي
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>عدد الاسئلة ({questions.length})</h6>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQuestion}>
                <Plus size={16} className="me-1" />
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
                  className="card mb-3"
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6>سؤال {index + 1}</h6>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeQuestion(index)} title="احذف السؤال">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">نوع السؤال</label>
                        <select
                          className="form-select"
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
                      <div className="col-md-6">
                        <label className="form-label d-flex align-items-center gap-2">
                          <Clock size={16} /> وقت السؤال (بالثواني)
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="300"
                          className="form-control"
                          value={question.timeLimit}
                          onChange={(e) =>
                            updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 30 })
                          }
                          title="وقت السؤال (بالثواني)"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">السؤال</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={question.text}
                        onChange={(e) => updateQuestion(index, { text: e.target.value })}
                        title="السؤال"
                      />
                    </div>

                    <div>
                      <label className="form-label">الاختيارات</label>
                      {question.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="d-flex align-items-center gap-2 mb-2">
                          <div
                            className={`rounded-circle`}
                            style={{
                              width: 16,
                              height: 16,
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
                            className="form-control"
                            value={choice}
                            placeholder={`اختيار ${choiceIndex + 1}`}
                            onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                            disabled={question.type === "true-false"}
                          />
                          <button
                            type="button"
                            className={`btn btn-sm ${question.correctAnswer === choiceIndex ? "btn-success" : "btn-outline-danger"
                              }`}
                            onClick={() => updateQuestion(index, { correctAnswer: choiceIndex })}
                            title="اختيار الصحيح"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ))}
                      <small className="text-muted">اضغط على (صح) لاختيار الاجابة الصحيحة</small>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && <p className="text-center text-muted">مفيش اي سؤال مضاف</p>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onOpenChange(false)} title="Cancel">
              الغاء
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!isValid || isSubmitting} title="Create Quiz">
              {isSubmitting ? "جاري الانشاء ..." : "إنشاء مسابقة"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
