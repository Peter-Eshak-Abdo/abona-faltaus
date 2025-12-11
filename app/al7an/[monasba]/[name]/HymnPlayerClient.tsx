"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast"; // تم التعديل لاستخدام الـ custom hook

type Props = {
  finalSrc: string;
  pageTitle: string;
  lyrics?: string;
};

export default function HymnPlayerClient({ finalSrc, pageTitle, lyrics = "" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  const CACHE_NAME = 'offline-audio';

  // التحقق مما إذا كان الملف متاحًا في وضع عدم الاتصال عند تحميل المكون
  useEffect(() => {
    async function checkCache() {
      if (!finalSrc || typeof caches === 'undefined') return;
      try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(finalSrc);
        if (response) {
          setIsOffline(true);
        }
      } catch (error) {
        console.error("Error checking cache:", error);
      }
    }
    checkCache();
  }, [finalSrc]);

  useEffect(() => {
    function loadVoices() {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const coptic = voices.find((v) => /copt|coptic/i.test(v.name || v.lang));
      const arabic = voices.find((v) => /^ar/.test(v.lang || v.name));
      const fallback = voices[0];
      setSelectedVoiceURI((coptic || arabic || fallback)?.voiceURI ?? null);
    }
    if ("speechSynthesis" in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function handleEnded() {
    setPlaying(false);
  }

  async function downloadForOffline() {
    if (!finalSrc || typeof caches === 'undefined') {
      toast({ title: "خطأ", description: "المتصفح لا يدعم التخزين." });
      return;
    }
    setIsDownloading(true);
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.add(finalSrc);
      setIsOffline(true);
      toast({ title: "نجاح", description: "تم تحميل اللحن بنجاح وهو متاح الآن للاستماع بدون انترنت." });
    } catch (error) {
      console.error("Failed to cache audio file:", error);
      toast({ title: "فشل التحميل", description: "لم نتمكن من تحميل الملف، قد يكون هناك مشكلة في الشبكة.", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }

  function sharePage() {
    const url = window.location.href;
    const title = pageTitle;
    if (navigator.share) {
      navigator.share({ title, text: `اسمع لحن ${title}`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      const wa = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
      window.open(wa, "_blank");
    }
    toast?.({ title: "تم مشاركة رابط الصفحة" });
  }

  function speak(text?: string) {
    const content = text?.trim() ? text : pageTitle;
    if (!("speechSynthesis" in window)) {
      alert("المتصفح لا يدعم التحويل إلى كلام");
      return;
    }
    const utter = new SpeechSynthesisUtterance(content);
    const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI) || availableVoices.find((v) => /^ar/.test(v.lang));
    if (voice) utter.voice = voice;
    utter.lang = (utter.voice?.lang || "ar-EG");
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  return (
    <section className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{pageTitle}</h2>
          {lyrics ? (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{lyrics}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">لا توجد كلمات مُدرجة لهذا اللحن.</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={togglePlay} variant="default">
              {playing ? "إيقاف" : "تشغيل"}
            </Button>
            <Button
              onClick={downloadForOffline}
              variant="outline"
              disabled={isOffline || isDownloading}
            >
              {isOffline ? "تم التحميل أوفلاين" : isDownloading ? "جاري التحميل..." : "تحميل أوفلاين"}
            </Button>
            <Button onClick={() => speak(lyrics || pageTitle)} variant="outline">
              نطق الكلمات
            </Button>
            <Button onClick={sharePage} variant="secondary">
              مشاركة
            </Button>
          </div>
        </div>

        <div className="w-full md:w-80">
          <motion.div
            initial={{ scale: 1 }}
            animate={playing ? { scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className="bg-slate-50 p-2 rounded-lg"
          >
            <audio
              ref={audioRef}
              onEnded={handleEnded}
              className="w-full"
              controls
              src={finalSrc || undefined}
            />
            {finalSrc ? (
              <div className="text-xs text-muted-foreground mt-1 text-center">
                مصدر الصوت: {finalSrc.startsWith('http') ? new URL(finalSrc).hostname : 'محلي'}
              </div>
            ) : (
              <div className="text-sm text-red-500 mt-1 p-4 text-center">❌ لا يوجد ملف صوتي متاح</div>
            )}
          </motion.div>
        </div>
      </div>

      {availableVoices.length > 0 && (
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <label className="text-sm text-muted-foreground">اختر صوتاً للنطق:</label>
          <select
            name="voice"
            title="voice"
            value={selectedVoiceURI ?? ""}
            onChange={(e) => setSelectedVoiceURI(e.target.value || null)}
            className="rounded border bg-gray-50 p-1 text-sm"
          >
            <option value="">افتراضي</option>
            {availableVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} — {v.lang}
              </option>
            ))}
          </select>
        </div>
      )}
    </section>
  );
}
