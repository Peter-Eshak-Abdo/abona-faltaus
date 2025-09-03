/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import {
  getQuiz,
  getQuizGroups,
  startQuiz,
  subscribeToGameState,
  deleteGroup,
  cleanupOldGroups,
} from "@/lib/firebase-utils"
import { QRCodeSVG } from "qrcode.react"
import type { Quiz, Group, GameState } from "@/types/quiz"
import { motion } from "framer-motion"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"

export default function HostQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startSuccess, setStartSuccess] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [qrSize, setQrSize] = useState(250)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const quizId = params.quizId as string

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && quizId) {
      loadQuiz()
    }
  }, [user, loading, quizId])

  useEffect(() => {
    if (!quizId) return

    console.log("Setting up listeners for quiz:", quizId)

    const unsubscribeGroups = getQuizGroups(quizId, (updatedGroups) => {
      console.log("Groups updated:", updatedGroups)
      setGroups(updatedGroups)
    })

    const unsubscribeGameState = subscribeToGameState(quizId, (state) => {
      console.log("Game state updated:", state)
      setGameState(state)

      if (state?.isActive) {
        setStartSuccess(true)
        setError(null)
      }
    })

    return () => {
      console.log("Cleaning up listeners")
      unsubscribeGroups()
      unsubscribeGameState()
    }
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setError(null)
      console.log("Loading quiz:", quizId)

      const quizData = await getQuiz(quizId)
      if (!quizData) {
        setError("المسابقة غير موجوده")
        return
      }

      if (quizData.createdBy !== user?.uid) {
        setError("ليس لديك صلاحية لإدارة هذة المسابقة")
        return
      }

      console.log("Quiz loaded:", quizData)
      setQuiz(quizData)
    } catch (error: any) {
      console.error("Error loading quiz:", error)
      setError(error.message || "فشل في تحميل المسابقة")
    }
  }

  const handleStartQuiz = async () => {
    if (groups.length === 0) {
      setError("يجب أن ينضم فريق واحدة على الأقل قبل البدء")
      return
    }

    if (!quiz) {
      setError("بيانات المسابقة غير محملة")
      return
    }

    setIsStarting(true)
    setError(null)
    setStartSuccess(false)

    try {
      console.log("Starting quiz with", groups.length, "groups")
      await startQuiz(quizId, quiz)

      setTimeout(() => {
        setStartSuccess(true)
        console.log("Quiz start initiated successfully")
      }, 1000)
    } catch (error: any) {
      console.error("Error starting quiz:", error)
      setError(error.message || "فشل في بدء المسابقة")
    } finally {
      setIsStarting(false)
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    setDeletingGroupId(groupId)

    try {
      console.log("Attempting to delete group:", groupId, groupName)
      await deleteGroup(quizId, groupId)
      console.log("Group deleted successfully")
    } catch (error: any) {
      console.error("Delete group error:", error)
      setError(error.message || "فشل في حذف الفرقة")
    } finally {
      setDeletingGroupId(null)
    }
  }

  const handleCleanupOldGroups = async () => {
    setIsCleaningUp(true)
    try {
      const deletedCount = await cleanupOldGroups(quizId)
      if (deletedCount > 0) {
        alert(`تم حذف ${deletedCount} فرقة غير نشطة`)
      } else {
        alert("لا توجد فرق غير نشطة")
      }
    } catch (error: any) {
      setError(error.message || "فشل في تنظيف الفرق")
    } finally {
      setIsCleaningUp(false)
    }
  }

  const getGroupActivityStatus = (group: Group) => {
    const now = new Date()
    const lastActivity = group.lastActivity || group.joinedAt
    const minutesAgo = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60))

    if (minutesAgo > 60) {
      return { status: "inactive", text: `منذ ${minutesAgo} دقيقة`, color: "text-red-600" }
    } else if (minutesAgo > 15) {
      return { status: "idle", text: `منذ ${minutesAgo} دقيقة`, color: "text-yellow-600" }
    } else {
      return { status: "active", text: "نشط", color: "text-green-600" }
    }
  }

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join` : `abona-faltaus.vercel.app/exam/quiz/quiz/${quizId}/join`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-right px-2 sm:px-0">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">{quiz.title}</h1>
          <p className="text-white/80 text-lg mb-3">{quiz.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-2xl font-bold shadow-md">
              ملحوظات :
            </div>
            {quiz.shuffleQuestions && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                خلط الأسئلة
              </div>
            )}
            {quiz.shuffleChoices && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow-md">
                خلط الاختيارات
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="mr-3 text-red-700 text-lg">{error}</p>
            </div>
          </div>
        )}

        {startSuccess && !gameState?.isActive && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-md">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
              <p className="mr-3 text-green-700 text-lg">
                جاري بدء المسابقة... يرجى انتظار تحميل واجهة اللعبة.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-2 sm:p-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-black p-4 sm:p-6">
              <h2 className="flex items-center gap-3 text-2xl font-bold  text-center">
                {/* <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3z" clipRule="evenodd" />
                </svg> */}
                الانضمام للمسابقة
              </h2>
            </div>
            <div className="text-center p-4 sm:p-8">
              {joinUrl && (
                <>
                  <div className="bg-gray-50 p-8 rounded-2xl inline-block mb-6 border-2 border-gray-200">
                    <QRCodeSVG value={joinUrl} size={qrSize} />
                  </div>

                  {/* QR Size Controls */}
                  <div className="mb-6 px-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setQrSize(Math.max(150, qrSize - 25))}
                        className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                        title="تقليل حجم الكود"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                      </button>
                      <span className="text-lg font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl">{qrSize}px</span>
                      <button
                        onClick={() => setQrSize(Math.min(400, qrSize + 25))}
                        className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                        title="زيادة حجم الكود"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM15.5 10.5l3 3m-3-3l-3 3" />
                        </svg>
                      </button>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((qrSize - 150) / (400 - 150)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-lg font-medium">امسح الكود أو ادخل على:</p>
                  <div className="bg-gray-100 p-4 rounded-xl border-2 border-gray-200">
                    <p className="font-mono text-sm break-all text-gray-800 font-medium">{joinUrl}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Groups Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-2 sm:p-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <h2 className="flex items-center gap-3 text-2xl font-bold">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  الفرق ({groups.length})
                </h2>
                <button
                  onClick={handleCleanupOldGroups}
                  disabled={isCleaningUp}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                  type="button"
                >
                  <svg className={`w-5 h-5 ${isCleaningUp ? "animate-spin" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  تنظيف
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {groups.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <p className="text-xl mb-2 font-medium">لم ينضم أي فريق بعد</p>
                  <p className="text-lg">شارك الكود للبدء</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {groups.map((group, index) => {
                    const activity = getGroupActivityStatus(group)
                    const isDeleting = deletingGroupId === group.id

                    return (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-6 flex items-center justify-between m-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-xl text-gray-900">
                                  {group.groupName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {group.members.length} عضو
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${activity.status === 'active' ? 'bg-green-100 text-green-800' :
                                    activity.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {activity.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-200">
                              <p className="text-gray-700 font-medium">{group.members.join(" || ")}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteGroup(group.id, group.groupName)}
                            disabled={isDeleting}
                            className="mr-4 p-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                            type="button"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="bg-white rounded-2xl shadow-2xl mb-8 overflow-hidden p-2 sm:p-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
            <h2 className="text-2xl font-bold">تفاصيل الامتحان</h2>
          </div>
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-2xl shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">{quiz.questions.length}</div>
                <div className="text-gray-700 font-bold text-lg">سؤال</div>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-2xl shadow-lg">
                <div className="text-4xl font-bold text-green-600 mb-2">{groups.length}</div>
                <div className="text-gray-700 font-bold text-lg">فريق</div>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-2xl shadow-lg">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {groups.reduce((total, group) => total + group.members.length, 0)}
                </div>
                <div className="text-gray-700 font-bold text-lg">عضو</div>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-2xl shadow-lg">
                <div className="text-gray-700 font-bold text-lg">{Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)} دقيقة</div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  <div className="text-gray-700 font-bold text-lg">{Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0))} ثانية</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            disabled={groups.length === 0 || isStarting || gameState?.isActive}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 sm:px-16 py-4 sm:py-6 rounded-2xl transition-all duration-300 text-xl sm:text-2xl shadow-2xl flex items-center gap-4 mx-auto"
            type="button"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء المسابقة" : "بدء المسابقة"}
          </button>
          {groups.length === 0 && (
            <p className="text-white/80 mt-6 text-lg sm:text-xl font-medium">يجب أن ينضم فريق واحدة على الأقل قبل البدء</p>
          )}
          {isStarting && <p className="text-white/80 mt-6 text-lg sm:text-xl font-medium">يرجى الانتظار أثناء تحضير المسابقة...</p>}
        </div>
      </div>
    </div>
  )
}
