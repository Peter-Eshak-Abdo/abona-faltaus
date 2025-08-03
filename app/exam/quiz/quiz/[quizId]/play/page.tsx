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
  const [timeLeft, setTimeLeft] = useState(5)
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
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, 5 - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        // Time's up, disable answering
        setHasAnswered(true)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState?.questionStartTime, gameState?.showResults, hasAnswered])

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

  if (!quiz || !gameState || !currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-4">Thanks for playing, {currentGroup.groupName}!</p>
              <p className="text-sm text-gray-500 mb-6">Check with your host for final results.</p>
              <Button onClick={() => router.push("/")} className="w-full">
                Done
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
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <Badge variant="secondary" className="mb-2">
              Question {gameState.currentQuestionIndex + 1} of {quiz.questions.length}
            </Badge>
            <h1 className="text-2xl font-bold">{currentGroup.groupName}</h1>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isCorrect ? (
                  <span className="text-green-600">Correct! 🎉</span>
                ) : (
                  <span className="text-red-600">Incorrect 😔</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">{currentQuestion.text}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.choices.map((choice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg flex items-center gap-3 ${
                        index === currentQuestion.correctAnswer
                          ? "bg-green-100 border-2 border-green-500"
                          : index === selectedAnswer
                            ? "bg-red-100 border-2 border-red-500"
                            : "bg-gray-50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${getChoiceColor(index)}`} />
                      <span className="font-medium">{choice}</span>
                      {index === currentQuestion.correctAnswer && (
                        <Badge className="ml-auto bg-green-500">Correct</Badge>
                      )}
                      {index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <Badge className="ml-auto bg-red-500">Your Answer</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <p className="text-gray-600">Waiting for next question...</p>
                  <div className="animate-pulse mt-2">
                    <div className="h-2 bg-blue-200 rounded-full"></div>
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary">
              Question {gameState.currentQuestionIndex + 1} of {quiz.questions.length}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil(timeLeft)}s
            </Badge>
          </div>
          <h1 className="text-xl font-bold flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            {currentGroup.groupName}
          </h1>
          <p className="text-sm text-gray-600">{currentGroup.members.join(", ")}</p>
        </motion.div>

        {/* Progress */}
        <Progress value={hasAnswered ? 100 : ((5 - timeLeft) / 5) * 100} className="mb-6" />

        {/* Question */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {currentQuestion.choices.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={hasAnswered || timeLeft === 0}
                      className={`p-4 rounded-lg flex items-center gap-4 text-left transition-all duration-200 ${
                        hasAnswered || timeLeft === 0
                          ? "cursor-not-allowed opacity-60"
                          : `cursor-pointer ${getChoiceColorHover(index)} transform hover:scale-105`
                      } ${
                        selectedAnswer === index ? "ring-2 ring-white shadow-lg" : ""
                      } ${getChoiceColor(index)} text-white font-semibold`}
                    >
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{choice}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-6 p-4 bg-blue-50 rounded-lg"
                >
                  <p className="text-blue-800 font-semibold">Answer submitted!</p>
                  <p className="text-blue-600 text-sm">Waiting for results...</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
