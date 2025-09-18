"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { getUserQuizzes } from "@/lib/firebase-utils"
import { Plus, Play, Users, Calendar, AlertCircle } from "lucide-react"
import type { Quiz } from "@/types/quiz"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [user, loading, authError] = useAuthState(auth)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [, setIsCreateDialogOpen] = useState(false)
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadUserQuizzes()
    }
  }, [user])

  const loadUserQuizzes = async () => {
    if (!user) return
    try {
      setError(null)
      setIndexUrl(null)
      setLoadingQuizzes(true)

      const userQuizzes = await getUserQuizzes(user.uid)
      setQuizzes(userQuizzes)
    } catch (error: unknown) {
      let message = "فشل في تحميل المسابقات"
      let urlMatch: RegExpMatchArray | null = null
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as { message: unknown }).message === "string") {
        const errorMessage = (error as { message: string }).message
        urlMatch = errorMessage.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/)
        message = errorMessage || message
      }
      if (urlMatch) {
        setIndexUrl(urlMatch[1])
        setError("مطلوب فهرس قاعدة البيانات. اضغط على الزر لإنشائه.")
      } else {
        setError(message)
      }
    } finally {
      setLoadingQuizzes(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span>خطأ في المصادقة: {authError.message}</span>
          </div>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            type="button"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-center mb-8 gap-4">
          <img src={"/images/alnosor/logo.jpeg"} alt="Logo"
            className="w-auto rounded-lg shadow-lg mb-2"
            style={{ height: "50vh" }} />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة تحكم المسابقات</h1>
            <p className="text-gray-600 text-lg">إنشاء وإدارة مسابقاتك التفاعلية</p>
            <p className="text-sm text-gray-500 mt-1">أهلاً بك، {user.displayName || user.email}</p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-3 px-4 text-lg font-semibold shadow-lg text-white rounded-lg"
            type="button"
          >
            <Plus className="w-6 h-6" />
            إنشاء مسابقة جديد
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            {indexUrl && (
              <button
                onClick={() => window.open(indexUrl, "_blank")}
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                type="button"
              >
                إنشاء الفهرس
              </button>
            )}
            <button
              onClick={loadUserQuizzes}
              className="mt-2 ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              type="button"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Quizzes */}
        {loadingQuizzes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">لا توجد مسابقات بعد</h3>
            <p className="text-gray-600 mb-8 text-lg">دوس على زرار &quot;إنشاء مسابقة جديدة&quot;</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>
                <div className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition cursor-pointer">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {quiz.questions.length} سؤال
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {quiz.createdAt.toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                    type="button"
                  >
                    <Play className="w-5 h-5" />
                    بدء المسابقة
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
