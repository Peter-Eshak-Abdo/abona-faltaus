"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import { createQuiz, updateQuiz } from "@/lib/supabase-utils"
import { Plus, Trash2, Check, Clock, X, Upload, Eye, EyeOff, LayoutDashboard, Settings2, WifiOff, Sparkles, Loader2, FileSpreadsheet } from "lucide-react"
import type { Question, Quiz } from "@/types/quiz"
import { motion, AnimatePresence } from "framer-motion"
import * as XLSX from "xlsx"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "../ui/button"
import { savePendingQuiz } from "@/lib/offline-quiz-store"
import { toast } from "sonner"

interface CreateQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: Quiz | null
}

const COLORS = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"];

export default function CreateQuizDialog({ open, onOpenChange, onSuccess, initialData }: CreateQuizDialogProps) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"edit">("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleChoices, setShuffleChoices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [aiTopic, setAiTopic] = useState("")
  const [aiCount, setAiCount] = useState(5)
  const [aiAudience, setAiAudience] = useState("إعدادي وثانوي")
  const [aiType, setAiType] = useState<"choice" | "tf" | "mixed">("mixed")
  const [aiDifficulty, setAiDifficulty] = useState("متوسط")
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => setUser(data?.user || null));
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setQuestions(initialData.questions || []);
        setShuffleQuestions(initialData.shuffle_questions || false);
        setShuffleChoices(initialData.shuffle_choices || false);
        setIsEditing(true);
      } else {
        setTitle(""); setDescription(""); setQuestions([]);
        setShuffleQuestions(false); setShuffleChoices(false); setIsEditing(false);
      }
    }
  }, [open, initialData]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      text: "",
      choices: ["", "", "", ""],
      correctAnswer: 0,
      timeLimit: 20,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updates: any) => {
    const updated = [...questions];
    let q = { ...updated[index], ...updates };

    // منطق تحويل النوع (صح/خطأ)
    if (updates.type === "true-false") {
      q.choices = ["خطأ", "صح"];
      q.correctAnswer = 0;
    } else if (updates.type === "multiple-choice" && q.choices.length === 2) {
      q.choices = ["", "", "", ""];
    }

    updated[index] = q;
    setQuestions(updated);
  }

  const validateAndSubmit = async () => {
    if (!title.trim()) return alert("يجب إدخال اسم المسابقة")
    if (questions.length === 0) return alert("يجب إضافة سؤال واحد على الأقل")

    setIsSubmitting(true)
    try {
      const { generateUniqueQuizCode } = await import("@/lib/supabase-utils");
      const generatedCode = initialData?.code || (await generateUniqueQuizCode());
      const quizData: any = {
        title: title.trim(),
        description: description.trim(),
        questions,
        shuffle_questions: shuffleQuestions,
        shuffle_choices: shuffleChoices,
        created_by: user?.id || "guest",
        created_at: new Date().toISOString(),
        is_deleted: false,
        deleted_at: null,
        code: generatedCode,
      };

      if (isEditing && initialData) {
        if (!navigator.onLine) {
          toast.error("🔌 لا يوجد إنترنت", {
            description: "لا يمكن تعديل المسابقة في وضع الأوفلاين. يُرجى الاتصال بالإنترنت أولاً.",
          });
          return;
        }
        await updateQuiz(initialData.id, quizData);
        // حفظ في التاريخ المحلي
        const savedHistory = localStorage.getItem("my_quizzes_history");
        let history = savedHistory ? JSON.parse(savedHistory) : [];
        const index = history.findIndex((h: any) => h.id === initialData.id || h.code === initialData.code);
        if (index > -1) {
          history[index] = { ...history[index], title: quizData.title, code: initialData.code || generatedCode };
        } else {
          history.unshift({ id: initialData.id, code: initialData.code || generatedCode, title: quizData.title });
        }
        localStorage.setItem("my_quizzes_history", JSON.stringify(history));
      } else if (!navigator.onLine) {
        // أوفلاين: حفظ محلياً للرفع لاحقاً
        await savePendingQuiz(quizData, user?.id || "guest");
        toast.success("💾 تم حفظ المسابقة محلياً!", {
          description: "ستُرفع تلقائياً عند عودة الاتصال بالإنترنت.",
          duration: 6000,
        });
      } else {
        const res = await createQuiz(quizData);
        const newId = typeof res === "object" ? res.id : res;
        const newCode = (typeof res === "object" ? res.code : generatedCode) || generatedCode;

        // حفظ في التاريخ المحلي للوصول السريع
        const savedHistory = localStorage.getItem("my_quizzes_history");
        let history = savedHistory ? JSON.parse(savedHistory) : [];
        history.unshift({ id: newId, code: newCode, title: quizData.title });
        localStorage.setItem("my_quizzes_history", JSON.stringify(history));

        toast.success(`🎉 تم إنشاء المسابقة! كود الدخول: ${newCode}`, {
          duration: 8000,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Quiz save error:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally { setIsSubmitting(false) }
  }

  // 1. تحميل ملف Template
  const downloadTemplate = () => {
    const templateData = [
      ["# معلومات المسابقة (اختياري)", "اسم المسابقة:", "مسابقة تجريبية", "الوصف:", "وصف المسابقة هنا"],
      [],
      ["السؤال", "الاختيار 1", "الاختيار 2", "الاختيار 3", "الاختيار 4", "رقم الإجابة الصحيحة (1-4)", "الوقت بالثواني"],
      ["ما هو عاصمة مصر؟", "القاهرة", "الإسكندرية", "أسوان", "الجيزة", "1", "20"],
      ["10 + 5 يساوي؟", "10", "15", "20", "25", "2", "15"],
      ["السماء لونها أزرق", "صح", "خطأ", "", "", "1", "10"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الأسئلة");
    XLSX.writeFile(wb, "quiz_template.xlsx");
  };

  // 2. تصدير الأسئلة الحالية لملف Excel
  const exportToExcel = () => {
    if (questions.length === 0) return alert("لا توجد أسئلة لتصديرها");
    const exportData = [
      ["السؤال", "الاختيار 1", "الاختيار 2", "الاختيار 3", "الاختيار 4", "رقم الإجابة الصحيحة (1-4)", "الوقت بالثواني"],
      ...questions.map(q => [
        q.text,
        q.choices[0], q.choices[1], q.choices[2], q.choices[3],
        (q.correctAnswer + 1).toString(),
        q.timeLimit.toString()
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "أسئلة المسابقة");
    XLSX.writeFile(wb, `${title || "quiz"}_export.xlsx`);
  };

  // 3. استيراد الأسئلة من ملف Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const importedQuestions: Question[] = json.slice(3).filter(row => row[0]).map(row => ({
          id: crypto.randomUUID(),
          text: row[0]?.toString() || "",
          choices: [row[1]?.toString() || "", row[2]?.toString() || "", row[3]?.toString() || "", row[4]?.toString() || ""],
          correctAnswer: (parseInt(row[5]?.toString()) - 1) || 0,
          timeLimit: parseInt(row[6]?.toString()) || 20,
          type: (row[3] === "" || !row[3]) ? "true-false" : "multiple-choice"
        }));

        setQuestions(prev => [...prev, ...importedQuestions]);
        alert(`تم استيراد ${importedQuestions.length} سؤال بنجاح`);
      } catch (err) {
        alert("فشل في قراءة الملف. تأكد من استخدام الـ Template الصحيح.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 4. توليد بالذكاء الاصطناعي
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim()) {
      toast.error("يرجى إدخال موضوع المسابقة");
      return;
    }
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic.trim(),
          count: aiCount,
          audience: aiAudience,
          type: aiType,
          difficulty: aiDifficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التوليد");

      const genQuiz = data.quiz;
      if (genQuiz) {
        if (genQuiz.title && !title) setTitle(genQuiz.title);
        if (genQuiz.description && !description) setDescription(genQuiz.description);

        const mappedQuestions: Question[] = (genQuiz.questions || []).map((q: any) => ({
          id: crypto.randomUUID(),
          text: q.title || q.text || "",
          type: q.type || (q.options?.length === 2 ? "true-false" : "multiple-choice"),
          choices: q.options || (q.type === "true-false" ? ["خطأ", "صح"] : ["", "", "", ""]),
          correctAnswer: typeof q.correctAnswer === "number" ? Math.max(0, q.correctAnswer - 1) : 0,
          timeLimit: q.timeLimit || 20,
        }));

        setQuestions(prev => [...prev, ...mappedQuestions]);
        toast.success(`🎉 تم توليد ${mappedQuestions.length} سؤال بنجاح!`);
        setIsAiModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التوليد");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-1 z-50 font-sans" dir="rtl">
      <motion.div
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-white/20 relative"
      >
        {/* Modal التوليد بالذكاء الاصطناعي */}
        {isAiModalOpen && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-1">
            <div className="bg-white dark:bg-zinc-900 border border-amber-500/30 rounded-3xl p-0.5 max-w-lg w-full shadow-2xl space-y-0.5">
              <div className="flex justify-between items-center border-b pb-0.5">
                <div className="flex items-center gap-0.25">
                  <div className="p-0.25 bg-amber-500/10 text-amber-500 rounded-xl">
                    <Sparkles size={22} />
                  </div>
                  <h3 className="text-xl font-black text-zinc-800 dark:text-white">توليد مسابقة بالذكاء الاصطناعي</h3>
                </div>
                <button onClick={() => setIsAiModalOpen(false)} className="text-zinc-400 hover:text-red-500 p-1">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-0.5">
                <div>
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1">الموضوع أو النص الكتابي / الطقسي</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="مثال: سفر يونان، شخصية مارمرقس، صوم الرسل..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.5 text-sm font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-0.5">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1">عدد الأسئلة</label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.25 text-sm font-bold outline-none"
                    >
                      <option value={5}>5 أسئلة</option>
                      <option value={10}>10 أسئلة</option>
                      <option value={15}>15 سؤال</option>
                      <option value={20}>20 سؤال</option>
                      <option value={25}>25 سؤال</option>
                      <option value={30}>30 سؤال</option>
                      <option value={40}>40 سؤال</option>
                      <option value={50}>50 سؤال</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1">المرحلة المستهدفة</label>
                    <select
                      value={aiAudience}
                      onChange={(e) => setAiAudience(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.25 text-sm font-bold outline-none"
                    >
                      <option value="مدارس أحد">مدارس أحد</option>
                      <option value="إعدادي">إعدادي</option>
                      <option value="ثانوي">ثانوي</option>
                      <option value="شباب وخريجين">شباب وخريجين</option>
                      <option value="خدام وشعب">خدام وشعب</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-0.25">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1">نوع الأسئلة</label>
                    <select
                      value={aiType}
                      onChange={(e) => setAiType(e.target.value as any)}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.25 text-sm font-bold outline-none"
                    >
                      <option value="mixed">ميكس (اختر + صح وخطأ)</option>
                      <option value="choice">اختيار من متعدد فقط</option>
                      <option value="tf">صح أو خطأ فقط</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block mb-1">مستوى الصعوبة</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-0.25 text-sm font-bold outline-none"
                    >
                      <option value="سهل">سهل ومباشر</option>
                      <option value="متوسط">متوسط</option>
                      <option value="تحدي وصعب">تحدي وأسئلة ذكاء</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-0.25 justify-end pt-0.25">
                <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>إلغاء</Button>
                <Button
                  onClick={handleGenerateWithAi}
                  disabled={isGeneratingAi || !aiTopic.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-0.25"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      توليد الأسئلة 🪄
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header Custom */}
        <div className="p-0.5 border-b bg-white dark:bg-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <h2 className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditing ? 'تعديل المسابقة' : 'مسابقة جديدة'}
            </h2>
            <div className="flex bg-zinc-100 dark:bg-zinc-700 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveTab("edit")}
                className={`p-0.5 rounded-lg flex items-center gap-1 font-bold transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-zinc-600 shadow-sm text-blue-600' : 'text-zinc-500'}`}
              >
                <Settings2 size={18} /> التعديل
              </button>
            </div>
          </div>
          <button onClick={() => onOpenChange(false)} className="bg-zinc-100 hover:bg-red-100 hover:text-red-500 p-0.5 rounded-full transition-colors text-zinc-500">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
          <>
            {/* Basic Info */}
            <div className="space-y-0.5">
              <input
                type="text"
                className="w-full min-w-14 text-3xl font-black bg-transparent border-b-4 border-zinc-200 focus:border-blue-500 outline-none transition-all pb-1 dark:text-white"
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المسابقة..."
              />
              <div className="flex flex-wrap gap-1 items-center">
                <div className="flex-1">
                  <textarea
                    className="w-full min-w-16 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-zinc-100 dark:border-zinc-700 p-1 font-medium focus:border-blue-500 outline-none"
                    rows={1} value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف بسيط..."
                  />
                </div>
                <div className="flex flex-wrap gap-0.5 p-0.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <label className="flex items-center gap-0.5 cursor-pointer font-bold text-blue-700 dark:text-blue-300">
                    <Checkbox checked={shuffleQuestions} onCheckedChange={(c) => setShuffleQuestions(!!c)} />
                    أسئلة عشوائية
                  </label>
                  <label className="flex items-center gap-0.5 cursor-pointer font-bold text-blue-700 dark:text-blue-300">
                    <Checkbox checked={shuffleChoices} onCheckedChange={(c) => setShuffleChoices(!!c)} />
                    خيارات عشوائية
                  </label>
                </div>
                <div className="flex flex-wrap gap-0.5 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                  <Button
                    variant="default"
                    size="normal"
                    onClick={() => setIsAiModalOpen(true)}
                    className="h-4 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    <Sparkles size={14} className="ml-1 text-yellow-200" /> توليد بالـ AI 🪄
                  </Button>
                  <Button variant="outline" size="normal" onClick={downloadTemplate} className="h-4 text-xs">
                    <Clock size={6} /> تحميل Template
                  </Button>
                  <Button variant="outline" size="normal" onClick={() => fileInputRef.current?.click()} className="h-4 text-xs">
                    <Upload size={6} /> استيراد Excel
                  </Button>
                  <input ref={fileInputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" size="normal" onClick={exportToExcel} className="h-4 text-xs">
                    <LayoutDashboard size={6} /> تصدير الأسئلة
                  </Button>
                </div>
              </div>
            </div>

            {/* Questions Editor */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-zinc-700 dark:text-zinc-300">الأسئلة ({questions.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white p-1 rounded-2xl font-bold flex items-center gap-1 text-sm shadow-md transition-all active:scale-95"
                  >
                    <Sparkles size={16} /> توليد بالـ AI
                  </button>
                  <button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center gap-1 transition-transform active:scale-95">
                    <Plus size={20} /> إضافة سؤال
                  </button>
                </div>
              </div>

              <Accordion type="multiple" className="space-y-0.5">
                {questions.map((q, idx) => (
                  <AccordionItem key={q.id} value={q.id} className="border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
                    <div className="flex items-center px-1 py-0.5 bg-zinc-50/50 dark:bg-zinc-800/50">
                      <span className="w-4 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-black text-zinc-600 dark:text-zinc-300">{idx + 1}</span>
                      <AccordionTrigger className="flex-1 px-0.5 hover:no-underline">
                        <span className="font-bold text-lg text-right truncate max-w-50">{q.text || "سؤال جديد يحتاج نص..."}</span>
                      </AccordionTrigger>
                      <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-red-500 px-1"><Trash2 size={20} /></button>
                    </div>
                    <AccordionContent className="p-0.5 space-y-0.5 border-t border-zinc-100 dark:border-zinc-700">
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="space-y-0.5">
                          <label className="text-sm font-black text-zinc-500">نوع السؤال</label>
                          <select
                            className="w-full p-0.5 rounded-xl border-2 border-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 font-bold outline-none focus:border-blue-500"
                            value={q.type} onChange={(e) => updateQuestion(idx, { type: e.target.value })}
                          >
                            <option value="multiple-choice">اختيارات متعددة</option>
                            <option value="true-false">صح / خطأ</option>
                          </select>
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-sm font-black text-zinc-500">الوقت (ثواني)</label>
                          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-700 p-0.5 rounded-xl">
                            <Clock size={12} className="text-zinc-400" />
                            <input type="number" className="bg-transparent font-bold w-full outline-none" value={q.timeLimit} onChange={(e) => updateQuestion(idx, { timeLimit: +e.target.value })} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-sm font-black text-zinc-500">نص السؤال</label>
                        <textarea
                          className="w-full p-0.5 rounded-xl border-2 border-zinc-100 dark:bg-zinc-700 dark:border-zinc-600 font-bold focus:border-blue-500 outline-none"
                          value={q.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                          placeholder="ما هو السؤال؟"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-0.5">
                        {q.choices.map((choice, cIdx) => (
                          <div key={cIdx} className={`flex items-center gap-0.5 p-0.5 rounded-2xl transition-all border-2 ${q.correctAnswer === cIdx ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' : 'border-transparent bg-zinc-50 dark:bg-zinc-900/50'}`}>
                            <div className={`w-2 h-2 rounded-lg ${COLORS[cIdx]} flex items-center justify-center text-white font-black`}>
                              {String.fromCharCode(65 + cIdx)}
                            </div>
                            <input
                              type="text" className="flex-1 bg-transparent p-0.5 font-bold outline-none"
                              value={choice} onChange={(e) => {
                                const newChoices = [...q.choices];
                                newChoices[cIdx] = e.target.value;
                                updateQuestion(idx, { choices: newChoices });
                              }}
                              disabled={q.type === 'true-false'}
                              placeholder={`اختيار ${cIdx + 1}`}
                            />
                            <button
                              onClick={() => updateQuestion(idx, { correctAnswer: cIdx })}
                              className={`p-0.5 rounded-xl transition-all ${q.correctAnswer === cIdx ? 'bg-green-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'}`}
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        </div>

        {/* Footer */}
        <div className="p-0.5 border-t bg-white dark:bg-zinc-800 flex justify-end gap-1">
          <button onClick={() => onOpenChange(false)} className="p-1 font-black text-zinc-500 hover:bg-zinc-100 rounded-2xl transition-colors">إلغاء</button>
          <button
            onClick={validateAndSubmit}
            disabled={isSubmitting}
            className="p-1 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "جاري الحفظ..." : (isEditing ? "حفظ التعديلات ✨" : "نشر المسابقة 🚀")}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
