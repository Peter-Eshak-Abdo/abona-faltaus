"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { nextQuestion, showQuestionResults, endQuiz, getQuestionResponses, updateGroupScores } from "@/lib/supabase-utils"
import type { Quiz, Group, GameState, QuizResponse, LeaderboardEntry } from "@/types/quiz"
import { motion } from "framer-motion"
import confetti from 'canvas-confetti';

interface QuizHostGameProps {
  quiz: Quiz
  groups: Group[]
  gameState: GameState
}

export function QuizHostGame({ quiz, groups, gameState }: QuizHostGameProps) {
  const router = useRouter()
  const [responses, setResponses] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(20)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [previousLeaderboard, setPreviousLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questionOnlyTimeLeft, setQuestionOnlyTimeLeft] = useState(5)
  const [fullScreenPhase, setFullScreenPhase] = useState<"question" | "stats" | "leaderboard" | null>(null)
  const [showFinalPodium, setShowFinalPodium] = useState(false)

  const currentQuestion = quiz.questions[gameState.current_question_index]
  const isLastQuestion = gameState.current_question_index >= quiz.questions.length - 1
  const CHOICE_COLORS = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"]

  useEffect(() => {
    if (gameState.show_question_only && gameState.is_active) {
      setQuestionOnlyTimeLeft(5)
      const timer = setInterval(() => setQuestionOnlyTimeLeft(p => p <= 1 ? 0 : p - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [gameState.show_question_only, gameState.is_active])

  useEffect(() => {
    if (gameState.is_active && !gameState.show_question_only && !gameState.show_results) {
      setFullScreenPhase("question")
      setTimeout(() => setFullScreenPhase(null), (currentQuestion?.timeLimit || 20) * 1000)
    } else if (gameState.show_results) {
      setFullScreenPhase("stats")
      setTimeout(() => {
        calculateLeaderboard()
        setFullScreenPhase("leaderboard")
      }, 5000)
    } else {
      setFullScreenPhase(null)
    }
  }, [gameState.is_active, gameState.show_question_only, gameState.show_results])

  useEffect(() => {
    if (!gameState.question_start_time || gameState.show_results || gameState.show_question_only) return
    const startTime = new Date(gameState.question_start_time).getTime()
    const timer = setInterval(() => {
      const remaining = Math.max(0, (currentQuestion?.timeLimit || 20) - (Date.now() - startTime) / 1000)
      setTimeLeft(remaining)
      if (remaining === 0) showQuestionResults(quiz.id)
    }, 100)
    return () => clearInterval(timer)
  }, [gameState.question_start_time, gameState.show_results, gameState.show_question_only])

  useEffect(() => {
    if (!gameState.is_active || gameState.show_question_only) return
    const poll = setInterval(async () => {
      const res = await getQuestionResponses(quiz.id, gameState.current_question_index)
      setResponses(res)
      if (res.length >= groups.length && !gameState.show_results) showQuestionResults(quiz.id)
    }, 500)
    return () => clearInterval(poll)
  }, [gameState.current_question_index, gameState.is_active, gameState.show_results])

  const calculateLeaderboard = () => {
    setPreviousLeaderboard([...leaderboard])
    const scores = new Map(groups.map((g: any) => [g.id, g.score || 0]))
    const correctRes = responses.filter(r => r.is_correct).sort((a, b) => a.time_taken - b.time_taken)

    correctRes.forEach(r => {
      const pts = Math.max(Math.round(1000 - (r.time_taken * 100)), 100)
      scores.set(r.group_id, (scores.get(r.group_id) || 0) + pts)
    })

    updateGroupScores(quiz.id, Object.fromEntries(scores))
    setLeaderboard(groups.map((g: any) => ({
      groupId: g.id, groupName: g.group_name, score: scores.get(g.id) || 0, members: g.members, saintImage: g.saint_image
    })).sort((a, b) => b.score - a.score))
  }

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      await endQuiz(quiz.id)
      setShowFinalPodium(true)
    } else {
      await nextQuestion(quiz.id, gameState.current_question_index + 1)
      setResponses([])
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

  if (showFinalPodium || (!gameState.is_active && leaderboard.length > 0)) {
    const topThree = leaderboard.slice(0, 3)
    const displayOrder = [topThree[2], topThree[0], topThree[1]].filter(Boolean)

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-1">
        <h1 className="text-6xl font-black mb-1 text-yellow-500">النتائج النهائية</h1>
        <div className="flex items-end justify-center gap-1 h-96 w-full max-w-5xl">
          {displayOrder.map((group, idx) => {
            const isFirst = group.groupId === topThree[0]?.groupId
            const isSecond = group.groupId === topThree[1]?.groupId
            const isThird = group.groupId === topThree[2]?.groupId
            return (
              <motion.div key={group.groupId} initial={{ y: 500, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: isThird ? 0.5 : isSecond ? 1.5 : 2.5, type: "spring" }} className="flex flex-col items-center flex-1">
                <div className="mb-1 text-center">
                  {group.saintImage && <img src={group.saintImage} className="w-16 h-16 rounded-full border-4 border-white mb-1 mx-auto" alt="" />}
                  <div className="text-2xl font-bold">{group.groupName}</div>
                  <div className="text-yellow-400 font-mono text-xl">{group.score} نقطة</div>
                </div>
                <div className="w-full rounded-t-2xl flex items-center justify-center text-6xl font-black shadow-2xl" style={{ height: isFirst ? '100%' : isSecond ? '75%' : '50%', background: isFirst ? 'linear-gradient(to top, #b45309, #f59e0b)' : isSecond ? 'linear-gradient(to top, #4b5563, #9ca3af)' : 'linear-gradient(to top, #78350f, #a16207)' }}>
                  {isFirst ? "1" : isSecond ? "2" : "3"}
                </div>
              </motion.div>
            )
          })}
        </div>
        <button onClick={() => window.location.reload()} className="mt-12 px-8 py-4 bg-white text-black rounded-full font-bold text-2xl hover:bg-yellow-500 transition-colors">خروج</button>
      </div>
    )
  }
  // question-only full screen
  if (gameState.show_question_only) {
    return (
      <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
        <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1 text-center">
          <div className="text-4xl font-bold">السؤال {gameState.current_question_index + 1} من {quiz.questions.length}</div>
          <h2 className="text-8xl font-extrabold mt-1">{currentQuestion?.text}</h2>
          <div className="mt-1 text-2xl">ستظهر الاختيارات خلال {questionOnlyTimeLeft} ثانية</div>
        </div>
      </div>
    )
  }

  // full screen question phase
  if (fullScreenPhase === "question") {
    return (
      <div className="min-h-screen p-1 bg-slate-900 text-white flex flex-col items-center justify-center">
      <div className="max-w-6xl w-full text-center">
        <h2 className="text-6xl font-bold mb-1 animate-pulse">{currentQuestion?.text}</h2>

        {/* إظهار الاختيارات هنا أيضاً لكي يراها الجميع */}
        <div className="grid grid-cols-2 gap-1 w-full">
          {currentQuestion?.choices.map((choice, index) => (
            <div
              key={index}
              className="p-1 rounded-2xl text-3xl font-bold flex items-center gap-1"
              style={{ backgroundColor: CHOICE_COLORS[index] }}
            >
              <span className="bg-white/20 w-7 h-7 rounded-full flex items-center justify-center">
                {getChoiceLabel(index)}
              </span>
              {choice}
            </div>
          ))}
        </div>

        <div className="mt-1 text-4xl font-mono bg-white/10 inline-block p-1 rounded-full">
          الوقت المتبقي: {Math.ceil(timeLeft)} ثانية
        </div>
      </div>
    </div>
    )
  }


  // if (fullScreenPhase === "stats") {
  //   return (
  //     <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
  //       <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1">
  //         <div className="text-center mb-1">
  //           <h2 className="text-2xl font-bold">إحصائيات الإجابات</h2>
  //           <div className="text-lg font-bold">{responses.length} / {groups.length} رد</div>
  //         </div>

  //         <div className="space-y-1">
  //           {getResponseStats().map((stat, index) => (
  //             <div key={index} className="flex items-center gap-1">
  //               <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</div>
  //               <div className="flex-1">
  //                 <div className="flex justify-between">
  //                   <div className="font-medium">{currentQuestion?.choices[index]}</div>
  //                   <div className="font-bold">{stat.count}</div>
  //                 </div>
  //                 <div className="w-full bg-gray-200 h-2 rounded mt-1">
  //                   <div className="h-2 rounded" style={{ width: `${responses.length > 0 ? (stat.count / responses.length) * 100 : 0}%`, backgroundColor: getChoiceStyle(index).backgroundColor }} />
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         <div className="text-center mt-1">
  //           <button onClick={handleSkipPhase} className="p-1 rounded bg-orange-500 text-white">تخطّي الإحصائيات</button>
  //           <button onClick={handleResetQuiz} disabled={isResetting} className="ml-1 p-1 rounded bg-blue-600 text-white">{isResetting ? "جاري..." : "إعادة تعيين"}</button>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (fullScreenPhase === "leaderboard") {
  //   return (
  //     <div className="min-h-screen bg-white/5 backdrop-blur-md p-1">
  //       <div className="max-w-8xl mx-auto bg-white/10 rounded-2xl p-1">
  //         <div className="text-center mb-1">
  //           <h2 className="text-3xl font-bold">الترتيب الحالي</h2>
  //         </div>

  //         <div className="space-y-1">
  //           {leaderboard.map((entry, index) => {
  //             const positionChange = getPositionChange(entry.groupId)
  //             return (
  //               <motion.div key={entry.groupId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, scale: showScoreAnimation ? [1, 1.05, 1] : 1 }} transition={{ delay: index * 0.06 }}>
  //                 <div className={`p-1 rounded-lg flex items-center justify-between ${index === 0 ? "bg-yellow-400 text-black" : index === 1 ? "bg-white/20 text-black" : "bg-white/10"}`}>
  //                   <div className="flex items-center gap-1">
  //                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${index < 3 ? "bg-white/20" : "bg-blue-500 text-white"}`}>{index + 1}</div>
  //                     {entry.saintImage && <img src={entry.saintImage || "/placeholder.svg"} alt={entry.saintName} className="w-12 h-12 rounded-full border-2 object-cover" />}
  //                     <div>
  //                       <div className="font-bold">{entry.groupName}</div>
  //                       <div className="text-sm opacity-80">{entry.members.join(" • ")}</div>
  //                     </div>
  //                   </div>
  //                   <div className="flex items-center gap-1">
  //                     {positionChange > 0 && <div className="text-green-500 font-bold">↑{positionChange}</div>}
  //                     {positionChange < 0 && <div className="text-red-500 font-bold">↓{Math.abs(positionChange)}</div>}
  //                     <div className="font-bold text-2xl">{entry.score.toLocaleString()}</div>
  //                   </div>
  //                 </div>
  //               </motion.div>
  //             )
  //           })}
  //         </div>

  //         <div className="text-center mt-1">
  //           <button onClick={handleSkipPhase} className="p-1 rounded bg-orange-500 text-white">تخطي اللوحة</button>
  //           <button onClick={handleEndQuiz} disabled={isEnding} className="ml-1 p-1 rounded bg-red-600 text-white">{isEnding ? "جاري..." : "إنهاء المسابقة"}</button>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // default: normal host view (question + side stats)
  return (
    <div className="min-h-screen bg-gray-50 p-1">
      <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="text-lg font-bold">السؤال {gameState.current_question_index + 1} من {quiz.questions.length}</div>
              <div className="text-sm text-gray-600">{quiz.title}</div>
            </div>

             {/* <div className="flex gap-1">
              <button onClick={handleEndQuiz} disabled={isEnding} className="p-1 rounded bg-red-600 text-white">{isEnding ? "جاري..." : "إنهاء"}</button>
              <button onClick={handleResetQuiz} disabled={isResetting} className="p-1 rounded bg-blue-600 text-white">{isResetting ? "جاري..." : "إعادة تعيين"}</button>
              <button onClick={handleExitHost} className="p-1 rounded bg-gray-200">خروج</button>
            </div> */}
          </div>

          <div className="space-y-1 grid grid-cols-2 gap-1 mt-3">
            {(currentQuestion?.choices || []).map((choice, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className={`p-1 rounded-lg flex items-center justify-between ${gameState.show_results && index === currentQuestion.correctAnswer ? "ring-1 ring-green-500 bg-green-50 shadow" : "bg-white/20 hover:bg-white/30"}`} style={getChoiceStyle(index)}>
                <div className="flex items-center gap-1">
                  <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={getChoiceStyle(index)}>{getChoiceLabel(index)}</span>
                  {choice}
                </div>
                {gameState.show_results && index === currentQuestion.correctAnswer && (
                  <div className="bg-green-500 text-white p-1 rounded-full text-sm font-bold">الإجابة الصحيحة</div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-1 flex gap-1">
            {/* {!gameState.show_results && (
              <button onClick={handleForceNext} disabled={isLoading} className="flex-1 bg-orange-500 text-white py-1 rounded-xl font-bold">تخطي/إظهار النتائج</button>
            )} */}
            {gameState.show_results && (
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
