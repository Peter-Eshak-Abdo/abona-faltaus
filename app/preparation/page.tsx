"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Sparkles,
  FileText,
  Presentation,
  Download,
  Copy,
  Trash2,
  Save,
  BookOpen,
  HelpCircle,
  Loader2,
  ArrowRight,
  Share2,
  Check,
  FileDown
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { exportToPowerPoint, exportToWord, exportToPDF } from "@/lib/prep-export";

export default function PreparationPage() {
  const [title, setTitle] = useState("تحضير درس جديد");
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State for AI Prep Modal
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("إعدادي وثانوي");
  const [duration, setDuration] = useState("30 دقيقة");
  const [style, setStyle] = useState("تفاعلي وقصصي");
  const [mainGoal, setMainGoal] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // تحميل المسودة المحفوظة تلقائياً
  useEffect(() => {
    const saved = localStorage.getItem("prep_draft_content");
    const savedTitle = localStorage.getItem("prep_draft_title");
    if (saved) setContent(saved);
    if (savedTitle) setTitle(savedTitle);
  }, []);

  // الحفظ التلقائي في LocalStorage
  const handleContentChange = (val: string) => {
    setContent(val);
    localStorage.setItem("prep_draft_content", val);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    localStorage.setItem("prep_draft_title", val);
  };

  // معالجة التسجيل الصوتي
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("جاري الاستماع والتسجيل... تحدث الآن");
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("يرجى إعطاء الإذن لاستخدام الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob);

      const res = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresConfig) {
          toast.error("ميزة التفريغ الصوتي تتطلب ضبط ELEVENLABS_API_KEY أو OPENAI_API_KEY");
        } else {
          throw new Error(data.error || "فشل تفريغ الصوت");
        }
        return;
      }

      if (data.text) {
        const updated = content ? `${content}\n\n${data.text}` : data.text;
        handleContentChange(updated);
        toast.success("تم تفريغ الصوت وإضافته للنوتة بنجاح!");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تفريغ الصوت");
    } finally {
      setIsTranscribing(false);
    }
  };

  // توليد التحضير بالذكاء الاصطناعي
  const handleGeneratePrep = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/preparation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftContent: content,
          topic: topic || title,
          audience,
          duration,
          style,
          mainGoal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل توليد التحضير");

      if (data.result) {
        handleContentChange(data.result);
        if (topic) handleTitleChange(topic);
        setIsAiModalOpen(false);
        toast.success("تم توليد تحضير الدرس بالكامل بنجاح! 🪄");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التوليد");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d1b18] flex flex-col font-sans pb-[calc(env(safe-area-inset-bottom,0px)+20px)]" dir="rtl">
      {/* Header */}
      <header className="bg-[#5c4538] text-[#e8cfae] px-4 py-3 sm:px-6 flex items-center justify-between shadow-md sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black">نوتة التحضير الذكية 📝</h1>
            <p className="text-xs text-[#e8cfae]/80 hidden sm:block">إعداد الدروس والعظات واللقاءات الروحية بمساعدة الـ AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Sparkles size={16} />
            <span>توليد بالـ AI 🪄</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        {/* Title & Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl sm:text-2xl font-black bg-transparent border-b-2 border-stone-200 focus:border-amber-600 outline-none pb-1 flex-1 text-[#2d1b18]"
            placeholder="عنوان الدرس أو العظة..."
          />

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mic Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : isTranscribing
                  ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }`}
            >
              {isTranscribing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>تفريغ الصوت...</span>
                </>
              ) : isRecording ? (
                <>
                  <MicOff size={15} />
                  <span>إيقاف التسجيل</span>
                </>
              ) : (
                <>
                  <Mic size={15} />
                  <span>تسجيل صوتي 🎙️</span>
                </>
              )}
            </button>

            {/* Quick Actions */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("تم نسخ المحتوى!");
              }}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              title="نسخ"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={() => {
                if (confirm("هل تريد مسح المسودة والبدء من جديد؟")) {
                  handleContentChange("");
                  handleTitleChange("تحضير درس جديد");
                  toast.info("تم مسح النوتة");
                }
              }}
              className="p-2 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              title="مسح"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Text Area Content */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-stone-200/80 flex-1 flex flex-col min-h-[380px]">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="اكتب أفكار ومسودة تحضير الدرس هنا، أو سجل صوتك، أو اضغط على 'توليد بالـ AI' لصياغة الدرس بالكامل..."
            className="w-full flex-1 min-h-[320px] bg-transparent outline-none resize-none leading-relaxed text-stone-800 text-base sm:text-lg font-medium"
          />
        </div>

        {/* Exports Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-600 text-sm font-bold">
            <Download size={18} className="text-amber-700" />
            <span>تصدير ملف التحضير:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={() => exportToPowerPoint(title, content)}
              disabled={!content.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Presentation size={16} />
              <span>PowerPoint (.pptx)</span>
            </button>

            <button
              onClick={() => exportToWord(title, content)}
              disabled={!content.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <FileText size={16} />
              <span>Word (.docx)</span>
            </button>

            <button
              onClick={() => exportToPDF(title, content)}
              disabled={!content.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <FileDown size={16} />
              <span>PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </main>

      {/* AI Requirements Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-amber-200/50 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-stone-900">توليد تحضير الدرس بالذكاء الاصطناعي</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">موضوع أو عنوان الدرس</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: فضيلة المحبة، داود النبي وجليات، الأمانة..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-sm font-bold outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">المرحلة والسن المستهدف</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-sm font-bold outline-none"
                  >
                    <option value="حضانة وأولى وثانية ابتدائي">حضانة وابتدائي صغار</option>
                    <option value="رابعة وخامسة وسادسة ابتدائي">ابتدائي كبار</option>
                    <option value="إعدادي وثانوي">إعدادي وثانوي</option>
                    <option value="شباب وخريجين">شباب وخريجين</option>
                    <option value="اجتماع عام وأسرة">اجتماع عام / أسرة</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">مدة الشرح التقريبية</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-sm font-bold outline-none"
                  >
                    <option value="15 دقيقة (موجز)">15 دقيقة (موجز)</option>
                    <option value="30 دقيقة (قياسي)">30 دقيقة (قياسي)</option>
                    <option value="45 دقيقة (مفصل)">45 دقيقة (مفصل)</option>
                    <option value="ساعة كاملة (دراسة)">ساعة كاملة (دراسة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">أسلوب وطريقة الشرح</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-sm font-bold outline-none"
                  >
                    <option value="قصصي وتفاعلي">قصصي وتفاعلي</option>
                    <option value="روحي وتأملي عميق">روحي وتأملي عميق</option>
                    <option value="دراسي وعقيدي">دراسي وعقيدي</option>
                    <option value="أنشطة وألعاب تطبيقية">أنشطة وألعاب</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">الهدف المركزي (اختياري)</label>
                  <input
                    type="text"
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="مثال: تطبيق عملي للأمانة في المذاكرة"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-sm font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-stone-100">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-stone-600 font-bold hover:bg-stone-100 rounded-xl text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleGeneratePrep}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري كتابة وتوليد الدرس...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>توليد التحضير 🪄</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
