/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
import { SAINTS_DATA } from "@/lib/saints-data"
import type { Quiz, GameState, Saint } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"

export default function JoinQuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [groupName, setGroupName] = useState("")
  const [memberCount, setMemberCount] = useState(2)
  const [memberNames, setMemberNames] = useState<string[]>(["", ""])
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null)
  const [useCustomName, setUseCustomName] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const quizId = params.quizId as string

  useEffect(() => {
    if (quizId) {
      loadQuiz()

      const unsubscribe = subscribeToGameState(quizId, (state) => {
        setGameState(state)
        if (state?.isActive && hasJoined) {
          router.push(`/exam/quiz/quiz/${quizId}/play`)
        }
      })

      return unsubscribe
    }
  }, [quizId, hasJoined])

  useEffect(() => {
    const newNames = [...memberNames]
    if (memberCount > memberNames.length) {
      for (let i = memberNames.length; i < memberCount; i++) {
        newNames.push("")
      }
    } else if (memberCount < memberNames.length) {
      newNames.splice(memberCount)
    }
    setMemberNames(newNames)
  }, [memberCount])

  const loadQuiz = async () => {
    try {
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        setError("المسابقة غير موجوده")
        return
      }
      setQuiz(quizData)
    } catch (error) {
      console.error("Error loading quiz:", error)
      setError("فشل في تحميل المسابقة")
    }
  }

  const updateMemberName = (index: number, name: string) => {
    const newNames = [...memberNames]
    newNames[index] = name
    setMemberNames(newNames)
  }

  const handleJoin = async () => {
    const finalGroupName = useCustomName ? groupName.trim() : selectedSaint?.name || ""

    if (!finalGroupName) {
      setError("يرجى اختيار قديس أو إدخال اسم مخصص للفريق")
      return
    }

    const validNames = memberNames.filter((name) => name.trim())
    if (validNames.length !== memberCount) {
      setError("يرجى ملء جميع أسماء الأعضاء")
      return
    }

    const uniqueNames = new Set(validNames.map((name) => name.trim().toLowerCase()))
    if (uniqueNames.size !== validNames.length) {
      setError("لازم تكون كل أسماء الأعضاء مختلفة في فريقكم")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      const groupData = {
        groupName: finalGroupName,
        members: validNames.map((name) => name.trim()),
        ...(selectedSaint && !useCustomName && {
          saintName: selectedSaint.name,
        }),
      }

      const groupId = await joinQuizAsGroup(quizId, groupData)

      localStorage.setItem(
        "currentGroup",
        JSON.stringify({
          id: groupId,
          ...groupData,
        }),
      )

      setHasJoined(true)
    } catch (error: any) {
      setError(error.message || "فشل في الانضمام للمسابقة")
    } finally {
      setIsJoining(false)
    }
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    )
  }

  if (gameState?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-4">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-2xl p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">بدأ المسابقة بالفعل</h2>
          <p className="text-gray-600 mb-6 text-lg">هذة المسابقة بدأ بالفعل. لا يمكنك الانضمام الآن.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 text-lg bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-bold"
            type="button"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  if (hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-blue-700 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="text-center bg-white rounded-2xl shadow-2xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">تم الانضمام بنجاح!</h2>
            <p className="text-gray-600 mb-6 text-lg">
              فريق &quot;{useCustomName ? groupName : selectedSaint?.name}&quot; انضمت للمسابقة. في انتظار بدء الخادم...
            </p>
            <div className="animate-pulse">
              <div className="h-3 bg-green-200 rounded-full"></div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">{quiz.title}</h1>
          <p className="text-white/80 text-lg">{quiz.description}</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h2 className="flex items-center gap-3 text-center justify-center text-2xl font-bold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              الانضمام كفريق
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="mr-3 text-red-700 text-lg">{error}</p>
                </div>
              </div>
            )}

            {/* اختيار نوع الاسم */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">اختر اسم الفريق</label>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setUseCustomName(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${!useCustomName
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  type="button"
                >
                  اختيار قديس
                </button>
                <button
                  onClick={() => setUseCustomName(true)}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${useCustomName
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  type="button"
                >
                  اسم مخصص
                </button>
              </div>

              <AnimatePresence mode="wait">
                {useCustomName ? (
                  <motion.div
                    key="custom"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="أدخل اسم فريقك..."
                      className="w-full text-lg p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="saints"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto"
                  >
                    {SAINTS_DATA.map((saint, index) => (
                      <motion.button
                        key={saint.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedSaint(saint as Saint)}
                        className={`p-4 rounded-xl border-2 transition-all ${selectedSaint?.name === saint.name
                          ? "border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                          }`}
                      >
                        <p className="text-sm font-bold text-gray-800 text-center leading-tight">
                          {saint.name}
                        </p>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">عدد الأعضاء</label>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  disabled={memberCount <= 1}
                  className="w-14 h-14 rounded-full border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  type="button"
                  title="تقليل عدد الأعضاء"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="text-4xl font-bold text-purple-600 w-16 text-center">{memberCount}</div>
                <button
                  onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                  disabled={memberCount >= 10}
                  className="w-14 h-14 rounded-full border-2 border-purple-300 flex items-center justify-center hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  title="زيادة عدد الأعضاء"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-4">أسماء الأعضاء</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberNames.map((name, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateMemberName(index, e.target.value)}
                      placeholder={`اسم العضو ${index + 1}`}
                      className="w-full text-lg p-4 pr-12 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 text-xl flex items-center justify-center gap-3 shadow-lg"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  جاري الانضمام...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  الانضمام للمسابقة
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
