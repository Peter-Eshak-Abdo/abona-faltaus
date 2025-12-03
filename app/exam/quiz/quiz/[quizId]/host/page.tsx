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
import type { Quiz, Group, GameState } from "@/types/quiz"
import { motion } from "framer-motion"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"
import { Button } from "@/components/ui/button"
import { QRCodeSection } from "@/components/quiz/qr-code-section"
import { GroupsSection } from "@/components/quiz/groups-section"
import { QuizStats } from "@/components/quiz/quiz-stats"

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



  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join` : `abona-faltaus.vercel.app/exam/quiz/quiz/${quizId}/join`

  return (
    <div className="min-h-screen from-blue-300 to-purple-300 p-1">
      <div className="max-w-8xl mx-auto">
        <div className="mb-3 text-center md:text-right px-2 sm:px-0">
          <div className="flex flex-col-reverse md:flex-row">
            <div className="grow">
              <h1 className="text-7xl font-bold text-white mb-3 drop-shadow-xl text-center md:text-9xl">{quiz.title}</h1>
              <p className="text-white/80 text-3xl mb-2 text-center">{quiz.description}</p>
            </div>
            <img src={"/images/alnosor/logo.jpeg"} alt="Logo" className="rounded-lg shadow-lg mb-2 w-20" />
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

        <div className="flex flex-col gap-1 mb-2">
          <QRCodeSection joinUrl={joinUrl} qrSize={qrSize} setQrSize={setQrSize} />
          <GroupsSection
            groups={groups}
            isCleaningUp={isCleaningUp}
            handleCleanupOldGroups={handleCleanupOldGroups}
            handleDeleteGroup={handleDeleteGroup}
            deletingGroupId={deletingGroupId}
          />
        </div>

        <div className="flex flex-row md:flex-row justify-center items-center gap-2">
          <QuizStats quiz={quiz} groups={groups} />

          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={handleStartQuiz}
              disabled={groups.length === 0 || isStarting || gameState?.isActive}
              className="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-2xl transition-all duration-300 text-xl sm:text-2xl shadow-2xl flex items-center mx-auto bg-primary text-primary-foreground p-1"
              type="button"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء المسابقة" : "بدء المسابقة"}
            </Button>
            {groups.length === 0 && (
              <p className="text-white/80 mt-1 text-lg sm:text-xl font-medium">يجب أن ينضم فريق واحدة على الأقل قبل البدء</p>
            )}
            {isStarting && <p className="text-white/80 mt-1 text-lg sm:text-xl font-medium">يرجى الانتظار أثناء تحضير المسابقة...</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
