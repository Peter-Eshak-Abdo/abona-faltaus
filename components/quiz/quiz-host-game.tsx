/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponsesOnce, updateGroupScores } from "@/lib/firebase-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Clock, Users, ArrowRight, AlertCircle, SkipForward } from 'lucide-react'
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [previousLeaderboard, setPreviousLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showingResults, setShowingResults] = useState(false)
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState(5)

  const currentQuestion = quiz.questions[gameState.currentQuestionIndex]
  const isLastQuestion = gameState.currentQuestionIndex >= quiz.questions.length - 1

  // مؤقت إظهار السؤال فقط لمدة 5 ثوان
  useEffect(() => {
    if (gameState.showQuestionOnly && gameState.isActive) {
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
  }, [gameState.showQuestionOnly, gameState.isActive, gameState.currentQuestionIndex])

  // مؤقت الإجابة
  useEffect(() => {
    if (!gameState.questionStartTime || gameState.showResults || gameState.showQuestionOnly) return

    const startTime = gameState.questionStartTime.getTime()
    const timeLimit = currentQuestion?.timeLimit || 30

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        handleTimeUp()
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState.questionStartTime, gameState.showResults, gameState.showQuestionOnly, currentQuestion?.timeLimit])

  // استطلاع الردود كل ثانية
  useEffect(() => {
    if (!gameState.isActive || gameState.showQuestionOnly) return

    const pollResponses = async () => {
      try {
        const questionResponses = await getQuestionResponsesOnce(gameState.quizId, gameState.currentQuestionIndex)
        setResponses(questionResponses)
      } catch (error) {
        console.error("Error polling responses:", error)
      }
    }

    const pollInterval = setInterval(pollResponses, 1000)
    pollResponses()

    return () => clearInterval(pollInterval)
  }, [gameState.quizId, gameState.currentQuestionIndex, gameState.isActive, gameState.showQuestionOnly])

  useEffect(() => {
    if (gameState.showResults) {
      calculateLeaderboard()
      setShowingResults(true)

      setTimeout(() => {
        setShowScoreAnimation(true)
      }, 1000)
    } else {
      setShowingResults(false)
      setShowScoreAnimation(false)
    }
  }, [gameState.showResults, responses])

  const handleTimeUp = async () => {
    if (gameState.showResults) return

    try {
      setIsLoading(true)
      await showQuestionResults(gameState.quizId)
    } catch (error: any) {
      console.error("Error showing results:", error)
      setError(error.message || "فشل في إظهار النتائج")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForceNext = async () => {
    try {
      setIsLoading(true)
      await showQuestionResults(gameState.quizId)
    } catch (error: any) {
      console.error("Error forcing next:", error)
      setError(error.message || "فشل في الانتقال للسؤال التالي")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateLeaderboard = () => {
    setPreviousLeaderboard([...leaderboard])

    const groupScores = new Map<string, number>()

    groups.forEach((group) => {
      groupScores.set(group.id, group.score || 0)
    })

    // نظام النقاط الجديد: 1000 نقطة ناقص الوقت بالميلي ثانية
    const correctResponses = responses.filter((r) => r.isCorrect).sort((a, b) => a.responseTime - b.responseTime)
    const newScores: { groupId: string; score: number }[] = []

    correctResponses.forEach((response) => {
      // حساب النقاط: 1000 - (وقت الاستجابة بالميلي ثانية / 10)
      const responseTimeMs = response.responseTime * 1000
      const points = Math.max(Math.round(1000 - (responseTimeMs / 10)), 50) // أقل نقاط 50

      const currentScore = groupScores.get(response.groupId) || 0
      const newScore = currentScore + points
      groupScores.set(response.groupId, newScore)

      newScores.push({ groupId: response.groupId, score: newScore })
    })

    if (newScores.length > 0) {
      updateGroupScores(gameState.quizId, newScores).catch(console.error)
    }

    const leaderboardEntries: LeaderboardEntry[] = groups
      .map((group) => ({
        groupId: group.id,
        groupName: group.groupName,
        members: group.members,
        score: groupScores.get(group.id) || 0,
        saintName: group.saintName,
        saintImage: group.saintImage,
      }))
      .sort((a, b) => b.score - a.score)

    setLeaderboard(leaderboardEntries)
  }

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      try {
        setIsLoading(true)
        await endQuiz(gameState.quizId)
      } catch (error: any) {
        setError(error.message || "فشل في إنهاء الامتحان")
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      await nextQuestion(gameState.quizId, gameState.currentQuestionIndex + 1)
      setResponses([])
      setTimeLeft(quiz.questions[gameState.currentQuestionIndex + 1]?.timeLimit || 30)
    } catch (error: any) {
      console.error("Error moving to next question:", error)
      setError(error.message || "فشل في الانتقال للسؤال التالي")
    } finally {
      setIsLoading(false)
    }
  }

  const getChoiceColor = (index: number) => {
    const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"]
    return colors[index] || "bg-gray-500"
  }

  const getResponseStats = () => {
    const stats = currentQuestion.choices.map((_, index) => ({
      choice: index,
      count: responses.filter((r) => r.answer === index).length,
    }))
    return stats
  }

  const getPositionChange = (groupId: string) => {
    const currentPos = leaderboard.findIndex(g => g.groupId === groupId)
    const previousPos = previousLeaderboard.findIndex(g => g.groupId === groupId)

    if (previousPos === -1) return 0
    return previousPos - currentPos
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
        <div className="w-full max-w-4xl text-center bg-white rounded-3xl shadow-2xl p-8 border-4 border-amber-200">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-gray-900">انتهى الامتحان!</h2>

          <div className="space-y-6">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3 }}
                className={`p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 ${index === 0
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xl"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-xl"
                      : "bg-gradient-to-r from-orange-300 to-red-400 text-white shadow-lg"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl ${index === 0 ? "bg-white text-amber-500" : "bg-white/20"
                      }`}>
                      {index + 1}
                    </div>
                    {entry.saintImage && (
                      <img
                        src={entry.saintImage || "/placeholder.svg"}
                        alt={entry.saintName}
                        className="w-12 h-12 rounded-full border-2 border-white object-cover"
                      />
                    )}
                    <div className="text-right">
                      <h3 className="font-bold text-2xl">{entry.groupName}</h3>
                      <p className="text-sm opacity-90">{entry.members.join(" • ")}</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold">{entry.score.toLocaleString()}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // إظهار السؤال فقط لمدة 5 ثوان
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 bg-white rounded-2xl p-6 shadow-xl border-4 border-purple-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
              </h1>
              <p className="text-gray-600 text-lg">{quiz.title}</p>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-xl">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-600">{questionOnlyTimeLeft}ث</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200"
          >
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">استعدوا للسؤال!</h2>
              <p className="text-6xl font-bold mb-6">{currentQuestion.text}</p>
              <div className="text-2xl">سيظهر الاختيارات خلال {questionOnlyTimeLeft} ثانية</div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white rounded-2xl p-6 shadow-xl border-4 border-amber-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}
            </h1>
            <p className="text-gray-600 text-lg">{quiz.title}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-xl">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{groups.length} مجموعة</span>
            </div>
            {!gameState.showResults && (
              <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-xl">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-600">{Math.ceil(timeLeft)}ث</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-xl border-4 border-amber-200">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.currentQuestionIndex / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Display */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-purple-200">
            <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white p-6">
              <h2 className="text-2xl font-bold">{currentQuestion.text}</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.choices.map((choice, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl flex items-center gap-3 transform hover:scale-105 transition-all duration-200 ${gameState.showResults && index === currentQuestion.correctAnswer
                        ? "ring-4 ring-green-500 bg-green-50 shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${getChoiceColor(index)} flex items-center justify-center text-white font-bold`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium text-lg flex-1">{choice}</span>
                    {gameState.showResults && index === currentQuestion.correctAnswer && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        الإجابة الصحيحة
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Admin Controls */}
              <div className="mt-6 flex gap-3">
                {!gameState.showResults && (
                  <button
                    onClick={handleForceNext}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <SkipForward className="w-5 h-5" />
                    تخطي الوقت
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Response Stats or Leaderboard */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
              <h2 className="text-2xl font-bold">
                {showingResults ? "الترتيب الحالي" : "الردود المباشرة"}
              </h2>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                {showingResults ? (
                  <motion.div
                    key="leaderboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {leaderboard.map((entry, index) => {
                      const positionChange = getPositionChange(entry.groupId)
                      return (
                        <motion.div
                          key={entry.groupId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: showScoreAnimation ? [1, 1.05, 1] : 1
                          }}
                          transition={{
                            delay: index * 0.1,
                            scale: { duration: 0.5, delay: 1 + index * 0.2 }
                          }}
                          className={`p-4 rounded-xl flex items-center justify-between transform transition-all duration-500 border-4 ${index === 0
                              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl border-amber-300"
                              : index === 1
                                ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-lg border-gray-300"
                                : index === 2
                                  ? "bg-gradient-to-r from-orange-300 to-red-400 text-white shadow-md border-orange-300"
                                  : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index < 3 ? "bg-white/20" : "bg-amber-500 text-white"
                              }`}>
                              {index + 1}
                            </div>
                            {entry.saintImage && (
                              <img
                                src={entry.saintImage || "/placeholder.svg"}
                                alt={entry.saintName}
                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                              />
                            )}
                            <div>
                              <div className="font-bold text-lg">{entry.groupName}</div>
                              <div className="text-sm opacity-75">{entry.members.join(" • ")}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {positionChange > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-green-500 font-bold"
                              >
                                ↑{positionChange}
                              </motion.div>
                            )}
                            {positionChange < 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 font-bold"
                              >
                                ↓{Math.abs(positionChange)}
                              </motion.div>
                            )}
                            <motion.div
                              className="text-2xl font-bold"
                              animate={showScoreAnimation ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                            >
                              {entry.score.toLocaleString()}
                            </motion.div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                ) : (
                  <motion.div
                    key="responses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-blue-600">
                        {responses.length} / {groups.length}
                      </div>
                      <div className="text-gray-600 text-lg">رد مستلم</div>
                    </div>

                    {getResponseStats().map((stat, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full ${getChoiceColor(index)}`} />
                        <div className="flex-1">
                          <div className="flex justify-between text-lg mb-2">
                            <span className="font-medium">{currentQuestion.choices[index]}</span>
                            <span className="font-bold">{stat.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${getChoiceColor(index)}`}
                              style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        {gameState.showResults && (
          <div className="mt-6 text-center">
            <button
              onClick={handleNextQuestion}
              disabled={isLoading}
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 text-xl flex items-center gap-3 mx-auto shadow-2xl transform hover:scale-105 border-4 border-amber-300"
            >
              {isLoading ? (
                "جاري التحميل..."
              ) : isLastQuestion ? (
                <>
                  <Trophy className="w-6 h-6" />
                  إنهاء الامتحان
                </>
              ) : (
                <>
                  <ArrowRight className="w-6 h-6" />
                  السؤال التالي
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
