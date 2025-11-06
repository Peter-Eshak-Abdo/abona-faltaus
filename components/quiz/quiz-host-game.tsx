"use client"

import { useState, useEffect } from "react"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponsesOnce, updateGroupScores } from "@/lib/firebase-utils"
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

// التايمير مش ظاهر عندي في الhost game
// الاختيارات مش متلونة بالالوان بتاعتها (اخضر واحمر وازرق واصفر)
// الاسكور مش بيتحسب
// مش بيظهر حالة النتيجة الحالية (stats/leaderboard) بشكل صحيح
// حالة النتجة النهائية بتاعت ال 3 مراكز الاولي

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [previousLeaderboard, setPreviousLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState(5)

  // displayPhase: controls what right-panel shows while showResults === true
  // 'idle' -> during question (we won't show choice breakdown)
  // 'stats' -> show response stats (short)
  // 'leaderboard' -> show leaderboard
  const [displayPhase, setDisplayPhase] = useState<"idle" | "stats" | "leaderboard">("idle")

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

  // مؤقت الإجابة (host) — يعتمد على الوقت بالبداية
  useEffect(() => {
    if (!gameState.questionStartTime || gameState.showResults || gameState.showQuestionOnly) return

    const startTime = gameState.questionStartTime.getTime()
    const timeLimit = currentQuestion?.timeLimit || 20

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

  // Poll responses (server-side firestore read) — poll to update count & end early if all groups answered
  useEffect(() => {
    if (!gameState.isActive || gameState.showQuestionOnly) return

    let cancelled = false
    const pollResponses = async () => {
      try {
        const questionResponses = await getQuestionResponsesOnce(gameState.quizId, gameState.currentQuestionIndex)
        if (cancelled) return
        setResponses(questionResponses)

        // إذا أجاب جميع الفرق، أنهِ السؤال مبكراً
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

  // عندما يقوم السيرفر بتفعيل showResults نعرض أولاً إحصائيات (stats) ثم ننتقل للـ leaderboard
  useEffect(() => {
    if (gameState.showResults) {
      // عرض الإحصائيات أولاً
      setDisplayPhase("stats")
      // بعد فترة قصيرة ننتقل للترتيب
      const t = setTimeout(() => {
        calculateLeaderboard()
        setDisplayPhase("leaderboard")
        // تشغيل أنيميشن النقاط
        setTimeout(() => setShowScoreAnimation(true), 150)
      }, 2800) // عرض الإحصائيات ~2.8s (يمكن تعديل المدة)

      return () => clearTimeout(t)
    } else {
      // أثناء السؤال أو قبل النتائج: عد للـ idle
      setDisplayPhase("idle")
      setShowScoreAnimation(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // نظام النقاط: 1000 تقل مع الزمن (كما عندك) — نطبق على الإجابات الصحيحة فقط
    const correctResponses = responses.filter((r) => r.isCorrect).sort((a, b) => a.responseTime - b.responseTime)
    const newScores: { groupId: string; score: number }[] = []

    correctResponses.forEach((response) => {
      const points = Math.max(Math.round(1000 - (response.responseTime * 100)), 100)
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
        setError(error.message || "فشل في إنهاء المسابقة")
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
      setDisplayPhase("idle")
    } catch (error: any) {
      console.error("Error moving to next question:", error)
      setError(error.message || "فشل في الانتقال للسؤال التالي")
    } finally {
      setIsLoading(false)
    }
  }

  // ألوان الاختيارات: ترتيب ثابت (أزرق، أصفر، أخضر، أحمر)
  const getChoiceColor = (index: number) => {
    const colors = ["bg-green-500", "bg-red-500", "bg-blue-500", "bg-yellow-500"]
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

  // --- UI ---
  if (!gameState.isActive) {
    // عرض النتائج النهائية على شاشة الـ Host (podium)
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-blue-700 p-1">
        <div className="w-full max-w-7xl text-center bg-white rounded-2xl shadow-2xl p-1">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <svg className="w-12 h-12 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-1 text-gray-900">انتهت المسابقة!</h2>

          <div className="grid grid-cols-1 gap-1">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, scale: index === 0 ? 1.03 : 1 }}
                transition={{ delay: index * 0.2 }}
                className={`p-1 rounded-2xl ${index === 0 ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white" : index === 1 ? "bg-slate-100 text-slate-900" : "bg-linear-to-r from-orange-300 to-red-400 text-white"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-3xl ${index === 0 ? "bg-white text-yellow-500" : "bg-white/20"}`}>
                      {index + 1}
                    </div>
                    {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-16 h-16 rounded-full border-4 border-white object-cover" />}
                    <div className="text-right">
                      <h3 className="font-bold text-2xl">{entry.groupName}</h3>
                      <p className="text-lg opacity-90">{entry.members.join(" || ")}</p>
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

  // إظهار السؤال فقط (fullscreen) — موجود عندك مسبقاً
  if (gameState.showQuestionOnly) {
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

  // العرض الطبيعي: يمين الصفحة إما إحصائيات (stats) أو اللوحة (leaderboard)
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* LEFT: سؤال + اختيارات */}
        <div className="bg-white rounded-2xl shadow-lg p-1">
          <div className="bg-gray-100 p-1 rounded-lg mb-1">
            <h2 className="text-3xl font-bold">{currentQuestion.text}</h2>
          </div>

          <div className="space-y-1">
            {currentQuestion.choices.map((choice, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className={`p-1 rounded-xl flex items-center gap-1 ${gameState.showResults && index === currentQuestion.correctAnswer ? "ring-4 ring-green-500 bg-green-50 shadow-lg" : "bg-gray-50 hover:bg-gray-100"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg ${getChoiceColor(index)}`}>
                  {String.fromCharCode(65 + index)}
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

        {/* RIGHT: conditional panel */}
        <div className="bg-white rounded-2xl shadow-lg p-1">
          <div className="bg-gray-100 p-1 rounded-lg mb-1">
            <h2 className="text-2xl font-bold">{displayPhase === "leaderboard" ? "الترتيب الحالي" : displayPhase === "stats" ? "إحصائيات الاختيارات" : "حالة الأسئلة"}</h2>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {displayPhase === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center mb-1">
                    <div className="text-4xl font-bold text-gray-700">{responses.length} / {groups.length}</div>
                    <div className="text-gray-600">رد مستلم</div>
                  </div>
                  <div className="text-sm text-gray-600">تفصيل إحصائيات الاختيارات سيظهر بعد انتهاء السؤال.</div>
                </motion.div>
              )}

              {displayPhase === "stats" && (
                <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="text-center mb-1">
                    <div className="text-xl font-bold">{responses.length} / {groups.length} رد</div>
                    <div className="text-gray-600">إحصائيات الإجابات</div>
                  </div>

                  <div className="space-y-1">
                    {getResponseStats().map((stat, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getChoiceColor(index)}`}>{String.fromCharCode(65 + index)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div className="font-medium text-gray-900">{currentQuestion.choices[index]}</div>
                            <div className="font-bold text-gray-900">{stat.count}</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                            <div className={`${getChoiceColor(index)} h-3 rounded-full`} style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {displayPhase === "leaderboard" && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="space-y-1">
                    {leaderboard.map((entry, index) => {
                      const positionChange = getPositionChange(entry.groupId)
                      return (
                        <motion.div key={entry.groupId} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, scale: showScoreAnimation ? [1, 1.05, 1] : 1 }} transition={{ delay: index * 0.06 }}>
                          <div className={`p-1 rounded-lg flex items-center justify-between ${index === 0 ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white" : index === 1 ? "bg-slate-100 text-slate-900" : index === 2 ? "bg-linear-to-r from-orange-300 to-red-400 text-white" : "bg-white"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index < 3 ? "bg-white/20" : "bg-blue-500 text-white"}`}>{index + 1}</div>
                              {entry.saintImage && <img src={entry.saintImage || "/placeholder.svg"} alt={entry.saintName} className="w-8 h-8 rounded-full border-2 border-white object-cover" />}
                              <div>
                                <div className="font-bold">{entry.groupName}</div>
                                <div className="text-sm opacity-80">{entry.members.join(" • ")}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {positionChange > 0 && <div className="text-green-500 font-bold">↑{positionChange}</div>}
                              {positionChange < 0 && <div className="text-red-500 font-bold">↓{Math.abs(positionChange)}</div>}
                              <div className="font-bold text-lg">{entry.score.toLocaleString()}</div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
