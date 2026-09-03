"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Compass, X, Sparkles, Volume2, VolumeX, EyeOff, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MysteriousExperience() {
  const [activeTab, setActiveTab] = useState<"candle" | "ephemeral" | "compass" | null>(null);
  const [candlePos, setCandlePos] = useState({ x: 150, y: 150 });
  const [ephemeralTimer, setEphemeralTimer] = useState<number | null>(null);
  const [ephemeralHidden, setEphemeralHidden] = useState(false);
  const [activeUsers, setActiveUsers] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const candleBoxRef = useRef<HTMLDivElement>(null);

  // تأثير الرسالة المتلاشية (Ephemeral Message)
  useEffect(() => {
    const todayKey = `ephemeral_read_${new Date().toISOString().slice(0, 10)}`;
    const hasReadToday = localStorage.getItem(todayKey);
    if (hasReadToday) {
      setEphemeralHidden(true);
    }
  }, []);

  const startEphemeralExperience = () => {
    setActiveTab("ephemeral");
    setEphemeralTimer(15);
    const todayKey = `ephemeral_read_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(todayKey, "true");

    const timer = setInterval(() => {
      setEphemeralTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setEphemeralHidden(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // محاكاة المستخدمين النشطين للبخور
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(Math.floor(Math.random() * 8) + 3);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!candleBoxRef.current) return;
    const rect = candleBoxRef.current.getBoundingClientRect();
    setCandlePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!candleBoxRef.current || !e.touches[0]) return;
    const rect = candleBoxRef.current.getBoundingClientRect();
    setCandlePos({
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    });
  };

  return (
    <>
      {/* 1. المبخرة التفاعلية العائمة (The Digital Censer) وبوصلة الصلاة */}
      <div className="fixed bottom-1 right-1 z-40 flex flex-col items-center gap-0.5 pointer-events-auto">
        {/* المبخرة */}
        <div className="relative group flex items-center justify-center">
          {/* تصاعد البخور بناء على المستخدمين النشطين */}
          <div className="absolute -top-1 flex flex-col items-center pointer-events-none">
            {Array.from({ length: Math.min(activeUsers, 5) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.8, y: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.7, 0.4, 0],
                  y: -35 - i * 10,
                  scale: [0.6, 1.4, 2],
                  x: [0, (i % 2 === 0 ? 8 : -8), 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5 + i * 0.4,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                className="w-4 h-4 rounded-full bg-white/40 blur-xs absolute"
              />
            ))}
          </div>

          <button
            onClick={() => setActiveTab("candle")}
            title={`المبخرة الروحية (${activeUsers} مصلين يتصفحون الآن) - اضغط لتجربة القلاية المظلمة`}
            className="w-3 h-3 rounded-full bg-amber-900/80 dark:bg-amber-800/90 border-2 border-amber-400 text-amber-200 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition backdrop-blur-md"
          >
            <Flame className="w-2 h-2 text-amber-300 animate-pulse" />
          </button>
          <span className="absolute -bottom-5 text-[10px] font-bold text-amber-400 bg-black/70 px-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
            {activeUsers} متصلين
          </span>
        </div>

        {/* بوصلة الصلاة (Spiritual Compass) */}
        <button
          onClick={() => setActiveTab("compass")}
          title="بوصلة الصلاة والآية الآنية"
          className="w-3 h-3 rounded-full bg-zinc-900/80 dark:bg-zinc-800/90 border border-amber-500/50 text-amber-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition backdrop-blur-md"
        >
          <Compass className="w-2 h-2 animate-spin-slow" />
        </button>

        {/* تدريب الرسائل المتلاشية اليومية */}
        {!ephemeralHidden && (
          <button
            onClick={startEphemeralExperience}
            title="رسالة القلاية المتلاشية اليومية (تظهر مرة واحدة فقط)"
            className="w-3 h-3 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 flex items-center justify-center shadow-lg hover:scale-105 transition animate-bounce"
          >
            <Sparkles className="w-2 h-2" />
          </button>
        )}
      </div>

      {/* 2. مودال تأثير القلاية المظلمة (Candlelight Reveal) */}
      <AnimatePresence>
        {activeTab === "candle" && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-0.5 select-none">
            <div className="absolute top-1 right-1 flex items-center gap-0.5 z-50">
              <span className="text-xs text-amber-300 font-serif">حرك إصبعك أو الفأرة لإضاءة الشمعة داخل القلاية</span>
              <button
                onClick={() => setActiveTab(null)}
                className="w-2 h-2 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700"
              >
                <X className="w-1.5 h-1.5" />
              </button>
            </div>

            <div
              ref={candleBoxRef}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full max-w-xl h-80 rounded-3xl overflow-hidden border border-amber-900/40 bg-black cursor-none flex items-center justify-center p-1 text-center shadow-2xl"
            >
              {/* النص المخفي الذي يظهر فقط بنور الشمعة */}
              <div
                className="absolute inset-0 p-1 flex flex-col items-center justify-center text-amber-100 font-serif transition-opacity"
                style={{
                  maskImage: `radial-gradient(circle 120px at ${candlePos.x}px ${candlePos.y}px, black 0%, transparent 100%)`,
                  WebkitMaskImage: `radial-gradient(circle 120px at ${candlePos.x}px ${candlePos.y}px, black 0%, transparent 100%)`,
                }}
              >
                <p className="text-2xl font-bold leading-loose text-amber-200">
                  «كُن مطمئناً جداً جداً، ولا تُفكر في الأمر كثيراً، بل دع الأمر لمن بيده الأمر»
                </p>
                <span className="text-sm font-bold text-amber-400 mt-1 block">
                  - القديس البابا كيرلس السادس
                </span>
              </div>

              {/* لهب الشمعة الذي يتحرك مع المؤشر */}
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left: `${candlePos.x}px`, top: `${candlePos.y}px` }}
              >
                <div className="w-3 h-3 rounded-full bg-amber-500/30 blur-md animate-pulse" />
                <Flame className="w-2 h-2 text-amber-400 drop-shadow-[0_0_15px_#f59e0b] -mt-0.5" />
              </div>

              {/* عتمة البداية للمساعدة */}
              <p className="text-[11px] text-zinc-600 pointer-events-none">
                أدخل في هدوء القلاية وحرك الشمعة لتكتشف رسالتك اليومية...
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. مودال الرسالة المتلاشية (Ephemeral Message) */}
      <AnimatePresence>
        {activeTab === "ephemeral" && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-1" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-zinc-950 border border-amber-800/60 rounded-3xl p-1 text-center space-y-4 shadow-2xl relative overflow-hidden"
            >
              {/* شريط تلاشي الوقت */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="bg-rose-500 h-full"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-amber-500">
                <span className="flex items-center gap-1">
                  <EyeOff className="w-2 h-2" />
                  رسالة اليوم لن تتكرر ثانية
                </span>
                <span className="font-bold font-mono text-rose-400">{ephemeralTimer} ثوانٍ</span>
              </div>

              {ephemeralTimer && ephemeralTimer > 0 ? (
                <motion.div
                  animate={{ opacity: ephemeralTimer <= 3 ? 0.3 : 1 }}
                  transition={{ duration: 1 }}
                  className="py-1 space-y-0.5"
                >
                  <p className="text-xl font-bold text-amber-100 leading-relaxed font-serif">
                    «صمتك في وقت الغضب صلاة، واحتمالك لأخيك إكليل لا يذبل.»
                  </p>
                  <p className="text-xs text-zinc-400">
                    تدريبك اليومي: اقضِ دقيقة صمت وصلاة من أجل شخص ضايقك مؤخراً.
                  </p>
                </motion.div>
              ) : (
                <div className="py-1 text-zinc-500">
                  <p className="text-sm">تلاشت الرسالة... احتفظ بها في قلبك واعمل بها طوال يومك.</p>
                  <Button onClick={() => setActiveTab(null)} className="mt-1 rounded-xl text-xs">
                    إغلاق
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. مودال بوصلة الصلاة (Spiritual Compass) */}
      <AnimatePresence>
        {activeTab === "compass" && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0.5 sm:p-1" dir="rtl">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-zinc-900 border border-amber-900/40 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-1 shadow-2xl space-y-0.5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                <div className="flex items-center gap-0.5">
                  <Compass className="w-2 h-2 text-amber-400" />
                  <h3 className="text-base font-bold text-amber-200">بوصلة الصلاة الحالية</h3>
                </div>
                <button onClick={() => setActiveTab(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-2 h-2" />
                </button>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-1 text-center space-y-0.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  صلوات السواعي المقترحة الآن
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed font-serif">
                  «ارْفَعُوا أَيْدِيَكُمْ نَحْوَ الْقُدْسِ، وَبَارِكُوا الرَّبَّ» (مز 134: 2)
                </p>
                <div className="pt-0.5 flex justify-center gap-2">
                  <Button asChild size="sm" className="bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs">
                    <a href="/agpeya">فتح الأجبية الآن</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
