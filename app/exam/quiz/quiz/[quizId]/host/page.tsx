"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Quiz, Group, GameState } from "@/types/quiz"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"
import { QRCodeSection } from "@/components/quiz/qr-code-section"
import { GroupsSection } from "@/components/quiz/groups-section"
import { QuizStats } from "@/components/quiz/quiz-stats"

export default function HostQuizView() {
  const { quizId } = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [gameState, setGameState] = useState<any>(null)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // 1. جلب بيانات المسابقة
      const { data: quizData } = await supabase.from("quizzes").select("*").eq("id", quizId).single()
      setQuiz(quizData)

      // 2. جلب الفرق الحالية
      const { data: groupsData } = await supabase.from("groups").select("*").eq("quiz_id", quizId)
      setGroups(groupsData || [])

      // 3. جلب حالة اللعبة
      const { data: stateData } = await supabase.from("game_state").select("*").eq("quiz_id", quizId).single()
      setGameState(stateData)
    }

    fetchData()

    // 4. الاشتراك في التغييرات اللحظية (الفرق وحالة اللعبة)
    const channel = supabase
      .channel(`quiz_${quizId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups', filter: `quiz_id=eq.${quizId}` },
        payload => {
          if (payload.eventType === 'INSERT') setGroups(prev => [...prev, payload.new])
          if (payload.eventType === 'DELETE') setGroups(prev => prev.filter(g => g.id !== payload.old.id))
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
        payload => setGameState(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [quizId])

  const handleStartQuiz = async () => {
    setIsStarting(true)
    // تحديث حالة اللعبة في Supabase لتصبح Active
    await supabase
      .from("game_state")
      .upsert({ quiz_id: quizId, is_active: true, current_question_index: 0, started_at: new Date() })
    setIsStarting(false)
  }

  if (!quiz) return <div className="h-screen flex items-center justify-center text-white bg-slate-900">جاري التحميل...</div>

  if (gameState?.is_active) return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />

  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join` : ""

  return (
    <div className="h-screen w-full bg-slate-900 text-white flex overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-800 p-1 flex flex-col border-l border-white/10">
        <h1 className="text-4xl font-black mb-1">{quiz.title}</h1>
        <div className="bg-white p-1 rounded-2xl mb-1">
          <QRCodeSection joinUrl={joinUrl} qrSize={200} setQrSize={function (size: number): void {
            throw new Error("Function not implemented.")
          } } />
        </div>
        <Button onClick={handleStartQuiz} disabled={groups.length === 0 || isStarting} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xl py-1">
          {isStarting ? "جاري البدء..." : "ابدأ المسابقة الآن 🚀"}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-1 flex flex-col gap-1 overflow-y-auto">
        <header>
          <h2 className="text-5xl font-bold">بانتظار الأبطال...</h2>
          <p className="text-slate-400 text-2xl mt-1">انضم حتى الآن: {groups.length} فريق</p>
        </header>

        <GroupsSection
          groups={groups}
          isCleaningUp={false}
          handleCleanupOldGroups={() => {}}
          handleDeleteGroup={() => {}}
          deletingGroupId={null}
        />

        <div className="mt-auto">
          <QuizStats quiz={quiz} groups={groups} />
        </div>
      </main>
    </div>
  )
}
