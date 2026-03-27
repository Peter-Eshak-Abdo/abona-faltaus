"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { SAINTS_DATA } from "@/lib/saints-data"
import type { Quiz, GameState, Saint } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/supabase-utils"

export default function JoinQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [groupName, setGroupName] = useState("")
  const [memberCount, setMemberCount] = useState(5)
  const [memberNames, setMemberNames] = useState<string[]>(["", ""])
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null)
  const [useCustomName, setUseCustomName] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const quizId = params.quizId as string
  const memberCountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (quizId) {
      loadQuiz()
      const subscription = subscribeToGameState(quizId, (state) => {
        setGameState(state)
        // التوجيه يتم فقط هنا عندما يقرر الأدمن بدء المسابقة
        if (state?.is_active && hasJoined) router.push(`/exam/quiz/quiz/${quizId}/play`)
      })
      return () => { subscription.unsubscribe() }
    }
  }, [quizId, hasJoined, router])

  useEffect(() => {
    const savedGroup = localStorage.getItem("currentGroup")
    if (savedGroup) {
      try {
        const parsed = JSON.parse(savedGroup)
        const THREE_HOURS = 3 * 60 * 60 * 1000
        const now = Date.now()

        const isSameQuiz = parsed.quiz_id === quizId
        const isFresh = parsed.timestamp && (now - parsed.timestamp) < THREE_HOURS

        if (isSameQuiz && isFresh) {
          setGroupName(parsed.group_name || "")
          setMemberNames(parsed.members || [])
          setMemberCount(parsed.members?.length || 5)

          if (parsed.saint_name) {
            setUseCustomName(false)
            setSelectedSaint({ name: parsed.saint_name, src: parsed.saint_image || "" })
          } else {
            setUseCustomName(true)
          }
          setHasJoined(true)
        } else {
          localStorage.removeItem("currentGroup")
        }
      } catch (e) {
        localStorage.removeItem("currentGroup")
      }
    }
  }, [quizId])

  useEffect(() => {
    const newNames = [...memberNames]
    if (memberCount > memberNames.length) {
      for (let i = memberNames.length; i < memberCount; i++) newNames.push("")
    } else if (memberCount < memberNames.length) {
      newNames.splice(memberCount)
    }
    setMemberNames(newNames)
  }, [memberCount])

  const loadQuiz = async () => {
    try {
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        setError("المسابقة غير موجودة")
        return
      }
      setQuiz(quizData)
    } catch (error) {
      setError("فشل في تحميل المسابقة")
    }
  }

  const updateMemberName = (index: number, name: string) => {
    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)
  }

  const handleSaintSelect = (saint: Saint) => {
    setSelectedSaint(saint)
    setTimeout(() => {
      memberCountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleJoin = async () => {
    const finalGroupName = useCustomName ? groupName.trim() : selectedSaint?.name || ""

    if (!finalGroupName) return setError("يرجى اختيار قديس أو إدخال اسم مخصص للفريق")

    const validNames = memberNames.filter((name) => name.trim())
    if (validNames.length !== memberCount) return setError("يرجى ملء جميع أسماء الأعضاء")

    const uniqueNames = new Set(validNames.map((name) => name.trim().toLowerCase()))
    if (uniqueNames.size !== validNames.length) return setError("لازم تكون كل أسماء الأعضاء مختلفة في فريقكم")

    setIsJoining(true)
    setError("")

    try {
      const groupData = {
        groupName: finalGroupName,
        members: validNames,
        saintName: !useCustomName ? selectedSaint?.name : undefined,
        saintImage: !useCustomName ? selectedSaint?.src : undefined,
      }

      const groupId = await joinQuizAsGroup(quizId, groupData)

      localStorage.setItem("currentGroup", JSON.stringify({
        id: groupId,
        quiz_id: quizId,
        group_name: groupData.groupName,
        members: groupData.members,
        saint_name: groupData.saintName,
        saint_image: groupData.saintImage,
        timestamp: Date.now()
      }))

      setHasJoined(true)
    } catch (error: any) {
      setError(error.message || "فشل في الانضمام للمسابقة")
    } finally {
      setIsJoining(false)
    }
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    )
  }

  if (gameState?.is_active && !hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center backdrop-blur-md bg-white/20 p-1 shadow-2xl">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-2xl p-2">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">بدأت المسابقة بالفعل</h2>
          <p className="text-gray-600 mb-3 text-lg">هذه المسابقة بدأت بالفعل. لا يمكنك الانضمام الآن.</p>
          <button onClick={() => router.push("/")} className="w-full py-3 text-lg bg-gray-600 text-white rounded-xl font-bold">العودة للرئيسية</button>
        </div>
      </div>
    )
  }

  if (hasJoined && !gameState?.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center backdrop-blur-md bg-white/20 p-1 shadow-2xl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="text-center bg-white rounded-2xl shadow-2xl p-1">
            {!useCustomName && selectedSaint?.src ? (
              <img src={selectedSaint.src} alt={selectedSaint.name} className="w-12 h-12 rounded-full mx-auto mb-1 object-cover border-4 border-green-100 shadow-md" />
            ) : (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-4xl text-green-600">✓</span>
              </div>
            )}
            <h2 className="text-4xl font-bold mb-1 text-gray-900">تم الانضمام بنجاح!</h2>
            <p className="text-gray-600 text-2xl font-extrabold mb-1">&quot;{useCustomName ? groupName : selectedSaint?.name}&quot;</p>
            <p className="text-gray-600 mt-1 text-xl">في انتظار بدء الخادم...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
              <motion.div className="bg-green-500 h-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-purple-700 flex items-center justify-center p-1">
      <div className="w-full max-w-7xl space-y-1 backdrop-blur-md bg-white/20 rounded-3xl p-1 shadow-2xl">
        <div className="text-center text-white mb-1">
          <h1 className="text-5xl font-bold drop-shadow-lg">{quiz.title}</h1>
          <p className="text-xl mt-1 opacity-90">{quiz.description}</p>
        </div>

        <Card className="bg-white/90 shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">الانضمام كفريق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {error && (
              <div className="bg-red-100 text-red-700 p-1 rounded-xl text-center font-bold">{error}</div>
            )}

            <div>
              <label className="block text-xl font-bold mb-1 text-center">اختر اسم الفريق</label>
              <div className="flex gap-1 mb-1">
                <button onClick={() => setUseCustomName(false)} className={`flex-1 p-1 rounded-xl font-bold ${!useCustomName ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>اختيار قديس</button>
                <button onClick={() => setUseCustomName(true)} className={`flex-1 p-1 rounded-xl font-bold ${useCustomName ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>اسم مخصص</button>
              </div>

              <AnimatePresence mode="wait">
                {useCustomName ? (
                  <motion.input key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="أدخل اسم فريقك..."
                    className="w-full text-xl p-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none" />
                ) : (
                  <motion.div key="saints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1 max-h-96 overflow-y-auto p-1">
                    {SAINTS_DATA.map((saint) => (
                      <button key={saint.name} onClick={() => handleSaintSelect(saint)}
                        className={`p-1 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedSaint?.name === saint.name ? "border-blue-600 bg-blue-50 scale-105 shadow-md" : "border-gray-200 hover:border-blue-300"}`}>
                        <img src={saint.src} alt={saint.name} className="w-8 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <p className="text-center font-bold text-sm">{saint.name}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <hr className="my-1" />

            <div ref={memberCountRef} className="text-center">
              <label className="block text-xl font-bold mb-1">عدد الأعضاء</label>
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => setMemberCount(Math.max(1, memberCount - 1))} className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold">-</button>
                <span className="text-5xl font-black">{memberCount}</span>
                <button onClick={() => setMemberCount(Math.min(10, memberCount + 1))} className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold">+</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-1">
              {memberNames.map((name, index) => (
                <div key={index} className="relative">
                  <input type="text" value={name} onChange={(e) => updateMemberName(index, e.target.value)} placeholder={`اسم العضو ${index + 1}`}
                    className="w-full text-lg p-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none pr-1 text-right" dir="rtl" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                </div>
              ))}
            </div>

            <button onClick={handleJoin} disabled={isJoining} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1 rounded-xl text-2xl mt-1 transition-colors shadow-lg">
              {isJoining ? "جاري الانضمام..." : "الانضمام للمسابقة 🚀"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
