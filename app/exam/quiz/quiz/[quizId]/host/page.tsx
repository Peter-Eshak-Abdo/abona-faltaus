"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import {
  getQuiz,
  getQuizGroups,
  startQuiz,
  subscribeToGameState,
  deleteGroup,
  cleanupOldGroups,
} from "@/lib/firebase-utils"
import { auth } from "@/lib/firebase";
import type { Quiz, Group, GameState } from "@/types/quiz"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { QuizHostGame } from "@/components/quiz/quiz-host-game"
import { QRCodeSection } from "@/components/quiz/qr-code-section"
import { GroupsSection } from "@/components/quiz/groups-section"
import { QuizStats } from "@/components/quiz/quiz-stats"
import { Auth } from "firebase/auth"

// Helper function to convert various timestamp formats to milliseconds
const toMillis = (ts: any): number | null => {
  if (!ts) return null;
  if (typeof ts.toMillis === 'function') {
    return ts.toMillis();
  }
  if (typeof ts.toDate === 'function') {
    return ts.toDate().getTime();
  }
  if (typeof ts === 'number') {
    return ts > 1e12 ? ts : ts * 1000;
  }
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.getTime();
  return null;
};

function HostQuizView({ auth }: { auth: Auth }) {
  const params = useParams()
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startSuccess, setStartSuccess] = useState(false)
  const [isCleaningUp, setIsCleaningUp] = useState(false)
  const [qrSize, setQrSize] = useState(250)
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null)
  const quizId = params?.quizId as string
  const [isQRFull, setIsQRFull] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && quizId) {
      loadQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, quizId])

  useEffect(() => {
    if (!quizId) return

    let unsubGroups: (() => void) | null = null
    let unsubGameState: (() => void) | null = null

    try {
      unsubGroups = getQuizGroups(quizId, (updatedGroups) => {
        setGroups(updatedGroups || [])
      })
    } catch (err) {
      console.error("getQuizGroups subscription failed:", err)
      setError("فشل في الاشتراك لتحديث الفرق")
    }

    try {
      unsubGameState = subscribeToGameState(quizId, (state) => {
        if (state?.questionStartTime) {
          try {
            const ms = toMillis(state.questionStartTime);
            if (ms) (state as any).questionStartTime = new Date(ms)
          } catch (e) {
            // ignore - leave as-is
          }
        }
        setGameState(state || null)
        if (state?.isActive) {
          setStartSuccess(true)
          setError(null)
        }
      })
    } catch (err) {
      console.error("subscribeToGameState failed:", err)
      setError("فشل في الاشتراك لحالة المسابقة")
    }

    return () => {
      try {
        if (typeof unsubGroups === "function") unsubGroups()
      } catch (e) {
        /* ignore */
      }
      try {
        if (typeof unsubGameState === "function") unsubGameState()
      } catch (e) {
        /* ignore */
      }
    }
  }, [quizId])

  const loadQuiz = async () => {
    try {
      setError(null)
      if (!quizId) {
        setError("معرّف المسابقة غير موجود")
        return
      }
      const quizData = await getQuiz(quizId)
      if (!quizData) {
        setError("المسابقة غير موجوده")
        return
      }
      if (!user) {
        setError("المستخدم غير مسجل")
        return
      }
      if (quizData.createdBy !== user.uid) {
        setError("ليس لديك صلاحية لإدارة هذة المسابقة")
        return
      }
      setQuiz(quizData)
    } catch (err) {
      console.error("Error loading quiz:", err)
      setError("فشل في تحميل المسابقة. تحقق من الاتصال.")
    }
  }

  const handleStartQuiz = async () => {
    setError(null)
    if (groups.length === 0) {
      setError("يجب أن ينضم فريق واحد على الأقل قبل البدء")
      return
    }
    if (!quiz || !quizId) {
      setError("بيانات المسابقة غير محملة")
      return
    }

    setIsStarting(true)
    setStartSuccess(false)

    try {
      await startQuiz(quizId)
      setTimeout(() => {
        setStartSuccess(true)
      }, 800)
    } catch (err) {
      console.error("Error starting quiz:", err)
      setError((err as any)?.message || "فشل في بدء المسابقة")
    } finally {
      setIsStarting(false)
    }
  }

  const handleDeleteGroup = async (groupId: string, groupName?: string) => {
    setDeletingGroupId(groupId)
    try {
      await deleteGroup(quizId, groupId)
    } catch (err) {
      console.error("Delete group error:", err)
      setError("فشل في حذف الفرقة")
    } finally {
      setDeletingGroupId(null)
    }
  }

  const handleCleanupOldGroups = async () => {
    setIsCleaningUp(true)
    try {
      const deletedCount = await cleanupOldGroups(quizId)
      if (deletedCount > 0) {
        alert(`تم حذف ${deletedCount} فرقة غير نشطة`)
      } else {
        alert("لا توجد فرق غير نشطة")
      }
    } catch (err) {
      console.error("Cleanup old groups error:", err)
      setError("فشل في تنظيف الفرق")
    } finally {
      setIsCleaningUp(false)
    }
  }

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white" />
      </div>
    )
  }

  if (gameState?.isActive && gameState !== null) {
    return <QuizHostGame quiz={quiz} groups={groups} gameState={gameState} />
  }

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/exam/quiz/quiz/${quizId}/join`
      : `https://abona-faltaus.vercel.app/exam/quiz/quiz/${quizId}/join`

  return (
    // <div className="min-h-screen from-blue-300 to-purple-300 p-1">
    //   <div className="max-w-8xl mx-auto">
    //     <div className="mb-3 text-center md:text-right px-2 sm:px-0">
    //       <div className="flex flex-col-reverse md:flex-row">
    //         <div className="grow">
    //           <h1 className="text-7xl font-bold text-white mb-3 drop-shadow-xl text-center md:text-9xl">{quiz.title}</h1>
    //           <p className="text-white/80 text-3xl mb-2 text-center">{quiz.description}</p>
    //         </div>
    //         <img src={"/images/alnosor/logo.jpeg"} alt="Logo" className="rounded-lg shadow-lg mb-2 w-20" />
    //       </div>

    //       <div className="bg-blue-100 text-blue-800 p-1 rounded-full font-bold shadow-2xl break-normal">
    //         <p className="text-center text-3xl "> ملحوظات </p>
    //         <p className="text-2xl pt-3 pb-1">
    //           {quiz.shuffleQuestions && quiz.shuffleChoices
    //             ? "خلط الأسئلة و الاختيارات"
    //             : quiz.shuffleQuestions
    //               ? "خلط الأسئلة فقط"
    //               : quiz.shuffleChoices
    //                 ? "خلط الاختيارات فقط"
    //                 : "لا يوجد خلط للاسئلة ولا للاختيارات"}
    //         </p>
    //       </div>
    //     </div>

    //     {error && (
    //       <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md">
    //         <div className="flex">
    //           <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
    //             <path
    //               fillRule="evenodd"
    //               d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //           <p className="mr-3 text-red-700 text-lg">{error}</p>
    //         </div>
    //       </div>
    //     )}

    //     {startSuccess && !gameState?.isActive && (
    //       <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-md">
    //         <div className="flex">
    //           <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
    //             <path
    //               fillRule="evenodd"
    //               d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //           <p className="mr-3 text-green-700 text-lg">جاري بدء المسابقة... يرجى انتظار تحميل واجهة اللعبة.</p>
    //         </div>
    //       </div>
    //     )}

    //     <div className="flex flex-col gap-1 mb-2">
    //       <QRCodeSection joinUrl={joinUrl} qrSize={qrSize} setQrSize={setQrSize} />
    //       <GroupsSection
    //         groups={groups}
    //         isCleaningUp={isCleaningUp}
    //         handleCleanupOldGroups={handleCleanupOldGroups}
    //         handleDeleteGroup={handleDeleteGroup}
    //         deletingGroupId={deletingGroupId}
    //       />
    //     </div>

    //     <div className="flex flex-row md:flex-row justify-center items-center gap-2">
    //       <QuizStats quiz={quiz} groups={groups} />

    //       <div className="text-center">
    //         <Button
    //           onClick={handleStartQuiz}
    //           disabled={groups.length === 0 || isStarting || !!gameState?.isActive}
    //           className="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-2xl transition-all duration-300 text-xl sm:text-2xl shadow-2xl flex items-center mx-auto bg-amber-400 text-primary-foreground p-1"
    //           type="button"
    //         >
    //           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
    //             <path
    //               fillRule="evenodd"
    //               d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
    //               clipRule="evenodd"
    //             />
    //           </svg>
    //           {isStarting ? "جاري البدء..." : gameState?.isActive ? "تم بدء المسابقة" : "بدء المسابقة"}
    //         </Button>

    //         {groups.length === 0 && <p className="text-white/80 mt-1 text-lg sm:text-xl font-medium">يجب أن ينضم فريق واحد على الأقل قبل البدء</p>}
    //         {isStarting && <p className="text-white/80 mt-1 text-lg sm:text-xl font-medium">يرجى الانتظار أثناء تحضير المسابقة...</p>}
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="h-screen w-full bg-slate-900 flex flex-col md:flex-row overflow-hidden text-white font-sans">

    {/* الـ Overlay للـ QR Code عند التكبير */}
    <AnimatePresence>
      {isQRFull && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setIsQRFull(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white p-8 rounded-3xl shadow-2xl">
            <QRCodeSection joinUrl={joinUrl} qrSize={500} setQrSize={() => {}} hideControls />
          </div>
          <p className="mt-8 text-4xl font-bold text-white">امسح الكود للانضمام</p>
          <p className="mt-4 text-2xl text-blue-400">{joinUrl}</p>
        </motion.div>
      )}
    </AnimatePresence>

    {/* السايد بار الأيمن (بيانات المسابقة) */}
    <aside className="w-full md:w-80 bg-slate-800/50 p-6 flex flex-col border-l border-white/10 shadow-2xl z-10">
      <div className="flex flex-col items-center text-center gap-4 grow">
        <img src="/images/alnosor/logo.jpeg" alt="Logo" className="w-24 h-24 rounded-2xl shadow-lg border-2 border-white/20" />
        <h1 className="text-3xl font-black leading-tight drop-shadow-md">{quiz.title}</h1>
        <p className="text-slate-400 line-clamp-2">{quiz.description}</p>

        <hr className="w-full border-white/10 my-2" />

        {/* مصغر الـ QR للضغط عليه */}
        <div
          onClick={() => setIsQRFull(true)}
          className="group relative cursor-pointer hover:scale-105 transition-transform"
        >
          <div className="bg-white p-2 rounded-xl">
             <QRCodeSection joinUrl={joinUrl} qrSize={160} setQrSize={() => {}} hideControls />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m4 0l-5-5m11 5l-5-5m5 5v-4m0 4h-4" />
             </svg>
          </div>
        </div>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">اضغط لتكبير الكود</p>
      </div>

      {/* زر البدء في السايد بار */}
      <div className="mt-auto pt-6">
        <Button
          onClick={handleStartQuiz}
          disabled={groups.length === 0 || isStarting}
          className="w-full h-16 text-2xl font-black rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-slate-900 transition-all active:scale-95"
        >
          {isStarting ? "جاري البدء..." : "ابدأ الآن 🚀"}
        </Button>
      </div>
    </aside>

    {/* المساحة الرئيسية (الفرق) */}
    <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white/90">بانتظار الأبطال...</h2>
          <p className="text-slate-400 text-xl mt-2">انضم {groups.length} فريق حتى الآن</p>
        </div>
        <div className="flex gap-4">
           {/* إحصائيات سريعة هنا إن أردت */}
           <Button onClick={handleCleanupOldGroups} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-xl">
              تنظيف القائمة
           </Button>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
         <GroupsSection
            groups={groups}
            isCleaningUp={isCleaningUp}
            handleCleanupOldGroups={handleCleanupOldGroups}
            handleDeleteGroup={handleDeleteGroup}
            deletingGroupId={deletingGroupId}
            compactView // خاصية جديدة سنضيفها
          />
      </section>
    </main>
  </div>
  )
}

export default function HostQuizPage() {
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center from-blue-600 to-purple-700">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white" />
      </div>
    );
  }

  return <HostQuizView auth={auth} />;
}
