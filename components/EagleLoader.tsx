"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EagleLoaderProps {
  statusText?: string;
  progress?: number | null; // Optional: 0 to 100
  tips?: string[];
  fullScreen?: boolean;
}

const DEFAULT_TIPS = [
  "«تَجَدَّدُ مِثْلَ النَّسْرِ شَبِيبَتُكَ» (مز 103: 5)",
  "«وَأَمَّا مُنْتَظِرُو الرَّبِّ فَيُجَدِّدُونَ قُوَّةً. يَرْفَعُونَ أَجْنِحَةً كَالنُّسُورِ» (إش 40: 31)",
  "«فِي كُلِّ شَيْءٍ أَسْتَطِيعُ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي» (في 4: 13)",
  "«كُونُوا مُطْمَئِنِّينَ جِدّاً جِدّاً، وَلاَ تَفَكِّرُوا فِي الأَمْرِ كَثِيراً، بَلْ دَعُوا الأَمْرَ لِمَنْ بِيَدِهِ الأَمْرُ» (البابا كيرلس السادس)",
  "«صلاة من القلب قادرة أن تشق عنان السماء» (أبونا فلتاؤس السرياني)",
  "«الرب نوري وخلاصي ممن أخاف؟» (مز 27: 1)",
];

export default function EagleLoader({
  statusText = "جاري التحميل...",
  progress = null,
  tips = DEFAULT_TIPS,
  fullScreen = true,
}: EagleLoaderProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!tips || tips.length <= 1) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [tips]);

  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-9999" : "relative w-full py-1"
      } flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl transition-all duration-300 p-0.5 select-none`}
      dir="rtl"
    >
      {/* Background soft ambient glow */}
      <div className="absolute w-18 h-18 bg-linear-to-tr from-amber-500/20 via-orange-500/15 to-blue-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center space-y-0.5">
        {/* Animated Eagle SVG with line drawing effect */}
        <div className="relative w-9 h-9 flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft decorative background circles */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="currentColor"
              className="text-amber-500/20 dark:text-amber-400/20"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <circle
              cx="100"
              cy="100"
              r="94"
              stroke="currentColor"
              className="text-blue-500/20 dark:text-blue-400/20"
              strokeWidth="1"
            />

            {/* Glowing outer aura animation */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#eagleGlowGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: [0.2, 0.8, 0.2], rotate: 360 }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Eagle Head & Beak outline */}
            <motion.path
              d="M 100 42 C 108 42, 118 47, 124 54 C 132 63, 133 72, 126 80 C 138 78, 148 83, 152 92 C 142 94, 131 93, 122 88 C 117 96, 109 104, 100 108 C 91 104, 83 96, 78 88 C 69 93, 58 94, 48 92 C 52 83, 62 78, 74 80 C 67 72, 68 63, 76 54 C 82 47, 92 42, 100 42 Z"
              stroke="url(#eagleLineGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Eagle Majestic Wings outline */}
            <motion.path
              d="M 40 85 C 25 70, 15 50, 22 30 C 35 48, 52 65, 75 75 M 160 85 C 175 70, 185 50, 178 30 C 165 48, 148 65, 125 75"
              stroke="url(#eagleGoldGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.1 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                delay: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Secondary Wing Feathers */}
            <motion.path
              d="M 45 105 C 28 95, 20 80, 26 65 C 38 80, 55 92, 74 98 M 155 105 C 172 95, 180 80, 174 65 C 162 80, 145 92, 126 98"
              stroke="url(#eagleGoldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.8,
                delay: 0.4,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Lower Body and Tail */}
            <motion.path
              d="M 85 105 C 75 125, 78 150, 100 168 C 122 150, 125 125, 115 105 M 92 140 L 100 162 L 108 140 M 100 115 L 100 152"
              stroke="url(#eagleLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                delay: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />

            {/* Glowing Cross in Center */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="origin-center"
            >
              <line
                x1="100"
                y1="64"
                x2="100"
                y2="86"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <line
                x1="91"
                y1="72"
                x2="109"
                y2="72"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Gradients */}
            <defs>
              <linearGradient id="eagleLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
              <linearGradient id="eagleGoldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="eagleGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Status text */}
        <div className="space-y-0.25">
          <h3 className="text-lg md:text-xl font-bold bg-linear-to-r from-amber-600 via-orange-500 to-amber-600 dark:from-amber-400 dark:via-orange-300 dark:to-amber-400 bg-clip-text text-transparent">
            {statusText}
          </h3>
        </div>

        {/* Progress bar if progress is specified */}
        {typeof progress === "number" && (
          <div className="w-full max-w-xs space-y-0.25">
            <div className="relative w-full h-1 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full overflow-hidden border border-amber-500/20 shadow-inner">
              <motion.div
                className="absolute top-0 right-0 h-full bg-linear-to-l from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-0.25">
              <span>{Math.round(progress)}%</span>
              <span>مكتمل</span>
            </div>
          </div>
        )}

        {/* Inspiring tips quote box */}
        {tips && tips.length > 0 && (
          <div className="w-full mt-0.25 p-0.5 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-amber-500/20 shadow-lg min-h-[72px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="text-sm md:text-base font-arabic font-medium leading-relaxed text-zinc-800 dark:text-zinc-200"
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
