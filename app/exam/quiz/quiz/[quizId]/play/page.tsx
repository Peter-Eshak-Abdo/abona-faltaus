/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, subscribeToGameState, submitResponse } from "@/lib/firebase-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Trophy } from "lucide-react"
import type { Quiz, GameState, Group } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

export default function PlayQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [showResults, setShowResults] = useState(false)
  const quizId = params.quizId as string

  useEffect(() => {
    // Get group info from localStorage
    const groupData = localStorage.getItem("currentGroup")
    if (!groupData) {
      router.push(`/exam/quiz/quiz/${quizId}/join`)
      return
    }

    setCurrentGroup(JSON.parse(groupData))
    loadQuiz()
  }, [quizId])

  useEffect(() => {
    if (!quizId) return

    const unsubscribe = subscribeToGameState(quizId, (state) => {
      setGameState(state)

      if (!state?.isActive) {
        // Quiz ended, show final results
        setShowResults(true)
        return
      }

      // Reset for new question
      if (state.questionStartTime && !state.showResults) {
        setSelectedAnswer(null)
        setHasAnswered(false)
        setShowResults(false)
        setTimeLeft(state.currentQuestionTimeLimit || 30)
      }

      if (state.showResults) {
        setShowResults(true)
      }
    })

    return unsubscribe
  }, [quizId])

  useEffect(() => {
    if (!gameState?.questionStartTime || gameState.showResults || hasAnswered) return

    const startTime = gameState.questionStartTime.getTime()
    const timeLimit = gameState.currentQuestionTimeLimit || 30

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        // Time's up, disable answering
        setHasAnswered(true)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState?.questionStartTime, gameState?.showResults, gameState?.currentQuestionTimeLimit, hasAnswered])

  const loadQuiz = async () => {
    try {
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        router.push("/")
        return
      }
      setQuiz(quizData)
    } catch (error) {
      console.error("Error loading quiz:", error)
      router.push("/")
    }
  }

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered || !gameState?.questionStartTime || !currentGroup) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)

    const responseTime = (Date.now() - gameState.questionStartTime.getTime()) / 1000
    const currentQuestion = quiz?.questions[gameState.currentQuestionIndex]

    if (!currentQuestion) return

    try {
      await submitResponse(quizId, {
        groupId: currentGroup.id,
        questionIndex: gameState.currentQuestionIndex,
        answer: answerIndex,
        isCorrect: answerIndex === currentQuestion.correctAnswer,
        responseTime,
      })
    } catch (error) {
      console.error("Error submitting response:", error)
    }
  }

  const getChoiceColor = (index: number) => {
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"]
    return colors[index] || "bg-gray-500"
  }

  const getChoiceColorHover = (index: number) => {
    const colors = ["hover:bg-red-600", "hover:bg-green-600", "hover:bg-blue-600", "hover:bg-yellow-600"]
    return colors[index] || "hover:bg-gray-600"
  }

  const getChoiceLabel = (index: number) => {
    const labels = ["أ", "ب", "ج", "د"]
    return labels[index] || (index + 1).toString()
  }

  if (!quiz || !gameState || !currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="text-center shadow-xl border-0">
            <CardContent className="pt-8 pb-8">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4 text-gray-900">انتهى الامتحان!</h2>
              <p className="text-gray-600 mb-4 text-lg">شكراً لمشاركتكم، {currentGroup.groupName}!</p>
              <p className="text-sm text-gray-500 mb-8">تحققوا من النتائج النهائية مع المشرف.</p>
              <Button onClick={() => router.push("/")} className="w-full py-3 text-lg">
                تم
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[gameState.currentQuestionIndex]

  if (showResults && selectedAnswer !== null) {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
              السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900">{currentGroup.groupName}</h1>
          </motion.div>

          <Card className="shadow-xl border-0">
            <CardHeader className={`text-center ${isCorrect ? "bg-green-500" : "bg-red-500"} text-white rounded-t-lg`}>
              <CardTitle className="text-2xl">
                {isCorrect ? <span>إجابة صحيحة! 🎉</span> : <span>إجابة خاطئة 😔</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="font-bold mb-6 text-xl text-gray-900">{currentQuestion.text}</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.choices.map((choice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-xl flex items-center gap-4 text-lg ${index === currentQuestion.correctAnswer
                          ? "bg-green-100 border-4 border-green-500"
                          : index === selectedAnswer
                            ? "bg-red-100 border-4 border-red-500"
                            : "bg-gray-50 border-2 border-gray-200"
                        }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${getChoiceColor(index)}`}
                      >
                        {getChoiceLabel(index)}
                      </div>
                      <span className="font-medium flex-1">{choice}</span>
                      {index === currentQuestion.correctAnswer && (
                        <Badge className="bg-green-500 text-white">الإجابة الصحيحة</Badge>
                      )}
                      {index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <Badge className="bg-red-500 text-white">إجابتكم</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-6">
                  <p className="text-gray-600 text-lg">في انتظار السؤال التالي...</p>
                  <div className="animate-pulse mt-4">
                    <div className="h-3 bg-blue-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 text-lg px-4 py-2 bg-white">
              <Clock className="w-5 h-5" />
              {Math.ceil(timeLeft)} ثانية
            </Badge>
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-3 text-gray-900">
            <Users className="w-6 h-6" />
            {currentGroup.groupName}
          </h1>
          <p className="text-gray-600 mt-2">{currentGroup.members.join(" • ")}</p>
        </motion.div>

        {/* Progress */}
        <Progress
          value={
            hasAnswered
              ? 100
              : ((gameState.currentQuestionTimeLimit - timeLeft) / gameState.currentQuestionTimeLimit) * 100
          }
          className="mb-8 h-3"
        />

        {/* Question */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-center text-2xl font-bold">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {currentQuestion.choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={hasAnswered || timeLeft === 0}
                      className={`p-6 rounded-xl flex items-center gap-4 text-right transition-all duration-200 ${hasAnswered || timeLeft === 0
                          ? "cursor-not-allowed opacity-60"
                          : `cursor-pointer ${getChoiceColorHover(index)} transform hover:scale-105 active:scale-95`
                        } ${selectedAnswer === index ? "ring-4 ring-white shadow-2xl" : ""
                        } ${getChoiceColor(index)} text-white font-semibold text-lg shadow-lg`}
                    >
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                        {getChoiceLabel(index)}
                      </div>
                      <span className="flex-1 text-right">{choice}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200"
                >
                  <p className="text-blue-800 font-bold text-lg mb-2">تم إرسال الإجابة!</p>
                  <p className="text-blue-600">في انتظار النتائج...</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
