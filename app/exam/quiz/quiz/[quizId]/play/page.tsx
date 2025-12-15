"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getQuiz,
  subscribeToGameState,
  submitResponse,
  getQuizGroups,
  getQuestionResponses,
  deleteGroup,
  checkAndResetQuizIfNeeded,
} from "@/lib/firebase-utils"
import type { Quiz, GameState, Group, LeaderboardEntry, QuizResponse } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function PlayQuizPageTailwind() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [showResults, setShowResults] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState<number>(3)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [loading, setLoading] = useState(true)

  const quizId = params?.quizId as string

  const getStartMillis = (ts: any): number | null => {
    if (!ts) return null
    if (typeof ts?.toDate === "function") {
      return ts.toDate().getTime()
    }
    if (typeof ts === "number") {
      return ts > 1e12 ? ts : ts * 1000
    }
    const d = new Date(ts)
    if (!isNaN(d.getTime())) return d.getTime()
    return null
  }

  useEffect(() => {
    setLoading(true)
    const groupData = localStorage.getItem("currentGroup")
    if (!groupData) {
      router.push(`/exam/quiz/quiz/${quizId}/join`)
      return
    }
    try {
      setCurrentGroup(JSON.parse(groupData))
    } catch (e) {
      console.warn("Invalid currentGroup in localStorage, removing it.", e)
      localStorage.removeItem("currentGroup")
      router.push(`/exam/quiz/quiz/${quizId}/join`)
      return
    }
    loadQuiz()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, router])

  useEffect(() => {
    if (!quizId) return
    const unsubState = subscribeToGameState(quizId, (state) => {
      console.debug("gameState update:", state)
      setGameState(state)
      if (!state?.isActive) {
        setShowResults(true)
        setShowLeaderboard(true)
        return
      }

      if (state.questionStartTime && !state.showResults && !state.showQuestionOnly) {
        setSelectedAnswer(null)
        setHasAnswered(false)
        setShowResults(false)
        setShowLeaderboard(false)

        const startMillis = getStartMillis(state.questionStartTime)
        const timeLimit = state.currentQuestionTimeLimit || 20
        if (startMillis) {
          const elapsed = (Date.now() - startMillis) / 1000
          const remaining = Math.max(0, timeLimit - elapsed)
          setTimeLeft(Math.ceil(remaining))
        } else {
          setTimeLeft(timeLimit)
        }
      }

      if (state.showResults) {
        setShowResults(true)
        setShowLeaderboard(false)
      }
    })
    return () => {
      if (typeof unsubState === "function") unsubState()
    }
  }, [quizId])

  useEffect(() => {
    if (!quizId) return
    const unsubGroups = getQuizGroups(quizId, (updatedGroups) => {
      setGroups(updatedGroups)
      const lb = (updatedGroups || [])
        .map((g) => ({
          groupId: g.id,
          groupName: g.groupName,
          members: g.members,
          score: g.score || 0,
          saintName: g.saintName,
          saintImage: g.saintImage,
        }))
        .sort((a, b) => b.score - a.score)
      setLeaderboard(lb)
    })
    return () => {
      if (typeof unsubGroups === "function") unsubGroups()
    }
  }, [quizId])

  useEffect(() => {
    if (showResults && quizId && gameState?.currentQuestionIndex !== undefined) {
      getQuestionResponses(quizId, gameState.currentQuestionIndex)
        .then(setResponses)
        .catch(err => console.error("Failed to get question responses", err))
    }
  }, [showResults, quizId, gameState?.currentQuestionIndex])


  useEffect(() => {
    if (gameState?.showQuestionOnly && gameState.isActive) {
      setQuestionOnlyTimeLeft(3)
      const t = setInterval(() => {
        setQuestionOnlyTimeLeft((p) => {
          if (p <= 1) {
            clearInterval(t)
            return 0
          }
          return p - 1
        })
      }, 1000)
      return () => clearInterval(t)
    } else {
      setQuestionOnlyTimeLeft(3)
    }
  }, [gameState?.showQuestionOnly, gameState?.isActive, gameState?.currentQuestionIndex])

  useEffect(() => {
    if (!gameState?.questionStartTime || gameState.showResults || hasAnswered || gameState?.showQuestionOnly) return

    const startMillis = getStartMillis(gameState.questionStartTime)
    const timeLimit = gameState?.currentQuestionTimeLimit || 20

    if (!startMillis) {
      setTimeLeft(timeLimit)
      return
    }

    const t = setInterval(() => {
      const elapsed = (Date.now() - startMillis) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      if (!isFinite(remaining)) {
        setTimeLeft(timeLimit)
      } else {
        setTimeLeft(Math.ceil(remaining))
        if (remaining <= 0) setHasAnswered(true)
      }
    }, 250)

    return () => clearInterval(t)
  }, [gameState?.questionStartTime, gameState?.showResults, gameState?.currentQuestionTimeLimit, gameState?.showQuestionOnly, hasAnswered])

  useEffect(() => {
    if (showResults && !showLeaderboard && gameState?.isActive) {
      const t = setTimeout(() => setShowLeaderboard(true), 5000)
      return () => clearTimeout(t)
    }
  }, [showResults, showLeaderboard, gameState?.isActive])

  const loadQuiz = async () => {
    try {
      const data = await getQuiz(quizId)
      if (!data) {
        router.push("/")
        return
      }
      setQuiz(data)
    } catch (err) {
      console.error("loadQuiz", err)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered || !gameState?.questionStartTime || !currentGroup || gameState.showQuestionOnly) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)

    const startMillis = getStartMillis(gameState.questionStartTime)
    const timeTaken = startMillis ? (Date.now() - startMillis) / 1000 : 0
    const currentQuestion = gameState?.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz?.questions[gameState?.currentQuestionIndex]
    if (!currentQuestion) {
      console.warn("No currentQuestion to submit to.")
      return
    }

    try {
      await submitResponse(
        quizId,
        currentGroup.id,
        gameState.currentQuestionIndex,
        answerIndex,
        answerIndex === currentQuestion.correctAnswer,
        timeTaken
      );
    } catch (err) {
      console.error("submitResponse", err)
    }
  }

  const choiceColors = ["bg-red-600", "bg-green-600", "bg-blue-600", "bg-yellow-400"]
  const choiceTextColors = ["text-white", "text-white", "text-white", "text-black"]

  const currentQuestion = useMemo(() => {
    if (gameState?.currentQuestionIndex === undefined) return null
    return gameState?.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz?.questions?.[gameState?.currentQuestionIndex] || null
  }, [gameState?.shuffledQuestions, gameState?.currentQuestionIndex, quiz?.questions])

  const handleExitQuiz = async () => {
    if (!currentGroup) return
    try {
      await deleteGroup(quizId, currentGroup.id)
      localStorage.removeItem("currentGroup")
      router.push(`/exam/quiz/quiz/${quizId}/join`)
    } catch (err) {
      console.error("Error exiting quiz:", err)
      alert("حدث خطأ أثناء الخروج.")
    }
  }

  const handleResetQuiz = async () => {
    try {
      await checkAndResetQuizIfNeeded(quizId)
      setShowResetConfirm(false)
      alert("تمت محاولة إعادة التعيين.")
    } catch (err) {
      console.error("Error resetting quiz:", err)
      alert("فشل في إعادة التعيين.")
    }
  }

  if (loading || !quiz || !gameState || !currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="mb-1">جارٍ التحميل ...</div>
          <div className="w-16 h-16 rounded-full border-b-4 border-white animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!gameState.isActive) {
    if (gameState.currentQuestionIndex !== undefined) {
      return (
        <div className="min-h-screen p-1 ">
          <div className="max-w-6xl mx-auto text-center text-white">
            <h1 className="text-4xl font-extrabold mb-1">🎉 انتهت المسابقة!</h1>
            <p className="mb-1">شكراً لمشاركتكم — النتائج النهائية أدناه</p>
            <div className="space-y-1">
              {leaderboard.slice(0, 3).map((entry, idx) => (
                <div key={entry.groupId} className={`p-1 rounded-2xl ${idx === 0 ? "bg-white/20" : "bg-white/10"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="text-2xl font-bold">{idx + 1}</div>
                      {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-12 h-12 rounded-full border-2 border-white" />}
                      <div>
                        <div className="text-2xl font-bold">{entry.groupName}</div>
                        <div className="text-sm opacity-80">{entry.members.join(" || ")}</div>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold">{entry.score.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-1">
              <Button onClick={() => router.push("/")}>العودة للرئيسية</Button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className="min-h-screen p-1 ">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold mb-1">⏳ في انتظار بدء المسابقة</h1>
            <p>يرجى الانتظار حتى يبدأ المضيف المسابقة</p>
            <div className="mt-1">
              <div className="font-bold text-lg">{currentGroup.groupName}</div>
              <div className="text-sm">{currentGroup.members.join(" || ")}</div>
            </div>
            <div className="mt-1">
              <Button onClick={() => router.push(`/exam/quiz/quiz/${quizId}/join`)}>العودة لصفحة الانضمام</Button>
            </div>
          </div>
        </div>
      )
    }
  }

  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen p-1 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto bg-white/10 rounded-2xl p-1 text-center">
          <div className="text-lg font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
          <h2 className="text-3xl font-extrabold mt-1">{currentQuestion?.text}</h2>
          <div className="mt-1">ستظهر الاختيارات بعد {questionOnlyTimeLeft} ثانية</div>
        </div>
      </div>
    )
  }

  if (showResults && !showLeaderboard) {
    const stats = (currentQuestion?.choices || []).map((_, i) => ({ choice: i, count: responses.filter((r) => r.choiceIndex === i).length }))
    return (
      <div className="min-h-screen p-1 bg-linear-to-br from-blue-600 to-purple-700">
        <div className="max-w-6xl mx-auto text-center text-white">
          <h1 className="text-3xl font-bold mb-1">نتائج السؤال</h1>
          <div className="bg-white/10 p-1 rounded">
            <div className="text-xl font-semibold mb-1">{currentQuestion?.text}</div>
            <div className="space-y-1">
              {(currentQuestion?.choices || []).map((choice, idx) => {
                const isCorrect = idx === currentQuestion?.correctAnswer
                const count = stats.find((s) => s.choice === idx)?.count || 0
                return (
                  <div key={idx} className={`p-1 rounded flex items-center justify-between ${isCorrect ? "bg-green-50" : "bg-white/20"}`}>
                    <div className="flex items-center gap-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${choiceColors[idx] || "bg-gray-400"} ${choiceTextColors[idx]}`}>{["أ", "ب", "ج", "د"][idx]}</div>
                      <div className="font-medium">{choice}</div>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-1 text-white/80">في انتظار عرض الترتيب الحالي...</div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && showLeaderboard) {
    return (
      <div className="min-h-screen p-1 bg-linear-to-br from-purple-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-1">الترتيب الحالي</h1>
          <div className="space-y-1">
            {leaderboard.map((entry, idx) => (
              <div key={entry.groupId} className={`p-1 rounded-2xl flex items-center justify-between ${idx === 0 ? "bg-yellow-400 text-black" : "bg-white/10"}`}>
                <div className="flex items-center gap-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                  {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-14 h-14 rounded-full border-2" />}
                  <div>
                    <div className="font-bold text-xl">{entry.groupName}</div>
                    <div className="text-sm opacity-80">{entry.members.join(" || ")}</div>
                  </div>
                </div>
                <div className="text-3xl font-extrabold">{entry.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen p-1 bg-linear-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-1">⏳ في انتظار السؤال التالي</h1>
          <p>لا يوجد سؤال حالي — إذا استمر هذا، تواصل مع المضيف.</p>
          <pre className="text-xs mt-1 bg-black/20 p-2 rounded text-left">{JSON.stringify({ gameState }, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-1 bg-white/5 backdrop-blur-md">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-1">
          <div className="bg-white/10 rounded p-1 inline-block text-lg font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
          <div className="mt-1 font-bold text-white text-2xl">{currentGroup.groupName}</div>
          <div className="text-white/80 text-sm">{currentGroup.members.join(" || ")}</div>
        </div>

        <div className="bg-white/10 rounded-2xl p-1 mb-1 backdrop-blur-sm">
          <h2 className="text-4xl font-extrabold mb-1 text-white text-center">{currentQuestion.text}</h2>

          <div className="grid gap-1">
            {(currentQuestion.choices && currentQuestion.choices.length > 0 ? currentQuestion.choices : ["لا توجد اختيارات"]).map((choice, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={hasAnswered || timeLeft === 0}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn("p-1 rounded-lg text-right w-full font-bold text-lg shadow-md", hasAnswered || timeLeft === 0 ? "opacity-70 cursor-not-allowed" : "hover:scale-105 active:scale-95")}
                style={{ backgroundColor: ["#ef4444", "#16a34a", "#3b82f6", "#f59e0b"][idx] || "#6b7280", color: idx === 3 ? "black" : "white" }}
                aria-pressed={selectedAnswer === idx}
                aria-disabled={hasAnswered || timeLeft === 0}
              >
                <div className="flex justify-between items-center">
                  <div className="text-2xl">{choice}</div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold">{["أ", "ب", "ج", "د"][idx] ?? idx + 1}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {hasAnswered && (
            <div className="mt-1 p-1 rounded bg-white/10 text-center text-lg font-semibold text-white">تم إرسال الإجابة — في انتظار النتائج...</div>
          )}
        </div>

        <div className="flex justify-between items-center gap-1">
          <Button variant="outline" onClick={() => setShowExitConfirm(true)} className="bg-red-500 text-white">خروج</Button>
          <div className="bg-orange-500 text-white p-1 rounded font-bold">{Math.ceil(timeLeft)} ث</div>
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} className="bg-blue-500 text-white">إعادة تعيين</Button>
        </div>
      </div>

      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExitConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-1 rounded max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold mb-1">تأكيد الخروج</h3>
              <p className="mb-4">هل أنت متأكد من رغبتك في الخروج من المسابقة؟</p>
              <div className="flex gap-1">
                <Button onClick={() => setShowExitConfirm(false)}>إلغاء</Button>
                <Button onClick={handleExitQuiz} className="bg-red-500 text-white">خروج</Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResetConfirm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-1 rounded max-w-sm" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold mb-1">تأكيد إعادة التعيين</h3>
              <p className="mb-1">هل أنت متأكد؟ سيتم حذف الإجابات والنقاط.</p>
              <div className="flex gap-1">
                <Button onClick={() => setShowResetConfirm(false)}>إلغاء</Button>
                <Button onClick={handleResetQuiz} className="bg-blue-500 text-white">إعادة تعيين</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
