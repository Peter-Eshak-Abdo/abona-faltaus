/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { getUserQuizzes } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Play, Users, Calendar, AlertCircle, ExternalLink } from "lucide-react"
import { CreateQuizDialog } from "@/components/quiz/create-quiz-dialog"
import type { Quiz } from "@/types/quiz"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [user, loading, authError] = useAuthState(auth)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
      console.log("Loading quizzes for user:", user.uid)

      const userQuizzes = await getUserQuizzes(user.uid)
      console.log("Loaded quizzes:", userQuizzes)
      setQuizzes(userQuizzes)
    } catch (error: any) {
      console.error("Error loading quizzes:", error)

      const urlMatch = error.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/)
      if (urlMatch) {
        setIndexUrl(urlMatch[1])
        setError("مطلوب فهرس قاعدة البيانات. انقر على الزر أدناه لإنشائه تلقائياً.")
      } else {
        setError(error.message || "فشل في تحميل الامتحانات")
      }
    } finally {
      setLoadingQuizzes(false)
    }
  }

  const handleQuizCreated = () => {
    setIsCreateDialogOpen(false)
    loadUserQuizzes()
  }

  const handleRetry = () => {
    loadUserQuizzes()
  }

  const handleCreateIndex = () => {
    if (indexUrl) {
      window.open(indexUrl, "_blank")
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
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في المصادقة: {authError.message}
            <Button onClick={() => router.push("/auth")} className="mt-2 w-full">
              حاول مرة أخرى
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة تحكم الامتحانات</h1>
            <p className="text-gray-600 text-lg">إنشاء وإدارة امتحاناتك التفاعلية</p>
            <p className="text-sm text-gray-500 mt-1">أهلاً بك، {user.displayName || user.email}</p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 text-lg font-semibold shadow-lg"
            size="lg"
          >
            <Plus className="w-6 h-6" />
            إنشاء امتحان جديد
          </Button>
        </div>

        {error && (
          <Alert className="mb-6" variant={indexUrl ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col gap-3">
                <span>{error}</span>
                <div className="flex gap-2">
                  {indexUrl && (
                    <Button
                      onClick={handleCreateIndex}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 bg-transparent"
                    >
                      <ExternalLink className="w-4 h-4" />
                      إنشاء الفهرس
                    </Button>
                  )}
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    إعادة المحاولة
                  </Button>
                </div>
                {indexUrl && (
                  <div className="text-xs text-gray-600 mt-2 p-3 bg-gray-50 rounded">
                    <strong>التعليمات:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>انقر على &quot;إنشاء الفهرس&quot; لفتح وحدة تحكم Firebase</li>
                      <li>انقر على &quot;Create Index&quot; في وحدة تحكم Firebase</li>
                      <li>انتظر حتى يتم بناء الفهرس (عادة 1-2 دقيقة)</li>
                      <li>ارجع وانقر على &quot;إعادة المحاولة&quot;</li>
                    </ol>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {loadingQuizzes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-lg">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 && !error ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="w-16 h-16 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">لا توجد امتحانات بعد</h3>
            <p className="text-gray-600 mb-8 text-lg">أنشئ امتحانك الأول للبدء</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="px-8 py-3 text-lg">
              إنشاء امتحانك الأول
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-600">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">{quiz.questions.length} سؤال</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{quiz.createdAt.toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/quiz/${quiz.id}/host`)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 text-lg font-semibold"
                    >
                      <Play className="w-5 h-5" />
                      بدء الامتحان
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onQuizCreated={handleQuizCreated}
        />
      </div>
    </div>
  )
}
