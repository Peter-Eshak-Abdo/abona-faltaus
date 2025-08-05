/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Minus, Play, AlertCircle } from "lucide-react"
import type { Quiz, GameState } from "@/types/quiz"
import { motion } from "framer-motion"

export default function JoinQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [groupName, setGroupName] = useState("")
  const [memberCount, setMemberCount] = useState(2)
  const [memberNames, setMemberNames] = useState<string[]>(["", ""])
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const quizId = params.quizId as string


  useEffect(() => {
    if (quizId) {
      const loadQuiz = async () => {
        try {
          const quizData = await getQuiz(quizId)
          if (!quizData) {
            setError("الامتحان غير موجود")
            return
          }
          setQuiz(quizData)
        } catch (error) {
          console.error("Error loading quiz:", error)
          setError("فشل في تحميل الامتحان")
        }
      }
      loadQuiz()

      // Subscribe to game state
      const unsubscribe = subscribeToGameState(quizId, (state) => {
        setGameState(state)
        if (state?.isActive && hasJoined) {
          router.push(`/exam/quiz/quiz/${quizId}/play`)
        }
      })

      return unsubscribe
    }
  }, [quizId, hasJoined, router])

  useEffect(() => {
    // Update member names array when count changes
    const newNames = [...memberNames]
    if (memberCount > memberNames.length) {
      // Add empty strings for new members
      for (let i = memberNames.length; i < memberCount; i++) {
        newNames.push("")
      }
    } else if (memberCount < memberNames.length) {
      // Remove excess names
      newNames.splice(memberCount)
    }
    setMemberNames(newNames)
  }, [memberCount , memberNames])


  const updateMemberName = (index: number, name: string) => {
    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)
  }

  const handleJoin = async () => {
    if (!groupName.trim()) {
      setError("يرجى إدخال اسم المجموعة")
      return
    }

    const validNames = memberNames.filter((name) => name.trim())
    if (validNames.length !== memberCount) {
      setError("يرجى ملء جميع أسماء الأعضاء")
      return
    }

    const uniqueNames = new Set(validNames.map((name) => name.trim().toLowerCase()))
    if (uniqueNames.size !== validNames.length) {
      setError("يجب أن تكون جميع أسماء الأعضاء مختلفة داخل مجموعتكم")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      const groupId = await joinQuizAsGroup(quizId, {
        groupName: groupName.trim(),
        members: validNames.map((name) => name.trim()),
      })

      localStorage.setItem(
        "currentGroup",
        JSON.stringify({
          id: groupId,
          groupName: groupName.trim(),
          members: validNames.map((name) => name.trim()),
        }),
      )

      setHasJoined(true)
    } catch (error: any) {
      setError(error.message || "فشل في الانضمام للامتحان")
    } finally {
      setIsJoining(false)
    }
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center shadow-xl border-0">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">بدأ الامتحان بالفعل</h2>
            <p className="text-gray-600 mb-6 text-lg">هذا الامتحان بدأ بالفعل. لا يمكنك الانضمام الآن.</p>
            <Button onClick={() => router.push("/")} variant="outline" className="w-full py-3 text-lg">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="text-center shadow-xl border-0">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">تم الانضمام بنجاح!</h2>
              <p className="text-gray-600 mb-6 text-lg">مجموعة &quot;{groupName}&quot; انضمت للامتحان. في انتظار بدء المشرف...</p>
              <div className="animate-pulse">
                <div className="h-3 bg-green-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
          <p className="text-gray-600 text-lg">{quiz.description}</p>
        </motion.div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-center justify-center text-2xl">
              <Users className="w-6 h-6" />
              الانضمام كمجموعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-lg">{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="groupName" className="text-lg font-medium text-gray-700 mb-3 block">
                اسم المجموعة
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="أدخل اسم مجموعتكم..."
                className="text-lg p-4 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-lg font-medium text-gray-700 mb-4 block">عدد الأعضاء</Label>
              <div className="flex items-center justify-center gap-6">
                <Button
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  variant="outline"
                  size="lg"
                  disabled={memberCount <= 1}
                  className="w-14 h-14 rounded-full border-2"
                >
                  <Minus className="w-6 h-6" />
                </Button>
                <div className="text-4xl font-bold text-blue-600 w-16 text-center">{memberCount}</div>
                <Button
                  onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                  variant="outline"
                  size="lg"
                  disabled={memberCount >= 10}
                  className="w-14 h-14 rounded-full border-2"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-lg font-medium text-gray-700 mb-4 block">أسماء الأعضاء</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberNames.map((name, index) => (
                  <div key={index} className="relative">
                    <Input
                      value={name}
                      onChange={(e) => updateMemberName(index, e.target.value)}
                      placeholder={`اسم العضو ${index + 1}`}
                      className="text-lg p-4 pr-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 text-xl"
              size="lg"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                  جاري الانضمام...
                </>
              ) : (
                <>
                  <Users className="w-6 h-6 ml-3" />
                  الانضمام للامتحان
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
