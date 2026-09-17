"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  Lock,
  Sparkles,
  HelpCircle,
  Cross,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ORTHODOX_THEMES = [
  { id: "burgundy", name: "عنابي كنسي", headerBg: "bg-linear-to-r from-[#4A0012] via-[#6B1124] to-[#4A0012]", accent: "#4A0012", border: "border-[#4A0012]" },
  { id: "gold", name: "مذهّب أرثوذكسي", headerBg: "bg-linear-to-r from-[#735C00] via-[#D4AF37] to-[#735C00]", accent: "#D4AF37", border: "border-amber-500" },
  { id: "blue", name: "سماء العذراء", headerBg: "bg-linear-to-r from-sky-900 via-blue-800 to-sky-950", accent: "#2563EB", border: "border-blue-600" },
];

export default function SubmitFormPage({
  params: paramsPromise,
}: {
  params: Promise<{ formId: string }>;
}) {
  const params = use(paramsPromise);
  const formId = params.formId;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);

  const currentTheme = ORTHODOX_THEMES[selectedThemeIndex];

  useEffect(() => {
    fetch(`/api/forms?id=${formId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.form) {
          setForm(data.form);
        } else {
          toast.error(data.error || "تعذر تحميل الاستبيان");
        }
      })
      .catch(() => toast.error("حدث خطأ في الاتصال"))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleAnswerChange = (fieldId: string, val: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Check required fields
    for (const f of form.fields || []) {
      if (f.required && (!answers[f.id] || answers[f.id].toString().trim() === "")) {
        toast.error(`يرجى الإجابة على السؤال المطلوب: "${f.label}"`);
        setActiveFieldId(f.id);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_response",
          formId,
          responses: answers,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success("تم إرسال إجابتك بنجاح!");
      } else {
        toast.error(data.error || "فشل إرسال الإجابة");
      }
    } catch {
      toast.error("تعذر إرسال الإجابة");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A0012]" />
        <p className="text-sm font-semibold text-stone-500">جاري فتح الاستبيان...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <h2 className="text-xl font-bold text-stone-800 dark:text-zinc-200">الاستبيان غير موجود أو تم إيقافه</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EBF8]/60 dark:bg-neutral-950 py-1 px-0.5 sm:px-1 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-0.5">
        {/* Google Forms Top Theme Banner */}
        <div className={cn("w-full h-9 sm:h-11 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden flex items-end p-1 transition-all duration-500", currentTheme.headerBg)}>
          {/* Subtle Coptic Cross pattern watermark */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-around pointer-events-none text-white text-7xl font-serif">
            <span>☦</span>
            <span>✝</span>
            <span>☦</span>
          </div>

          {/* Theme switcher pill */}
          <div className="absolute top-1 left-1 bg-black/40 backdrop-blur-md rounded-full px-0.5 py-0.5 flex items-center gap-0.5 z-10">
            {ORTHODOX_THEMES.map((th, idx) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setSelectedThemeIndex(idx)}
                title={th.name}
                className={cn(
                  "w-4 h-4 rounded-full border border-white/50 transition-all",
                  selectedThemeIndex === idx && "scale-125 ring-2 ring-white"
                )}
                style={{ backgroundColor: th.accent }}
              />
            ))}
          </div>

          <div className="relative z-10 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
              استبيان واستمارة كنسية
            </span>
          </div>
        </div>

        {submitted ? (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className="rounded-2xl border-t-8 border-t-[#4A0012] bg-white dark:bg-neutral-900 shadow-sm p-1 text-center space-y-0.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                تم تسجيل ردك بنجاح
              </h2>
              <p className="text-xs text-stone-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                شكراً لمشاركتك معنا في استمارة {form.title}. صلواتك دائماً تسند الخدمة.
              </p>
              <Button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                variant="outline"
                className="text-xs font-bold rounded-xl mt-0.5"
              >
                إرسال رد آخر
              </Button>
            </Card>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-0.5 pb-2">
            {/* Title Card (Google Forms Style with top accent strip) */}
            <Card className="rounded-2xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden border-t-8 border-t-[#4A0012]">
              <CardContent className="p-1 sm:p-1.5 space-y-0.5">
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-neutral-300 leading-relaxed pt-1">
                    {form.description}
                  </p>
                )}
                <div className="pt-0.5 border-t border-stone-100 dark:border-neutral-800 text-[11px] text-rose-600 font-bold">
                  * يشير إلى سؤال مطلوب
                </div>
              </CardContent>
            </Card>

            {/* Questions Cards (One floating card per question, Google Forms style) */}
            {(form.fields || []).map((field: any, idx: number) => {
              const isFocused = activeFieldId === field.id;
              return (
                <div
                  key={field.id}
                  onClick={() => setActiveFieldId(field.id)}
                  className={cn(
                    "p-1 sm:p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-200 shadow-xs relative",
                    isFocused
                      ? "border-[#4A0012] dark:border-amber-500 ring-1 ring-[#4A0012]/20 border-r-4 border-r-[#4A0012]"
                      : "border-stone-200 dark:border-neutral-800 hover:border-stone-300"
                  )}
                >
                  <label className="block text-sm font-bold text-stone-900 dark:text-white mb-1">
                    <span>{idx + 1}. {field.label}</span>
                    {field.required && <span className="text-rose-600 ms-1 font-black">*</span>}
                  </label>

                  {/* Question Inputs according to field type */}
                  {field.type === "paragraph" ? (
                    <Textarea
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      onFocus={() => setActiveFieldId(field.id)}
                      placeholder="إجابتك المطولة..."
                      className="min-h-[90px] rounded-xl text-xs bg-stone-50 dark:bg-neutral-800/60 border-stone-200 dark:border-neutral-700 resize-none"
                    />
                  ) : field.type === "multiple_choice" && field.options && field.options.length > 0 ? (
                    <div className="space-y-0.5">
                      {field.options.map((opt: string, oIdx: number) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-0.5 p-0.5 rounded-xl hover:bg-stone-50 dark:hover:bg-neutral-800/60 cursor-pointer text-xs font-semibold text-stone-800 dark:text-neutral-200 transition"
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={answers[field.id] === opt}
                            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                            className="w-4 h-4 text-[#4A0012] focus:ring-[#4A0012] cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "rating" ? (
                    <div className="flex items-center gap-0.5 pt-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleAnswerChange(field.id, num)}
                          className={cn(
                            "w-3 h-3 rounded-xl text-sm font-bold border transition",
                            answers[field.id] === num
                              ? "bg-[#4A0012] text-white border-[#4A0012] shadow-sm"
                              : "bg-stone-50 dark:bg-neutral-800 text-stone-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700 hover:bg-stone-100"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Default Short text */
                    <Input
                      type="text"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleAnswerChange(field.id, e.target.value)}
                      onFocus={() => setActiveFieldId(field.id)}
                      placeholder="إجابتك..."
                      className="rounded-xl text-xs bg-stone-50 dark:bg-neutral-800/60 border-stone-200 dark:border-neutral-700 h-3"
                    />
                  )}
                </div>
              );
            })}

            {/* Bottom Actions Bar (Mobile Friendly) */}
            <div className="flex items-center justify-between pt-0.5">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4A0012] hover:bg-[#6B1124] text-amber-100 font-bold px-1.5 py-0.5 text-xs rounded-xl shadow-md h-2 gap-0.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الاستمارة</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setAnswers({})}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white font-medium"
              >
                مسح النموذج
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
