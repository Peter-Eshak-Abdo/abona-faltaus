import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Users, Calendar, Edit, Trash2 } from "lucide-react"
import type { Quiz } from "@/types/quiz"

interface QuizCardProps {
  quiz: Quiz
  index: number
  onEdit: (quiz: Quiz) => void
  onDelete: (quizId: string) => void
  onHost: (quizId: string) => void
  onJoin: (quizId: string) => void
}

const QuizCard = React.memo(({ quiz, index, onEdit, onDelete, onHost, onJoin }: QuizCardProps) => {
  return (
    <motion.div
      key={quiz.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out rounded-4xl">
        <CardHeader className="bg-linear-to-r from-blue-500 to-indigo-600 text-white">
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
              onClick={() => onHost(quiz.id)}
              className="flex-1 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
              type="button"
            >
              <Play className="w-4 h-4" />
              البدء
            </Button>
            <Button
              size="normal"
              onClick={() => onJoin(quiz.id)}
              className="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1"
              type="button"
            >
              <Users className="w-4 h-4" />
              الانضمام
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              size="normal"
              onClick={() => onEdit(quiz)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-1 transition-all duration-200 scale-95 hover:scale-100 hover:text-2xl"
              type="button"
            >
              <Edit className="w-3 h-4" />
              تعديل
            </Button>
            <Button
              size="normal"
              onClick={() => onDelete(quiz.id)}
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
  )
})

QuizCard.displayName = "QuizCard"

export default QuizCard
