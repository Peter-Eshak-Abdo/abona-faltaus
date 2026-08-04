import { useState, useRef } from "react"
import localforage from "localforage";

type VerseObj = { verse: number; text_plain: string; text_vocalized: string };
type BookObj = { abbrev: string; name: string; chapters: VerseObj[][] };

export default function AudioPlayerBottomBar() {
  const [bibleData, setBibleData] = useState<BookObj[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isBrowserFallback, setIsBrowserFallback] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [currentBookIdx, setCurrentBookIdx] = useState(0);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [ttsLoadingMessage, setTtsLoadingMessage] = useState("");


  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
    setIsBrowserFallback(false);
  };

  const toggleAudio = async () => {
    if (isPlaying || isAudioLoading) {
      stopAudio();
      setIsTTSLoading(false);
      return;
    }

    setIsAudioLoading(true);

    const cacheKey = `audio_offline_${currentBookIdx}_${currentChapterIdx}`;

    const activeBook = bibleData[currentBookIdx];
    const activeChapter = activeBook.chapters[currentChapterIdx];
    let textToRead = `${activeBook.name}، الإصحَاحُ ${currentChapterIdx + 1}. `;
    textToRead += activeChapter.map(v => v.text_vocalized).join(". ");

    try {
      let audioBlob = await localforage.getItem<Blob>(cacheKey);

      if (!audioBlob) {
        setIsTTSLoading(true);
        setTtsLoadingMessage("جاري تجهيز الملف الصوتي لأول مرة... قد يستغرق بضع ثوانٍ (سيعمل لاحقاً بدون إنترنت)");

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToRead }),
        });

        if (!response.ok) {
          throw new Error('السيرفر غير متاح أو الخدمة متوقفة');
        }

        audioBlob = await response.blob();
        await localforage.setItem(cacheKey, audioBlob);
      }

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsTTSLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      await audio.play();
      setIsPlaying(true);
      setIsTTSLoading(false);

    } catch (error) {
      setIsTTSLoading(false);
      console.warn('Network TTS failed, triggering Level 3 Offline Fallback (Web Speech API)...', error);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ar-EG';

        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;

        utterance.onend = () => {
          setIsPlaying(false);
          setIsBrowserFallback(false);
        };

        utterance.onerror = () => {
          stopAudio();
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsBrowserFallback(true);
      } else {
        alert("نظام قراءة النصوص غير مدعوم على هذا الجهاز بالكامل بالوضع الحالي.");
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-variant shadow-[0_-8px_30px_rgba(31,31,31,0.08)] transform translate-y-0 transition-transform duration-300" id="audio-player">
      <div className="max-w-4xl mx-auto px-1 py-1 flex flex-col md:flex-row items-center gap-1 md:gap-8">
        <div className="flex items-center gap-1 w-full md:w-auto justify-center">
          <button className="w-2 h-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">replay_10</span>
          </button>
          <button onClick={toggleAudio} className="w-3 h-3 flex items-center justify-center rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            {isPlaying ? (
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
            ) : (
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            )}
          </button>
          <button className="w-2 h-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">forward_10</span>
          </button>
        </div>
        <div className="grow flex items-center gap-1 w-full">
          <span className="font-label-sm text-label-sm text-on-surface-variant w-10 text-left">0:00</span>
          <div className="grow relative h-2 bg-surface-container-high rounded-full cursor-pointer group">
            <div className="right-0 top-0 h-full bg-primary rounded-full w-0 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant w-10">0:00</span>
        </div>
        <div className="hidden md:flex items-center gap-0.5">
          <button className="w-2 h-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" title="سرعة القراءة">
            <span className="font-label-sm font-bold">1x</span>
          </button>
          <button className="w-2 h-2 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">volume_up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
