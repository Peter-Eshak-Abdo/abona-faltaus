"use client";

import React, { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceRecorderButton({
  onTranscript,
  className = "",
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    setStatusMessage("");

    // 1. المحاولة الأولى: التسجيل الصوتي وإرساله لـ Groq Whisper / ElevenLabs API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        let mimeType = "audio/webm";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("audio/webm")) {
            mimeType = "audio/webm";
          } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
            mimeType = "audio/mp4";
          } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
            mimeType = "audio/ogg";
          }
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          setIsProcessing(true);
          setStatusMessage("جاري تحويل الصوت إلى نص...");

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const res = await fetch("/api/notes/transcribe", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("API transcription failed");

            const data = await res.json();
            const text = data.transcript || data.text;
            if (text) {
              onTranscript(text);
              toast.success("تم تفريغ الصوت بنجاح! 🎙️");
            } else {
              throw new Error("لم يتم التعرف على أي نص");
            }
          } catch (apiErr) {
            console.warn("Server STT API failed, falling back to Web Speech API:", apiErr);
            toast.info("جاري التحويل عبر ميكروفون المتصفح المباشر...");
            startWebSpeechFallback();
          } finally {
            setIsProcessing(false);
            setStatusMessage("");
          }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        setStatusMessage("جاري التسجيل... تحدث الآن");
        return;
      } catch (err: any) {
        console.warn("getUserMedia failed or denied, using Web Speech API fallback:", err);
      }
    }

    // 2. المحاولة البديلة المباشرة (Fallback): Web Speech API
    startWebSpeechFallback();
  };

  const startWebSpeechFallback = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("التسجيل الصوتي غير مدعوم في متصفحك الحالي. يرجى الكتابة يدوياً.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-EG";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        if (transcript) {
          onTranscript(transcript);
          toast.success("تم تسجيل الصوت وإضافته! 🎙️");
        }
        setIsRecording(false);
        setStatusMessage("");
      };

      recognition.onerror = (e: any) => {
        console.error("Web Speech API error:", e);
        toast.error("تعذر التقاط الصوت، يمكنك المحاولة مرة أخرى.");
        setIsRecording(false);
        setStatusMessage("");
      };

      recognition.onend = () => {
        setIsRecording(false);
        setStatusMessage("");
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setStatusMessage("جاري الاستماع...");
    } catch (e: any) {
      console.error("Speech Recognition start failed:", e);
      toast.error("فشل بدء التعرف الصوتي.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`flex items-center gap-0.25 px-0.5 py-0.25 rounded-xl text-xs font-bold transition-all shadow-sm ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
            : isProcessing
            ? "bg-stone-300 dark:bg-zinc-700 text-stone-600 dark:text-stone-300 cursor-wait"
            : "bg-amber-600/90 hover:bg-amber-600 text-white active:scale-95"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>جاري المعالجة...</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff size={14} />
            <span>إيقاف التسجيل</span>
          </>
        ) : (
          <>
            <Mic size={14} />
            <span>تسجيل صوتي</span>
          </>
        )}
      </button>

      {statusMessage && (
        <span className="text-xs text-amber-500 font-medium animate-pulse">
          {statusMessage}
        </span>
      )}
    </div>
  );
}
