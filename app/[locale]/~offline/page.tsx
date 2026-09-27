"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { WifiOff, BookOpen, Music, BookMarked, Home, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-center p-4"
      dir="rtl"
    >
      {/* Ambient Glow */}
      <div className="absolute w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mb-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-lg"
        >
          <WifiOff size={28} className="text-amber-500/80" />
        </motion.div>

        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white">
          أنت غير متصل بالإنترنت
        </h1>
        <p className="text-zinc-400 mb-4 leading-relaxed text-xs sm:text-sm">
          لكن لا تقلق! كثير من محتوى التطبيق متاح بدون إنترنت إذا فتحته مسبقاً.
        </p>

        {/* Available Offline Links */}
        <div className="w-full bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-4 mb-4">
          <p className="text-zinc-400 text-xs mb-2 font-semibold uppercase tracking-wider">
            يمكنك الوصول لهذه الصفحات أوفلاين:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/", label: "الرئيسية", icon: Home, color: "text-amber-400" },
              { href: "/bible", label: "الكتاب المقدس", icon: BookOpen, color: "text-blue-400" },
              { href: "/al7an", label: "الألحان", icon: Music, color: "text-orange-400" },
              { href: "/prayers", label: "الأجبية", icon: BookMarked, color: "text-emerald-400" },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 p-2 bg-zinc-700/50 hover:bg-zinc-700 rounded-xl text-xs font-medium text-zinc-200 hover:text-white transition-all active:scale-95"
              >
                <Icon size={16} className={color} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="flex items-center gap-8 bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold px-24 py-12 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
          {retrying ? "جاري الاتصال..." : "إعادة المحاولة"}
        </button>

        <p className="mt-24 text-zinc-600 text-xs">
          💡 للاستفادة من التطبيق أوفلاين بشكل كامل، قم بتثبيته كـ PWA على جهازك
        </p>
      </motion.div>
    </div>
  );
}
