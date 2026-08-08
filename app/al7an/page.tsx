"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import al7anData from "@/public/al7an-all.json";

type Hymn = {
  name: string;
  src: string;
  duration?: string;
  lyrics_ar?: string;
  lyrics_copt?: string;
  lyrics_ar_copt?: string;
  [key: string]: any;
};
type HymnMap = Record<string, Hymn[]>;

const merged = (al7anData as any[]).reduce((acc, c) => ({ ...acc, ...c }), {}) as HymnMap;
const monasbatList = Object.keys(merged);

export default function UnifiedAl7anClient() {
  const [activeMonasba, setActiveMonasba] = useState<string>(monasbatList[0] || "");
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const hymnsForActiveMonasba = useMemo(() => merged[activeMonasba] || [], [activeMonasba]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const getArchiveSrc = (src: string) => {
    return `https://archive.org/download/abona-faltaus-audio/${encodeURIComponent(src.trim() + ".mp3")}`;
    // return `https://archive.org/download/abona-faltaus-audio/${encodeURIComponent(name.trim() + ".mp3")}`;
    // https://dn720702.ca.archive.org/0/items/abona-faltaus-audio/%D8%A7%D9%88%D9%85%D9%88%D9%86%D9%88%D8%AC%D9%86%D9%8A%D8%B3.mp3
    // https://dn720702.ca.archive.org/0/items/abona-faltaus-audio/%D9%84%D8%AD%D9%86_%D8%A7%D9%88%D9%85%D9%88%D9%86%D9%88%D8%AC%D9%86%D9%8A%D8%B3.mp3
  };

  const getImages = (hymn: Hymn) => {
    return Object.keys(hymn)
      .filter((k) => k.startsWith("hazatSrc") && hymn[k])
      .map((k) => hymn[k] as string);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-80px)] overflow-hidden bg-surface" dir="rtl">

      <div className={`w-full ${selectedHymn ? 'hidden lg:flex' : 'flex'} lg:w-[40%] h-full flex-col bg-surface border-l border-outline-variant/30 z-10 overflow-hidden`}>
        <div className="p-0.5 shrink-0">
          <h2 className="text-2xl font-bold text-primary mb-0.5">المناسبات والألحان</h2>
          <div className="flex gap-0.5 overflow-x-auto pb-0.25 scrollbar-hide">
            {monasbatList.map((m) => (
              <button
                key={m}
                onClick={() => { setActiveMonasba(m); setSelectedHymn(null); }}
                className={`px-1 py-0.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeMonasba === m
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 pb-2 lg:pb-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
            {hymnsForActiveMonasba.map((h, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                onClick={() => {
                  setSelectedHymn(h);
                  setIsPlaying(true);
                  setCurrentTime(0);
                }}
                className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all bg-surface-container-lowest border p-0.5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-lg text-on-surface mb-0.25">{h.name}</h3>
                  <p className="text-xs text-muted-foreground">{activeMonasba}</p>
                </div>
                {h.duration && <div className="text-xs text-primary mt-0.25">المدة: {h.duration}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedHymn && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full lg:w-[60%] h-full relative overflow-y-auto bg-slate-900 text-white flex flex-col"
          >
            <div className="lg:hidden p-1 sticky top-0 left-0 z-50">
              <button onClick={() => setSelectedHymn(null)} className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                ✕
              </button>
            </div>

            <div className="relative z-10 flex flex-col h-full w-full p-0.5 lg:p-1">
              <div className="flex items-center gap-0.5 mb-0.5 mt-0.5 lg:mt-0">
                <div className="w-3 h-3 rounded-2xl shadow-2xl bg-primary flex items-center justify-center text-4xl">
                  🎵
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-0.5">{selectedHymn.name}</h2>
                  <p className="text-lg text-white/60">{activeMonasba}</p>
                </div>
              </div>

              <div className="w-full max-w-2xl mx-auto mb-1 bg-white/5 p-0.5 rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between text-sm text-white/50 mb-0.5" dir="ltr">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                <div
                  className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1 cursor-pointer relative"
                  onClick={(e) => {
                    if (audioRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                  <div
                    className="h-full bg-primary relative transition-all"
                    style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={togglePlay}
                    className="w-3 h-3 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-105 transition-all text-white text-2xl"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                </div>

                <audio
                  ref={audioRef}
                  src={getArchiveSrc(selectedHymn.name)}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-1 w-full max-w-2xl mx-auto mb-1">
                {(selectedHymn.lyrics_ar || selectedHymn.lyrics_copt || selectedHymn.lyrics_ar_copt) ? (
                  <div className="bg-white/5 p-1 rounded-2xl text-center space-y-0.5">
                    <h3 className="text-xl font-semibold text-white/80 border-b border-white/10 pb-0.5 mb-1">كلمات اللحن</h3>

                    {selectedHymn.lyrics_ar && (
                      <p className="text-lg leading-loose text-white/90 whitespace-pre-wrap">
                        {selectedHymn.lyrics_ar}
                      </p>
                    )}
                    {selectedHymn.lyrics_copt && (
                      <p className="text-lg leading-loose text-secondary-fixed whitespace-pre-wrap font-display-lg-mobile mt-0.5 border-t border-white/10 pt-0.5">
                        {selectedHymn.lyrics_copt}
                      </p>
                    )}
                    {selectedHymn.lyrics_ar_copt && (
                      <p className="text-lg leading-loose text-white/70 whitespace-pre-wrap mt-0.5 border-t border-white/10 pt-0.5" dir="ltr">
                        {selectedHymn.lyrics_ar_copt}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-white/50 text-center mt-0.5">لا توجد كلمات مُدرجة لهذا اللحن.</p>
                )}
              </div>

              {getImages(selectedHymn).length > 0 && (
                <div className="w-full max-w-4xl mx-auto">
                  <h3 className="text-xl font-semibold mb-1 text-white/80">هزات اللحن</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                    {getImages(selectedHymn).map((src, i) => (
                      <div key={i} className="rounded-xl overflow-hidden bg-white/5">
                        <Image
                          src={src}
                          alt={`هزات ${selectedHymn.name} - صفحة ${i + 1}`}
                          width={600}
                          height={800}
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
