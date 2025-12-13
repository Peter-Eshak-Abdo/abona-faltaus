"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
import { SAINTS_DATA } from "@/lib/saints-data"
import type { Quiz, GameState, Saint } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirebaseServices } from "@/lib/firebase";

export default function JoinQuizPage() {
  const { auth } = getFirebaseServices();
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
  const [user] = useAuthState(auth);
  // const groupId = await joinQuizAsGroup(quizId, groupData, user?.uid);

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

  const handleSaintSelect = (saint: Saint) => {
    setSelectedSaint(saint)
    setTimeout(() => {
      memberCountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
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
          saintImage: selectedSaint.src,
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
      router.push(`/exam/quiz/quiz/${quizId}/play`)

    } catch (error) {
      console.error("Error joining quiz:", error)
      const errorMessage = (error as Error).message || "فشل في الانضمام للمسابقة"
      alert(errorMessage)
      setError(errorMessage)
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

  if (gameState?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-2xl p-1">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">بدأ المسابقة بالفعل</h2>
          <p className="text-gray-600 mb-1 text-lg">هذة المسابقة بدأ بالفعل. لا يمكنك الانضمام الآن.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-1 text-lg bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-bold"
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
      <div className="min-h-screen flex items-center justify-center backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="text-center bg-white rounded-2xl shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-3 text-gray-900">تم الانضمام بنجاح!</h2>
            <p className="text-gray-600 text-2xl">فريق</p>
            <p className="text-gray-600 text-4xl font-extrabold">&quot;{useCustomName ? groupName : selectedSaint?.name}&quot;</p>
            <p className="text-gray-600 mt-1 text-2xl"> اسماء الاعضاء:</p>
            <ul className="list-disc list">
              <li>{memberNames.map((name, index) => (
                <span key={index} className="text-gray-600 text-2xl font-bold block">
                  {index + 1}- {name}
                </span>
              ))}</li>
            </ul>
            <p className="text-gray-600 mt-1 text-2xl">
              انضمت للمسابقة. في انتظار بدء الخادم...
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

    <div className="min-h-screen bg-linear-to-br flex items-center justify-center">
      <div className="w-full max-w-8xl space-y-2 backdrop-blur-md bg-white/20 dark:bg-black/30 rounded-2xl p-1 border-white/30 dark:border-white/20 shadow-2xl">
        <div className="text-center mb-2">
          <h1 className="text-5xl font-bold mb-2 text-black drop-shadow-lg">{quiz.title}</h1>
          <p className="text-black/90 drop-shadow-md text-lg mb-3">{quiz.description}</p>
          <img src={"/images/alnosor/logo.jpeg"} alt="Logo" className="rounded-lg shadow-lg mb-2 w-20 mx-auto" />
        </div>

        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm border-white/30 dark:border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-1 text-black drop-shadow-md text-center justify-center text-2xl font-bold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              الانضمام كفريق
            </CardTitle>
          </CardHeader>

          <CardContent className="p-1 space-y-1">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-1 rounded-lg">
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
              <label className="block text-lg font-bold text-black mb-1">اختر اسم الفريق</label>
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => setUseCustomName(false)}
                  className={`flex-1 p-1 rounded-xl font-bold transition-all ${!useCustomName
                    ? "bg-white/30 hover:bg-white/40 border-white/40 text-black shadow-xl/30 inset-shadow-sm"
                    : "bg-white/20 hover:bg-white/30 border-white/30 text-black/80"
                    }`}
                  type="button"
                >
                  اختيار قديس
                </button>
                <button
                  onClick={() => setUseCustomName(true)}
                  className={`flex-1 p-1 rounded-xl font-bold transition-all ${useCustomName
                    ? "bg-white/30 hover:bg-white/40 border-white/40 text-black shadow-xl/30 inset-shadow-sm"
                    : "bg-white/20 hover:bg-white/30 border-white/30 text-black/80"
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
                      className="w-full text-lg p-1 bg-white/30 border-white/40 text-black placeholder:text-gray-600 font-medium rounded-xl focus:border-white/60 focus:outline-none transition-colors"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="saints"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 max-h-96 overflow-y-auto"
                  >
                    {SAINTS_DATA.map((saint, index) => {
                      const isSelected = selectedSaint?.name === saint.name;

                      return (
                        <motion.button
                          key={saint.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSaintSelect(saint)}
                          className={`p-2 rounded-xl border-2 transition-all duration-300 transform scale-90 flex flex-col items-center gap-1
                          ${isSelected
                              ? "border-white/60 bg-white/40 scale-100 text-black shadow-lg"
                              : selectedSaint
                                ? "border-gray-400 bg-gray-200 text-gray-500 opacity-50 grayscale cursor-not-allowed"
                                : "border-white/30 hover:border-white/50 hover:bg-white/20 bg-white/10 text-black/80 hover:scale-95"
                            }`}
                          // disabled={selectedSaint !== null && !isSelected}
                        >
                          <img
                            src={saint.src}
                            alt={saint.name}
                            className={`w-8 h-8 rounded-full object-cover border border-white/50 ${selectedSaint && !isSelected ? "grayscale" : ""}`}
                          />
                          <p className={`text-center leading-tight font-bold ${isSelected ? "text-sm" : "text-xs"}`}>
                            {saint.name}
                          </p>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <hr className="border-white/30" />

            <div ref={memberCountRef}>
              <label className="block text-lg font-bold text-black mb-1 select-none">عدد الأعضاء</label>
              <div className="flex items-center justify-center gap-1 px-1">
                <button
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  disabled={memberCount <= 1}
                  className="w-4 h-4 rounded-full border-2 border-white/40 flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black"
                  type="button"
                  title="تقليل عدد الأعضاء"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <div className="text-4xl font-bold text-black w-16 text-center">{memberCount}</div>
                <button
                  onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
                  disabled={memberCount >= 10}
                  className="w-4 h-4 rounded-full border-2 border-white/40 flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black"
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
              <label className="block text-lg font-bold text-black mb-1">أسماء الأعضاء</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {memberNames.map((name, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateMemberName(index, e.target.value)}
                      placeholder={`اسم العضو ${index + 1}`}
                      className="w-full text-lg p-1 ps-3 border-2 bg-white/30 border-white/40 text-black placeholder:text-gray-600 font-medium rounded-xl focus:border-white/60 focus:outline-none transition-colors"
                    />
                    <div className="absolute start-0 ms-0.5 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full flex items-center justify-center border border-white/50">
                      <span className="text-black text-sm font-bold">{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full bg-white/30 hover:bg-white/40 border-white/40 text-black font-bold py-1 rounded-xl transition-all duration-200 text-xl flex items-center justify-center gap-1 shadow-xl/30 inset-shadow-sm"
              type="button"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
