// app/al7an/HymnPlayerClient.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// import { toast } from "@/components/ui/use-toast"; // لو عندك toast; لو مش موجود احذف
// يمكنك استبدال toast بـ alert بسيطة

type Props = {
  finalSrc: string;
  pageTitle: string;
  lyrics?: string;
};

export default function HymnPlayerClient({ finalSrc, pageTitle, lyrics = "" }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);

  useEffect(() => {
    // Detect TTS voices (async)
    function loadVoices() {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      // حاول نلاقي صوت قبطي أولًا (نادرا ما يكون موجود)، بعدها أصوات عربية
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

  function sharePage() {
    const url = window.location.href;
    const title = pageTitle;
    if (navigator.share) {
      navigator
        .share({ title, text: `اسمع لحن ${title}`, url })
        .catch(() => { });
    } else {
      // fall back: copy to clipboard + open whatsapp
      navigator.clipboard?.writeText(url);
      const wa = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
      window.open(wa, "_blank");
    }
    // optional toast
    try {
      alert?.({ title: "تم مشاركة رابط الصفحة" });
    } catch { }
  }

  function downloadPageLink() {
    const url = window.location.href;
    // افتح رابط التنزيل للصفحة (لا يمكن "تحميل" صفحة html مباشرة لكن ننسخ الرابط)
    navigator.clipboard?.writeText(url);
    try {
      alert?.({ title: "رابط الصفحة نُسخ للحافظة" });
    } catch {
      alert("نسخ رابط الصفحة");
    }
  }

  function speak(text?: string) {
    const content = text?.trim() ? text : pageTitle;
    if (!("speechSynthesis" in window)) {
      alert("المتصفح لا يدعم التحويل إلى كلام");
      return;
    }
    const utter = new SpeechSynthesisUtterance(content);
    // اختر صوت إذا متاح
    const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI) || availableVoices.find((v) => /^ar/.test(v.lang));
    if (voice) utter.voice = voice;
    // احاول ضبط اللغة للعربية افتراضيًا
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

          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={togglePlay} variant="default">
              {playing ? "إيقاف" : "تشغيل"}
            </Button>

            <Button onClick={() => speak(lyrics || pageTitle)} variant="outline">
              نطق الاسم / الكلمات
            </Button>

            <Button onClick={sharePage} variant="secondary">
              مشاركة الصفحة
            </Button>

            <Button onClick={downloadPageLink} variant="ghost">
              نسخ رابط الصفحة
            </Button>
          </div>
        </div>

        <div className="w-full md:w-80">
          <motion.div
            initial={{ scale: 1 }}
            animate={playing ? { scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className="bg-slate-50 p-3 rounded"
          >
            <audio
              ref={audioRef}
              onEnded={handleEnded}
              className="w-full"
              controls
              src={finalSrc || undefined}
            />
            {finalSrc ? (
              <div className="text-xs text-muted-foreground mt-2">
                مصدر الصوت: {finalSrc.startsWith('http') ? new URL(finalSrc).hostname : 'محلي'}
              </div>
            ) : (
              <div className="text-sm text-red-500 mt-2">❌ لا يوجد ملف صوتي متاح</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* اختيار صوت (إن وُجدت) */}
      {availableVoices.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <label className="text-sm text-muted-foreground">اختر صوتاً:</label>
          <select
            name="voice"
            title="voice"
            value={selectedVoiceURI ?? ""}
            onChange={(e) => setSelectedVoiceURI(e.target.value || null)}
            className="rounded border px-2 py-1"
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
