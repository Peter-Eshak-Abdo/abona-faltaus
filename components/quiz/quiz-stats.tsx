import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Quiz, Group } from "@/types/quiz"

interface QuizStatsProps {
  quiz: Quiz
  groups: Group[]
}

export function QuizStats({ quiz, groups }: QuizStatsProps) {
  const totalMembers = groups.reduce((sum: number, g: any) => sum + (g.members?.length || 0), 0)
  return (
    <Card className="shadow-2xl mb-1 overflow-hidden">
      <CardHeader className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="text-2xl font-bold">تفاصيل الامتحان</CardTitle>
      </CardHeader>
      <CardContent className="p-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1" dir="rtl">
          {[
            { label: "سؤال", value: quiz.questions?.length || 0, color: "text-blue-500" },
            { label: "فريق", value: groups.length, color: "text-green-500" },
            { label: "عضو", value: totalMembers, color: "text-purple-500" },
            { label: "دقيقة (تقريباً)", value: Math.ceil((quiz.questions?.reduce((a: any, b: any) => a + (b.timeLimit || 0), 0) || 0) / 60), color: "text-orange-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md p-1 rounded-2xl text-center border border-white/5">
              <div className={`text-4xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
