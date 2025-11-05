"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  getQuiz,
  subscribeToGameState,
  submitResponse,
  getQuizGroups,
  getQuestionResponses,
} from "@/lib/firebase-utils"
import type { Quiz, GameState, Group, LeaderboardEntry, QuizResponse } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
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
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState<number>(5)

  const quizId = params?.quizId as string

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

    const unsubState = subscribeToGameState(quizId, (state) => {
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
        setTimeLeft(state.currentQuestionTimeLimit || 20)
      }

      if (state.showResults) {
        setShowResults(true)
        setShowLeaderboard(false)
      }
    })

    const unsubGroups = getQuizGroups(quizId, (updatedGroups) => {
      setGroups(updatedGroups)
      const lb = updatedGroups
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

    const unsubResponses = getQuestionResponses(
      quizId,
      gameState?.currentQuestionIndex || 0,
      (updatedResponses) => {
        setResponses(updatedResponses)
      }
    )

    return () => {
      if (typeof unsubState === "function") unsubState()
      if (typeof unsubGroups === "function") unsubGroups()
      if (typeof unsubResponses === "function") unsubResponses()
    }
  }, [quizId, gameState?.currentQuestionIndex])

  // question-only timer - تسريع لـ 3 ثوان بدلاً من 5
  useEffect(() => {
    if (gameState?.showQuestionOnly && gameState.isActive) {
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

  // answer timer
  useEffect(() => {
    if (!gameState?.questionStartTime || gameState.showResults || hasAnswered || gameState.showQuestionOnly) return

    const start = gameState.questionStartTime.getTime()
    const timeLimit = gameState.currentQuestionTimeLimit || 20

    const t = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(remaining)
      if (remaining === 0) setHasAnswered(true)
    }, 100)

    return () => clearInterval(t)
  }, [gameState?.questionStartTime, gameState?.showResults, gameState?.currentQuestionTimeLimit, gameState?.showQuestionOnly, hasAnswered])

  // auto switch to leaderboard after showing results
  useEffect(() => {
    if (showResults && !showLeaderboard && gameState?.isActive) {
      const t = setTimeout(() => setShowLeaderboard(true), 5000)
      return () => clearTimeout(t)
    }
  }, [showResults, showLeaderboard, gameState?.isActive])

    useEffect(() => {
    if (!gameState) return
    if (!gameState.isActive) {
      // نعيد تأكيد الترتيب النهائي عند الانتهاء
      const lb = groups
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
    }
  }, [gameState?.isActive, groups])

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
    } catch (err) {
      console.error("submitResponse", err)
    }
  }

  const getChoiceColor = (index: number) => {
    const base = ["bg-green-500", "bg-red-500", "bg-blue-500", "bg-yellow-500"]
    return base[index] ?? "bg-gray-500"
  }

  const getChoiceHover = (index: number) => {
    const h = ["hover:bg-green-600", "hover:bg-red-600", "hover:bg-blue-600", "hover:bg-yellow-600"]
    return h[index] ?? "hover:bg-gray-600"
  }

  const getChoiceLabel = (i: number) => ["أ", "ب", "ج", "د"][i] ?? `${i + 1}`

  if (!quiz || !gameState || !currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!gameState.isActive) {
    return (
      <div className="min-h-screen p-1 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600">
        <div className="max-w-8xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-1">
            <h1 className="text-5xl font-extrabold text-white mb-1">🎉 انتهت المسابقة!</h1>
            <p className="text-lg text-white/90">شكراً لمشاركتكم — النتائج النهائية أدناه</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-1">
            {leaderboard.slice(0, 3).map((entry, idx) => (
              <Card key={entry.groupId} className={cn("p-1 rounded-2xl", idx === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : idx === 1 ? "bg-slate-100 text-slate-900" : "bg-gradient-to-r from-orange-300 to-red-400 text-white")}>
                <div className="flex items-center gap-1">
                  <div className="text-4xl font-bold">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      {entry.saintImage && (
                        <img
                          src={entry.saintImage}
                          alt={entry.saintName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                        />
                      )}
                      <div>
                        <div className="text-2xl font-bold">{entry.groupName}</div>
                        <div className="text-sm opacity-80">{entry.members.join(" || ")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold">{entry.score.toLocaleString()}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-1 text-center">
            <Button onClick={() => router.push("/")}>العودة للرئيسية</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[gameState.currentQuestionIndex]

  // question-only view
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen p-1 bg-gradient-to-br from-purple-600 to-blue-700">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between bg-white rounded-2xl p-1 mb-1">
            <div>
              <div className="text-lg font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
              <div className="text-sm text-slate-600">{currentGroup.groupName}</div>
            </div>
            <div className="flex items-center gap-1 bg-purple-100 p-1 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
              <div className="font-bold text-purple-600">{questionOnlyTimeLeft} ث</div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-1 shadow-xl text-center">
            <h2 className="text-3xl font-bold mb-1">استعدوا للسؤال</h2>
            <p className="text-2xl font-semibold">{currentQuestion.text}</p>
            <p className="text-sm text-slate-500 mt-1">ستظهر الاختيارات بعد {questionOnlyTimeLeft} ثانية</p>
          </motion.div>
        </div>
      </div>
    )
  }

  // response stats
  if (showResults && !showLeaderboard) {
    const stats = currentQuestion.choices.map((_, i) => ({ choice: i, count: responses.filter((r) => r.answer === i).length }))

    return (
      <div className="min-h-screen p-1 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-8xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-1">
            <div className="inline-block bg-white/90 p-1 rounded-full font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
            <h1 className="text-3xl font-bold text-white mt-1">نتائج السؤال</h1>
          </motion.div>

          <Card className="p-1">
            <div className="space-y-1">
              <div className="text-xl font-semibold text-slate-800">{currentQuestion.text}</div>

              <div className="grid grid-cols-1 gap-1">
                {currentQuestion.choices.map((choice, idx) => {
                  const isCorrect = idx === currentQuestion.correctAnswer
                  const count = stats.find((s) => s.choice === idx)?.count || 0
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className={cn("p-1 rounded-lg flex items-center justify-between", isCorrect ? "bg-green-50 border border-green-300" : "bg-slate-50 border border-slate-200")}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-white", getChoiceColor(idx))}>{getChoiceLabel(idx)}</div>
                        <div className="font-medium text-slate-800">{choice}</div>
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                    </motion.div>
                  )
                })}
              </div>

              <div className="text-center text-slate-600">في انتظار عرض الترتيب الحالي...</div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // full leaderboard
  if (showResults && showLeaderboard) {
    return (
      <div className="min-h-screen p-1 bg-gradient-to-br from-purple-600 to-blue-700">
        <div className="max-w-8xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-1">
            <h1 className="text-4xl font-bold text-white">الترتيب الحالي</h1>
            <p className="text-white/80 mt-1">بعد السؤال {gameState.currentQuestionIndex + 1}</p>
          </motion.div>

          <div className="space-y-1">
            {leaderboard.map((entry, idx) => (
              <motion.div key={entry.groupId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} className={cn("p-1 rounded-2xl flex items-center justify-between", idx === 0 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : idx === 1 ? "bg-slate-100 text-slate-900" : idx === 2 ? "bg-gradient-to-r from-orange-300 to-red-400 text-white" : "bg-white")}>
                <div className="flex items-center gap-1">
                  <div className={cn("w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl", idx < 3 ? "bg-white/20" : "bg-blue-500 text-white")}>{idx + 1}</div>
                  {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-16 h-16 rounded-full object-cover border-2 border-white" />}
                  <div>
                    <div className="font-bold text-xl">{entry.groupName}</div>
                    <div className="text-sm opacity-80">{entry.members.join(" || ")}</div>
                  </div>
                </div>
                <div className="text-3xl font-extrabold">{entry.score.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-1 text-white/80">في انتظار السؤال التالي...</div>
        </div>
      </div>
    )
  }

  // main playing UI - تصميم أصغر
  return (
    <div className="min-h-screen p-1 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-8xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-1">
          <div className="flex flex-col md:flex-row items-center justify-between gap-1 mb-1">
            <div className="bg-white p-1 rounded-full font-bold text-sm">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
            <div className="flex items-center gap-1 bg-orange-500 text-white p-1 rounded-full font-bold text-sm">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" /></svg>
              {Math.ceil(timeLeft)} ث
            </div>
          </div>

          <div className="text-white text-lg font-bold">{currentGroup.groupName}</div>
          <div className="text-white/80 text-sm">{currentGroup.members.join(" || ")}</div>
        </motion.div>

        {/* Progress */}
        <div className="mb-1">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="h-2 rounded-full bg-orange-500 transition-all" style={{ width: hasAnswered ? "100%" : `${((gameState.currentQuestionTimeLimit - timeLeft) / gameState.currentQuestionTimeLimit) * 100}%` }} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-1 text-center">
              <h2 className="text-lg font-bold">{currentQuestion.text}</h2>
            </div>
            <div className="p-1">
              <div className="grid grid-cols-1 gap-1">
                <AnimatePresence>
                  {currentQuestion.choices.map((choice, idx) => (
                    <motion.button key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} onClick={() => handleAnswerSelect(idx)} disabled={hasAnswered || timeLeft === 0} className={cn("p-1 rounded-lg flex items-center gap-1 text-right w-full text-white font-semibold shadow-md transition-transform transform text-sm", (hasAnswered || timeLeft === 0) ? "opacity-60 cursor-not-allowed scale-100" : `${getChoiceHover(idx)} hover:scale-105 active:scale-95`, selectedAnswer === idx ? "ring-4 ring-white" : "", getChoiceColor(idx))}>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">{getChoiceLabel(idx)}</div>
                      <div className="flex-1 text-right">{choice}</div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {hasAnswered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 p-1 bg-blue-50 rounded-lg text-center">
                  <div className="text-blue-800 font-bold text-sm">تم إرسال الإجابة!</div>
                  <div className="text-blue-600 text-xs">في انتظار النتائج...</div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
