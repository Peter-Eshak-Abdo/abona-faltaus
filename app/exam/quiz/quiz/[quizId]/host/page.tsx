/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import {
  getQuiz, getQuizGroups, startQuiz, subscribeToGameState, deleteGroup,
  cleanupOldGroups, } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Users, Play, QrCode, AlertCircle, CheckCircle, Trash2, Clock, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { Quiz, Group, GameState } from "@/types/quiz"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"
import { motion } from "framer-motion"

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
  const [qrSize, setQrSize] = useState([250]) // حجم QR Code
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

    // Subscribe to groups
    const unsubscribeGroups = getQuizGroups(quizId, (updatedGroups) => {
      console.log("Groups updated:", updatedGroups)
      setGroups(updatedGroups)
    })

    // Subscribe to game state
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
    if (!confirm(`هل أنت متأكد من حذف مجموعة "${groupName}"؟`)) {
      return
    }

    try {
      await deleteGroup(quizId, groupId)
    } catch (error: any) {
      setError(error.message || "فشل في حذف المجموعة")
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

    if (minutesAgo > 30) {
      return { status: "inactive", text: `منذ ${minutesAgo} دقيقة`, color: "text-red-600" }
    } else if (minutesAgo > 10) {
      return { status: "idle", text: `منذ ${minutesAgo} دقيقة`, color: "text-yellow-600" }
    } else {
      return { status: "active", text: "نشط", color: "text-green-600" }
    }
  }

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}exam/quiz/quiz/${quizId}/join` : `abona-faltaus.vercel.app/exam/quiz/quiz/${quizId}/join`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-right">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
          <p className="text-gray-600 text-lg mb-3">{quiz.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2">
            {quiz.shuffleQuestions && (
              <Badge variant="outline" className="text-sm">
                خلط الأسئلة
              </Badge>
            )}
            {quiz.shuffleChoices && (
              <Badge variant="outline" className="text-sm">
                خلط الاختيارات
              </Badge>
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
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <QrCode className="w-6 h-6" />
                الانضمام للامتحان
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              {joinUrl && (
                <>
                  <div className="bg-white p-6 rounded-xl inline-block mb-6 border-2 border-gray-200 shadow-lg">
                    <QRCodeSVG value={joinUrl} size={qrSize[0]} />
                  </div>

                  {/* QR Size Slider */}
                  <div className="mb-6 px-4">
                    <div className="flex items-center justify-between mb-2">
                      <ZoomOut className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">حجم الكود</span>
                      <ZoomIn className="w-5 h-5 text-gray-500" />
                    </div>
                    <Slider value={qrSize} onValueChange={setQrSize} max={400} min={150} step={25} className="w-full" />
                    <div className="text-xs text-gray-500 mt-1">{qrSize[0]}px</div>
                  </div>

                  <p className="text-gray-600 mb-3 text-lg">امسح الكود أو ادخل على:</p>
                  <div className="bg-gray-100 p-4 rounded-lg border">
                    <p className="font-mono text-sm break-all text-gray-800">{joinUrl}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Groups Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Users className="w-6 h-6" />
                  المجموعات المنضمة ({groups.length})
                </CardTitle>
                <Button
                  onClick={handleCleanupOldGroups}
                  variant="outline"
                  size="sm"
                  disabled={isCleaningUp}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className={`w-4 h-4 ${isCleaningUp ? "animate-spin" : ""}`} />
                  تنظيف
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {groups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">لم تنضم أي مجموعة بعد</p>
                  <p className="text-lg">شارك الكود للبدء</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {groups.map((group, index) => {
                    const activity = getGroupActivityStatus(group)
                    return (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900">{group.groupName}</h4>
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                              {group.members.length} عضو
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2 text-sm">{group.members.join(" • ")}</p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className={`text-sm font-medium ${activity.color}`}>{activity.text}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteGroup(group.id, group.groupName)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-3"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quiz Stats */}
        <Card className="mb-8 shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-xl">تفاصيل الامتحان</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600 mb-2">{quiz.questions.length}</div>
                <div className="text-gray-600 font-medium">سؤال</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{groups.length}</div>
                <div className="text-gray-600 font-medium">مجموعة</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {groups.reduce((total, group) => total + group.members.length, 0)}
                </div>
                <div className="text-gray-600 font-medium">طالب</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)}
                </div>
                <div className="text-gray-600 font-medium">دقيقة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStartQuiz}
            disabled={groups.length === 0 || isStarting || gameState?.isActive}
            size="lg"
            className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl"
          >
            <Play className="w-6 h-6 mr-3" />
            {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء الامتحان" : "بدء الامتحان"}
          </Button>
          {groups.length === 0 && (
            <p className="text-gray-600 mt-4 text-lg">يجب أن تنضم مجموعة واحدة على الأقل قبل البدء</p>
          )}
          {isStarting && <p className="text-blue-600 mt-4 text-lg">يرجى الانتظار أثناء تحضير الامتحان...</p>}
        </div>
      </div>
    </div>
  )
}
