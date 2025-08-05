"use client"

import { useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { createQuiz } from "@/lib/firebase-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
      timeLimit: 30, // مؤقت افتراضي 30 ثانية
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

      // Reset form
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* خيارات الخلط */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
              />
              <Label htmlFor="shuffleQuestions" className="flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Shuffle Questions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffleChoices"
                checked={shuffleChoices}
                onCheckedChange={(checked) => setShuffleChoices(checked as boolean)}
              />
              <Label htmlFor="shuffleChoices" className="flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Shuffle Answer Choices
              </Label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
              <Button onClick={addQuestion} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4"
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        <Button
                          onClick={() => removeQuestion(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Question Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value: "true-false" | "multiple-choice") =>
                              updateQuestion(index, {
                                type: value,
                                choices: value === "true-false" ? ["True", "False"] : ["", "", "", ""],
                                correctAnswer: 0,
                              })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                              <SelectItem value="true-false">True/False</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time Limit (seconds)
                          </Label>
                          <Input
                            type="number"
                            min="10"
                            max="300"
                            value={question.timeLimit}
                            onChange={(e) =>
                              updateQuestion(index, { timeLimit: Number.parseInt(e.target.value) || 30 })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(index, { text: e.target.value })}
                          placeholder="Enter your question..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Answer Choices</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full ${choiceIndex === 0
                                    ? "bg-red-500"
                                    : choiceIndex === 1
                                      ? "bg-green-500"
                                      : choiceIndex === 2
                                        ? "bg-blue-500"
                                        : "bg-yellow-500"
                                  }`}
                              />
                              <Input
                                value={choice}
                                onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                                placeholder={`Choice ${choiceIndex + 1}`}
                                disabled={question.type === "true-false"}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => updateQuestion(index, { correctAnswer: choiceIndex })}
                                variant={question.correctAnswer === choiceIndex ? "default" : "outline"}
                                size="sm"
                                className="px-2"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">Click the checkmark to set the correct answer</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
