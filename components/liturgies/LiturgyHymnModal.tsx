'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  FaPlay,
  FaPause,
  FaTimes,
  FaMusic,
  FaVolumeUp,
  FaFileImage,
  FaExternalLinkAlt,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';
import { LiturgyHymnRef } from '@/lib/liturgies/types';
import Link from 'next/link';

interface Props {
  hymn: LiturgyHymnRef | null;
  onClose: () => void;
}

export default function LiturgyHymnModal({ hymn, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHazat, setShowHazat] = useState(true);
  const [isFullScreenImage, setIsFullScreenImage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioSrc = (src: string) => {
    return `https://pub-08244638454a477bbf9f9548b1fdb3b5.r2.dev/al7an/${encodeURIComponent(
      src.trim() + '.mp3'
    )}`;
  };

  const fallbackAudioSrc = (src: string) => {
    return `https://archive.org/download/abona-faltaus-audio/${encodeURIComponent(
      src.trim() + '.mp3'
    )}`;
  };

  useEffect(() => {
    if (hymn && hymn.src) {
      setIsPlaying(true);
    }
  }, [hymn]);

  if (!hymn) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0.5 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-2xl bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-1 border-b border-neutral-800 bg-neutral-950/80">
            <div className="flex items-center gap-0.5 text-amber-400">
              <FaMusic className="text-xl" />
              <div>
                <h3 className="font-bold text-lg text-white">{hymn.name}</h3>
                <span className="text-xs text-neutral-400">
                  {hymn.duration ? `المدة: ${hymn.duration}` : 'تسجيل اللحن الكنسي والهزات'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <Link
                href={`/al7an`}
                className="p-0.5 text-xs bg-neutral-800 hover:bg-amber-600/20 text-neutral-300 rounded-lg flex items-center gap-1 transition"
                title="فتح في صفحة الألحان الشاملة"
              >
                <FaExternalLinkAlt />
                <span className="hidden sm:inline">صفحة الألحان</span>
              </Link>
              <button
                onClick={onClose}
                className="p-0.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-0.5 space-y-0.5">
            {/* Audio Player Bar */}
            {hymn.src && (
              <div className="bg-neutral-950/60 p-0.5 rounded-xl border border-neutral-800 flex flex-col gap-0.5">
                <audio
                  ref={audioRef}
                  src={getAudioSrc(hymn.src)}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => {
                    // Fallback to Archive
                    if (audioRef.current) {
                      audioRef.current.src = fallbackAudioSrc(hymn.src!);
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                />

                <div className="flex items-center justify-between gap-0.5">
                  <button
                    onClick={togglePlay}
                    className="w-3 h-3 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-neutral-950 flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20 hover:scale-105 transition"
                  >
                    {isPlaying ? <FaPause /> : <FaPlay className="mr-0.5" />}
                  </button>

                  <div className="flex-1 space-y-0.5">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
                    />
                    <div className="flex justify-between text-xs text-neutral-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hazat Musical Sheet Toggle & Display */}
            {hymn.hazatSrc && (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowHazat(!showHazat)}
                    className="flex items-center gap-0.5 text-sm font-bold text-amber-400 hover:text-amber-300"
                  >
                    <FaFileImage />
                    <span>مذكرة الهزات الموسيقية</span>
                  </button>
                  <button
                    onClick={() => setIsFullScreenImage(!isFullScreenImage)}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-0.25"
                  >
                    <FaExpand />
                    <span>تكبير المذكرة</span>
                  </button>
                </div>

                {showHazat && (
                  <div
                    className={`relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 ${
                      isFullScreenImage ? 'fixed inset-4 z-50 flex items-center justify-center bg-black/95' : 'h-64'
                    }`}
                  >
                    {isFullScreenImage && (
                      <button
                        onClick={() => setIsFullScreenImage(false)}
                        className="absolute top-1 left-1 z-50 p-0.5 bg-neutral-800 text-white rounded-full"
                      >
                        <FaCompress />
                      </button>
                    )}
                    <Image
                      src={hymn.hazatSrc}
                      alt={hymn.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
