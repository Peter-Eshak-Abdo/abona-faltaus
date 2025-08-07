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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Play, QrCode, AlertCircle, CheckCircle, Trash2, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
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
        setError("الامتحان غير موجود")
        return
      }

      if (quizData.createdBy !== user?.uid) {
        setError("ليس لديك صلاحية لإدارة هذا الامتحان")
        return
      }

      console.log("Quiz loaded:", quizData)
      setQuiz(quizData)
    } catch (error: any) {
      console.error("Error loading quiz:", error)
      setError(error.message || "فشل في تحميل الامتحان")
    }
  }

  const handleStartQuiz = async () => {
    if (groups.length === 0) {
      setError("يجب أن تنضم مجموعة واحدة على الأقل قبل البدء")
      return
    }

    if (!quiz) {
      setError("بيانات الامتحان غير محملة")
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
      setError(error.message || "فشل في بدء الامتحان")
    } finally {
      setIsStarting(false)
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مجموعة "${groupName}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      return
    }

    setDeletingGroupId(groupId)

    try {
      console.log("Attempting to delete group:", groupId, groupName)
      await deleteGroup(quizId, groupId)
      console.log("Group deleted successfully")
    } catch (error: any) {
      console.error("Delete group error:", error)
      setError(error.message || "فشل في حذف المجموعة")
    } finally {
      setDeletingGroupId(null)
    }
  }

  const handleCleanupOldGroups = async () => {
    setIsCleaningUp(true)
    try {
      const deletedCount = await cleanupOldGroups(quizId)
      if (deletedCount > 0) {
        alert(`تم حذف ${deletedCount} مجموعة غير نشطة`)
      } else {
        alert("لا توجد مجموعات غير نشطة")
      }
    } catch (error: any) {
      setError(error.message || "فشل في تنظيف المجموعات")
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join` : `abona-faltaus.vercel.app/exam/quiz/quiz/${quizId}/join`

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-right">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
          <p className="text-gray-600 text-lg mb-3">{quiz.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {quiz.shuffleQuestions && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border-2 border-amber-300">
                خلط الأسئلة
              </div>
            )}
            {quiz.shuffleChoices && (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium border-2 border-orange-300">
                خلط الاختيارات
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">{error}</AlertDescription>
          </Alert>
        )}

        {startSuccess && !gameState?.isActive && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">
              جاري بدء الامتحان... يرجى انتظار تحميل واجهة اللعبة.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Code Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 border-4 border-blue-200">
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white p-6">
              <h2 className="flex items-center gap-3 text-2xl font-bold">
                <QrCode className="w-7 h-7" />
                الانضمام للامتحان
              </h2>
            </div>
            <div className="text-center p-8">
              {joinUrl && (
                <>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl inline-block mb-6 border-4 border-gray-200 shadow-inner">
                    <QRCodeSVG value={joinUrl} size={qrSize} />
                  </div>

                  {/* QR Size Controls */}
                  <div className="mb-6 px-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setQrSize(Math.max(150, qrSize - 25))}
                        className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors border-2 border-blue-300"
                        title="تصغير حجم الكود"
                        type="button"
                      >
                        <ZoomOut className="w-5 h-5 text-blue-600" />
                      </button>
                      <span className="text-lg font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl border-2 border-gray-300">{qrSize}px</span>
                      <button
                        onClick={() => setQrSize(Math.min(400, qrSize + 25))}
                        className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors border-2 border-blue-300"
                        title="تكبير حجم الكود"
                        type="button"
                      >
                        <ZoomIn className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-gray-300">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((qrSize - 150) / (400 - 150)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 text-lg font-medium">امسح الكود أو ادخل على:</p>
                  <div className="bg-gray-100 p-4 rounded-xl border-4 border-gray-200">
                    <p className="font-mono text-sm break-all text-gray-800 font-medium">{joinUrl}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Groups Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 border-4 border-green-200">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="flex items-center gap-3 text-2xl font-bold">
                  <Users className="w-7 h-7" />
                  المجموعات ({groups.length})
                </h2>
                <button
                  onClick={handleCleanupOldGroups}
                  disabled={isCleaningUp}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 border-2 border-white/30"
                  title="تنظيف المجموعات غير النشطة"
                  type="button"
                >
                  <RefreshCw className={`w-5 h-5 ${isCleaningUp ? "animate-spin" : ""}`} />
                  تنظيف
                </button>
              </div>
            </div>
            <div className="p-6">
              {groups.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-xl mb-2 font-medium">لم تنضم أي مجموعة بعد</p>
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
                        className="group relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl border-4 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                      >
                        {/* 3D Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">
                                {index + 1}
                              </div>
                              {group.saintImage && (
                                <img
                                  src={group.saintImage || "/placeholder.svg"}
                                  alt={group.saintName}
                                  className="w-12 h-12 rounded-full border-4 border-amber-300 object-cover shadow-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors">
                                  {group.groupName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border-2 border-blue-300">
                                    {group.members.length} عضو
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${activity.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                                      activity.status === 'idle' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                        'bg-red-100 text-red-800 border-red-300'
                                    }`}>
                                    {activity.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border-2 border-gray-200">
                              <p className="text-gray-700 font-medium">{group.members.join(" • ")}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteGroup(group.id, group.groupName)}
                            disabled={isDeleting}
                            className="mr-4 p-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-xl transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg border-2 border-red-200"
                            type="button"
                            title={`حذف المجموعة ${group.groupName}`}
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                            ) : (
                              <Trash2 className="w-6 h-6" />
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
        <div className="bg-white rounded-3xl shadow-2xl mb-8 overflow-hidden transform hover:scale-105 transition-all duration-300 border-4 border-purple-200">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white p-6">
            <h2 className="text-2xl font-bold">تفاصيل الامتحان</h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 border-4 border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">{quiz.questions.length}</div>
                <div className="text-gray-700 font-bold text-lg">سؤال</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 border-4 border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">{groups.length}</div>
                <div className="text-gray-700 font-bold text-lg">مجموعة</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 border-4 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {groups.reduce((total, group) => total + group.members.length, 0)}
                </div>
                <div className="text-gray-700 font-bold text-lg">طالب</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-300 border-4 border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)}
                </div>
                <div className="text-gray-700 font-bold text-lg">دقيقة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartQuiz}
            disabled={groups.length === 0 || isStarting || gameState?.isActive}
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-16 py-6 rounded-3xl transition-all duration-300 text-2xl shadow-2xl transform hover:scale-110 flex items-center gap-4 mx-auto border-4 border-amber-300"
            type="button"
            title="بدء الامتحان"
          >
            <Play className="w-8 h-8" />
            {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء الامتحان" : "بدء الامتحان"}
          </button>
          {groups.length === 0 && (
            <p className="text-gray-600 mt-6 text-xl font-medium">يجب أن تنضم مجموعة واحدة على الأقل قبل البدء</p>
          )}
          {isStarting && <p className="text-amber-600 mt-6 text-xl font-medium">يرجى الانتظار أثناء تحضير الامتحان...</p>}
        </div>
      </div>
    </div>
  )
}
