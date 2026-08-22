"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Presentation,
  Download,
  Copy,
  Trash2,
  BookOpen,
  Loader2,
  ArrowRight,
  FileDown,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { exportToPowerPoint, exportToWord, exportToPDF } from "@/lib/prep-export";
import VoiceRecorderButton from "@/components/notes/VoiceRecorderButton";
import LessonsSidebar, { SavedLesson } from "@/components/notes/LessonsSidebar";
import { supabase } from "@/lib/supabase";

export default function PreparationPage() {
  const [title, setTitle] = useState("تحضير درس جديد");
  const [content, setContent] = useState("");
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Form State for AI Prep Modal
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("إعدادي وثانوي");
  const [duration, setDuration] = useState("30 دقيقة");
  const [style, setStyle] = useState("تفاعلي وقصصي");
  const [mainGoal, setMainGoal] = useState("");

  // New features state
  const [extraDetails, setExtraDetails] = useState("");
  const [extraSources, setExtraSources] = useState<string[]>([""]);
  const [options, setOptions] = useState({
    includeVerses: true,
    includeFatherQuotes: true,
    includePrayer: false,
    includeActivity: false,
    includeSummary: true,
  });

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

  // حفظ الدرس في Supabase
  const saveLessonToDatabase = async (generatedResult: string, lessonTitle: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const lessonData = {
        title: lessonTitle || topic || "تحضير درس",
        note_content: content,
        requirements: { topic, audience, duration, style, mainGoal },
        options,
        generated_content: generatedResult,
        extra_sources: extraSources.filter((s) => s.trim()),
      };

      if (session?.user) {
        const { data, error } = await supabase
          .from("lesson_notes")
          .insert({
            user_id: session.user.id,
            ...lessonData,
          })
          .select("id")
          .single();

        if (!error && data) {
          setCurrentLessonId(data.id);
        }
      }

      // حفظ نسخة في LocalStorage كـ Fallback
      const localSaved = localStorage.getItem("local_saved_lessons");
      const existing: SavedLesson[] = localSaved ? JSON.parse(localSaved) : [];
      const newLessonItem: SavedLesson = {
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...lessonData,
      };
      localStorage.setItem("local_saved_lessons", JSON.stringify([newLessonItem, ...existing]));
    } catch (err) {
      console.warn("Failed to auto-save lesson to DB:", err);
    }
  };

  // توليد التحضير بالذكاء الاصطناعي
  const handleGeneratePrep = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/notes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteText: content,
          requirements: {
            topic: topic || title,
            audience,
            duration,
            style,
            mainGoal,
          },
          options,
          extraDetails,
          extraSources,
          format: "full",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل توليد التحضير");

      if (data.result) {
        handleContentChange(data.result);
        const resolvedTitle = topic || title;
        if (topic) handleTitleChange(topic);
        setIsAiModalOpen(false);
        toast.success("تم تحضير الدرس كاملاً بنجاح! 🪄");
        await saveLessonToDatabase(data.result, resolvedTitle);
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التوليد");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectLesson = (lesson: SavedLesson) => {
    setCurrentLessonId(lesson.id);
    setTitle(lesson.title);
    setContent(lesson.generated_content || lesson.note_content || "");
    if (lesson.requirements) {
      if (lesson.requirements.topic) setTopic(lesson.requirements.topic);
      if (lesson.requirements.audience) setAudience(lesson.requirements.audience);
      if (lesson.requirements.duration) setDuration(lesson.requirements.duration);
      if (lesson.requirements.style) setStyle(lesson.requirements.style);
      if (lesson.requirements.mainGoal) setMainGoal(lesson.requirements.mainGoal);
    }
    if (lesson.options) setOptions(lesson.options);
    if (lesson.extra_sources) setExtraSources(lesson.extra_sources);
    toast.success(`تم استرجاع: ${lesson.title}`);
  };

  const handleNewLesson = () => {
    setCurrentLessonId(null);
    setTitle("تحضير درس جديد");
    setContent("");
    setTopic("");
    setMainGoal("");
    setExtraDetails("");
    setExtraSources([""]);
    localStorage.removeItem("prep_draft_content");
    localStorage.removeItem("prep_draft_title");
    toast.info("تم فتح مسودة درس جديدة");
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d1b18] flex flex-col font-sans pb-[calc(env(safe-area-inset-bottom,0px)+5px)]" dir="rtl">
      {/* Header */}
      <header className="bg-[#5c4538] text-[#e8cfae] px-1 py-0.5 sm:px-1 flex items-center justify-between shadow-md sticky top-0 z-30 pt-[calc(env(safe-area-inset-top,0px)+3px)]">
        <div className="flex items-center gap-0.5">
          <Link href="/" className="p-0.5 hover:bg-white/10 rounded-xl transition-colors text-white">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black">نوتة التحضير الذكية 📝</h1>
            <p className="text-xs text-[#e8cfae]/80 hidden sm:block">إعداد الدروس والعظات واللقاءات الروحية بمساعدة الـ AI</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Lessons Sidebar */}
          <LessonsSidebar
            onSelectLesson={handleSelectLesson}
            onNewLesson={handleNewLesson}
            currentLessonId={currentLessonId}
          />

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-0.25 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-950 font-black px-1 py-0.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <Sparkles size={16} />
            <span>توليد بالـ AI 🪄</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-1 sm:p-1 flex flex-col gap-0.5">
        {/* Title & Toolbar */}
        <div className="bg-white rounded-3xl p-1 sm:p-1 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row gap-0.5 sm:items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl sm:text-2xl font-black bg-transparent border-b-2 border-stone-200 focus:border-amber-600 outline-none pb-0.5 flex-1 text-[#2d1b18]"
            placeholder="عنوان الدرس أو العظة..."
          />

          <div className="flex items-center gap-0.5 flex-wrap">
            {/* Mic Record Button */}
            <VoiceRecorderButton
              onTranscript={(text) => {
                const updated = content ? `${content}\n\n${text}` : text;
                handleContentChange(updated);
              }}
            />

            {/* Quick Actions */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("تم نسخ المحتوى!");
              }}
              className="p-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
              title="نسخ"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={() => {
                if (confirm("هل تريد مسح المسودة والبدء من جديد؟")) {
                  handleNewLesson();
                }
              }}
              className="p-0.5 bg-stone-100 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              title="مسح"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Text Area Content */}
        <div className="bg-white rounded-3xl p-1 sm:p-1 shadow-sm border border-stone-200/80 flex-1 flex flex-col min-h-[380px]">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="اكتب أفكار ومسودة تحضير الدرس هنا، أو سجل صوتك، أو اضغط على 'توليد بالـ AI' لصياغة الدرس بالكامل..."
            className="w-full flex-1 min-h-[320px] bg-transparent outline-none resize-none leading-relaxed text-stone-800 text-base sm:text-lg font-medium"
          />
        </div>

        {/* Exports Bar */}
        <div className="bg-white rounded-3xl p-1 sm:p-1 shadow-sm border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-0.25 text-stone-600 text-sm font-bold">
            <Download size={18} className="text-amber-700" />
            <span>تصدير ملف التحضير:</span>
          </div>

          <div className="flex items-center gap-0.25 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={async () => {
                setIsExporting("pptx");
                try {
                  await exportToPowerPoint(title, content);
                  toast.success("تم تصدير PowerPoint بنجاح!");
                } catch {
                  toast.error("فشل تصدير PowerPoint");
                } finally {
                  setIsExporting(null);
                }
              }}
              disabled={!content.trim() || isExporting !== null}
              className="flex-1 sm:flex-none flex items-center justify-center gap-0.25 px-1 py-0.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting === "pptx" ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
              <span>PowerPoint (.pptx)</span>
            </button>

            <button
              onClick={async () => {
                setIsExporting("docx");
                try {
                  await exportToWord(title, content);
                  toast.success("تم تصدير Word بنجاح!");
                } catch {
                  toast.error("فشل تصدير Word");
                } finally {
                  setIsExporting(null);
                }
              }}
              disabled={!content.trim() || isExporting !== null}
              className="flex-1 sm:flex-none flex items-center justify-center gap-0.25 px-1 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting === "docx" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              <span>Word (.docx)</span>
            </button>

            <button
              onClick={async () => {
                setIsExporting("pdf");
                try {
                  await exportToPDF(title, content);
                  toast.success("تم تصدير PDF بنجاح!");
                } catch {
                  toast.error("فشل تصدير PDF");
                } finally {
                  setIsExporting(null);
                }
              }}
              disabled={!content.trim() || isExporting !== null}
              className="flex-1 sm:flex-none flex items-center justify-center gap-0.25 px-1 py-0.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              <span>PDF (.pdf)</span>
            </button>
          </div>
        </div>
      </main>

      {/* AI Requirements Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-1">
          <div className="bg-white rounded-3xl p-1 sm:p-1 max-w-lg w-full shadow-2xl border border-amber-200/50 space-y-0.5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-0.5">
              <div className="flex items-center gap-0.25">
                <div className="p-0.5 bg-amber-500/10 text-amber-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-stone-900">توليد تحضير الدرس بالذكاء الاصطناعي</h3>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-stone-400 hover:text-stone-700 p-0.5">
                ✕
              </button>
            </div>

            <div className="space-y-0.5">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-0.5">موضوع أو عنوان الدرس</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="مثال: فضيلة المحبة، داود النبي وجليات، الأمانة..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-0.5 text-sm font-bold outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-0.5">المرحلة والسن المستهدف</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value="حضانة وأولى وثانية ابتدائي">حضانة وابتدائى صغار</option>
                    <option value="رابعة وخامسة وسادسة ابتدائي">ابتدائي كبار</option>
                    <option value="إعدادي">إعدادي</option>
                    <option value="ثانوي">ثانوي</option>
                    <option value="شباب وخريجين">شباب وخريجين</option>
                    <option value="الشعب">الشعب</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-0.5">مدة الشرح التقريبية</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value="15 دقيقة (موجز)">15 دقيقة (موجز)</option>
                    <option value="30 دقيقة (قياسي)">30 دقيقة (قياسي)</option>
                    <option value="45 دقيقة (مفصل)">45 دقيقة (مفصل)</option>
                    <option value="ساعة كاملة (دراسة)">ساعة كاملة (دراسة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-0.5">أسلوب وطريقة الشرح</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-0.5 text-sm font-bold outline-none"
                  >
                    <option value="قصصي وتفاعلي">قصصي وتفاعلي</option>
                    <option value="روحي وتأملي عميق">روحي وتأملي عميق</option>
                    <option value="دراسي وعقيدي">دراسي وعقيدي</option>
                    <option value="أنشطة وألعاب تطبيقية">أنشطة وألعاب</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-0.5">الهدف المركزي (اختياري)</label>
                  <input
                    type="text"
                    value={mainGoal}
                    onChange={(e) => setMainGoal(e.target.value)}
                    placeholder="مثال: تطبيق عملي للأمانة في المذاكرة"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-0.5 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {/* عناصر ومحتويات الدرس (Checkboxes) */}
              <div className="bg-stone-50 rounded-2xl p-1 border border-stone-200/80 space-y-0.5">
                <h4 className="font-bold text-xs text-stone-700">عناصر الدرس المطلوب تضمينها:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.25 text-xs font-semibold text-stone-700">
                  {[
                    { key: "includeVerses", label: "آيات كتابية", icon: "📖" },
                    { key: "includeFatherQuotes", label: "أقوال آباء", icon: "✝️" },
                    { key: "includePrayer", label: "صلاة", icon: "🙏" },
                    { key: "includeActivity", label: "نشاط وتطبيق", icon: "🎯" },
                    { key: "includeSummary", label: "خلاصة الدرس", icon: "📝" },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-0.25 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={options[key as keyof typeof options]}
                        onChange={(e) =>
                          setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="accent-amber-600 rounded w-3 h-3"
                      />
                      <span>{icon} {label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* تفاصيل إضافية من الخادم */}
              <div className="bg-stone-50 rounded-2xl p-1 border border-stone-200/80 space-y-0.25">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-700">✨ ملاحظات وتفاصيل إضافية للخادم:</label>
                  <VoiceRecorderButton
                    onTranscript={(text) => setExtraDetails((prev) => (prev ? `${prev} ${text}` : text))}
                  />
                </div>
                <textarea
                  value={extraDetails}
                  onChange={(e) => setExtraDetails(e.target.value)}
                  placeholder="مثال: عندي شباب بيعانوا من ضغط الامتحانات، أو التركيز على موقف معين..."
                  rows={2}
                  className="w-full bg-white border border-stone-200 rounded-xl p-0.5 text-xs font-medium outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* مصادر إضافية مخصصة */}
              <div className="bg-stone-50 rounded-2xl p-1 border border-stone-200/80 space-y-0.5">
                <label className="text-xs font-bold text-stone-700 block">📚 مصادر ومراجع إضافية (روابط أو نصوص):</label>
                {extraSources.map((src, i) => (
                  <div key={i} className="flex gap-0.25">
                    <input
                      type="text"
                      value={src}
                      onChange={(e) => {
                        const updated = [...extraSources];
                        updated[i] = e.target.value;
                        setExtraSources(updated);
                      }}
                      placeholder="رابط تفسير أو نص مرجع..."
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-1 py-0.5 text-xs font-medium outline-none focus:border-amber-600"
                    />
                    {extraSources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setExtraSources((prev) => prev.filter((_, idx) => idx !== i))}
                        className="p-0.5 text-stone-400 hover:text-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setExtraSources((prev) => [...prev, ""])}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-0.25"
                >
                  <Plus size={13} /> إضافة مرجع آخر
                </button>
              </div>
            </div>

            <div className="flex gap-0.25 justify-end pt-0.5 border-t border-stone-100">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-1 py-0.5 text-stone-600 font-bold hover:bg-stone-100 rounded-xl text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleGeneratePrep}
                disabled={isGenerating}
                className="flex items-center gap-0.25 px-1 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
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
