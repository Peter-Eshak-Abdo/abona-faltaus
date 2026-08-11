"use client";
import { useState, useMemo, useRef, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

type Verse = {
  ar?: string;
  copt?: string;
  ar_copt?: string;
};

type Hymn = {
  name: string;
  src: string;
  duration?: string;
  lyrics_ar?: string;
  lyrics_copt?: string;
  lyrics_ar_copt?: string;
  verses?: Verse[];
  [key: string]: any;
};

type HymnMap = Record<string, Hymn[]>;
const monasbaName = {
  "snawi": "سنوي",
  "som-kebir": "صوم كبير",
  "asbo3-alam": "اسبوع الآلام",
  "khmacen": "الخماسين",
  "nhdet-al3dra": "نهضة العذراء",
  "keahk": "كيهك",
}
const merged = (al7anData as any[]).reduce((acc, c) => ({ ...acc, ...c }), {}) as HymnMap;
// const monasbatKeys = Object.keys(merged);
// const monasbatList = monasbatKeys.map((key) => monasbaName[key as keyof typeof monasbaName] ?? key);
const monasbatList = Object.keys(merged);
const allHymnsFlat = Object.values(merged).flat();

const WAVEFORM_BARS = 120;
const waveHeights = Array.from({ length: WAVEFORM_BARS }, (_, i) =>
  Math.max(15, Math.sin(i * 0.5) * 40 + Math.random() * 50 + 10)
);

export default function UnifiedAl7anClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMonasba, setActiveMonasba] = useState<string>(monasbatList[0] || "");
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showAr, setShowAr] = useState(true);
  const [showCopt, setShowCopt] = useState(true);
  const [showArCopt, setShowArCopt] = useState(true);

  // طريقة العرض: صفوف (rows) أو 3 أعمدة (cols)
  const [layoutMode, setLayoutMode] = useState<"rows" | "cols">("rows");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const touchStartDist = useRef<number | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [audioErrorDetails, setAudioErrorDetails] = useState<string>("");
  const [audioData, setAudioData] = useState<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const displayedHymns = useMemo(() => {
    if (searchQuery.trim()) {
      return allHymnsFlat.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return merged[activeMonasba] || [];
  }, [searchQuery, activeMonasba]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + amount, 0), duration);
    }
  };

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  const handleShare = async () => {
    if (!selectedHymn) return;
    const shareData = {
      title: selectedHymn.name,
      text: `استمع إلى لحن ${selectedHymn.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // تجميع النص لنسخه بضغطة واحدة
  const getLyricsText = (type: "ar" | "copt" | "ar_copt") => {
    if (!selectedHymn) return "";
    if (selectedHymn.verses && selectedHymn.verses.length > 0) {
      return selectedHymn.verses.map(v => v[type] || "").filter(Boolean).join("\n");
    }
    if (type === "ar") return selectedHymn.lyrics_ar || "";
    if (type === "copt") return selectedHymn.lyrics_copt || "";
    if (type === "ar_copt") return selectedHymn.lyrics_ar_copt || "";
    return "";
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const getArchiveSrc = (src: string) =>
    `https://archive.org/download/abona-faltaus-audio/${encodeURIComponent(src.trim() + ".mp3")}`;

  const getImages = (hymn: Hymn) => Object.keys(hymn).filter(k => k.startsWith("hazatSrc") && hymn[k]).map(k => hymn[k] as string);

  // التعامل مع التكبير والتصغير باللمس بأصبعين (Pinch Zoom)
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartDist.current;
      setImageScale((prev) => Math.min(Math.max(prev * factor, 0.5), 4));
      touchStartDist.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
  };

  const hasLyrics = selectedHymn && (
    (selectedHymn.verses && selectedHymn.verses.length > 0) ||
    selectedHymn.lyrics_ar ||
    selectedHymn.lyrics_copt ||
    selectedHymn.lyrics_ar_copt
  );

  const setupAudioAnalyser = () => {
    if (!audioRef.current || audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const updateWaveform = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const normalized = Array.from(dataArray).map(val => Math.max(15, (val / 255) * 100));
          setAudioData(normalized);
        }
        requestAnimationFrame(updateWaveform);
      };
      updateWaveform();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-20px)] overflow-hidden bg-surface" dir="rtl">
      <div className={`w-full ${selectedHymn ? 'hidden lg:flex' : 'flex'} lg:w-[35%] h-full flex-col bg-surface border-l border-outline-variant/30 z-10 overflow-hidden`}>
        <div className="p-0.5 shrink-0 flex flex-col gap-0.5">
          <div className="flex-none border-b border-[#dcc0c1]/20 bg-[#f6f3f2]/10 backdrop-blur-md flex items-center justify-between z-10 shadow-2xl rounded-b-4xl">

            <Link href="/" className="p-0.5 m-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline" title="الرجوع للصفحة الرئيسية">
              <FaArrowRight size={18} />
            </Link>
            <input
              type="text"
              placeholder="بحث عن لحن..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-0.5 rounded-lg border border-outline/30 bg-surface-container-highest text-on-surface focus:outline-primary"
            />
          </div>
          {!searchQuery && (
            <div className="flex gap-0.5 overflow-x-auto pb-0.25 scrollbar-hide">
              {monasbatList.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMonasba(m)}
                  className={`px-0.5 py-0.25 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeMonasba === m ? "bg-primary text-white shadow-md" : "bg-surface-container-high hover:bg-surface-variant"
                    }`}
                >
                  {monasbaName[m as keyof typeof monasbaName] ?? m}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-0.5 pb-2 lg:pb-0.5 custom-scrollbar">
          <div className="grid grid-cols-1 gap-0.25">
            {displayedHymns.map((h, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                onClick={() => {
                  setSelectedHymn(h);
                  setIsPlaying(false);
                  setIsLoading(true);
                  setHasError(false);
                  setCurrentTime(0);
                  setDuration(0);
                }}
                className="group cursor-pointer rounded-lg border bg-surface-container-lowest p-0.5 flex justify-between items-center hover:shadow-sm transition-all"
              >
                <div>
                  <h3 className="font-bold text-sm">{h.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery ? 'نتائج البحث' :
                      monasbaName[activeMonasba as keyof typeof monasbaName] ?? activeMonasba
                    }</p>
                </div>
                {h.duration && (
                  <span className="text-xs bg-primary/10 text-primary px-0.5 py-0.25 rounded">
                    {typeof h.duration === "number" ? formatTime(h.duration) : h.duration}
                  </span>
                )}
                {/* {h.duration && <span className="text-xs bg-primary/10 text-primary px-0.5 py-0.25 rounded">{h.duration}</span>} */}
              </motion.div>
            ))}
            {displayedHymns.length === 0 && (
              <p className="text-center text-muted-foreground text-sm mt-1">لا توجد ألحان مطابقة</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedHymn && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full lg:w-[65%] h-full relative overflow-hidden bg-[#121212] text-white flex flex-col"
          >
            <div className="absolute top-1 left-1 z-50 flex gap-0.25">
              <button onClick={handleShare} className="w-3 h-3 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              </button>
              <button onClick={() => setSelectedHymn(null)} className="lg:hidden w-3 h-3 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                ✕
              </button>
            </div>

            <div className="relative z-10 flex flex-col h-full w-full p-0.5 lg:p-1">

              <div className="flex items-center gap-0.5 mb-0.5 mt-1 lg:mt-0">
                <div className="w-3 h-3 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                  🎵
                </div>
                <div className="flex-1 overflow-hidden">
                  <h2 className="text-2xl font-bold truncate">{selectedHymn.name}</h2>
                  <p className="text-sm text-white/50">  {monasbaName[activeMonasba as keyof typeof monasbaName] ?? activeMonasba}</p>
                </div>
              </div>

              <div className="w-full mb-0.5 bg-[#1e1e1e] p-0.5 rounded-xl shadow-inner relative shrink-0">

                {isLoading && (
                  <div className="absolute inset-0 bg-[#1e1e1e]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-0.25"></div>
                    <span className="text-sm text-orange-500">جاري تحميل اللحن...</span>
                  </div>
                )}
                {hasError && (
                  <div className="absolute inset-0 bg-[#1e1e1e]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-0.5 rounded-xl text-center">
                    <span className="text-red-500 text-lg mb-0.25 font-bold">⚠️ تعذر تشغيل الملف الصوتي</span>
                    <p className="text-xs text-red-300/80 mb-0.5 max-w-xs dir-ltr font-mono bg-black/40 p-0.25 rounded border border-red-500/20">
                      {audioErrorDetails || "خطأ غير معروف في الاتصال بالسيرفر"}
                    </p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                        if (audioRef.current) {
                          audioRef.current.load();
                          audioRef.current.play().catch(() => { });
                        }
                      }}
                      className="px-0.5 py-0.25 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-xs font-semibold transition"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                )}

                <div className="flex justify-between text-xs font-mono text-white/50 mb-0.25" dir="ltr">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* <div
                  className="flex items-center gap-[2px] h-3 w-full cursor-pointer group"
                  onClick={handleWaveClick}
                  dir="ltr"
                >
                  {waveHeights.map((h, i) => {
                    const isActive = (i / WAVEFORM_BARS) <= (currentTime / (duration || 1));
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-150 ${isActive ? 'bg-linear-to-t from-orange-600 to-orange-400' : 'bg-white/20 group-hover:bg-white/30'}`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div> */}
                <div
                  className="flex items-center gap-[2px] h-2 w-full cursor-pointer group"
                  onClick={handleWaveClick}
                  dir="ltr"
                >
                  {(audioData.length > 0 ? audioData : waveHeights).map((h, i) => {
                    const totalBars = audioData.length > 0 ? audioData.length : WAVEFORM_BARS;
                    const isActive = (i / totalBars) <= (currentTime / (duration || 1));
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-75 ${isActive ? 'bg-linear-to-t from-orange-600 to-orange-400' : 'bg-white/20 group-hover:bg-white/30'
                          }`}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-0.5 mt-0.5" dir="ltr">
                  <button onClick={() => skipTime(-5)} className="text-white/60 hover:text-white transition-colors">
                  </button>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 3v18L11 12l10-9z" /><path d="M11 3v18L1 12l10-9z" /><text x="10" y="16" fontSize="8" fill="currentColor">+5</text></svg>
                  <button
                    onClick={togglePlay}
                    disabled={isLoading || hasError}
                    className="w-3 h-3 rounded-full bg-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:scale-105 active:scale-95 transition-all text-white disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    )}
                  </button>
                  <button onClick={() => skipTime(5)} className="text-white/60 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18L13 12 3 3z" /><path d="M13 3v18l10-9-10-9z" /><text x="8" y="16" fontSize="8" fill="currentColor">-5</text></svg>
                  </button>
                </div>

                <audio
                  ref={audioRef}
                  src={getArchiveSrc(selectedHymn.src)}
                  onPlay={() => {
                    if (audioCtxRef.current?.state === 'suspended') {
                      audioCtxRef.current.resume();
                    }
                    setupAudioAnalyser();
                  }}
                  onLoadStart={() => { setIsLoading(true); setHasError(false); setAudioErrorDetails(""); }}
                  onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    setIsLoading(false);
                  }}
                  onCanPlay={() => setIsLoading(false)}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => {
                    setIsLoading(false);
                    setHasError(true);
                    setIsPlaying(false);
                    const err = e.currentTarget.error;
                    if (err?.code === 1) setAudioErrorDetails("تم إلغاء تحميل الصوت بواسطة المستخدم (Aborted).");
                    else if (err?.code === 2) setAudioErrorDetails("خطأ في شبكة الاتصال أثناء تحميل الصوت (Network Error).");
                    else if (err?.code === 3) setAudioErrorDetails("خطأ في فك تشفير الملف الصوتي (Decode Error).");
                    else if (err?.code === 4) setAudioErrorDetails("الملف غير موجود على السيرفر (404 Not Found).");
                    else setAudioErrorDetails("تعذر الوصول لملف الصوت.");
                  }}
                  onTimeUpdate={() => {
                    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                  }}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>

              {(selectedHymn.lyrics_ar || selectedHymn.lyrics_copt || selectedHymn.lyrics_ar_copt) && (
                <div className="flex flex-wrap justify-center gap-0.5 mb-0.5 bg-white/5 py-0.25 px-0.5 rounded-lg shrink-0">
                  <label className="flex items-center gap-0.25 cursor-pointer text-sm">
                    <input type="checkbox" checked={showAr} onChange={e => setShowAr(e.target.checked)} className="accent-orange-500 w-2 h-2" />
                    عربي
                  </label>
                  <label className="flex items-center gap-0.25 cursor-pointer text-sm font-coptic">
                    <input type="checkbox" checked={showCopt} onChange={e => setShowCopt(e.target.checked)} className="accent-orange-500 w-2 h-2" />
                    قبطي
                  </label>
                  <label className="flex items-center gap-0.25 cursor-pointer text-sm" dir="ltr">
                    <input type="checkbox" checked={showArCopt} onChange={e => setShowArCopt(e.target.checked)} className="accent-orange-500 w-2 h-2" />
                    معرب
                  </label>
                </div>
              )}

              <div className="flex-1 overflow-y-auto scrollbar-hide px-0.25">
                {hasLyrics ? (
                  <div className="flex flex-col gap-0.5 pb-0.5 pt-0.5 text-center bg-white/5 rounded-xl p-0.5">
                    {/* 🟢 الزرارين هنا لاختيار طريقة العرض */}
                    <div className="flex justify-center gap-0.25 my-0.25">
                      <button
                        onClick={() => setLayoutMode("rows")}
                        className={`px-0.5 py-0.25 rounded-lg text-xs font-semibold transition ${layoutMode === "rows"
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-white/10 hover:bg-white/20 text-white/70"
                          }`}
                      >
                        صفوف 📜
                      </button>
                      <button
                        onClick={() => setLayoutMode("cols")}
                        className={`px-0.5 py-0.25 rounded-lg text-xs font-semibold transition ${layoutMode === "cols"
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-white/10 hover:bg-white/20 text-white/70"
                          }`}
                      >
                        أعمدة 📑
                      </button>
                    </div>
                    {selectedHymn.verses && selectedHymn.verses.length > 0 ? (
                      selectedHymn.verses.map((verse, index) => {
                        // التناوب بين خلفية تقيلة وخفيفة
                        const bgClass = index % 2 === 0 ? "bg-white/10" : "bg-white/5";
                        // حساب عدد الأعمدة المفعلة ديناميكياً
                        const activeCols = [showAr && verse.ar, showCopt && verse.copt, showArCopt && verse.ar_copt].filter(Boolean).length || 1;
                        return (
                          <div
                            key={index}
                            className={`p-0.5 rounded-lg border border-white/5 transition-all ${bgClass} ${layoutMode === "cols"
                                ? "grid grid-cols-1 md:grid-cols-3 gap-0.25 items-center text-center"
                                : "flex flex-col gap-0.25 text-center"
                              }`}
                            style={{
                              gridTemplateColumns: layoutMode === "cols" ? `repeat(${activeCols}, minmax(0, 1fr))` : undefined
                            }}
                          >
                            {showAr && verse.ar && (
                              <div className={`text-base font-bold text-white whitespace-pre-wrap leading-relaxed ${layoutMode === "cols" ? "border-l border-white/10 last:border-l-0 px-0.25" : ""
                                }`}>
                                {verse.ar}
                              </div>
                            )}
                            {showCopt && verse.copt && (
                              <div className={`text-lg font-coptic tracking-wide text-white/90 whitespace-pre-wrap ${layoutMode === "cols" ? "border-l border-white/10 last:border-l-0 px-0.25" : ""
                                }`}>
                                {verse.copt}
                              </div>
                            )}
                            {showArCopt && verse.ar_copt && (
                              <div className={`text-base font-serif text-white/70 whitespace-pre-wrap ${layoutMode === "cols" ? "border-l border-white/10 last:border-l-0 px-0.25" : ""
                                }`}>
                                {verse.ar_copt}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {showAr && selectedHymn.lyrics_ar && (
                          <div className="text-lg font-bold text-white whitespace-pre-wrap leading-relaxed">
                            {selectedHymn.lyrics_ar}
                          </div>
                        )}
                        {showCopt && selectedHymn.lyrics_copt && (
                          <div className="text-xl font-coptic tracking-wide text-white/90 whitespace-pre-wrap mt-0.5 border-t border-white/10 pt-0.5">
                            {selectedHymn.lyrics_copt}
                          </div>
                        )}
                        {showArCopt && selectedHymn.lyrics_ar_copt && (
                          <div className="text-lg font-serif text-white/70 whitespace-pre-wrap mt-0.5 border-t border-white/10 pt-0.5" dir="ltr">
                            {selectedHymn.lyrics_ar_copt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-0.5">
                    <span className="text-4xl">📝</span>
                    <p>الكلمات غير متوفرة لهذا اللحن حالياً</p>
                  </div>
                )}
              </div>

              {/* قسم الهزات والمخطوطات */}
              {/* {getImages(selectedHymn).length > 0 && (
                <div className="w-full mt-0.5 bg-white/5 p-0.5 rounded-xl shrink-0 overflow-y-auto custom-scrollbar">
                  <h3 className="text-sm font-semibold mb-0.5 text-white/50 sticky top-0 bg-[#1a1a1a] p-0.25 rounded z-10">مخطوطات / هزات</h3>
                  <div className="flex gap-0.5 overflow-x-auto pb-0.25">
                    {getImages(selectedHymn).map((src, i) => (
                      <div
                        key={i}
                        onClick={() => { setFullScreenImage(src); setImageScale(1); }}
                        className="min-w-[150px] w-[150px] md:min-w-[200px] md:w-[200px] shrink-0 rounded-lg overflow-hidden border border-white/10 cursor-zoom-in relative group"
                      >
                        <Image
                          src={src}
                          alt={`هزات ${i + 1}`}
                          width={200}
                          height={280}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md text-2xl">🔍</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
              {getImages(selectedHymn).length > 0 && (
                <div className="mt-0.5 shrink-0 flex justify-center">
                  <button
                    onClick={() => {
                      const imgs = getImages(selectedHymn);
                      setFullScreenImage(imgs[0]);
                      setCurrentImageIndex(0);
                      setImageScale(1);
                    }}
                    className="flex items-center gap-0.25 px-0.5 py-0.25 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-semibold transition shadow-md"
                  >
                    📖 عرض المخطوطات والهزات ({getImages(selectedHymn).length})
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة عرض الصورة بكامل الشاشة مع دعم التكبير باللمس Pinch-to-Zoom */}
      {/* <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          > */}
            {/* Top Bar with Close Button */}
            {/* <div className="absolute top-0 left-0 w-full p-0.5 flex justify-between items-center z-110 bg-linear-to-b from-black/80 to-transparent">
              <div className="text-white/50 text-sm bg-black/50 px-0.5 py-0.25 rounded-full">
                يمكنك التكبير والتصغير بأصبعيك أو الأزرار
              </div>
              <button
                onClick={() => { setFullScreenImage(null); setImageScale(1); }}
                className="w-3 h-3 bg-white/10 hover:bg-white/30 hover:rotate-90 rounded-full flex items-center justify-center text-white text-2xl backdrop-blur-md transition-all"
              >
                ✕
              </button>
            </div> */}

            {/* Zoom Controls */}
            {/* <div className="absolute bottom-1 right-1 z-110 flex gap-0.5">
              <button
                onClick={(e) => { e.stopPropagation(); setImageScale(prev => Math.min(prev + 0.5, 4)); }}
                className="w-3 h-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white text-2xl shadow-lg backdrop-blur-md transition-all"
              >
                +
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImageScale(prev => Math.max(prev - 0.5, 0.5)); }}
                className="w-3 h-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white text-3xl shadow-lg backdrop-blur-md transition-all pb-0.25"
              >
                -
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setImageScale(1); }}
                className="h-3 px-0.25 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white text-sm shadow-lg backdrop-blur-md transition-all"
              >
                إعادة
              </button>
            </div> */}

            {/* Image Container */}
            {/* <div
              className="w-full h-full overflow-auto flex items-center justify-center cursor-zoom-out"
              onClick={() => { setFullScreenImage(null); setImageScale(1); }}
            >
              <motion.div
                animate={{ scale: imageScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full min-h-[50vh]"
                onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); setImageScale(1); }}
              >
                <Image
                  src={fullScreenImage}
                  alt="Full screen view"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
      {/* نافذة المعرض والـ Slideshow للمخطوطات */}
      <AnimatePresence>
        {fullScreenImage && selectedHymn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* شريط أدوات النافذة */}
            <div className="absolute top-0 left-0 w-full p-0.5 flex justify-between items-center z-110 bg-linear-to-b from-black/80 to-transparent">
              <div className="text-white/70 text-xs bg-black/50 px-0.5 py-0.25 rounded-full border border-white/10">
                مخطوطة {currentImageIndex + 1} من {getImages(selectedHymn).length}
              </div>
              <button
                onClick={() => { setFullScreenImage(null); setImageScale(1); }}
                className="w-3 h-3 bg-white/10 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-lg backdrop-blur-md transition"
              >
                ✕
              </button>
            </div>

            {/* أزرار التنقل (Slideshow) */}
            {getImages(selectedHymn).length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const imgs = getImages(selectedHymn);
                    const nextIdx = (currentImageIndex - 1 + imgs.length) % imgs.length;
                    setCurrentImageIndex(nextIdx);
                    setFullScreenImage(imgs[nextIdx]);
                    setImageScale(1);
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-110 p-0.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition"
                >
                  ❯
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const imgs = getImages(selectedHymn);
                    const nextIdx = (currentImageIndex + 1) % imgs.length;
                    setCurrentImageIndex(nextIdx);
                    setFullScreenImage(imgs[nextIdx]);
                    setImageScale(1);
                  }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-110 p-0.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition"
                >
                  ❮
                </button>
              </>
            )}

            {/* عرض الصورة والزوم */}
            <div
              className="w-full h-full overflow-auto flex items-center justify-center cursor-zoom-out p-0.5"
              onClick={() => { setFullScreenImage(null); setImageScale(1); }}
            >
              <motion.div
                animate={{ scale: imageScale }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full h-full max-w-4xl max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={fullScreenImage}
                  alt="Manuscript"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
