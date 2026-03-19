"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponses, updateGroupScores, checkAndResetQuizIfNeeded, cleanupOldGroups } from "@/lib/firebase-utils"
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion } from "framer-motion"

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const router = useRouter()
  const [responses, setResponses] = useState<QuizResponse[]>([])
  const [timeLeft, setTimeLeft] = useState(20)
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

  const [isEnding, setIsEnding] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const currentQuestion = gameState.shuffledQuestions?.[gameState.currentQuestionIndex] || quiz.questions[gameState.currentQuestionIndex]
  const isLastQuestion = gameState.currentQuestionIndex >= quiz.questions.length - 1
  const CHOICE_COLORS = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"]; // أحمر، أزرق، أصفر، أخضر

  // question-only timer (host)
  useEffect(() => {
    if (gameState.showQuestionOnly && gameState.isActive) {
      setQuestionOnlyTimeLeft(5)
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

  // Full screen phases sequence (host)
  useEffect(() => {
    if (gameState.isActive && !gameState.showQuestionOnly && !gameState.showResults) {
      setFullScreenPhase("question")
      const questionDuration = currentQuestion?.timeLimit || 20
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      questionTimerRef.current = setTimeout(() => {
        setFullScreenPhase(null)
      }, questionDuration * 1000)
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
  }, [gameState.isActive, gameState.showQuestionOnly, gameState.showResults, gameState.currentQuestionIndex, currentQuestion?.timeLimit]) // eslint-disable-line

  // host timer (display)
  useEffect(() => {
    if (!gameState.questionStartTime || gameState.showResults || gameState.showQuestionOnly) return

    const startTime = new Date(gameState.questionStartTime).getTime()
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
  }, [gameState.questionStartTime, gameState.showResults, gameState.showQuestionOnly, currentQuestion?.timeLimit]) // eslint-disable-line

  // Poll responses (short-poll) to update count & possibly end early
  useEffect(() => {
    if (!gameState.isActive || gameState.showQuestionOnly) return
    let cancelled = false

    const pollResponses = async () => {
      try {
        const questionResponses = await getQuestionResponses(quiz.id, gameState.currentQuestionIndex)
        if (cancelled) return
        setResponses(questionResponses || [])
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
      await showQuestionResults(quiz.id)
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
      await showQuestionResults(quiz.id)
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
    groups.forEach((g) => {
      groupScores.set(g.id, g.score || 0)
    })

    const correctResponses = (responses || []).filter((r) => r.isCorrect).sort((a, b) => a.timeTaken - b.timeTaken)
    const newScores: { groupId: string; score: number }[] = []

    correctResponses.forEach((response) => {
      const points = Math.max(Math.round(1000 - (response.timeTaken * 100)), 100)
      const currentScore = groupScores.get(response.groupId) || 0
      const newScore = currentScore + points
      groupScores.set(response.groupId, newScore)
      newScores.push({ groupId: response.groupId, score: newScore })
    })

    if (newScores.length > 0) {
      const scoresToUpdate = Object.fromEntries(groupScores.entries());
      updateGroupScores(quiz.id, scoresToUpdate).catch(console.error)
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
        await endQuiz(quiz.id)
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
      await nextQuestion(quiz.id, gameState.currentQuestionIndex + 1)
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

  const getChoiceStyle = (index: number) => ({ backgroundColor: CHOICE_COLORS[index] ?? "#6b7280" });

  const getChoiceLabel = (i: number) => ["أ", "ب", "ج", "د"][i] ?? `${i + 1}`

  const getResponseStats = () => {
    const stats = (currentQuestion?.choices || []).map((_, index) => ({
      choice: index,
      count: (responses || []).filter((r) => r.choiceIndex === index).length,
    }))
    return stats
  }

  const getPositionChange = (groupId: string) => {
    const currentPos = leaderboard.findIndex(g => g.groupId === groupId)
    const previousPos = previousLeaderboard.findIndex(g => g.groupId === groupId)

    if (previousPos === -1) return 0
    return previousPos - currentPos
  }

  // --- New host controls: End quiz / Reset quiz / Exit host UI ---
  const handleEndQuiz = async () => {
    if (!confirm("هل تريد إنهاء المسابقة الآن؟")) return
    setIsEnding(true)
    try {
      await endQuiz(quiz.id)
    } catch (err) {
      console.error("End quiz failed:", err)
      setError("فشل في إنهاء المسابقة")
    } finally {
      setIsEnding(false)
    }
  }

  const handleResetQuiz = async () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين المسابقة؟ سيتم حذف الإجابات والنقاط.")) return
    setIsResetting(true)
    try {
      await cleanupOldGroups(quiz.id);
      await checkAndResetQuizIfNeeded(quiz.id)
      window.location.reload(); // لإعادة شحن الواجهة كلياً
      alert("تمت محاولة إعادة التعيين (إن كان مطلوب).")
    } catch (err) {
      console.error("Reset failed:", err)
      setError("فشل في إعادة التعيين")
    } finally {
      setIsResetting(false)
    }
  }

  const handleExitHost = () => router.push("/")

  const handleSkipPhase = async () => {
    if (fullScreenPhase === "question") {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current)
      if (isLastQuestion) {
        await endQuiz(quiz.id)
      } else {
        setFullScreenPhase(null)
      }
    } else if (fullScreenPhase === "stats") {
      if (statsTimerRef.current) clearTimeout(statsTimerRef.current)
      calculateLeaderboard()
      setFullScreenPhase("leaderboard")
      setShowScoreAnimation(true)
      leaderboardTimerRef.current = setTimeout(() => {
        handleNextQuestion()
      }, 5000)
    } else if (fullScreenPhase === "leaderboard") {
      if (leaderboardTimerRef.current) clearTimeout(leaderboardTimerRef.current)
      handleNextQuestion()
    }
  }

  // if quiz not active -> final podium view (host)
  if (!gameState.isActive) {
    return (
      //   <div className="min-h-screen p-1 relative overflow-hidden">
      //     <div className="flex items-center justify-between mb-1">
      //       <div>
      //         <h1 className="text-4xl font-bold text-white drop-shadow">🎉 انتهت المسابقة! 🎉</h1>
      //         <p className="text-white/90">الفائزون النهائيون</p>
      //       </div>
      //       <div className="flex gap-1">
      //         <button type="button" onClick={handleResetQuiz} disabled={isResetting} className="p-1 rounded-xl bg-blue-600 text-white">{isResetting ? "جاري..." : "إعادة تعيين"}</button>
      //         <button type="button" onClick={handleExitHost} className="p-1 rounded-xl bg-gray-200 text-black">خروج</button>
      //       </div>
      //     </div>

      //     <div className="flex items-center justify-center min-h-[60vh]">
      //       <div className="text-center w-full max-w-6xl">
      //         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="mb-1">
      //           <div className="grid grid-cols-1 md:grid-cols-3 gap-1 items-end">
      //             {/* second place */}
      //             {leaderboard[1] && (
      //               <div className="bg-white/20 text-white p-1 rounded-2xl shadow-lg">
      //                 <div className="text-2xl font-bold">2</div>
      //                 {leaderboard[1].saintImage && <img src={leaderboard[1].saintImage} alt={leaderboard[1].saintName} className="w-16 h-16 rounded-full mx-auto my-1" />}
      //                 <div className="font-bold">{leaderboard[1].groupName}</div>
      //                 <div className="text-sm opacity-80">{leaderboard[1].members.join(" • ")}</div>
      //                 <div className="text-xl font-bold mt-1">{leaderboard[1].score.toLocaleString()}</div>
      //               </div>
      //             )}

      //             {/* first place */}
      //             {leaderboard[0] && (
      //               <div className="bg-yellow-400 text-black p-1 rounded-2xl shadow-2xl">
      //                 <div className="text-4xl font-bold">👑 1</div>
      //                 {leaderboard[0].saintImage && <img src={leaderboard[0].saintImage} alt={leaderboard[0].saintName} className="w-24 h-24 rounded-full mx-auto my-1 border-4 border-white" />}
      //                 <div className="font-bold text-2xl">{leaderboard[0].groupName}</div>
      //                 <div className="text-sm opacity-80">{leaderboard[0].members.join(" • ")}</div>
      //                 <div className="text-3xl font-bold mt-1">{leaderboard[0].score.toLocaleString()}</div>
      //               </div>
      //             )}

      //             {/* third place */}
      //             {leaderboard[2] && (
      //               <div className="bg-white/20 text-white p-1 rounded-2xl shadow-lg">
      //                 <div className="text-2xl font-bold">3</div>
      //                 {leaderboard[2].saintImage && <img src={leaderboard[2].saintImage} alt={leaderboard[2].saintName} className="w-16 h-16 rounded-full mx-auto my-1" />}
      //                 <div className="font-bold">{leaderboard[2].groupName}</div>
      //                 <div className="text-sm opacity-80">{leaderboard[2].members.join(" • ")}</div>
      //                 <div className="text-xl font-bold mt-1">{leaderboard[2].score.toLocaleString()}</div>
      //               </div>
      //             )}
      //           </div>
      //         </motion.div>

      //         {leaderboard.length > 3 && (
      //           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1">
      //             <h3 className="text-xl font-bold text-white mb-1">باقي المشاركين</h3>
      //             <div className="grid gap-1">
      //               {leaderboard.slice(3).map((entry, idx) => (
      //                 <div key={entry.groupId} className="flex items-center justify-between bg-white/20 p-1 rounded">
      //                   <div className="flex items-center gap-1">
      //                     <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">{idx + 4}</div>
      //                     <div>
      //                       <div className="font-bold">{entry.groupName}</div>
      //                       <div className="text-xs opacity-80">{entry.members.join(" • ")}</div>
      //                     </div>
      //                   </div>
      //                   <div className="font-bold">{entry.score.toLocaleString()}</div>
      //                 </div>
      //               ))}
      //             </div>
      //           </div>
      //         )}

      //       </div>
      //     </div>
      //   </div>
      <div className="min-h-screen bg-linear-to-b from-purple-900 via-blue-900 to-black p-1 text-white">
        <div className="text-center mb-1">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-black mb-1 animate-bounce"
          >
            🏆 أبطال المسابقة 🏆
          </motion.h1>
        </div>

        <div className="flex flex-row justify-center items-end gap-1 h-[50vh] max-w-5xl mx-auto">
          {/* المركز الثاني */}
          {leaderboard[1] && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: '60%' }}
              className="flex flex-col items-center w-1/3"
            >
              <img src={leaderboard[1].saintImage} className="w-20 h-20 rounded-full border border-gray-400 mb-1" />
              <div className="bg-gray-400 w-full rounded-t-lg p-1 text-center text-black font-bold">
                <p className="text-xl">{leaderboard[1].groupName}</p>
                <p className="text-2xl">2</p>
              </div>
            </motion.div>
          )}

          {/* المركز الأول */}
          {leaderboard[0] && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: '80%' }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center w-1/3"
            >
              <div className="text-5xl mb-1">👑</div>
              <img src={leaderboard[0].saintImage} className="w-32 h-32 rounded-full border border-yellow-400 mb-1 shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
              <div className="bg-yellow-400 w-full rounded-t-lg p-1 text-center text-black font-black">
                <p className="text-2xl">{leaderboard[0].groupName}</p>
                <p className="text-4xl">1</p>
              </div>
            </motion.div>
          )}

          {/* المركز الثالث */}
          {leaderboard[2] && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: '40%' }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center w-1/3"
            >
              <img src={leaderboard[2].saintImage} className="w-16 h-16 rounded-full border border-orange-600 mb-1" />
              <div className="bg-orange-600 w-full rounded-t-lg p-1 text-center text-black font-bold">
                <p className="text-lg">{leaderboard[2].groupName}</p>
                <p className="text-xl">3</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* أزرار التحكم بعد النهاية */}
        <div className="mt-1 flex justify-center gap-1">
          <button onClick={handleResetQuiz} className="bg-white text-purple-900 p-1 rounded-full font-bold hover:scale-105 transition">مسابقة جديدة</button>
          <button onClick={handleExitHost} className="bg-purple-700 p-1 rounded-full font-bold">خروج</button>
        </div>
      </div>
    )
  }

  // question-only full screen
  if (gameState.showQuestionOnly) {
    return (
      <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
        <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1 text-center">
          <div className="text-4xl font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
          <h2 className="text-8xl font-extrabold mt-1">{currentQuestion?.text}</h2>
          <div className="mt-1 text-2xl">ستظهر الاختيارات خلال {questionOnlyTimeLeft} ثانية</div>
        </div>
      </div>
    )
  }

  // full screen question phase
  if (fullScreenPhase === "question") {
    return (
      <div className="min-h-screen p-1">
        <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h1 className="text-3xl font-bold text-white">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</h1>
              <p className="text-white/80 text-5xl">{quiz.title}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={handleSkipPhase} className="p-1 rounded bg-orange-500 text-white">تخطي</button>
              <button onClick={handleEndQuiz} disabled={isEnding} className="p-1 rounded bg-red-600 text-white">{isEnding ? "جاري..." : "إنهاء"}</button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-1">{currentQuestion?.text}</h2>
            <div className="text-2xl text-white">يبقى {Math.ceil(timeLeft)} ث</div>
          </div>
        </div>
      </div>
    )
  }

  if (fullScreenPhase === "stats") {
    return (
      <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
        <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1">
          <div className="text-center mb-1">
            <h2 className="text-2xl font-bold">إحصائيات الإجابات</h2>
            <div className="text-lg font-bold">{responses.length} / {groups.length} رد</div>
          </div>

          <div className="space-y-1">
            {getResponseStats().map((stat, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium">{currentQuestion?.choices[index]}</div>
                    <div className="font-bold">{stat.count}</div>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className="h-2 rounded" style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%`, backgroundColor: getChoiceStyle(index).backgroundColor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-1">
            <button onClick={handleSkipPhase} className="p-1 rounded bg-orange-500 text-white">تخطّي الإحصائيات</button>
            <button onClick={handleResetQuiz} disabled={isResetting} className="ml-1 p-1 rounded bg-blue-600 text-white">{isResetting ? "جاري..." : "إعادة تعيين"}</button>
          </div>
        </div>
      </div>
    )
  }

  if (fullScreenPhase === "leaderboard") {
    return (
      <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
        <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1">
          <div className="text-center mb-1">
            <h2 className="text-3xl font-bold">الترتيب الحالي</h2>
          </div>

          <div className="space-y-1">
            {leaderboard.map((entry, index) => {
              const positionChange = getPositionChange(entry.groupId)
              return (
                <motion.div key={entry.groupId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, scale: showScoreAnimation ? [1, 1.05, 1] : 1 }} transition={{ delay: index * 0.06 }}>
                  <div className={`p-1 rounded-lg flex items-center justify-between ${index === 0 ? "bg-yellow-400 text-black" : index === 1 ? "bg-white/20 text-black" : "bg-white/10"}`}>
                    <div className="flex items-center gap-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${index < 3 ? "bg-white/20" : "bg-blue-500 text-white"}`}>{index + 1}</div>
                      {entry.saintImage && <img src={entry.saintImage || "/placeholder.svg"} alt={entry.saintName} className="w-12 h-12 rounded-full border-2 object-cover" />}
                      <div>
                        <div className="font-bold">{entry.groupName}</div>
                        <div className="text-sm opacity-80">{entry.members.join(" • ")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {positionChange > 0 && <div className="text-green-500 font-bold">↑{positionChange}</div>}
                      {positionChange < 0 && <div className="text-red-500 font-bold">↓{Math.abs(positionChange)}</div>}
                      <div className="font-bold text-2xl">{entry.score.toLocaleString()}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="text-center mt-1">
            <button onClick={handleSkipPhase} className="p-1 rounded bg-orange-500 text-white">تخطي اللوحة</button>
            <button onClick={handleEndQuiz} disabled={isEnding} className="ml-1 p-1 rounded bg-red-600 text-white">{isEnding ? "جاري..." : "إنهاء المسابقة"}</button>
          </div>
        </div>
      </div>
    )
  }

  // default: normal host view (question + side stats)
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="text-lg font-bold">السؤال {gameState.currentQuestionIndex + 1} من {quiz.questions.length}</div>
              <div className="text-sm text-gray-600">{quiz.title}</div>
            </div>

            <div className="flex gap-1">
              <button onClick={handleEndQuiz} disabled={isEnding} className="p-1 rounded bg-red-600 text-white">{isEnding ? "جاري..." : "إنهاء"}</button>
              <button onClick={handleResetQuiz} disabled={isResetting} className="p-1 rounded bg-blue-600 text-white">{isResetting ? "جاري..." : "إعادة تعيين"}</button>
              <button onClick={handleExitHost} className="p-1 rounded bg-gray-200">خروج</button>
            </div>
          </div>

          <div className="space-y-1 grid grid-cols-2 gap-1 mt-3">
            {(currentQuestion?.choices || []).map((choice, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className={`p-1 rounded-lg flex items-center justify-between ${gameState.showResults && index === currentQuestion.correctAnswer ? "ring-1 ring-green-500 bg-green-50 shadow" : "bg-white/20 hover:bg-white/30"}`} style={getChoiceStyle(index)}>
                <div className="flex items-center gap-1">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</span>
                  {choice}
                </div>
                {gameState.showResults && index === currentQuestion.correctAnswer && (
                  <div className="bg-green-500 text-white p-1 rounded-full text-sm font-bold">الإجابة الصحيحة</div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-1 flex gap-1">
            {!gameState.showResults && (
              <button onClick={handleForceNext} disabled={isLoading} className="flex-1 bg-orange-500 text-white py-1 rounded-xl font-bold">تخطي/إظهار النتائج</button>
            )}
            {gameState.showResults && (
              <button onClick={handleNextQuestion} disabled={isLoading} className="flex-1 bg-purple-600 text-white py-1 rounded-xl font-bold">{isLastQuestion ? "انهاء المسابقة" : "السؤال التالي"}</button>
            )}
          </div>
        </div>

        {/* right panel - stats */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 shadow-lg">
          <div className="text-center mb-1">
            <div className="text-4xl font-bold">{responses.length} / {groups.length}</div>
            <div className="text-sm">رد مستلم</div>
          </div>

          {responses.length > 0 ? (
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">إحصائيات الاختيارات</h3>
              {getResponseStats().map((stat, index) => (
                <div key={index} className="flex items-center gap-1 p-1 bg-white/10 rounded">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{currentQuestion?.choices[index]}</div>
                      <div className="font-bold">{stat.count}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full" style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%`, background: getChoiceStyle(index).backgroundColor }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">لم يتم استلام أي ردود بعد.</div>
          )}
        </div>
      </div>
    </div>
  )
}
