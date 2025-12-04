"use client"

import { useState, useEffect, useRef } from "react"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponsesOnce, updateGroupScores } from "@/lib/firebase-utils"
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { toMillis, safeCeil } from "@/lib/utils/time"

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [previousLeaderboard, setPreviousLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState(5)

  const [fullScreenPhase, setFullScreenPhase] = useState<"question" | "stats" | "leaderboard" | null>(null)
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const statsTimerRef = useRef<NodeJS.Timeout | null>(null)
  const leaderboardTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = gameState.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz.questions[gameState.currentQuestionIndex]
  const isLastQuestion = gameState.currentQuestionIndex >= quiz.questions.length - 1

  // question-only timer
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

  // Full screen phases sequence (safe durations)
  useEffect(() => {
    const questionDuration = Number(currentQuestion?.timeLimit ?? 20)

    if (gameState.isActive && !gameState.showQuestionOnly && !gameState.showResults) {
      setFullScreenPhase("question")
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      questionTimerRef.current = setTimeout(() => {
        setFullScreenPhase(null)
      }, Math.max(1, questionDuration) * 1000)

      return () => {
        if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      }
    } else if (gameState.showResults) {
      setFullScreenPhase("stats")
      if (statsTimerRef.current) clearTimeout(statsTimerRef.current)
      statsTimerRef.current = setTimeout(() => {
        calculateLeaderboard()
        setFullScreenPhase("leaderboard")
        setShowScoreAnimation(true)
        if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
        leaderboardTimerRef.current = setTimeout(() => {
          handleNextQuestion()
        }, 5000)
      }, 5000)

      return () => {
        if (statsTimerRef.current) clearTimeout(statsTimerRef.current)
        if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
      }
    } else {
      setFullScreenPhase(null)
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      if (statsTimerRef.current) clearTimeout(statsTimerRef.current)
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
    }
  }, [gameState.isActive, gameState.showQuestionOnly, gameState.showResults, gameState.currentQuestionIndex, currentQuestion?.timeLimit])

  // host timer — use toMillis to avoid Firestore Timestamp issues
  useEffect(() => {
    if (!gameState.questionStartTime || gameState.showResults || gameState.showQuestionOnly) return

    const startMs = toMillis(gameState.questionStartTime as any)
    const timeLimit = Number(currentQuestion?.timeLimit ?? 20)

    if (!startMs || !isFinite(timeLimit) || timeLimit <= 0) {
      setTimeLeft(timeLimit)
      return
    }

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startMs) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        handleTimeUp()
      }
    }, 100)

    return () => clearInterval(timer)
  }, [gameState.questionStartTime, gameState.showResults, gameState.showQuestionOnly, currentQuestion?.timeLimit])

  // Poll responses
  useEffect(() => {
    if (!gameState.isActive || gameState.showQuestionOnly) return

    let cancelled = false
    const pollResponses = async () => {
      try {
        const questionResponses = await getQuestionResponsesOnce(gameState.quizId, gameState.currentQuestionIndex)
        if (cancelled) return
        setResponses(questionResponses)

        if (questionResponses.length >= groups.length && !gameState.showResults) {
          handleTimeUp()
        }
      } catch (err) {
        console.error("Error polling responses:", err)
      }
    }

    const pollInterval = setInterval(pollResponses, 500)
    pollResponses()

    return () => {
      cancelled = true
      clearInterval(pollInterval)
    }
  }, [gameState.quizId, gameState.currentQuestionIndex, gameState.isActive, gameState.showQuestionOnly, groups.length, gameState.showResults])

  const handleTimeUp = async () => {
    if (gameState.showResults) return

    try {
      setIsLoading(true)
      await showQuestionResults(gameState.quizId)
    } catch (error: any) {
      console.error("Error showing results:", error)
      setError(error?.message || "فشل في إظهار النتائج")
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
      setError(error?.message || "فشل في الانتقال للسؤال التالي")
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

    // Apply points for correct responses — ensure responseTime is seconds
    const correctResponses = responses.filter((r) => r.isCorrect).sort((a, b) => (a.responseTime ?? 0) - (b.responseTime ?? 0))
    const newScores: { groupId: string; score: number }[] = []

    correctResponses.forEach((response) => {
      const respTime = Number(response.responseTime ?? 0)
      const points = Math.max(Math.round(1000 - respTime * 100), 100)
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
        setError(error?.message || "فشل في إنهاء المسابقة")
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
      setTimeLeft(quiz.questions[gameState.currentQuestionIndex + 1]?.timeLimit || 20)
      setFullScreenPhase(null)
    } catch (error: any) {
      console.error("Error moving to next question:", error)
      setError(error?.message || "فشل في الانتقال للسؤال التالي")
    } finally {
      setIsLoading(false)
    }
  }

  // UI helpers (unchanged)
  const getChoiceColor = (index: number) => {
    const base = ["bg-blue-500", "bg-yellow-500", "bg-green-500", "bg-red-500"]
    return base[index] ?? "bg-gray-500"
  }

  const getChoiceHover = (index: number) => {
    const h = ["hover:bg-blue-600", "hover:bg-yellow-600", "hover:bg-green-600", "hover:bg-red-600"]
    return h[index] ?? "hover:bg-gray-600"
  }

  const getChoiceLabel = (i: number) => ["أ", "ب", "ج", "د"][i] ?? `${i + 1}`

  const getChoiceStyle = (index: number) => {
    const colors = ["#3b82f6", "#eab308", "#22c55e", "#ef4444", "#6b7280"]
    return { backgroundColor: colors[index] ?? colors[4] }
  }

  const getResponseStats = () => {
    const stats = currentQuestion.choices.map((_, index) => ({
      choice: index,
      count: responses.filter((r) => r.answer === index).length,
    }))
    return stats
  }

  const getPositionChange = (groupId: string) => {
    const currentPos = leaderboard.findIndex((g) => g.groupId === groupId)
    const previousPos = previousLeaderboard.findIndex((g) => g.groupId === groupId)

    if (previousPos === -1) return 0
    return previousPos - currentPos
  }

  const handleSkipPhase = async () => {
    if (fullScreenPhase === "question") {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      if (isLastQuestion) {
        await endQuiz(gameState.quizId)
      } else {
        setFullScreenPhase(null)
      }
    } else if (fullScreenPhase === "stats") {
      if (statsTimerRef.current) clearTimeout(statsTimerRef.current)
      calculateLeaderboard()
      setFullScreenPhase("leaderboard")
      setShowScoreAnimation(true)
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
      leaderboardTimerRef.current = setTimeout(() => {
        handleNextQuestion()
      }, 5000)
    } else if (fullScreenPhase === "leaderboard") {
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
      handleNextQuestion()
    }
  }

  // Error modal to prevent accidental exit
  const ErrorModal = () => (
    <AnimatePresence>
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white p-4 rounded-lg max-w-md w-full">
            <h3 className="font-bold mb-2">حدث خطأ</h3>
            <p className="text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              <button onClick={() => setError(null)} className="flex-1 border p-2 rounded">ابقَ في الصفحة</button>
              <button onClick={() => { setError(null); window.location.reload() }} className="flex-1 bg-blue-500 text-white p-2 rounded">إعادة تحميل</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // --- UI ---
  if (!gameState.isActive) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-700 p-1 relative overflow-hidden">
        <ErrorModal />
        {/* Final podium UI (unchanged) */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="mb-1">
              <h1 className="text-6xl font-bold text-white mb-1 drop-shadow-2xl">🎉 انتهت المسابقة! 🎉</h1>
              <p className="text-2xl text-white/90">الفائزون النهائيون</p>
            </motion.div>

            <div className="flex justify-center items-end gap-1 mb-1">
              {/* second, first, third cards (same as before) */}
              {leaderboard[1] && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1, type: "spring", stiffness: 100 }} className="bg-slate-100 text-slate-900 p-1 rounded-t-2xl shadow-2xl w-64 h-48 flex flex-col justify-end">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-1">2</div>
                    {leaderboard[1].saintImage && <img src={leaderboard[1].saintImage} alt={leaderboard[1].saintName} className="w-12 h-12 rounded-full border-2 border-white object-cover mx-auto mb-1" />}
                    <h3 className="font-bold text-lg">{leaderboard[1].groupName}</h3>
                    <p className="text-sm opacity-80">{leaderboard[1].members.join(" • ")}</p>
                    <div className="text-xl font-bold mt-1">{leaderboard[1].score.toLocaleString()}</div>
                  </div>
                </motion.div>
              )}

              {leaderboard[0] && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 1, type: "spring", stiffness: 100 }} className="bg-linear-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-t-2xl shadow-2xl w-80 h-64 flex flex-col justify-end relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="text-4xl">👑</div>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 text-white rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-1">1</div>
                    {leaderboard[0].saintImage && <img src={leaderboard[0].saintImage} alt={leaderboard[0].saintName} className="w-16 h-16 rounded-full border-4 border-white object-cover mx-auto mb-1" />}
                    <h3 className="font-bold text-xl">{leaderboard[0].groupName}</h3>
                    <p className="text-sm opacity-90">{leaderboard[0].members.join(" • ")}</p>
                    <div className="text-2xl font-bold mt-1">{leaderboard[0].score.toLocaleString()}</div>
                  </div>
                </motion.div>
              )}

              {leaderboard[2] && (
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 100 }} className="bg-linear-to-r from-orange-300 to-red-400 text-white p-1 rounded-t-2xl shadow-2xl w-64 h-40 flex flex-col justify-end">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-1">3</div>
                    {leaderboard[2].saintImage && <img src={leaderboard[2].saintImage} alt={leaderboard[2].saintName} className="w-12 h-12 rounded-full border-2 border-white object-cover mx-auto mb-1" />}
                    <h3 className="font-bold text-lg">{leaderboard[2].groupName}</h3>
                    <p className="text-sm opacity-80">{leaderboard[2].members.join(" • ")}</p>
                    <div className="text-xl font-bold mt-1">{leaderboard[2].score.toLocaleString()}</div>
                  </div>
                </motion.div>
              )}
            </div>

            {leaderboard.length > 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.5 }} className="bg-white/10 backdrop-blur-md rounded-2xl p-1 max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-1">باقي المشاركين</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {leaderboard.slice(3).map((entry, index) => (
                    <motion.div key={entry.groupId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 + index * 0.1, duration: 0.3 }} className="bg-white/20 p-1 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">{index + 4}</div>
                        <div>
                          <div className="font-bold text-sm text-white">{entry.groupName}</div>
                          <div className="text-xs text-white/80">{entry.members.join(" • ")}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white">{entry.score.toLocaleString()}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // إظهار السؤال فقط (fullscreen) — موجود عندك مسبقاً
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen bg-transparent backdrop-blur-md p-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-1 bg-white rounded-2xl p-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</h1>
              <p className="text-gray-600 text-lg">{quiz.title}</p>
            </div>
            <div className="flex items-center gap-1 bg-purple-100 p-1 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-purple-600">{questionOnlyTimeLeft} ث</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-1 text-center">
              <h2 className="text-4xl font-bold mb-1">استعدوا للسؤال!</h2>
              <p className="text-6xl font-bold mb-1">{currentQuestion.text}</p>
              <div className="text-2xl">سيظهر الاختيارات خلال {questionOnlyTimeLeft} ثانية</div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Full screen phases
  if (fullScreenPhase === "question") {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-700 p-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4 bg-white rounded-2xl p-1">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</h1>
              <p className="text-gray-600 text-lg">{quiz.title}</p>
            </div>
            <div className="flex items-center gap-1 bg-purple-100 p-1 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-purple-600">{Math.ceil(timeLeft)} ث</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-1 text-center">
              <h2 className="text-4xl font-bold mb-1">السؤال</h2>
              <p className="text-6xl font-bold mb-1">{currentQuestion.text}</p>
              <div className="text-2xl">سيظهر الاختيارات خلال {Math.ceil(timeLeft)} ثانية</div>
            </div>
            <div className="p-1 text-center">
              <button onClick={handleSkipPhase} className="bg-orange-500 text-white font-bold py-1 px-1 rounded-xl">تخطي السؤال</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (fullScreenPhase === "stats") {
    return (
      <div className="min-h-screen bg-transparent backdrop-blur-md p-1">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-1">
            <div className="text-center mb-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">إحصائيات الإجابات</h2>
              <div className="text-lg font-bold">{responses.length} / {groups.length} رد</div>
            </div>

            <div className="space-y-1">
              {getResponseStats().map((stat, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium text-gray-900 text-sm">{currentQuestion.choices[index]}</div>
                      <div className="font-bold text-gray-900 text-sm">{stat.count}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
                      <div className="h-4 rounded-full" style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%`, backgroundColor: getChoiceStyle(index).backgroundColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-1 text-center">
              <button onClick={handleSkipPhase} className="bg-orange-500 text-white font-bold py-1 px-1 rounded-xl">تخطي الإحصائيات</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (fullScreenPhase === "leaderboard") {
    return (
      <div className="min-h-screen bg-transparent backdrop-blur-md p-1">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-1">
            <div className="text-center mb-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-1">الترتيب الحالي</h2>
            </div>

            <div className="space-y-1">
              {leaderboard.map((entry, index) => {
                const positionChange = getPositionChange(entry.groupId)
                return (
                  <motion.div key={entry.groupId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, scale: showScoreAnimation ? [1, 1.05, 1] : 1 }} transition={{ delay: index * 0.06 }}>
                    <div className={`p-1 rounded-lg flex items-center justify-between ${index === 0 ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white" : index === 1 ? "bg-slate-100 text-slate-900" : index === 2 ? "bg-linear-to-r from-orange-300 to-red-400 text-white" : "bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${index < 3 ? "bg-white/20" : "bg-blue-500 text-white"}`}>{index + 1}</div>
                        {entry.saintImage && <img src={entry.saintImage || "/placeholder.svg"} alt={entry.saintName} className="w-12 h-12 rounded-full border-2 border-white object-cover" />}
                        <div>
                          <div className="font-bold text-xl">{entry.groupName}</div>
                          <div className="text-sm opacity-80">{entry.members.join(" • ")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {positionChange > 0 && <div className="text-green-500 font-bold text-lg">↑{positionChange}</div>}
                        {positionChange < 0 && <div className="text-red-500 font-bold text-lg">↓{Math.abs(positionChange)}</div>}
                        <div className="font-bold text-2xl">{entry.score.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="p-1 text-center">
              <button onClick={handleSkipPhase} className="bg-orange-500 text-white font-bold py-1 px-1 rounded-xl">تخطي اللوحة</button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // العرض الطبيعي: يمين الصفحة إما إحصائيات (stats) أو اللوحة (leaderboard)
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <ErrorModal />
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* LEFT: سؤال + اختيارات */}
        <div className="bg-white rounded-2xl shadow-lg p-1">
          <div className="bg-gray-100 p-1 rounded-lg mb-1">

            {!gameState.showResults && !gameState.showQuestionOnly && (
              <div className="flex items-center gap-1 bg-purple-100 p-1 rounded-xl mb-1">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-purple-600">{Math.ceil(timeLeft)} ث</span>
              </div>
            )}

            <div className="space-y-1">
              {currentQuestion.choices.map((choice, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className={`p-1 rounded-xl flex items-center gap-1 ${gameState.showResults && index === currentQuestion.correctAnswer ? "ring-1 ring-green-500 bg-green-50 shadow-lg" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white" style={getChoiceStyle(index)}>
                    {getChoiceLabel(index)}
                  </div>
                  <div className="text-2xl flex-1 text-gray-900">{choice}</div>
                  {gameState.showResults && index === currentQuestion.correctAnswer && (
                    <div className="bg-green-500 text-white p-1 rounded-full text-sm font-bold">الإجابة الصحيحة</div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-1 flex gap-1">
              {!gameState.showResults && (
                <button onClick={handleForceNext} disabled={isLoading} className="flex-1 bg-orange-500 text-white font-bold py-1 rounded-xl">تخطي/إظهار النتائج</button>
              )}
              {gameState.showResults && (
                <button onClick={handleNextQuestion} disabled={isLoading} className="flex-1 bg-purple-600 text-white font-bold py-1 rounded-xl">
                  {isLoading ? "جاري..." : isLastQuestion ? "انهاء المسابقة" : "السؤال التالي"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: conditional panel */}
        <div className="bg-white rounded-2xl shadow-lg p-1">
          <div className="bg-gray-100 p-1 rounded-lg mb-1">
            <h2 className="text-2xl font-bold">حالة الأسئلة</h2>
          </div>

          <div>
            <div className="text-center mb-1">
              <div className="text-4xl font-bold text-gray-700">{responses.length} / {groups.length}</div>
              <div className="text-gray-600">رد مستلم</div>
            </div>
            {responses.length > 0 && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">إحصائيات الاختيارات</h3>
                {getResponseStats().map((stat, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={getChoiceStyle(index)}>
                      {getChoiceLabel(index)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-900">{currentQuestion.choices[index]}</div>
                        <div className="text-lg font-bold text-gray-700">{stat.count}</div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {responses.length === 0 && (
              <div className="text-sm text-gray-600">لم يتم استلام أي ردود بعد.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
