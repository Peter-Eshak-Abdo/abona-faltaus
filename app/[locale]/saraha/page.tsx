"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Send,
  Loader2,
  Lock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  EyeOff,
  Link as LinkIcon,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SarahaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // حالة صفحة المخدوم (إرسال سؤال)
  const [linkData, setLinkData] = useState<any>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  // حالة لوحة تحكم الخادم (Dashboard)
  const [myLinks, setMyLinks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
  }, []);

  // جلب بيانات الرابط إذا كان هناك slug
  useEffect(() => {
    if (slug) {
      setLoadingLink(true);
      fetch(`/api/saraha?slug=${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.link) {
            setLinkData(data.link);
          } else {
            toast.error(data.error || "الرابط غير موجود");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("تعذر تحميل الصفحة");
        })
        .finally(() => setLoadingLink(false));
    }
  }, [slug]);

  // جلب بيانات الخادم إذا كان مسجلاً وبدون slug
  const fetchServantDashboard = async (userId: string, targetLinkId?: string | null) => {
    setLoadingDashboard(true);
    try {
      const queryParam = targetLinkId ? `&linkId=${targetLinkId}` : "";
      const res = await fetch(`/api/saraha?userId=${userId}${queryParam}`);
      const data = await res.json();
      if (data.success) {
        setMyLinks(data.links || []);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (!slug && user?.id) {
      fetchServantDashboard(user.id, selectedLinkId);
    }
  }, [slug, user?.id, selectedLinkId]);

  // إرسال السؤال السري المجهول
  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("يرجى كتابة نص السؤال أو الاستفسار أولاً");
      return;
    }

    if (!linkData) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/saraha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          linkId: linkData.id,
          servantId: linkData.user_id,
          content: questionText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSentSuccess(true);
        setQuestionText("");
        toast.success("تم إرسال سؤالك بكل سرية وأمان!");
      } else {
        toast.error(data.error || "فشل إرسال السؤال");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSending(false);
    }
  };

  // إنشاء رابط صراحة جديد للخادم
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug.trim()) {
      toast.error("يرجى كتابة اسم الرابط (slug) بالإنجليزية أو أرقام");
      return;
    }

    if (!user) {
      toast.error("يجب تسجيل الدخول كخادم لإنشاء الرابط");
      return;
    }

    setIsCreatingLink(true);
    try {
      const res = await fetch("/api/saraha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_link",
          userId: user.id,
          slug: newSlug.trim(),
          title: newTitle.trim() || "صندوق أسئلة واستفسارات الخدمة",
          description: newDescription.trim() || "اكتب سؤالك بكل صراحة وبدون ظهور هويتك.",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تم إنشاء رابط الصراحة بنجاح!");
        setShowCreateModal(false);
        setNewSlug("");
        setNewTitle("");
        setNewDescription("");
        fetchServantDashboard(user.id);
      } else {
        toast.error(data.error || "فشل إنشاء الرابط");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء إنشاء الرابط");
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyShareLink = (s: string) => {
    const fullUrl = `${window.location.origin}/saraha/${s}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("تم نسخ رابط الصراحة لمشاركته مع المخدومين!");
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    try {
      const res = await fetch("/api/saraha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_message",
          messageId,
          userId: user.id,
        }),
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        toast.success("تم حذف السؤال");
      }
    } catch {
      toast.error("تعذر الحذف");
    }
  };

  // ==========================================
  // 1. عرض صفحة المخدوم (إرسال السؤال السري)
  // ==========================================
  if (slug) {
    if (loadingLink) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 gap-1 text-stone-600 dark:text-stone-300">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <p className="text-sm font-semibold">جاري فتح صندوق الأسئلة السري...</p>
        </div>
      );
    }

    if (!linkData) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 text-center">
          <Card className="max-w-md w-full p-2 border-stone-200 dark:border-zinc-800 shadow-xl">
            <h2 className="text-lg font-bold text-rose-600 mb-0.5">الرابط غير متاح</h2>
            <p className="text-xs text-stone-500 mb-1">تأكد من صحة الرابط أو تواصل مع الخادم المسؤول.</p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-3 px-1 flex flex-col items-center justify-center relative" dir="rtl">
        {/* Background glow */}
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full relative z-10 space-y-1.5"
        >
          {/* Header Card */}
          <Card className="rounded-3xl border-amber-900/20 dark:border-amber-500/20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl overflow-hidden text-center">
            <CardHeader className="pb-1 pt-2 px-1.5 bg-linear-to-b from-amber-500/10 to-transparent">
              <div className="mx-auto w-4 h-4 rounded-2xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-0.5 shadow-xs">
                <ShieldCheck className="w-2.5 h-2.5" />
              </div>
              <CardTitle className="text-xl font-bold text-amber-950 dark:text-amber-100">
                {linkData.title}
              </CardTitle>
              <CardDescription className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {linkData.description}
              </CardDescription>

              {/* Privacy Guarantee Badge */}
              <div className="mt-1 inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <EyeOff className="w-1.5 h-1.5" />
                <span>هويتك مجهولة 100% ولن تظهر للخادم إطلاقاً</span>
              </div>
            </CardHeader>

            <CardContent className="p-1.5">
              {isSentSuccess ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-2 space-y-1 text-center"
                >
                  <div className="w-5 h-5 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <h3 className="text-base font-bold text-stone-800 dark:text-zinc-100">
                    وصل سؤالك للخادم بنجاح!
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    شكراً لثقتك وصراحتك. سيقوم الخادم بمراجعة سؤالك والصلاة من أجلك والرد عليه في الخدمة.
                  </p>
                  <Button
                    onClick={() => setIsSentSuccess(false)}
                    variant="outline"
                    className="rounded-xl text-xs font-bold mt-1"
                  >
                    إرسال سؤال آخر
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSendQuestion} className="space-y-1 text-right">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.5">
                      اكتب سؤالك أو استفسارك الروحي هنا:
                    </label>
                    <Textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="اكتب كل ما في قلبك بحرية تامة وبدون أي قلق..."
                      className="min-h-[140px] rounded-2xl bg-stone-50 dark:bg-zinc-800/70 border-stone-200 dark:border-zinc-700 text-sm leading-relaxed p-1 resize-none focus-visible:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span className="flex items-center gap-0.25">
                      <Lock className="w-1.5 h-1.5" />
                      مشفّر ومجهول الهوية
                    </span>
                    <span>{questionText.length} حرف</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSending || !questionText.trim()}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-1 rounded-2xl shadow-lg transition-all text-sm flex items-center justify-center gap-0.5"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-2 h-2 animate-spin" />
                        <span>جاري الإرسال السري...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-2 h-2" />
                        <span>إرسال السؤال بسرية تامة</span>
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

  // ==========================================
  // 2. عرض لوحة تحكم الخادم (إنشاء الروابط والاطلاع على الأسئلة)
  // ==========================================
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 gap-1">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <p className="text-sm font-semibold text-stone-500">جاري التحقق من الحساب...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 text-center" dir="rtl">
        <Card className="max-w-md w-full p-2 border-stone-200 dark:border-zinc-800 shadow-2xl rounded-3xl bg-white/90 dark:bg-zinc-900/90">
          <div className="w-5 h-5 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1">
            <HeartHandshake className="w-3 h-3" />
          </div>
          <h2 className="text-xl font-bold text-amber-950 dark:text-amber-100 mb-0.5">
            صندوق صراحة لخدمة المخدومين
          </h2>
          <p className="text-xs text-stone-500 mb-1.5 leading-relaxed">
            أنشئ رابطاً خاصاً بك كخادم وشاركه مع مخدوميك لاستقبال كل أسئلتهم واستفساراتهم الروحية والشخصية بحرية تامة وبدون كشف أي بيانات عنهم.
          </p>
          <Button asChild className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-2xl font-bold">
            <Link href="/auth/signin">تسجيل الدخول كخادم لإنشاء رابط</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 px-1 sm:px-2 max-w-6xl mx-auto space-y-1.5" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 bg-white/80 dark:bg-zinc-900/80 p-1.5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-amber-950 dark:text-amber-200 flex items-center gap-0.5">
            <HeartHandshake className="w-3 h-3 text-amber-600" />
            <span>لوحة أسئلة واستفسارات المخدومين (صراحة)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.25">
            استقبل أسئلة مخدوميك بخصوصية تامة 100% دون معرفة هوية السائل
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl text-xs flex items-center gap-0.5 shadow-md"
        >
          <Plus className="w-2 h-2" />
          <span>إنشاء رابط صراحة جديد</span>
        </Button>
      </div>

      {/* Grid: Left Links, Right Received Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        {/* Active Links Box */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-0.5">
              <LinkIcon className="w-2 h-2 text-amber-600" />
              <span>روابط الصراحة (المحادثات)</span>
            </h2>
            {myLinks.length > 0 && (
              <button
                onClick={() => setSelectedLinkId(null)}
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-lg transition ${selectedLinkId === null
                    ? "bg-amber-600 text-white"
                    : "bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-stone-300"
                  }`}
              >
                الكل
              </button>
            )}
          </div>

          {myLinks.length === 0 ? (
            <Card className="rounded-2xl p-1 text-center border-dashed border-stone-300 dark:border-zinc-700 bg-transparent">
              <p className="text-xs text-stone-500 mb-0.5">لم تنشئ أي رابط للمخدومين بعد</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                className="rounded-xl text-xs font-bold"
              >
                إنشاء أول رابط
              </Button>
            </Card>
          ) : (
            <div className="space-y-0.5">
              {myLinks.map((lnk) => {
                const isSelected = selectedLinkId === lnk.id;
                return (
                  <Card
                    key={lnk.id}
                    onClick={() => setSelectedLinkId(lnk.id)}
                    className={`rounded-2xl p-1 transition cursor-pointer border ${isSelected
                        ? "border-amber-600 bg-amber-500/10 dark:bg-amber-950/30 ring-1 ring-amber-600"
                        : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-amber-400"
                      } shadow-xs`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-bold text-amber-950 dark:text-amber-300 truncate">{lnk.title}</h3>
                      <Badge variant="outline" className={`text-[10px] ${isSelected ? "text-amber-600 border-amber-500" : "text-emerald-600 border-emerald-500/30"}`}>
                        {isSelected ? "محدد" : "نشط"}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-stone-400 bg-stone-50 dark:bg-zinc-800 p-0.5 rounded-lg truncate mb-0.5">
                      /saraha/{lnk.slug}
                    </p>
                    <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => copyShareLink(lnk.slug)}
                        className="w-full bg-stone-100 hover:bg-amber-100 text-stone-800 dark:bg-zinc-800 dark:hover:bg-amber-950/60 dark:text-zinc-200 rounded-xl text-xs font-bold"
                      >
                        نسخ الرابط للمخدومين
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Received Questions Stream */}
        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-0.5">
              <MessageSquare className="w-2 h-2 text-amber-600" />
              <span>الأسئلة الواردة من المخدومين ({messages.length})</span>
            </h2>
          </div>

          {loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-3 gap-1">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <p className="text-xs font-semibold text-stone-500">جاري تحميل الأسئلة...</p>
            </div>
          ) : messages.length === 0 ? (
            <Card className="rounded-3xl p-3 text-center border-stone-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70">
              <HelpCircle className="w-5 h-5 text-amber-500/40 mx-auto mb-0.5" />
              <h3 className="text-sm font-bold text-stone-700 dark:text-zinc-300">لا توجد أسئلة واردة حتى الآن</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.25">
                انسخ رابط الصراحة وشاركه في جروب الخدمة أو مع الشباب لتشجيعهم على طرح الأسئلة بحرية.
              </p>
            </Card>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => (
                <Card key={msg.id} className="rounded-3xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
                  <div className="p-1 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-amber-50/40 dark:bg-zinc-800/40 text-xs">
                    <span className="flex items-center gap-0.25 text-stone-500">
                      <Clock className="w-1.5 h-1.5" />
                      {new Date(msg.created_at).toLocaleString("ar-EG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-stone-400 hover:text-rose-600 p-0.25 transition"
                      title="حذف الرسالة"
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="p-1.5">
                    <p className="text-sm leading-relaxed text-stone-900 dark:text-zinc-100 font-sans">
                      {msg.content}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Saraha Link */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-1">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-1.5 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-1">
            <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
              إنشاء رابط صراحة جديد للخدمة
            </h3>

            <form onSubmit={handleCreateLink} className="space-y-1 text-right">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.25">
                  عنوان الصندوق للمخدومين:
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: أسئلة أسرة ثانوي / استفسارات اجتماع الشباب"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.25">
                  الاسم الفريد للرابط (Slug بالإنجليزية):
                </label>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="مثال: youth-qna أو abona-shabab"
                  className="rounded-xl text-xs font-mono text-left"
                  dir="ltr"
                />
                <p className="text-[11px] text-stone-500 mt-1 bg-amber-50 dark:bg-zinc-800 p-1.5 rounded-xl border border-amber-200 dark:border-zinc-700 leading-relaxed">
                  💡 <strong>ما هو الـ Slug (الاسم الفريد)؟</strong><br />
                  هو الكلمة الإنجليزية أو الرمز الذي يظهر في نهاية رابط صفحتك على الإنترنت (مثل: <code className="text-amber-700 dark:text-amber-400 font-bold">/saraha/shabab</code>). يجب أن يكون حروف وأرقام إنجليزية بدون مسافات، ويُستخدم لتمييز هذا الصندوق تحديداً عن باقي الروابط الخاصة بالاجتماعات الأخرى.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.25">
                  رسالة توجيهية للمخدومين (اختياري):
                </label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="اكتب سؤالك بكل صراحة وبدون ظهور هويتك للخادم..."
                  className="rounded-xl text-xs resize-none min-h-[70px]"
                />
              </div>

              <div className="flex gap-0.5 pt-0.5">
                <Button
                  type="submit"
                  disabled={isCreatingLink || !newSlug.trim()}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold"
                >
                  {isCreatingLink ? "جاري الإنشاء..." : "إنشاء الرابط الآن"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="w-auto rounded-xl text-xs"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
