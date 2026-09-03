"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Trash2,
  Share2,
  Download,
  Users,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Send,
  HelpCircle,
  Clock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface FormField {
  id: string;
  label: string;
  type: "text" | "paragraph" | "multiple_choice" | "rating";
  options?: string[];
  required: boolean;
}

export default function ChurchFormsDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // States
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Modal create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    { id: "f1", label: "الاسم ثلاثي", type: "text", required: true },
    { id: "f2", label: "رقم الهاتف / الواتساب", type: "text", required: true },
    { id: "f3", label: "ملاحظات أو أسئلة للخادم", type: "paragraph", required: false },
  ]);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Collaborator Admin modal
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
  }, []);

  const fetchServantForms = async () => {
    if (!user) return;
    setLoadingForms(true);
    try {
      const res = await fetch(`/api/forms?userId=${user.id}&userEmail=${user.email || ""}`);
      const data = await res.json();
      if (data.success) {
        setForms(data.forms || []);
        if (data.forms?.length > 0 && !selectedForm) {
          loadFormResponses(data.forms[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingForms(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchServantForms();
    }
  }, [user?.id]);

  const loadFormResponses = async (form: any) => {
    setSelectedForm(form);
    setLoadingResponses(true);
    try {
      const res = await fetch(`/api/forms?id=${form.id}`);
      const data = await res.json();
      if (data.success) {
        setResponses(data.responses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    setFields((prev) => [
      ...prev,
      { id: newId, label: "سؤال جديد", type: "text", required: false },
    ]);
  };

  const handleRemoveField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان الاستبيان");
      return;
    }

    setIsSubmittingForm(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_form",
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          fields,
          adminCollaborators: [user.email],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تم إنشاء الاستبيان بنجاح!");
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        fetchServantForms();
      } else {
        toast.error(data.error || "فشل إنشاء الاستبيان");
      }
    } catch {
      toast.error("حدث خطأ أثناء الإنشاء");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !selectedForm) return;

    setIsAddingAdmin(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_admin",
          formId: selectedForm.id,
          newAdminEmail: newAdminEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تمت إضافة الخادم ${newAdminEmail} كـ Admin بنجاح!`);
        setSelectedForm((prev: any) => ({
          ...prev,
          admin_collaborators: data.admins,
        }));
        setNewAdminEmail("");
      }
    } catch {
      toast.error("تعذر إضافة الخادم المشرف");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // تصدير كـ Excel (CSV UTF-8)
  const exportToExcel = () => {
    if (!selectedForm || responses.length === 0) {
      toast.error("لا توجد ردود لتصديرها");
      return;
    }

    const formFields = selectedForm.fields || [];
    const headers = ["تاريخ التقديم", ...formFields.map((f: any) => f.label)];
    const rows = responses.map((r) => {
      const dateStr = new Date(r.submitted_at).toLocaleString("ar-EG");
      const answers = formFields.map((f: any) => `"${(r.responses[f.id] || "").replace(/"/g, '""')}"`);
      return [`"${dateStr}"`, ...answers].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedForm.title}_الردود.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تم تصدير ملف الإكسيل بنجاح!");
  };

  // تصدير كـ PDF عبر الطباعة المنظمة
  const exportToPdf = () => {
    window.print();
  };

  const copyShareLink = (id: string) => {
    const fullUrl = `${window.location.origin}/forms/${id}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("تم نسخ رابط الاستبيان لمشاركته مع المخدومين!");
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-2 gap-1">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-stone-500">جاري التحقق من الحساب...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-0.5 px-0.5 sm:px-4 max-w-7xl mx-auto space-y-0.5 font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 bg-white/80 dark:bg-zinc-900/80 p-0.5 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-0.5">
            <ClipboardList className="w-2 h-2 text-blue-600" />
            <span>نظام استبيانات واستمارات الخدمة (Google Forms البديل)</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            أنشئ استماراتك، شارك الروابط مع المخدومين، حلل الردود وشارك الإدارة مع الخدام المشرفين
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-0.5 shadow-md h-3 px-1"
        >
          <Plus className="w-2 h-2" />
          <span>إنشاء استبيان جديد</span>
        </Button>
      </div>

      {/* Main Grid: Forms list + Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0.5">
        {/* Left: Active Forms list */}
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-0.25">
            <ClipboardList className="w-2 h-2 text-blue-600" />
            <span>استبياناتك المتاحة ({forms.length})</span>
          </h2>

          {forms.length === 0 ? (
            <Card className="rounded-2xl p-0.5 text-center border-dashed border-stone-300 dark:border-zinc-700 bg-transparent">
              <p className="text-xs text-stone-500 mb-0.5">لم تقم بإنشاء أي استبيان بعد</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="outline"
                className="rounded-xl text-xs font-bold"
              >
                إنشاء أول استبيان
              </Button>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {forms.map((f) => {
                const isSelected = selectedForm?.id === f.id;
                return (
                  <Card
                    key={f.id}
                    onClick={() => loadFormResponses(f)}
                    className={`rounded-2xl p-0.5 transition cursor-pointer border ${
                      isSelected
                        ? "border-blue-600 bg-blue-500/10 dark:bg-blue-950/30 ring-1 ring-blue-600"
                        : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400"
                    } shadow-xs`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 truncate">{f.title}</h3>
                      <Badge variant="outline" className={`text-[10px] ${isSelected ? "text-blue-600 border-blue-500" : "text-emerald-600 border-emerald-500/30"}`}>
                        {isSelected ? "محدد" : "نشط"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-0.5">
                      <span>{f.fields?.length || 0} أسئلة</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="w-3 h-3" />
                        {f.admin_collaborators?.length || 1} مشرفين
                      </span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareLink(f.id);
                      }}
                      className="w-full bg-stone-100 hover:bg-blue-100 text-stone-800 dark:bg-zinc-800 dark:hover:bg-blue-950/60 dark:text-zinc-200 rounded-xl text-xs font-bold"
                    >
                      <Share2 className="w-2.5 h-2.5 ml-0.5" />
                      نسخ الرابط للمخدومين
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Responses Analytics & Admin Collaborators */}
        <div className="lg:col-span-2 space-y-0.5">
          {selectedForm ? (
            <>
              {/* Form Dashboard Header */}
              <Card className="rounded-3xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xs space-y-0.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-0.5 border-b border-stone-100 dark:border-zinc-800 pb-0.5">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">{selectedForm.title}</h2>
                    <p className="text-xs text-stone-500 mt-0.5">{selectedForm.description || "استبيان خدمة"}</p>
                  </div>

                  <div className="flex flex-wrap gap-0.5">
                    <Button
                      onClick={exportToExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-0.5"
                    >
                      <FileSpreadsheet className="w-2.5 h-2.5" />
                      <span>تصدير Excel</span>
                    </Button>

                    <Button
                      onClick={exportToPdf}
                      variant="outline"
                      className="rounded-xl text-xs font-bold flex items-center gap-0.5"
                    >
                      <FileText className="w-2 h-2" />
                      <span>تصدير PDF</span>
                    </Button>
                  </div>
                </div>

                {/* Admins & Collaborators Section */}
                <div className="bg-stone-50 dark:bg-zinc-800/50 p-0.5 rounded-2xl border border-stone-200/60 dark:border-zinc-700/60 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-zinc-300 flex items-center gap-0.5">
                      <ShieldCheck className="w-2 h-2 text-blue-600" />
                      الخدام المشرفين كـ Admin على الاستبيان:
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-0.5">
                    {(selectedForm.admin_collaborators || []).map((adminEmail: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs font-mono">
                        {adminEmail}
                      </Badge>
                    ))}
                  </div>

                  <form onSubmit={handleAddCollaborator} className="flex gap-0.5 pt-0.5">
                    <Input
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="أدخل إيميل الخادم لإضافته كـ Admin..."
                      className="text-xs rounded-xl h-2.5"
                      dir="ltr"
                    />
                    <Button
                      type="submit"
                      disabled={isAddingAdmin || !newAdminEmail.trim()}
                      className="bg-stone-800 hover:bg-black text-white text-xs rounded-xl h-2.5 font-bold px-0.5 shrink-0"
                    >
                      {isAddingAdmin ? "جاري الإضافة..." : "إضافة خادم مشرف"}
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Responses List */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-0.5">
                    <BarChart3 className="w-2 h-2 text-blue-600" />
                    <span>الردود المستلمة ({responses.length})</span>
                  </h3>
                </div>

                {loadingResponses ? (
                  <div className="flex flex-col items-center justify-center py-1 gap-0.5">
                    <Loader2 className="w-2 h-2 animate-spin text-blue-600" />
                    <p className="text-xs font-semibold text-stone-500">جاري تحميل الردود...</p>
                  </div>
                ) : responses.length === 0 ? (
                  <Card className="rounded-3xl p-6 text-center border-stone-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60">
                    <HelpCircle className="w-2 h-2 text-stone-400 mx-auto mb-0.5" />
                    <h4 className="text-sm font-bold text-stone-700 dark:text-zinc-300">لا توجد ردود مسجلة بعد</h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-0.5">
                      شارك الرابط مع المخدومين لتظهر ردودهم وإحصائياتهم هنا مباشرة.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-0.5">
                    {responses.map((resp) => (
                      <Card key={resp.id} className="rounded-2xl border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xs space-y-0.5">
                        <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-100 dark:border-zinc-800 pb-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2 h-2" />
                            {new Date(resp.submitted_at).toLocaleString("ar-EG")}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 text-xs">
                          {(selectedForm.fields || []).map((f: any) => (
                            <div key={f.id} className="bg-stone-50 dark:bg-zinc-800/40 p-2 rounded-xl">
                              <span className="font-bold text-stone-600 dark:text-zinc-400 block mb-0.5">{f.label}:</span>
                              <span className="text-stone-900 dark:text-zinc-100 font-medium">
                                {resp.responses[f.id] || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="rounded-3xl p-1.5 text-center border-stone-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
              <ClipboardList className="w-2 h-2 text-stone-400 mx-auto mb-0.5" />
              <h3 className="text-base font-bold text-stone-700 dark:text-zinc-300">اختر استبياناً لعرض إحصائياته وردوده</h3>
            </Card>
          )}
        </div>
      </div>

      {/* Modal: Create Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0.5">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full p-1 shadow-2xl border border-stone-200 dark:border-zinc-800 space-y-0.5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">إنشاء استبيان كنسي جديد</h3>

            <form onSubmit={handleCreateForm} className="space-y-0.5 text-right">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.5">
                  عنوان الاستبيان:
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: استمارة بيانات أسرة إعدادي 2026"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-zinc-300 mb-0.5">
                  وصف الاستبيان أو رسالة للمخدومين (اختياري):
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="يرجى ملء البيانات بدقة للتواصل معكم في أنشطة الخدمة..."
                  className="rounded-xl text-xs resize-none min-h-[60px]"
                />
              </div>

              {/* Fields Builder */}
              <div className="space-y-0.5 pt-0.5 border-t border-stone-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 dark:text-zinc-200">الأسئلة والحقول:</span>
                  <Button
                    type="button"
                    onClick={handleAddField}
                    variant="outline"
                    className="rounded-xl text-xs flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    إضافة سؤال
                  </Button>
                </div>

                <div className="space-y-0.5">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex gap-0.5 items-center bg-stone-50 dark:bg-zinc-800 p-0.5 rounded-xl">
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFields((prev) =>
                            prev.map((f) => (f.id === field.id ? { ...f, label: val } : f))
                          );
                        }}
                        className="rounded-xl text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-stone-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-0.5 pt-0.5">
                <Button
                  type="submit"
                  disabled={isSubmittingForm || !title.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold h-10"
                >
                  {isSubmittingForm ? "جاري الإنشاء..." : "إنشاء الاستبيان الآن"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="w-auto rounded-xl text-xs h-10"
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
