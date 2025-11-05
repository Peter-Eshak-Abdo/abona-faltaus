"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { getUserQuizzes } from "@/lib/firebase-utils"
import { Plus, Play, Users, Calendar, AlertCircle, Edit, Trash2, Trash } from "lucide-react"
import type { Quiz } from "@/types/quiz"
import { motion } from "framer-motion"
import { CreateQuizDialog } from "@/components/quiz/create-quiz-dialog"
import { getDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TrashSection from "@/components/quiz/trash-section"

export default function DashboardPage() {
  const [user, loading, authError] = useAuthState(auth)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [indexUrl, setIndexUrl] = useState<string | null>(null)
  const router = useRouter()
  const [customDisplayName, setCustomDisplayName] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadUserQuizzes()
    }
    const loadCustomName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCustomDisplayName(userData.name || null);
          }
        } catch (error) {
          console.error("Error loading custom name:", error);
        }
      }
    };
    loadCustomName();

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

  const displayName = customDisplayName || user?.displayName || "اهلا بك";

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المسابقة؟ سيتم نقلها إلى سلة المحذوفات لمدة 30 يوم.")) {
      try {
        const { deleteQuiz } = await import("@/lib/firebase-utils")
        await deleteQuiz(quizId)
        alert("تم نقل المسابقة إلى سلة المحذوفات")
        loadUserQuizzes()
      } catch (error) {
        console.error("Error deleting quiz:", error)
        alert("فشل في حذف المسابقة")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-1">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <Card className="mb-2 shadow-xl rounded-4xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-center gap-1">
              <img src={"/images/alnosor/logo.jpeg"} alt="Logo"
                className="w-auto rounded-lg shadow-lg mb-1 h-16" />
              <div className="text-center md:text-left">
                <CardTitle className="text-5xl font-bold text-gray-900 mb-2">لوحة تحكم المسابقات</CardTitle>
                <p className="text-gray-600 text-3xl">إنشاء وإدارة مسابقاتك التفاعلية</p>
                <p className="text-2xl text-gray-500 mt-1">استاذ/ة {displayName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-1 font-bold shadow-lg text-white rounded-lg text-2xl scale-95 hover:scale-100 transition-all duration-200 hover:shadow-2xl hover:text-2xl"
                  type="button"
                  size="normal"
                >
                  <Plus className="w-3 h-3" />
                  إنشاء مسابقة جديد
                </Button>
                <Button
                  onClick={() => setShowTrash(!showTrash)}
                  variant="outline"
                  className="flex items-center gap-1 p-1 font-bold shadow-lg rounded-lg text-4xl scale-95 hover:scale-100 transition-all duration-200 hover:shadow-2xl hover:text-2xl"
                  type="button"
                  size="normal"
                >
                  <Trash className="w-4 h-4" />
                  سلة المحذوفات
                </Button>
              </div>
              <CreateQuizDialog
                open={isCreateDialogOpen}
                onOpenChange={(open) => {
                  setIsCreateDialogOpen(open)
                  if (!open) setEditingQuiz(null)
                }}
                onQuizCreated={() => {
                  setIsCreateDialogOpen(false)
                  setEditingQuiz(null)
                  loadUserQuizzes()
                }}
                editQuiz={editingQuiz}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Error message */}
        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-1 rounded mb-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            {indexUrl && (
              <button
                onClick={() => window.open(indexUrl, "_blank")}
                className="mt-1 bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded"
                type="button"
              >
                إنشاء الفهرس
              </button>
            )}
            <button
              onClick={loadUserQuizzes}
              className="mt-1 ml-1 bg-gray-500 hover:bg-gray-600 text-white p-1 rounded"
              type="button"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Quizzes */}
        {loadingQuizzes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-1 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-1">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <Plus className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-1">لا توجد مسابقات حتي الأن</h3>
            <p className="text-gray-600 mb-1 text-lg">دوس على زرار &quot;إنشاء مسابقة جديدة&quot;</p>
          </motion.div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {quizzes.map((quiz, index) => (
              <motion.div key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>
                <Card className="shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out rounded-4xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <CardTitle className="text-2xl text-center font-bold">{quiz.title}</CardTitle>
                    <p className="text-blue-100 text-lg">• {quiz.description}</p>
                  </CardHeader>
                  <CardContent className="p-1">
                    <div className="flex items-center justify-between md:flex-row flex-col mb-1">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span className="text-2xl font-extrabold">
                          {new Date(quiz.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-3 h-3" />
                        <span className="text-2xl font-extrabold">{quiz.questions.length} سؤال</span>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-1">
                      <Button
                        size="normal"
                        onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                        type="button"
                      >
                        <Play className="w-4 h-4" />
                        البدء
                      </Button>
                      <Button
                        size="normal"
                        onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/join`)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
                        type="button"
                      >
                        <Users className="w-4 h-4" />
                        الانضمام
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="normal"
                        onClick={() => handleEditQuiz(quiz)}
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1 transition-all duration-200 scale-95 hover:scale-100 hover:text-2xl"
                        type="button"
                      >
                        <Edit className="w-3 h-4" />
                        تعديل
                      </Button>
                      <Button
                        size="normal"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        variant="destructive"
                        className="flex-1 flex items-center justify-center gap-1 transition-all duration-200 scale-95 hover:scale-100 hover:text-2xl"
                        type="button"
                      >
                        <Trash2 className="w-3 h-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Trash Section */}
        {showTrash && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1"
          >
            <TrashSection userId={user.uid} onClose={() => setShowTrash(false)} onRestore={loadUserQuizzes} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
