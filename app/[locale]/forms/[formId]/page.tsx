"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function SubmitFormPage({
  params: paramsPromise,
}: {
  params: Promise<{ formId: string }>;
}) {
  const params = use(paramsPromise);
  const formId = params.formId;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

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
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-1 gap-0.5">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-stone-500">جاري فتح الاستبيان...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-1 text-center">
        <AlertCircle className="w-5 h-5 text-rose-500 mb-2" />
        <h2 className="text-xl font-bold text-stone-800 dark:text-zinc-200">الاستبيان غير موجود أو تم إيقافه</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-1.5 px-1 max-w-xl mx-auto font-sans" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-3xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          <CardHeader className="bg-linear-to-b from-blue-500/10 to-transparent p-6 text-center border-b border-stone-100 dark:border-zinc-800">
            <div className="w-3 h-3 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-0.5 shadow-xs">
              <ClipboardList className="w-2 h-2" />
            </div>
            <CardTitle className="text-xl font-bold text-stone-900 dark:text-zinc-100">
              {form.title}
            </CardTitle>
            {form.description && (
              <CardDescription className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                {form.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="p-1">
            {submitted ? (
              <div className="text-center py-1.5 space-y-0.5">
                <div className="w-4 h-4 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                  تم تسجيل إجابتك بنجاح!
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  شكراً لتعاونكم ومشاركتكم معنا في استبيانات الخدمة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-0.5 text-right">
                {(form.fields || []).map((f: any) => (
                  <div key={f.id} className="space-y-0.5">
                    <label className="block text-xs font-bold text-stone-800 dark:text-zinc-200">
                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                    </label>

                    {f.type === "paragraph" ? (
                      <Textarea
                        required={f.required}
                        value={answers[f.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))
                        }
                        placeholder="اكتب إجابتك هنا..."
                        className="rounded-xl text-xs resize-none min-h-[90px]"
                      />
                    ) : (
                      <Input
                        required={f.required}
                        value={answers[f.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [f.id]: e.target.value }))
                        }
                        placeholder="اكتب إجابتك هنا..."
                        className="rounded-xl text-xs h-3"
                      />
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-2xl shadow-lg mt-1 flex items-center justify-center gap-0.25 text-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>إرسال الاستمارة</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
