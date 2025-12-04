"use client"

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Quiz, GameState, Group, LeaderboardEntry, QuizResponse } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Small helper: safe millis (if you already have /lib/utils/time.ts use that instead)
const toMillisSafe = (t?: any) => {
  if (!t) return undefined
  if (typeof t === "number") return t
  if (t?.toDate && typeof t.toDate === "function") {
    const d = t.toDate()
    return isNaN(d.getTime()) ? undefined : d.getTime()
  }
  const d = new Date(t)
  return isNaN(d.getTime()) ? undefined : d.getTime()
}

export default function PlayQuizPageTailwind() {
  const params = useParams()
  const router = useRouter()
  const quizId = params?.quizId as string

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
  const [loadingMsg, setLoadingMsg] = useState<string | null>("جارٍ التحميل...")
  const [fatalError, setFatalError] = useState<string | null>(null)

  // refs for unsubscribes
  const unsubRefs = useRef<{ unsubState?: Function; unsubGroups?: Function; unsubResponses?: Function }>({})

  // IMPORTANT: avoid top-level imports of modules that might reference `process`.
  // Do a small browser polyfill for `process` before any dynamic import runs.
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (globalThis as any).process === "undefined") {
      // lightweight polyfill just so modules that reference `process` don't throw.
      ; (globalThis as any).process = { env: {} }
      // Note: this is a safe temporary polyfill for the browser runtime.
      // If you prefer, remove later and fix server/client modules to not reference process at top-level.
      console.info("Injected lightweight process polyfill for browser.")
    }
  }, [])

  // load quiz metadata (dynamic import prevents early evaluation of firebase-utils)
  const loadQuiz = useCallback(async () => {
    if (!quizId) return
    setLoadingMsg("جارٍ تحميل بيانات المسابقة...")
    try {
      const mod = await import("@/lib/firebase-utils")
      const data = await mod.getQuiz(quizId)
      if (!data) {
        setFatalError("المسابقة غير موجودة أو انتهت صلاحيتها.")
        return
      }
      setQuiz(data)
    } catch (err: any) {
      console.error("loadQuiz error:", err)
      setFatalError("فشل في تحميل المسابقة. تأكد من الاتصال أو تهيئة Firebase.")
    } finally {
      setLoadingMsg(null)
    }
  }, [quizId])

  // subscribe to game state + groups (dynamic import)
  useEffect(() => {
    if (!quizId) return
    let mounted = true
    ;(async () => {
        try {
          const mod = await import("@/lib/firebase-utils")
          // groups
          const unsubGroups = mod.getQuizGroups(quizId, (updatedGroups: Group[]) => {
            if (!mounted) return
            setGroups(updatedGroups || [])
            // build leaderboard snapshot
            const lb = (updatedGroups || []).map((g) => ({
              groupId: g.id,
              groupName: g.groupName,
              members: g.members,
              score: g.score || 0,
              saintName: g.saintName,
              saintImage: g.saintImage,
            })).sort((a, b) => b.score - a.score)
            setLeaderboard(lb)
          })
          // game state
          const unsubState = mod.subscribeToGameState(quizId, (state: GameState | null) => {
            if (!mounted) return
            // normalize questionStartTime if Firestore Timestamp
            if (state?.questionStartTime) {
              const ms = toMillisSafe((state as any).questionStartTime)
              if (ms) (state as any).questionStartTime = new Date(ms)
            }
            setGameState(state || null)
            if (!state?.isActive) {
              setShowResults(true)
              setShowLeaderboard(true)
            }
            // set timeLeft when question starts
            if (state?.questionStartTime && !state.showResults && !state.showQuestionOnly) {
              setHasAnswered(false)
              setSelectedAnswer(null)
              setShowResults(false)
              setShowLeaderboard(false)
              setTimeLeft(state.currentQuestionTimeLimit || 20)
            }
          })

            unsubRefs.current.unsubGroups = unsubGroups
            unsubRefs.current.unsubState = unsubState
          } catch (err) {
            console.error("subscribe error:", err)
            setFatalError("فشل في الاشتراك لتحديث حالة المسابقة. تحقق من تهيئة firebase-utils.")
          }
      })()

    return () => {
      mounted = false
      try { if (typeof unsubRefs.current.unsubGroups === "function") unsubRefs.current.unsubGroups() } catch { }
      try { if (typeof unsubRefs.current.unsubState === "function") unsubRefs.current.unsubState() } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  // subscribe to question responses (when currentQuestionIndex is set)
  useEffect(() => {
    if (!quizId || gameState?.currentQuestionIndex === undefined) return
    let mounted = true
    ;(async () => {
      try {
        const mod = await import("@/lib/firebase-utils")
        const unsub = mod.getQuestionResponses(quizId, gameState.currentQuestionIndex, (updatedResponses: QuizResponse[]) => {
          if (!mounted) return
          setResponses(updatedResponses)
        })
        unsubRefs.current.unsubResponses = unsub
      } catch (err) {
        console.error("getQuestionResponses subscription error:", err)
      }
    })()

    return () => {
      mounted = false
      try { if (typeof unsubRefs.current.unsubResponses === "function") unsubRefs.current.unsubResponses() } catch { }
    }
  }, [quizId, gameState?.currentQuestionIndex])

  // question-only timer (client side)
  useEffect(() => {
    if (gameState?.showQuestionOnly && gameState.isActive) {
      setQuestionOnlyTimeLeft(3) // quick show for players
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

  // answer timer (client)
  useEffect(() => {
    if (!gameState?.questionStartTime || gameState.showResults || hasAnswered || gameState?.showQuestionOnly) return
    const start = toMillisSafe((gameState as any).questionStartTime) || Date.now()
    const timeLimit = gameState?.currentQuestionTimeLimit || 20
    const t = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) setHasAnswered(true)
    }, 250)
    return () => clearInterval(t)
  }, [gameState?.questionStartTime, gameState?.showResults, gameState?.currentQuestionTimeLimit, hasAnswered, gameState?.showQuestionOnly])

  // auto switch to leaderboard after showing results
  useEffect(() => {
    if (showResults && !showLeaderboard && gameState?.isActive) {
      const t = setTimeout(() => setShowLeaderboard(true), 5000)
      return () => clearTimeout(t)
    }
  }, [showResults, showLeaderboard, gameState?.isActive])

  useEffect(() => {
    if (!gameState?.isActive) {
      // clear stored group on quiz end
      localStorage.removeItem("currentGroup")
    }
  }, [gameState?.isActive])

  // load quiz metadata once
  useEffect(() => {
    loadQuiz()
  }, [loadQuiz])

  // helper: currentQuestion
  const currentQuestion = useMemo(() => {
    if (gameState?.currentQuestionIndex === undefined) return null
    return gameState?.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz?.questions?.[gameState.currentQuestionIndex] || null
  }, [gameState?.shuffledQuestions, gameState?.currentQuestionIndex, quiz?.questions])

  // handle submit answer (dynamic import)
  const handleAnswerSelect = async (answerIndex: number) => {
    if (!gameState || !currentGroup || !gameState.questionStartTime || hasAnswered || gameState.showQuestionOnly) return
    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    const responseTime = ((Date.now() - (toMillisSafe((gameState as any).questionStartTime) || Date.now())) / 1000) || 0
    try {
      const mod = await import("@/lib/firebase-utils")
      const currentQuestionLocal = gameState?.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz?.questions[gameState.currentQuestionIndex]
      await mod.submitResponse(quizId, {
        groupId: currentGroup.id,
        questionIndex: gameState.currentQuestionIndex,
        answer: answerIndex,
        isCorrect: answerIndex === currentQuestionLocal?.correctAnswer,
        responseTime,
      })
    } catch (err) {
      console.error("submitResponse error:", err)
    }
  }

  // exit & reset handlers (dynamic import)
  const handleExitQuiz = async () => {
    if (!currentGroup) return
    try {
      const mod = await import("@/lib/firebase-utils")
      await mod.deleteGroup(quizId, currentGroup.id)
      localStorage.removeItem("currentGroup")
      router.push(`/exam/quiz/quiz/${quizId}/join`)
    } catch (err) {
      console.error("Error exiting quiz:", err)
      alert("حدث خطأ أثناء الخروج. حاول مجددًا.")
    }
  }

  const handleResetQuiz = async () => {
    try {
      const mod = await import("@/lib/firebase-utils")
      await mod.checkAndResetQuizIfNeeded(quizId)
      setShowResetConfirm(false)
      alert("تمت إعادة التعيين (إن وُجدت حاجة لإعادة التعيين).")
    } catch (err) {
      console.error("Error resetting quiz:", err)
      alert("فشل في إعادة التعيين.")
    }
  }

  // --- render / fallbacks ---

  if (fatalError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg bg-white p-4 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
          <p className="mb-4">{fatalError}</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>إعادة تحميل</Button>
            <Button onClick={() => router.push("/")}>العودة للرئيسية</Button>
          </div>
          <pre className="text-xs mt-4 text-left bg-gray-50 p-2 rounded">{JSON.stringify({ quizId, gameState }, null, 2)}</pre>
        </div>
      </div>
    )
  }

  if (!quiz || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-purple-700">
        <div className="text-white text-center">
          <div className="mb-2">{loadingMsg || "جارٍ التحميل..."}</div>
          <div className="w-16 h-16 rounded-full border-b-4 border-white animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // If quiz ended
  if (!gameState.isActive) {
    if (gameState.currentQuestionIndex !== undefined) {
      // final results
      return (
        <div className="min-h-screen p-4 bg-linear-to-br from-yellow-400 via-orange-500 to-red-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl font-extrabold mb-2">🎉 انتهت المسابقة!</h1>
            <p className="mb-4">شكراً لمشاركتكم — النتائج النهائية أدناه</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 3).map((entry, idx) => (
                <Card key={entry.groupId} className={cn("p-2 rounded-2xl", idx === 0 ? "bg-linear-to-r from-yellow-400 to-orange-500 text-white" : idx === 1 ? "bg-slate-100 text-slate-900" : "bg-linear-to-r from-orange-300 to-red-400 text-white")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{idx + 1}</div>
                      {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-12 h-12 rounded-full border-2 border-white" />}
                      <div>
                        <div className="font-bold">{entry.groupName}</div>
                        <div className="text-sm opacity-80">{entry.members.join(" || ")}</div>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold">{entry.score.toLocaleString()}</div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => router.push("/")}>العودة للرئيسية</Button>
            </div>
          </div>
        </div>
      )
    } else {
      // waiting to start
      return (
        <div className="min-h-screen p-4 bg-linear-to-br from-blue-600 to-purple-700 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold mb-2">⏳ في انتظار بدء المسابقة</h1>
            <p>يرجى الانتظار حتى يبدأ المضيف المسابقة</p>
            <div className="mt-4">
              <div className="font-bold text-lg">{currentGroup?.groupName}</div>
              <div className="text-sm">{currentGroup?.members.join(" || ")}</div>
            </div>
          </div>
        </div>
      )
    }
  }

  // question-only view
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen p-4 bg-linear-to-br from-purple-600 to-blue-700">
        <div className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-md rounded p-4">
          <div className="text-lg font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
          <h2 className="text-2xl font-bold mt-2">{currentQuestion?.text || "لم يتم تحميل نص السؤال"}</h2>
          <div className="mt-3">ستظهر الاختيارات بعد {questionOnlyTimeLeft} ثانية</div>
        </div>
      </div>
    )
  }

  // results (stats only)
  if (showResults && !showLeaderboard) {
    const stats = (currentQuestion?.choices || []).map((_: any, i: number) => ({ choice: i, count: responses.filter((r) => r.answer === i).length }))
    return (
      <div className="min-h-screen p-4 bg-linear-to-br from-blue-600 to-purple-700">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-3xl font-bold mb-2">نتائج السؤال</h1>
          <div className="bg-white/20 p-4 rounded">
            <div className="text-xl font-semibold mb-2">{currentQuestion?.text}</div>
            <div className="space-y-2">
              {(currentQuestion?.choices || []).map((choice: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => {
                const isCorrect = idx === currentQuestion?.correctAnswer
                const count = stats.find((s: { choice: any }) => s.choice === idx)?.count || 0
                return (
                  <div key={idx} className={cn("p-2 rounded flex items-center justify-between", isCorrect ? "bg-green-50" : "bg-slate-50")}>
                    <div className="flex gap-3 items-center">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", typeof idx === "number" && idx < 2 ? "bg-blue-500 text-white" : "bg-gray-300")}>
                        {typeof idx === "number" && idx >= 0 && idx < 4 ? ["أ", "ب", "ج", "د"][idx] : (typeof idx === "number" ? idx + 1 : "")}
                      </div>
                      <div>{choice}</div>
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                )
              })}
            </div>
            <div className="text-center mt-3 text-slate-200">في انتظار عرض الترتيب الحالي...</div>
          </div>
        </div>
      </div>
    )
  }

  // full leaderboard
  if (showResults && showLeaderboard) {
    return (
      <div className="min-h-screen p-4 bg-linear-to-br from-purple-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2">الترتيب الحالي</h1>
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div key={entry.groupId} className={cn("p-3 rounded-2xl flex items-center justify-between", idx === 0 ? "bg-yellow-400 text-black" : idx === 1 ? "bg-slate-100 text-black" : "bg-white/20")}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold">{idx + 1}</div>
                  {entry.saintImage && <img src={entry.saintImage} alt={entry.saintName} className="w-12 h-12 rounded-full border-2" />}
                  <div>
                    <div className="font-bold">{entry.groupName}</div>
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

  // if no currentQuestion (safety)
  if (!currentQuestion) {
    return (
      <div className="min-h-screen p-4 bg-linear-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold mb-2">⏳ في انتظار السؤال التالي</h1>
          <p>لا يوجد سؤال حالي — إذا استمر هذا، تواصل مع المضيف.</p>
          <pre className="text-xs mt-3 bg-black/20 p-2 rounded text-left">{JSON.stringify({ gameState }, null, 2)}</pre>
        </div>
      </div>
    )
  }

  // main playing UI
  return (
    <div className="min-h-screen p-4 bg-linear-to-br from-blue-600/80 to-purple-700/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <div className="bg-white/20 rounded p-2 inline-block">{`السؤال ${gameState.currentQuestionIndex + 1} من ${quiz.questions.length}`}</div>
          <div className="mt-2 font-bold text-white">{currentGroup?.groupName}</div>
        </div>

        <div className="bg-white/20 rounded p-4 mb-4">
          <h2 className="text-xl font-bold mb-2">{currentQuestion.text}</h2>

          <div className="grid gap-2">
            {((currentQuestion.choices && currentQuestion.choices.length > 0) ? currentQuestion.choices : ["لا توجد اختيارات"]).map((choice: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, idx: React.Key | null | undefined) => (
              <motion.button
                key={idx}
                onClick={() => {
                  if (typeof idx === "number") handleAnswerSelect(idx)
                }}
                disabled={hasAnswered || timeLeft === 0}
                className={cn("p-3 rounded text-right w-full font-semibold", hasAnswered || timeLeft === 0 ? "opacity-60 cursor-not-allowed" : "hover:scale-105")}
                style={{ background: selectedAnswer === idx ? "#4f46e5" : undefined, color: selectedAnswer === idx ? "white" : undefined }}
              >
                <div className="flex justify-between items-center">
                  <div>{choice}</div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                    {typeof idx === "number" && idx >= 0 && idx < 4
                      ? ["أ", "ب", "ج", "د"][idx]
                      : typeof idx === "number"
                        ? idx + 1
                        : ""}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {hasAnswered && <div className="mt-2 text-center text-sm text-white/80">تم إرسال الإجابة — في انتظار النتائج...</div>}
        </div>

        <div className="flex justify-between items-center gap-2">
          <Button variant="outline" onClick={() => setShowExitConfirm(true)} className="bg-red-500 text-white">خروج</Button>
          <div className="bg-orange-500 text-white p-2 rounded font-bold">{Math.ceil(timeLeft)} ث</div>
          <Button variant="outline" onClick={() => setShowResetConfirm(true)} className="bg-blue-500 text-white">إعادة تعيين</Button>
        </div>
      </div>

      {/* Exit confirm modal (omitted for brevity) */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded max-w-sm">
              <h3 className="font-bold mb-2">تأكيد الخروج</h3>
              <p className="mb-4">هل تريد الخروج من المسابقة؟</p>
              <div className="flex gap-2">
                <Button onClick={() => setShowExitConfirm(false)}>إلغاء</Button>
                <Button onClick={handleExitQuiz}>خروج</Button>
              </div>
            </div>
          </motion.div>
        )}
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded max-w-sm">
              <h3 className="font-bold mb-2">تأكيد إعادة التعيين</h3>
              <p className="mb-4">هل أنت متأكد؟ سيتم حذف الإجابات والنقاط.</p>
              <div className="flex gap-2">
                <Button onClick={() => setShowResetConfirm(false)}>إلغاء</Button>
                <Button onClick={handleResetQuiz}>إعادة تعيين</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
