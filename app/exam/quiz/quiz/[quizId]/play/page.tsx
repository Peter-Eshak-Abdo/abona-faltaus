"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Quiz, GameState, Group, LeaderboardEntry, QuizResponse } from "@/types/quiz"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { getQuiz, subscribeToGameState, getQuizGroups, getQuestionResponses, submitResponse } from "@/lib/supabase-utils"

const KAHOOT_SHAPES = [
  <svg key="triangle" viewBox="0 0 32 32" className="w-4 h-4 fill-white"><path d="M16 4L2 28h28L16 4z" /></svg>,
  <svg key="diamond" viewBox="0 0 32 32" className="w-4 h-4 fill-white"><path d="M16 2l14 14-14 14L2 16 16 2z" /></svg>,
  <svg key="circle" viewBox="0 0 32 32" className="w-4 h-4 fill-white"><circle cx="16" cy="16" r="14" /></svg>,
  <svg key="square" viewBox="0 0 32 32" className="w-4 h-4 fill-white"><rect x="4" y="4" width="24" height="24" rx="2" /></svg>
]

export default function PlayQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params?.quizId as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(20)
  const [showResults, setShowResults] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState<number>(3)
  const [loading, setLoading] = useState(true)

  const getStartMillis = (ts: any): number | null => {
    if (!ts) return null
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
      const parsed = JSON.parse(groupData)
      if (parsed.quiz_id !== quizId) {
        localStorage.removeItem("currentGroup")
        router.push(`/exam/quiz/quiz/${quizId}/join`)
        return
      }
      setCurrentGroup(parsed)
    } catch (e) {
      localStorage.removeItem("currentGroup")
      router.push(`/exam/quiz/quiz/${quizId}/join`)
      return
    }

    getQuiz(quizId).then(q => {
      setQuiz(q)
      setLoading(false)
    }).catch(() => router.push("/"))
  }, [quizId, router])

  useEffect(() => {
    if (!quizId) return
    const subscription = subscribeToGameState(quizId, (state) => {
      setGameState(state)

      if (!state?.is_active) {
        setShowResults(true)
        setShowLeaderboard(true)
        return
      }

      if (state.question_start_time && !state.show_results && !state.show_question_only) {
        setSelectedAnswer(null)
        setHasAnswered(false)
        setShowResults(false)
        setShowLeaderboard(false)

        const startMillis = getStartMillis(state.question_start_time)
        const timeLimit = state.current_question_time_limit || 20
        if (startMillis) {
          const elapsed = (Date.now() - startMillis) / 1000
          setTimeLeft(Math.ceil(Math.max(0, timeLimit - elapsed)))
        }
      }

      if (state.show_results) {
        setShowResults(true)
        setShowLeaderboard(false)
      }
    })
    return () => { subscription.unsubscribe() }
  }, [quizId])

  useEffect(() => {
    if (!quizId) return
    const subGroups = getQuizGroups(quizId, (updatedGroups) => {
      const lb = updatedGroups.map(g => ({
        groupId: g.id,
        groupName: g.group_name,
        members: g.members,
        score: g.score || 0,
        saintName: g.saint_name,
        saintImage: g.saint_image,
      })).sort((a, b) => b.score - a.score)
      setLeaderboard(lb)
    })
    return () => { subGroups.unsubscribe() }
  }, [quizId])

  useEffect(() => {
    if (gameState?.show_question_only && gameState.is_active) {
      setQuestionOnlyTimeLeft(3)
      const t = setInterval(() => {
        setQuestionOnlyTimeLeft(p => p <= 1 ? 0 : p - 1)
      }, 1000)
      return () => clearInterval(t)
    }
  }, [gameState?.show_question_only, gameState?.is_active])

  useEffect(() => {
    if (!gameState?.question_start_time || gameState.show_results || hasAnswered || gameState?.show_question_only) return

    const startMillis = getStartMillis(gameState.question_start_time)
    const timeLimit = gameState?.current_question_time_limit || 20

    if (!startMillis) return setTimeLeft(timeLimit)

    const t = setInterval(() => {
      const elapsed = (Date.now() - startMillis) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) setHasAnswered(true)
    }, 250)

    return () => clearInterval(t)
  }, [gameState?.question_start_time, gameState?.show_results, gameState?.show_question_only, hasAnswered])

  useEffect(() => {
    if (showResults && !showLeaderboard && gameState?.is_active) {
      const t = setTimeout(() => setShowLeaderboard(true), 5000)
      return () => clearTimeout(t)
    }
  }, [showResults, showLeaderboard, gameState?.is_active])

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered || !gameState?.question_start_time || !currentGroup || gameState.show_question_only) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)

    const startMillis = getStartMillis(gameState.question_start_time)
    const timeTaken = startMillis ? (Date.now() - startMillis) / 1000 : 0
    const currentQuestion = gameState?.shuffled_questions?.[gameState.current_question_index] || quiz?.questions[gameState?.current_question_index]

    if (!currentQuestion) return

    try {
      await submitResponse(quizId, currentGroup.id, {
        questionIndex: gameState.current_question_index,
        choiceIndex: answerIndex,
        isCorrect: answerIndex === currentQuestion.correctAnswer,
        timeTaken
      });
    } catch (err) { console.error(err) }
  }

  const choiceColors = ["bg-[#e21b3c]", "bg-[#1368ce]", "bg-[#d89e00]", "bg-[#26890c]"]
  const choiceTextColors = ["border-[#b0132b]", "border-[#0e4e9c]", "border-[#a67a00]", "border-[#1d6b08]"]

  const currentQuestion = useMemo(() => {
    if (gameState?.current_question_index === undefined || !quiz) return null
    return gameState?.shuffled_questions?.[gameState.current_question_index] || quiz.questions[gameState.current_question_index] || null
  }, [gameState, quiz])

  if (loading || !quiz || !gameState || !currentGroup) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">جاري التحميل...</div>
  }

  if (!gameState.is_active && showLeaderboard) {
    return (
      <div className="min-h-screen p-1 bg-slate-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold mb-1">🎉 انتهت المسابقة!</h1>
        <div className="w-full max-w-4xl space-y-1">
          {leaderboard.slice(0, 3).map((entry, idx) => (
            <div key={entry.groupId} className={`p-1 rounded-2xl flex items-center justify-between ${idx === 0 ? "bg-yellow-500 text-black" : "bg-white/10"}`}>
              <div className="flex items-center gap-1">
                <span className="text-3xl font-black">{idx + 1}</span>
                {entry.saintImage && <img src={entry.saintImage} className="w-8 h-12 rounded-full border-2 border-white" alt="" />}
                <div>
                  <h3 className="font-bold text-xl">{entry.groupName}</h3>
                  <p className="text-sm opacity-80">{entry.score} نقطة</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/")} className="mt-1 bg-blue-600 p-1 rounded-full font-bold">عودة للرئيسية</button>
      </div>
    )
  }

  if (gameState.show_question_only) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-1">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-1 text-center text-white w-full max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black mb-1">{currentQuestion?.text}</h2>
          <p className="text-2xl mt-1 animate-pulse">استعد... {questionOnlyTimeLeft}</p>
        </div>
      </div>
    )
  }

  if (showResults && !showLeaderboard) {
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
    const bgColor = selectedAnswer === null ? "bg-gray-800" : isCorrect ? "bg-green-500" : "bg-red-500";
    const title = selectedAnswer === null ? "انتهى الوقت!" : isCorrect ? "إجابة صحيحة! 🎉" : "إجابة خاطئة! ❌";

    return (
      <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-4 text-white`}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">{title}</h1>
        </motion.div>
      </div>
    )
  }

  if (hasAnswered && gameState.is_active && !showResults) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-1"></div>
        <h2 className="text-3xl font-bold text-gray-800">في انتظار الباقين...</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm p-1 flex justify-between items-center">
        <span className="font-bold text-xl">{currentGroup.group_name}</span>
        <span className="bg-purple-600 text-white p-1 rounded-full font-black text-2xl">{Math.ceil(timeLeft)}</span>
      </div>

      <div className="flex-1 flex flex-col p-1 max-w-5xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-1 text-center mb-1">
          <h2 className="text-3xl md:text-5xl font-black text-gray-800">{currentQuestion?.text}</h2>
        </div>

        <div className="grid grid-cols-2 gap-1 flex-1">
          {currentQuestion?.choices.map((choice, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              disabled={hasAnswered || timeLeft === 0}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative flex flex-col items-center justify-center p-1 rounded-2xl shadow-[0_8px_0_0] active:shadow-[0_0px_0_0] active:translate-y-2 transition-all",
                choiceColors[idx % 4], choiceTextColors[idx % 4]
              )}
            >
              <div className="mb-1">{KAHOOT_SHAPES[idx % 4]}</div>
              <span className="text-white font-black text-2xl md:text-4xl text-center">{choice}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
