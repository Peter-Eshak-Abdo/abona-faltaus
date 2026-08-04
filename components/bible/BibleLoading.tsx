import { motion, AnimatePresence } from "framer-motion";

interface BibleLoadingProps {
  loadingStatus: string;
  loadProgress: number;
  tipIndex: number;
  tips: string[];
}

export default function BibleLoading({ loadingStatus, loadProgress, tipIndex, tips }: BibleLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-1 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center space-y-1"
      >
        <div className="text-6xl mb-1">📖</div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-blue-600 dark:text-blue-400">جاري مزامنة الكتاب المقدس</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">{loadingStatus}</p>
        </div>
        <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border dark:border-zinc-700">
          <motion.div
            className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-blue-700"
            initial={{ width: 0 }}
            animate={{ width: `${loadProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-sm font-bold text-blue-600">{loadProgress}%</span>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-1 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 min-h-2 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg font-arabic leading-relaxed text-zinc-700 dark:text-zinc-300"
            >
              {tips[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="text-xs text-zinc-400">هذه العملية تحدث مرة واحدة فقط</p>
      </motion.div>
    </div>
  );
}
