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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

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
    } catch (error) {
      console.error("Error loading quiz:", error)
      // setError(error.massage || "فشل في تحميل المسابقة")
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
    } catch (error) {
      console.error("Error starting quiz:", error)
      // setError(error.message || "فشل في بدء المسابقة")
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
    } catch (error) {
      console.error("Delete group error:", error)
      // setError(error.message || "فشل في حذف الفرقة")
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
    } catch (error) {
      console.error("Cleanup old groups error:", error)
      // setError(error.message || "فشل في تنظيف الفرق")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-300 p-1">
      <div className="max-w-8xl mx-auto">
        <div className="mb-3 text-center md:text-right px-2 sm:px-0">
          <div className="flex flex-col-reverse md:flex-row">
            <div className="grow">
              <h1 className="text-7xl font-bold text-white mb-3 drop-shadow-xl text-center md:text-9xl">{quiz.title}</h1>
              <p className="text-white/80 text-3xl mb-2 text-center">{quiz.description}</p>
            </div>
            <img src={"/images/alnosor/logo.jpeg"} alt="Logo" className="rounded-lg shadow-lg mb-2 w-20 " />
          </div>
          <div className="bg-blue-100 text-blue-800 p-1 rounded-full font-bold shadow-2xl break-normall">
            <p className="text-center text-3xl "> ملحوظات </p>
            <p className="text-2xl pt-3 pb-1">{quiz.shuffleQuestions && quiz.shuffleChoices
              ? "خلط الأسئلة و الاختيارات"
              : quiz.shuffleQuestions
                ? "خلط الأسئلة فقط"
                : quiz.shuffleChoices
                  ? "خلط الاختيارات فقط"
                  : "لا يوجد خلط للاسئلة ولا للاختيارات"}</p>
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

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2"> */}
        <div className="flex flex-col gap-1 mb-2">
          {/* QR Code Card */}
          <Card className="shadow-2xl overflow-hidden shrink-3 grow">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-black">
              <CardTitle className="flex items-center gap-1 text-2xl font-bold text-center">
                الانضمام للمسابقة
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-1">
              {joinUrl && (
                <>
                  <div className="bg-gray-50 p-0.5 rounded-2xl inline-block mb-1 border-2 border-gray-200">
                    <QRCodeSVG value={joinUrl} size={qrSize} />
                  </div>

                  {/* QR Size Controls */}
                  <div className="mb-1 px-1">
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        onClick={() => setQrSize(Math.max(250, qrSize - 75))}
                        className="p-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors mb:p-3"
                        title="تقليل حجم الكود"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-dash-circle fw-bolder" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8" />
                        </svg>
                      </Button>
                      <span className="text-2xl font-extrabold text-gray-700 bg-gray-100 p-1 rounded-xl">{qrSize}px</span>
                      <Button
                        onClick={() => setQrSize(Math.min(1000, qrSize + 75))}
                        className="p-1 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors mb:p-3"
                        title="زيادة حجم الكود"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-plus-circle fw-bolder" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                        </svg>
                      </Button>
                    </div>
                    <div className="relative mb-2">
                      <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-purple-600 h-2 rounded-full" />
                      <Slider
                        value={[qrSize]}
                        onValueChange={(value) => setQrSize(value[0])}
                        max={1000}
                        min={250}
                        step={25}
                        className="custom-slider w-full"
                        dir="rtl"
                      />
                      <div className="flex justify-between text-sm text-gray-600 mt-3">
                        <span>صغير</span>
                        <span>كبير</span>
                      </div>
                    </div>
                    <style jsx>{`
                      .custom-slider [data-radix-slider-track] {
                        background: transparent !important;
                      }
                    `}</style>
                  </div>
                  {/* <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((qrSize - 250) / (1000 - 250)) * 100}%` }}
                    />
                  </div> */}

                  <p className="text-gray-600 mb-1 text-lg font-medium">امسح الكود أو ادخل على:</p>
                  <div className="bg-gray-100 p-1 rounded-xl border-2 border-gray-200">
                    <p className="font-mono text-sm break-all text-gray-800 font-medium">{joinUrl}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Groups Card */}
          <Card className="shadow-2xl overflow-hidden p-0">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-0.5 rounded-4xl shadow-2xl">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-2xl font-bold">
                  <svg className="w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  الفرق ({groups.length})
                </CardTitle>
                <Button
                  onClick={handleCleanupOldGroups}
                  disabled={isCleaningUp}
                  size="normal"
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-xl transition-colors flex items-center bg-warning text-black"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                  </svg>
                  تنظيف
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-1">
              {groups.length === 0 ? (
                <div className="text-center p-1 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <p className="text-xl mb-2 font-medium">لم ينضم أي فريق بعد</p>
                  <p className="text-lg">شارك الكود للبدء</p>
                </div>
              ) : (
                <div className="grid grid-col-2 md:grid-cols-4 lg:grid-col-4 gap-1 max-h-96 overflow-y-auto">
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
                        <div className="p-0.5 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-0.5 mb-1">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-bold text-2xl text-gray-900">
                                  {group.groupName}
                                </h3>
                                <div className="flex items-center">
                                  <div className="bg-blue-100 text-blue-800 p-1 rounded-full text-xl font-medium">
                                    {group.members.length} عضو
                                  </div>
                                  <div className={`p-1 rounded-full text-sm font-medium ${activity.status === 'active' ? 'bg-green-100 text-green-800' :
                                    activity.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {activity.text}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-white rounded-xl p-1 border border-gray-200">
                              <p className="text-gray-700 font-medium">{group.members.join(" || ")}</p>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleDeleteGroup(group.id, group.groupName)}
                            disabled={isDeleting}
                            className="mx-1 h-1 w-1 p-1 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded transition-all duration-200 shadow-sm hover:shadow bg-danger"
                            type="button"
                            size="normal"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-1 w-1 border-b-2 border-red-600" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quiz Stats */}
        <Card className="shadow-2xl mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl font-bold">تفاصيل الامتحان</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
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
          </CardContent>
        </Card>
      </div>

      {/* Start Button */}
      <div className="text-center mt-3">
        <Button
          onClick={handleStartQuiz}
          disabled={groups.length === 0 || isStarting || gameState?.isActive}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold sm:px-16 py-4 sm:py-6 rounded-2xl transition-all duration-300 text-xl sm:text-2xl shadow-2xl flex items-center gap-4 mx-auto bg-primary text-primary-foreground px-2"
          type="button"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء المسابقة" : "بدء المسابقة"}
        </Button>
        {groups.length === 0 && (
          <p className="text-white/80 mt-6 text-lg sm:text-xl font-medium">يجب أن ينضم فريق واحدة على الأقل قبل البدء</p>
        )}
        {isStarting && <p className="text-white/80 mt-6 text-lg sm:text-xl font-medium">يرجى الانتظار أثناء تحضير المسابقة...</p>}
      </div>
    </div>
  )
}
