/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, subscribeToGameState, submitResponse } from "@/lib/firebase-utils"
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
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState(5)
  const quizId = params.quizId as string

  useEffect(() => {
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
        setShowResults(true)
        return
      }

      if (state.questionStartTime && !state.showResults && !state.showQuestionOnly) {
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

  // مؤقت إظهار السؤال فقط
  useEffect(() => {
    if (gameState?.showQuestionOnly && gameState.isActive) {
      const timer = setInterval(() => {
        setQuestionOnlyTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } else {
      setQuestionOnlyTimeLeft(5)
    }
  }, [gameState?.showQuestionOnly, gameState?.isActive, gameState?.currentQuestionIndex])

  // مؤقت الإجابة
  useEffect(() => {
    if (!gameState?.questionStartTime || gameState.showResults || hasAnswered || gameState.showQuestionOnly) return

    const startTime = gameState.questionStartTime.getTime()
    const timeLimit = gameState.currentQuestionTimeLimit || 30

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        setHasAnswered(true)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState?.questionStartTime, gameState?.showResults, gameState?.currentQuestionTimeLimit, gameState?.showQuestionOnly, hasAnswered])

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
    if (hasAnswered || !gameState?.questionStartTime || !currentGroup || gameState.showQuestionOnly) return

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    )
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-blue-700 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="text-center bg-white rounded-2xl shadow-2xl p-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">انتهى المسابقة!</h2>
            <p className="text-gray-600 mb-4 text-lg">شكراً لمشاركتكم، {currentGroup.groupName}!</p>
            <p className="text-sm text-gray-500 mb-8">تحققوا من النتائج النهائية مع الخادم.</p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 text-lg bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold"
            >
              تم
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[gameState.currentQuestionIndex]

  // إظهار السؤال فقط لمدة 5 ثوان
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 bg-white rounded-2xl p-6 shadow-xl">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
              </h1>
              <p className="text-gray-600 text-lg">{currentGroup.groupName}</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-purple-600">{questionOnlyTimeLeft}ث</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">استعدوا للسؤال!</h2>
              <p className="text-5xl font-bold mb-6">{currentQuestion.text}</p>
              <div className="text-2xl">سيظهر الاختيارات خلال {questionOnlyTimeLeft} ثانية</div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showResults && selectedAnswer !== null) {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="bg-white px-4 py-2 rounded-full text-lg font-bold text-gray-900 inline-block mb-4">
              السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
            </div>
            <h1 className="text-3xl font-bold text-white">{currentGroup.groupName}</h1>
            {currentGroup.saintImage && (
              <img
                src={currentGroup.saintImage || "/placeholder.svg"}
                alt={currentGroup.saintName}
                className="w-16 h-16 rounded-full mx-auto mt-4 border-4 border-white"
              />
            )}
          </motion.div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className={`text-center p-6 text-white ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
              <h2 className="text-2xl font-bold">
                {isCorrect ? <span>إجابة صحيحة! 🎉</span> : <span>إجابة خاطئة 😔</span>}
              </h2>
            </div>
            <div className="p-8">
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${getChoiceColor(index)}`}>
                        {getChoiceLabel(index)}
                      </div>
                      <span className="font-medium flex-1 text-gray-900">{choice}</span>
                      {index === currentQuestion.correctAnswer && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          الإجابة الصحيحة
                        </div>
                      )}
                      {index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          إجابتكم
                        </div>
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
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="bg-white px-4 py-2 rounded-full text-lg font-bold text-gray-900">
              السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
            </div>
            <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {Math.ceil(timeLeft)} ثانية
            </div>
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-3 text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            {currentGroup.groupName}
          </h1>
          <p className="text-white/80 mt-2">{currentGroup.members.join(" || ")}</p>
          {currentGroup.saintImage && (
            <img
              src={currentGroup.saintImage || "/placeholder.svg"}
              alt={currentGroup.saintName}
              className="w-16 h-16 rounded-full mx-auto mt-4 border-4 border-white"
            />
          )}
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: hasAnswered
                  ? "100%"
                  : `${((gameState.currentQuestionTimeLimit - timeLeft) / gameState.currentQuestionTimeLimit) * 100}%`
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <h2 className="text-center text-2xl font-bold">{currentQuestion.text}</h2>
            </div>
            <div className="p-8">
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
