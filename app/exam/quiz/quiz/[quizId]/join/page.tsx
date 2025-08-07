// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/exhaustive-deps */
// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
// import { SAINTS_DATA } from "@/lib/saints-data"
// import type { Quiz, GameState, Saint } from "@/types/quiz"
// import { Users, Minus, Plus, Crown, Check, AlertTriangle, Loader2, PartyPopper, TimerOff, UserPlus } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"

// export default function JoinQuizPage() {
//   const params = useParams()
//   const router = useRouter()
//   const [quiz, setQuiz] = useState<Quiz | null>(null)
//   const [gameState, setGameState] = useState<GameState | null>(null)
//   const [groupName, setGroupName] = useState("")
//   const [memberCount, setMemberCount] = useState(2)
//   const [memberNames, setMemberNames] = useState<string[]>(["", ""])
//   const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null)
//   const [useCustomName, setUseCustomName] = useState(false)
//   const [isJoining, setIsJoining] = useState(false)
//   const [error, setError] = useState("")
//   const [hasJoined, setHasJoined] = useState(false)
//   const quizId = params.quizId as string


//   useEffect(() => {
//     if (quizId) {
//       loadQuiz()

//       const unsubscribe = subscribeToGameState(quizId, (state) => {
//         setGameState(state)
//         if (state?.isActive && hasJoined) {
//           router.push(`/exam/quiz/quiz/${quizId}/play`)
//         }
//       })

//       return unsubscribe
//     }
//   }, [quizId, hasJoined, router])

//   useEffect(() => {
//     setMemberNames((currentNames) => {
//       const newNames = [...currentNames]
//       if (memberCount > newNames.length) {
//         for (let i = newNames.length; i < memberCount; i++) {
//           newNames.push("")
//         }
//       } else if (memberCount < newNames.length) {
//         newNames.splice(memberCount)
//       }
//       return newNames
//     })
//   }, [memberCount])

//   const loadQuiz = async () => {
//     try {
//       const quizData = await getQuiz(quizId)
//       if (!quizData) {
//         setError("الامتحان غير موجود")
//         return
//       }
//       setQuiz(quizData)
//     } catch (error) {
//       console.error("Error loading quiz:", error)
//       setError("فشل في تحميل الامتحان")
//     }
//   }

//   const updateMemberName = (index: number, name: string) => {
//     const newNames = [...memberNames]
//     newNames[index] = name
//     setMemberNames(newNames)
//   }

//   const handleJoin = async () => {
//     const finalGroupName = useCustomName ? groupName.trim() : selectedSaint?.name || ""

//     if (!finalGroupName) {
//       setError("يرجى اختيار قديس أو إدخال اسم مخصص للمجموعة")
//       return
//     }

//     const validNames = memberNames.map((name) => name.trim()).filter(Boolean)
//     if (validNames.length !== memberCount) {
//       setError("يرجى ملء جميع أسماء الأعضاء")
//       return
//     }

//     const uniqueNames = new Set(validNames.map((name) => name.toLowerCase()))
//     if (uniqueNames.size !== validNames.length) {
//       setError("يجب أن تكون جميع أسماء الأعضاء مختلفة داخل مجموعتكم")
//       return
//     }

//     setIsJoining(true)
//     setError("")

//     try {
//       const groupData = {
//         groupName: finalGroupName,
//         members: validNames,
//         ...(selectedSaint && !useCustomName && {
//           saintName: selectedSaint.name,
//           saintImage: selectedSaint.image,
//         }),
//       }

//       const groupId = await joinQuizAsGroup(quizId, groupData)

//       localStorage.setItem(
//         "currentGroup",
//         JSON.stringify({
//           id: groupId,
//           ...groupData,
//         }),
//       )

//       setHasJoined(true)
//     } catch (error: any) {
//       setError(error.message || "فشل في الانضمام للامتحان")
//     } finally {
//       setIsJoining(false)
//     }
//   }

//   if (!quiz) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600"></div>
//       </div>
//     )
//   }

//   if (gameState?.isActive) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
//         <div className="w-full max-w-md text-center bg-white rounded-3xl shadow-2xl p-8 border-4 border-amber-200">
//           <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 10 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
//             <TimerOff className="w-12 h-12 text-amber-600" />
//           </motion.div>
//           <h2 className="text-2xl font-bold mb-4 text-gray-900">بدأ الامتحان بالفعل</h2>
//           <p className="text-gray-600 mb-6 text-lg">هذا الامتحان بدأ بالفعل. لا يمكنك الانضمام الآن.</p>
//           <button
//             onClick={() => router.push("/")}
//             className="w-full py-3 text-lg bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors font-semibold"
//           >
//             العودة للرئيسية
//           </button>
//         </div>
//       </div>
//     )
//   }

//   if (hasJoined) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
//         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "backOut" }} className="w-full max-w-md">
//           <div className="text-center bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: -10 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <PartyPopper className="w-12 h-12 text-green-600" />
//             </motion.div>
//             <h2 className="text-2xl font-bold mb-4 text-gray-900">تم الانضمام بنجاح!</h2>
//             <p className="text-gray-600 mb-6 text-lg">
//               مجموعة &quot;{useCustomName ? groupName : selectedSaint?.name}&quot; انضمت للامتحان. في انتظار بدء المشرف...
//             </p>
//             <div className="animate-pulse">
//               <div className="h-3 bg-green-200 rounded-full"></div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
//       <div className="max-w-4xl mx-auto">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-3">{quiz.title}</h1>
//           <p className="text-gray-600 text-lg">{quiz.description}</p>
//         </motion.div>

//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
//           <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-6">
//             <h2 className="flex items-center gap-3 text-center justify-center text-2xl font-bold">
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
//               </svg>
//               الانضمام كمجموعة
//             </h2>
//           </div>

//           <div className="p-8 space-y-8">
//             {error && (
//               <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
//                 <div className="flex">
//                   <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   <p className="mr-3 text-red-700 text-lg">{error}</p>
//                 </div>
//               </div>
//             )}

//             {/* اختيار نوع الاسم */}
//             <div>
//               <label className="block text-lg font-bold text-gray-700 mb-4">اختر اسم المجموعة</label>
//               <div className="flex gap-4 mb-6">
//                 <button
//                   onClick={() => setUseCustomName(false)}
//                   className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${!useCustomName
//                       ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                 >
//                   اختيار قديس
//                 </button>
//                 <button
//                   onClick={() => setUseCustomName(true)}
//                   className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${useCustomName
//                       ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                 >
//                   اسم مخصص
//                 </button>
//               </div>

//               <AnimatePresence mode="wait">
//                 {useCustomName ? (
//                   <motion.div
//                     key="custom"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                   >
//                     <input
//                       type="text"
//                       value={groupName}
//                       onChange={(e) => setGroupName(e.target.value)}
//                       placeholder="أدخل اسم مجموعتكم..."
//                       className="w-full text-lg p-4 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
//                     />
//                   </motion.div>
//                 ) : (
//                   <motion.div
//                     key="saints"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -20 }}
//                     className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto"
//                   >
//                     {SAINTS_DATA.map((saint, index) => (
//                       <motion.button
//                         key={saint.name}
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: index * 0.05 }}
//                         onClick={() => setSelectedSaint(saint)}
//                         className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedSaint?.name === saint.name
//                             ? "border-amber-500 bg-amber-50 shadow-lg"
//                             : "border-gray-200 bg-white hover:border-amber-300 hover:shadow-md"
//                           }`}
//                       >
//                         <img
//                           src={saint.image || "/placeholder.svg"}
//                           alt={saint.name}
//                           className="w-16 h-16 mx-auto mb-2 rounded-full object-cover border-2 border-amber-200"
//                         />
//                         <p className="text-sm font-semibold text-gray-800 text-center leading-tight">
//                           {saint.name}
//                         </p>
//                         <p className="text-xs text-gray-500 text-center mt-1">
//                           {saint.feast}
//                         </p>
//                       </motion.button>
//                     ))}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <div>
//               <label className="block text-lg font-bold text-gray-700 mb-4">عدد الأعضاء</label>
//               <div className="flex items-center justify-center gap-6">
//                 <button
//                   onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
//                   disabled={memberCount <= 1}
//                   className="w-14 h-14 rounded-full border-2 border-amber-300 flex items-center justify-center hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   title="تقليل عدد الأعضاء"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
//                   </svg>
//                 </button>
//                 <div className="text-4xl font-bold text-amber-600 w-16 text-center">{memberCount}</div>
//                 <button
//                   onClick={() => setMemberCount(Math.min(10, memberCount + 1))}
//                   disabled={memberCount >= 10}
//                   className="w-14 h-14 rounded-full border-2 border-amber-300 flex items-center justify-center hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   title="زيادة عدد الأعضاء"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="block text-lg font-bold text-gray-700 mb-4">أسماء الأعضاء</label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {memberNames.map((name, index) => (
//                   <div key={index} className="relative">
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => updateMemberName(index, e.target.value)}
//                       placeholder={`اسم العضو ${index + 1}`}
//                       className="w-full text-lg p-4 pr-12 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none transition-colors"
//                     />
//                     <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
//                       <span className="text-white text-sm font-bold">{index + 1}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <button
//               onClick={handleJoin}
//               disabled={isJoining}
//               className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 text-xl flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
//             >
//               {isJoining ? (
//                 <>
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
//                   جاري الانضمام...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
//                   </svg>
//                   الانضمام للامتحان
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect, useCallback, useMemo, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { getQuiz, joinQuizAsGroup, subscribeToGameState } from "@/lib/firebase-utils"
import { SAINTS_DATA } from "@/lib/saints-data"
import type { Quiz, GameState, Saint } from "@/types/quiz"
import { TimerOff, PartyPopper } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function JoinQuizPage() {
  const { quizId } = useParams() as { quizId: string }
  const router = useRouter()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [useCustomName, setUseCustomName] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null)
  const [memberCount, setMemberCount] = useState(2)
  const [memberNames, setMemberNames] = useState<string[]>(["", ""])
  const [error, setError] = useState<string>("")
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const q = await getQuiz(quizId)
        if (!q) throw new Error("الامتحان غير موجود")
        setQuiz(q)
      } catch (e: any) {
        setError(e.message)
      }
    }
    load()

    const unsub = subscribeToGameState(quizId, (state) => {
      setGameState(state)
      if (state?.isActive && hasJoined) {
        router.push(`/exam/quiz/quiz/${quizId}/play`)
      }
    })
    return unsub
  }, [quizId, hasJoined])

  useEffect(() => {
    setMemberNames((names) => {
      const updated = [...names]
      if (names.length < memberCount) {
        return [...updated, ...Array(memberCount - names.length).fill("")]
      }
      return updated.slice(0, memberCount)
    })
  }, [memberCount])

  const validGroupName = useMemo(() => useCustomName ? groupName.trim() : selectedSaint?.name || "", [useCustomName, groupName, selectedSaint])

  const handleJoin = useCallback(async () => {
    setError("")
    if (!validGroupName) {
      setError("اختر قديسًا أو أدخل اسمًا مخصصًا")
      return
    }
    const trimmed = memberNames.map(n => n.trim())
    if (trimmed.length !== memberCount || trimmed.some(n => !n)) {
      setError("املأ جميع أسماء الأعضاء")
      return
    }
    if (new Set(trimmed.map(n => n.toLowerCase())).size !== trimmed.length) {
      setError("أسماء الأعضاء يجب أن تكون فريدة")
      return
    }

    setIsJoining(true)
    try {
      const payload: any = { groupName: validGroupName, members: trimmed }
      if (!useCustomName && selectedSaint) payload.saint = selectedSaint
      const groupId = await joinQuizAsGroup(quizId, payload)
      localStorage.setItem("currentGroup", JSON.stringify({ id: groupId, ...payload }))
      setHasJoined(true)
    } catch (e: any) {
      setError(e.message || "خطأ في الانضمام")
    } finally {
      setIsJoining(false)
    }
  }, [quizId, validGroupName, memberNames, memberCount, useCustomName, selectedSaint])

  if (!quiz) return <Loader />
  if (gameState?.isActive) return <StatusCard icon={TimerOff} title="بدأ الامتحان" desc="لا يمكنك الانضمام الآن" btnText="الرئيسية" onClick={() => router.push("/")} color="orange" />
  if (hasJoined) return <StatusCard icon={PartyPopper} title="تم الانضمام" desc={`مجموعة "${validGroupName}" تنتظر بدء المشرف`} color="green" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <header className="bg-gradient-to-r from-amber-500 to-red-500 text-white p-8 text-center">
          <h1 className="text-3xl font-extrabold">{quiz.title}</h1>
          <p className="mt-2 text-lg opacity-90">{quiz.description}</p>
        </header>
        <main className="p-6 space-y-6">
          {error && <Alert msg={error} />}
          <NameSelector
            useCustom={useCustomName}
            setUseCustom={setUseCustomName}
            groupName={groupName}
            setGroupName={setGroupName}
            saints={SAINTS_DATA}
            selected={selectedSaint}
            onSelect={setSelectedSaint}
          />
          <MemberCount count={memberCount} setCount={setMemberCount} />
          <MemberNames names={memberNames} onChange={(i: number, v: string) => {
            const arr = [...memberNames]; arr[i] = v; setMemberNames(arr)
          }} />
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl text-xl font-bold hover:scale-105 transition-transform disabled:opacity-60">
            {isJoining
              ? <Loader size={6} color="white" />
              : <span>انضم للامتحان</span>
            }
          </button>
        </main>
      </div>
    </div>
  )
}

// Components
const Loader = ({ size = 16, color = "amber" }) => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full" style={{ width: size * 4, height: size * 4, borderWidth: size / 4, borderColor: `#f59e0b`, borderBottomColor: "transparent" }}></div>
  </div>
)

const Alert = ({ msg }: { msg: string }) => (
  <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
    {msg}
  </div>
)

function StatusCard({ icon: Icon, title, desc, btnText, onClick, color }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 border-2" style={{ borderColor: `var(--tw-${color}-200)` }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 10 }} className="w-20 h-20 flex items-center justify-center rounded-full bg-opacity-20" style={{ backgroundColor: `var(--tw-${color}-100)` }}>
          <Icon className={`w-10 h-10 text-${color}-600`} />
        </motion.div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600">{desc}</p>
        {btnText && <button onClick={onClick} className="mt-4 px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-semibold">{btnText}</button>}
      </div>
    </div>
  )
}

function NameSelector({ useCustom, setUseCustom, groupName, setGroupName, saints, selected, onSelect }: any) {
  return (
    <div>
      <p className="font-semibold mb-2">اسم المجموعة</p>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setUseCustom(false)} className={`flex-1 py-2 ${!useCustom ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"} rounded-lg`}>قديس</button>
        <button onClick={() => setUseCustom(true)} className={`flex-1 py-2 ${useCustom ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"} rounded-lg`}>مخصص</button>
      </div>
      <AnimatePresence>
        {useCustom ? (
          <motion.input
            key="custom"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="w-full p-3 border rounded-lg focus:outline-amber-400"
            placeholder="ادخل اسم المجموعة"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        ) : (
          <motion.div
            key="saints"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-auto"
          >
            {saints.map((s: { name: string; image: string }) => (
              <button key={s.name} onClick={() => onSelect(s)} className={`p-2 flex flex-col items-center rounded-lg border ${selected?.name === s.name ? "border-amber-500 bg-amber-100" : "border-gray-200 hover:bg-gray-50"}`}>
                <Image src={s.image || "/placeholder.svg"} alt={s.name} width={48} height={48} className="rounded-full" />
                <span className="text-sm mt-1">{s.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MemberCount({ count, setCount }: any) {
  return (
    <div className="flex items-center justify-between">
      <p className="font-semibold">عدد الأعضاء</p>
      <div className="flex items-center gap-2">
        <button onClick={() => setCount((c: number) => Math.max(1, c - 1))} disabled={count <= 1} className="p-2 bg-gray-100 rounded-full disabled:opacity-50">-</button>
        <span className="w-8 text-center font-bold">{count}</span>
        <button onClick={() => setCount((c: number) => Math.min(10, c + 1))} disabled={count >= 10} className="p-2 bg-gray-100 rounded-full disabled:opacity-50">+</button>
      </div>
    </div>
  )
}

function MemberNames({ names, onChange }: any) {
  return (
    <div>
      <p className="font-semibold mb-2">أسماء الأعضاء</p>
      <div className="space-y-2">
        {names.map((n: string, i: number) => (
          <input
            key={i}
            className="w-full p-3 border rounded-lg focus:outline-amber-400"
            placeholder={`العضو ${i + 1}`}
            value={n}
            onChange={e => onChange(i, e.target.value)}
          />
        ))}
      </div>
    </div>
  )
}
