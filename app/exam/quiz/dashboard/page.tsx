"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Play, Users, Calendar, AlertCircle, Edit, Trash2, Trash, Loader2 } from "lucide-react"
import type { Quiz } from "@/types/quiz"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { CreateQuizDialog } from "@/components/quiz/create-quiz-dialog-old"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import TrashSection from "@/components/quiz/trash-section"

function DashboardView() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<any>(null)
  const [showTrash, setShowTrash] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push("/auth/signin")
      else {
        setUser(user)
        loadQuizzes(user.id)
      }
    }
    checkUser()
  }, [router])

  const loadQuizzes = async (userId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("created_by", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    if (error) setError("فشل تحميل المسابقات")
    else setQuizzes(data || [])
    setLoading(false)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("نقل المسابقة لسلة المحذوفات؟")) {
      const { error } = await supabase
        .from("quizzes")
        .update({ is_deleted: true, deleted_at: new Date() })
        .eq("id", quizId)

      if (!error) loadQuizzes(user.id)
    }
  }

  if (loading && !quizzes.length) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12" /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-1" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-1">
        {/* Header */}
        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">لوحة تحكم المسابقات</CardTitle>
              <p className="text-muted-foreground">أهلاً بك يا أستاذ {user?.user_metadata?.full_name || "المعلم"}</p>
            </div>
            <div className="flex gap-1">
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-1 h-4 w-4" /> مسابقة جديدة
              </Button>
              <Button variant="outline" onClick={() => setShowTrash(!showTrash)}>
                <Trash className="ml-1 h-4 w-4" /> السلة
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {quizzes.map((quiz) => (
            <motion.div key={quiz.id} layout>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-2 bg-blue-500" />
                <CardContent className="p-1">
                  <h3 className="text-xl font-bold mb-1">{quiz.title}</h3>
                  <div className="flex gap-1 text-sm text-gray-500 mb-1">
                    <span className="flex items-center"><Calendar className="ml-1 h-4 w-4" /> {new Date(quiz.created_at).toLocaleDateString('ar-EG')}</span>
                    <span className="flex items-center"><Users className="ml-1 h-4 w-4" /> {quiz.questions?.length || 0} سؤال</span>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => router.push(`/exam/quiz/quiz/${quiz.id}/host`)} className="flex-1 bg-green-600">بدء</Button>
                    <Button variant="outline" onClick={() => { setEditingQuiz(quiz); setIsCreateDialogOpen(true); }}>تعديل</Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuiz(quiz.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {showTrash && <TrashSection userId={user.id} onClose={() => setShowTrash(false)} onRestore={() => loadQuizzes(user.id)} />}

        <CreateQuizDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          editQuiz={editingQuiz}
          onQuizCreated={() => loadQuizzes(user.id)}
        />
      </div>
    </div>
  )
}
