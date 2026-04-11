"use client"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, Minimize2, Link2 } from "lucide-react"

export default function QRCodeSection({ quizId }: { quizId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const quizUrl = `${window.location.origin}/exam/quiz/quiz/${quizId}/join`

  return (
    <>
      <div className="flex flex-col items-center gap-1 p-1 bg-white dark:bg-zinc-800 rounded-3xl border-2 border-zinc-100 dark:border-zinc-700 shadow-sm">
        <div
          onClick={() => setIsExpanded(true)}
          className="relative cursor-pointer group p-1 bg-white rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-500 transition-all"
        >
          <QRCodeSVG value={quizUrl} size={150} />
          <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl">
            <Maximize2 className="text-blue-600" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-zinc-500 mb-1">لينك الانضمام المباشر:</p>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Link2 size={16} className="text-blue-500" />
            <code className="text-xs font-black text-blue-600">{quizUrl}</code>
          </div>
        </div>
      </div>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-999 flex flex-col items-center justify-center p-1 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white p-1 rounded-[40px] shadow-[0_0_50px_rgba(59,130,246,0.5)]"
            >
              <QRCodeSVG value={quizUrl} size={800} />
            </motion.div>
            {/* <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-white text-3xl font-black mt-1 text-center"
            >
              امسح الكود للدخول في المسابقة 🚀
            </motion.p> */}
            <button className="mt-1 text-white/50 flex items-center gap-1">
              <Minimize2 /> اضغط في أي مكان للإغلاق
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
