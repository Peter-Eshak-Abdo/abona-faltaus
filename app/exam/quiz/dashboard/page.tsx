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
    } catch (error: unknown) {
      console.error("Error loading quizzes:", error)

      // Extract index URL if present
      let message = "Failed to load quizzes"
      if (error instanceof Error) {
        message = error.message
        const urlMatch = error.message.match(/(https:\/\/console\.firebase\.google\.com[^\s]+)/)
        if (urlMatch) {
          setIndexUrl(urlMatch[1])
          setError("Database index required. Click the button below to create it automatically.")
          setLoadingQuizzes(false)
          return
        }
      }
      setError(message)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication error: {authError.message}
            <Button onClick={() => router.push("/auth")} className="mt-2 w-full">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Dashboard</h1>
            <p className="text-gray-600 mt-2">Create and manage your interactive quizzes</p>
            <p className="text-sm text-gray-500">Welcome, {user.displayName || user.email}</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2" size="lg">
            <Plus className="w-5 h-5" />
            Create New Quiz
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
                      Create Index
                    </Button>
                  )}
                  <Button onClick={handleRetry} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
                {indexUrl && (
                  <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Click &quot;Create Index&quot; to open Firebase Console</li>
                      <li>Click &quot;Create Index&quot; in the Firebase Console</li>
                      <li>Wait for the index to build (usually 1-2 minutes)</li>
                      <li>Come back and click &quot;Retry&quot;</li>
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
              <Card key={i} className="animate-pulse">
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Create your first quiz to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              Create Your First Quiz
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
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {quiz.questions.length} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {quiz.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Host Quiz
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
