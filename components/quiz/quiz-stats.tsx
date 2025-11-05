import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quiz, Group } from "@/types/quiz"

interface QuizStatsProps {
  quiz: Quiz
  groups: Group[]
}

export function QuizStats({ quiz, groups }: QuizStatsProps) {
  return (
    <Card className="shadow-2xl mb-1 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="text-2xl font-bold">تفاصيل الامتحان</CardTitle>
      </CardHeader>
      <CardContent className="p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-1 bg-blue-50 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{quiz.questions.length}</div>
            <div className="text-gray-700 font-bold text-lg">سؤال</div>
          </div>
          <div className="text-center p-1 bg-green-50 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">{groups.length}</div>
            <div className="text-gray-700 font-bold text-lg">فريق</div>
          </div>
          <div className="text-center p-1 bg-purple-50 rounded-2xl shadow-lg">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {groups.reduce((total, group) => total + group.members.length, 0)}
            </div>
            <div className="text-gray-700 font-bold text-lg">عضو</div>
          </div>
          <div className="text-center p-1 bg-orange-50 rounded-2xl shadow-lg">
            <div className="text-gray-700 font-bold text-lg">{Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) / 60)} دقيقة</div>
            <div className="text-4xl font-bold text-orange-600 mb-2">
              <div className="text-gray-700 font-bold text-lg">{Math.round(quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0))} ثانية</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
