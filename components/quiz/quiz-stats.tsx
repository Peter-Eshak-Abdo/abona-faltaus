"use client"
import { Clock, HelpCircle, Users, Trophy } from "lucide-react"

export function QuizStats({ quiz, groups }: { quiz: any, groups: any[] }) {
  // حساب إجمالي الدقائق بناءً على وقت كل سؤال
  const totalSeconds = quiz?.questions?.reduce((acc: number, q: any) => acc + (q.time_limit || 20), 0) || 0;
  const totalMinutes = Math.ceil(totalSeconds / 60);

  const stats = [
    { label: "سؤال", value: quiz?.questions?.length || 0, icon: HelpCircle, color: "bg-blue-500" },
    { label: "فريق", value: groups.length, icon: Users, color: "bg-green-500" },
    { label: "عضو", value: groups.reduce((acc, g) => acc + (g.members?.length || 0), 0), icon: Trophy, color: "bg-purple-500" },
    { label: "دقيقة (تقريباً)", value: totalMinutes, icon: Clock, color: "bg-orange-500" },
  ]

  return (
    <div className="grid grid-cols-4 gap-1 p-0.5 bg-white/5 rounded-xl border border-white/10">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center p-0.5 rounded-lg bg-black/20">
          <stat.icon className="w-3 h-3 mb-0.5 text-slate-400" />
          <span className="text-2xl font-black text-white leading-none">{stat.value}</span>
          <span className="text-2xl text-slate-400 font-bold mt-0.5">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
