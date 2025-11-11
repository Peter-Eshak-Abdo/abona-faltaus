"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Quiz } from "@/types/quiz"

interface TrashSectionProps {
  userId: string
  onClose: () => void
  onRestore: () => void
}

const TrashSection = ({ userId, onClose, onRestore }: TrashSectionProps) => {
  const [trashedQuizzes, setTrashedQuizzes] = useState<(Quiz & { originalId: string; deletedAt: Date; expiresAt: Date })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrashedQuizzes()
  }, [userId])

  const loadTrashedQuizzes = async () => {
    try {
      setLoading(true)
      const { getTrashedQuizzes, cleanupExpiredTrash } = await import("@/lib/firebase-utils")

      // Clean up expired items first
      await cleanupExpiredTrash(userId)

      // Load trashed quizzes
      const trashed = await getTrashedQuizzes(userId)
      setTrashedQuizzes(trashed)
    } catch (error) {
      console.error("Error loading trashed quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (trashId: string) => {
    if (confirm("هل أنت متأكد من استعادة هذه المسابقة؟")) {
      try {
        const { restoreQuiz } = await import("@/lib/firebase-utils")
        await restoreQuiz(trashId)
        alert("تم استعادة المسابقة بنجاح")
        await loadTrashedQuizzes()
        onRestore()
      } catch (error) {
        console.error("Error restoring quiz:", error)
        alert("فشل في استعادة المسابقة")
      }
    }
  }

  const handlePermanentDelete = async (trashId: string) => {
    if (confirm("هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        const { permanentlyDeleteQuiz } = await import("@/lib/firebase-utils")
        await permanentlyDeleteQuiz(trashId)
        alert("تم الحذف النهائي")
        loadTrashedQuizzes()
      } catch (error) {
        console.error("Error permanently deleting quiz:", error)
        alert("فشل في الحذف النهائي")
      }
    }
  }

  const getDaysRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-4xl">سلة المحذوفات</CardTitle>
          <Button onClick={onClose} variant="outline">إغلاق</Button>
        </div>
      </CardHeader>
      <CardContent>
        {trashedQuizzes.length === 0 ? (
          <p className="text-center text-gray-500 text-2xl py-8">لا توجد مسابقات محذوفة</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trashedQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 mb-4">{quiz.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>تم الحذف: {quiz.deletedAt.toLocaleDateString("ar-EG")}</p>
                  <p className="text-red-600 font-semibold">
                    يتبقى {getDaysRemaining(quiz.expiresAt)} يوم للحذف النهائي
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleRestore(quiz.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  >
                    استعادة
                  </Button>
                  <Button
                    onClick={() => handlePermanentDelete(quiz.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    حذف نهائي
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrashSection
