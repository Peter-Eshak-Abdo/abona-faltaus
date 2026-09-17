"use client";

import React, { useState, useMemo } from "react";
import BackButton from "@/components/navigation/BackButton";
import {
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  Plus,
  Trash2,
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Settings,
  RefreshCw,
  Clock,
  BookOpen,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Servant,
  MeetingSlotConfig,
  ScheduleConfig,
  ScheduledMeeting,
  generateClassSchedule,
} from "@/lib/class-coordinator-scheduler";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INITIAL_SERVANTS: Servant[] = [
  { id: "s1", name: "بيتر إسحق", phone: "01200000001", restrictedSlots: [], unavailableDates: [] },
  { id: "s2", name: "مينا نبيل", phone: "01200000002", restrictedSlots: [1], unavailableDates: [] },
  { id: "s3", name: "كيرلس مجدي", phone: "01200000003", restrictedSlots: [], unavailableDates: [] },
  { id: "s4", name: "مارينا عاطف", phone: "01200000004", restrictedSlots: [], unavailableDates: [] },
  { id: "s5", name: "فادي سمير", phone: "01200000005", restrictedSlots: [], unavailableDates: [] },
  { id: "s6", name: "سارة رفعت", phone: "01200000006", restrictedSlots: [], unavailableDates: [] },
];

const INITIAL_SLOTS: MeetingSlotConfig[] = [
  { slotIndex: 1, defaultTitle: "الفقرة الأولى (درس كتاب / عقيدة)", servantsNeeded: 1, alternateWeekly: false },
  { slotIndex: 2, defaultTitle: "الفقرة الثانية (طقس / لغة قبطية / أنشطة)", servantsNeeded: 1, alternateWeekly: false },
];

export default function ClassCoordinatorPage() {
  const [meetingName, setMeetingName] = useState("اجتماع إعداد خدام وثانوي — كنيسة الشهداء");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [meetingDayOfWeek, setMeetingDayOfWeek] = useState(5); // الجمعة
  const [numberOfWeeks, setNumberOfWeeks] = useState(10);
  const [minSpacingWeeks, setMinSpacingWeeks] = useState(2);

  const [slots, setSlots] = useState<MeetingSlotConfig[]>(INITIAL_SLOTS);
  const [servants, setServants] = useState<Servant[]>(INITIAL_SERVANTS);
  const [schedule, setSchedule] = useState<ScheduledMeeting[]>([]);

  // New servant modal/inputs
  const [newServantName, setNewServantName] = useState("");
  const [newServantPhone, setNewServantPhone] = useState("");
  const [activeTab, setActiveTab] = useState<"schedule" | "servants" | "settings">("schedule");

  // Generate schedule
  const handleGenerate = () => {
    if (servants.length < 2) {
      toast.error("يرجى إضافة خادمين على الأقل للبدء بالتوزيع");
      return;
    }

    const config: ScheduleConfig = {
      startDate,
      numberOfWeeks,
      meetingDayOfWeek,
      minWeeksBetweenLessons: minSpacingWeeks,
      slots,
    };

    const result = generateClassSchedule(servants, config);
    setSchedule(result);
    setActiveTab("schedule");
    toast.success("تم إنشاء جدول التوزيع العادل بنجاح!");
  };

  // Add new servant
  const handleAddServant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServantName.trim()) return;

    const newS: Servant = {
      id: `s_${Date.now()}`,
      name: newServantName.trim(),
      phone: newServantPhone.trim() || undefined,
      restrictedSlots: [],
      unavailableDates: [],
    };

    setServants((prev) => [...prev, newS]);
    setNewServantName("");
    setNewServantPhone("");
    toast.success(`تم إضافة الخادم (${newS.name}) بنجاح`);
  };

  // Remove servant
  const handleRemoveServant = (id: string) => {
    setServants((prev) => prev.filter((s) => s.id !== id));
  };

  // Toggle slot restriction
  const handleToggleSlotRestriction = (servantId: string, slotIdx: number) => {
    setServants((prev) =>
      prev.map((s) => {
        if (s.id !== servantId) return s;
        const exists = s.restrictedSlots.includes(slotIdx);
        return {
          ...s,
          restrictedSlots: exists
            ? s.restrictedSlots.filter((x) => x !== slotIdx)
            : [...s.restrictedSlots, slotIdx],
        };
      })
    );
  };

  // Update lesson title in schedule
  const handleUpdateLessonTitle = (weekIdx: number, slotIdx: number, newTitle: string) => {
    setSchedule((prev) =>
      prev.map((meeting) => {
        if (meeting.weekIndex !== weekIdx) return meeting;
        return {
          ...meeting,
          slots: meeting.slots.map((sl) => {
            if (sl.slotIndex !== slotIdx) return sl;
            return { ...sl, lessonTitle: newTitle };
          }),
        };
      })
    );
  };

  // Update assigned servant manually
  const handleManualServantChange = (
    weekIdx: number,
    slotIdx: number,
    servantOrderIdx: number,
    newServantId: string
  ) => {
    setSchedule((prev) =>
      prev.map((meeting) => {
        if (meeting.weekIndex !== weekIdx) return meeting;
        return {
          ...meeting,
          slots: meeting.slots.map((sl) => {
            if (sl.slotIndex !== slotIdx) return sl;
            const updatedIds = [...sl.assignedServantIds];
            updatedIds[servantOrderIdx] = newServantId;
            return { ...sl, assignedServantIds: updatedIds };
          }),
        };
      })
    );
    toast.success("تم تحديث الخادم المكلف");
  };

  // Export to Word (.doc)
  const handleExportWord = () => {
    if (schedule.length === 0) {
      toast.error("يرجى إنشاء الجدول أولاً");
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${meetingName}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; margin: 20px; }
          h1 { color: #4A0012; text-align: center; margin-bottom: 5px; }
          h3 { color: #735C00; text-align: center; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #999; padding: 10px; text-align: center; font-size: 13px; }
          th { background-color: #4A0012; color: #FFF; font-weight: bold; }
          tr:nth-child(even) { background-color: #F8F6F0; }
        </style>
      </head>
      <body>
        <h1>كنيسة القديسة العذراء مريم والشهداء</h1>
        <h3>جدول توزيع شرح دروس ولقاءات: ${meetingName}</h3>
        <table>
          <thead>
            <tr>
              <th>الأسبوع</th>
              <th>التاريخ</th>
              ${slots.map((s) => `<th>${s.defaultTitle}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${schedule
              .map((m) => {
                const slotCells = m.slots
                  .map((sl) => {
                    const servantNames = sl.assignedServantIds
                      .map((id) => servants.find((s) => s.id === id)?.name || "غير محدد")
                      .join(" + ");
                    const lesson = sl.lessonTitle ? `<br/><small style="color:#555">الموضوع: ${sl.lessonTitle}</small>` : "";
                    return `<td><strong>${servantNames}</strong>${lesson}</td>`;
                  })
                  .join("");
                return `<tr><td>${m.weekIndex}</td><td>${m.formattedDateAr}</td>${slotCells}</tr>`;
              })
              .join("")}
          </tbody>
        </table>
        <p style="margin-top: 30px; text-align: center; color: #777;">صُنِع بواسطة نظام أبونا فلتاؤس الرقمي لخدمة الكنيسة</p>
      </body>
      </html>
    `;

    const blob = new Blob(["\ufeff" + html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `جدول_شرح_الخدام_${startDate}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("تم تصدير ملف Word بنجاح!");
  };

  // Copy WhatsApp Summary
  const handleCopyWhatsApp = () => {
    if (schedule.length === 0) return;

    let text = `✝️ *جدول توزيع خدمة وشرح: ${meetingName}*\n\n`;
    schedule.forEach((m) => {
      text += `📅 *الأسبوع ${m.weekIndex} (${m.formattedDateAr}):*\n`;
      m.slots.forEach((sl) => {
        const names = sl.assignedServantIds
          .map((id) => servants.find((s) => s.id === id)?.name || "—")
          .join(" و ");
        text += `   ▫️ ${sl.slotTitle}: *${names}*`;
        if (sl.lessonTitle) text += ` (موضوع: ${sl.lessonTitle})`;
        text += `\n`;
      });
      text += `\n`;
    });
    text += `صلواتكم من أجل ثمار الخدمة 🙏`;

    navigator.clipboard.writeText(text);
    toast.success("تم نسخ جدول التوزيع بتنسيق WhatsApp!");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pb-20 print:bg-white print:text-black" dir="rtl">
      {/* Header */}
      <header className="border-b border-[#EBE9E0] dark:border-neutral-800 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-1 py-0.5 flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <BackButton />
            <div>
              <h1 className="text-lg md:text-xl font-black text-[#4A0012] dark:text-amber-400 flex items-center gap-0.5">
                <Users className="w-2 h-2 text-amber-600" />
                منظومة أمين الفصل — جدول توزيع الخدام
              </h1>
              <p className="text-xs text-stone-500 dark:text-neutral-400">
                توزيع عادل، متوازن، وغير متتالي بين الخدام مع دعم كافة الشروط والاعتذارات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <div className="bg-stone-100 dark:bg-neutral-800 p-1 rounded-xl flex items-center gap-1 border border-stone-200 dark:border-neutral-700">
              <button
                onClick={() => setActiveTab("schedule")}
                className={cn(
                  "px-1 py-0.5 rounded-lg text-xs font-bold transition",
                  activeTab === "schedule"
                    ? "bg-[#4A0012] text-white shadow-sm"
                    : "text-stone-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                )}
              >
                الجدول ({schedule.length})
              </button>
              <button
                onClick={() => setActiveTab("servants")}
                className={cn(
                  "px-1 py-0.5 rounded-lg text-xs font-bold transition",
                  activeTab === "servants"
                    ? "bg-[#4A0012] text-white shadow-sm"
                    : "text-stone-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                )}
              >
                الخدام ({servants.length})
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "px-1 py-0.5 rounded-lg text-xs font-bold transition",
                  activeTab === "settings"
                    ? "bg-[#4A0012] text-white shadow-sm"
                    : "text-stone-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                )}
              >
                الإعدادات
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-1 py-1.5 space-y-0.5">
        {/* Printable Header for print only */}
        <div className="hidden print:block text-center border-b pb-0.5 mb-0.5">
          <h2 className="text-xl font-bold">كنيسة القديسة العذراء مريم — خدمة مدارس الأحد</h2>
          <h3 className="text-base font-semibold mt-1">جدول شرح وتوزيع الخدمة: {meetingName}</h3>
          <p className="text-xs text-gray-600">تاريخ البدء: {startDate}</p>
        </div>

        {/* Tab 1: Schedule Table View */}
        {activeTab === "schedule" && (
          <div className="space-y-0.5">
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
              <div className="flex items-center gap-0.25">
                <Button
                  onClick={handleGenerate}
                  className="bg-[#4A0012] hover:bg-[#6B1124] text-amber-200 font-bold text-xs rounded-xl shadow-md gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {schedule.length > 0 ? "إعادة التوزيع العشوائي العادل" : "إنشاء وتوزيع الجدول الآن"}
                </Button>

                {schedule.length > 0 && (
                  <Badge variant="outline" className="bg-amber-50 dark:bg-neutral-900 border-amber-300 text-amber-900 dark:text-amber-300 text-xs font-bold">
                    {schedule.length} أسابيع مخططة
                  </Badge>
                )}
              </div>

              {schedule.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="outline"
                    onClick={handleExportWord}
                    className="rounded-xl text-xs font-bold border-stone-300 dark:border-neutral-700 gap-0.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    تنزيل Word (.doc)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="rounded-xl text-xs font-bold border-stone-300 dark:border-neutral-700 gap-0.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                    طباعة / PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyWhatsApp}
                    className="rounded-xl text-xs font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-0.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    نسخ واتساب
                  </Button>
                </div>
              )}
            </div>

            {/* Schedule Table */}
            {schedule.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-2 border-amber-900/20 dark:border-amber-500/20 bg-white/50 dark:bg-neutral-900/50 p-1 text-center">
                <div className="w-4 h-4 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
                  <CalendarIcon className="w-2 h-2" />
                </div>
                <h3 className="text-base font-bold text-[#4A0012] dark:text-amber-300">
                  لم يتم إنشاء جدول بعد
                </h3>
                <p className="text-xs text-stone-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-0.5 leading-relaxed">
                  قم بمراجعة قائمة الخدام وإعدادات الفقرات، ثم اضغط على زر التوزيع لإنشاء جدول عادل ومتكامل.
                </p>
                <Button
                  onClick={handleGenerate}
                  className="bg-[#4A0012] hover:bg-[#6B1124] text-white font-bold text-xs rounded-xl px-1 py-0.5 shadow-lg"
                >
                  توزيع الجدول الآن
                </Button>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#4A0012] text-white border-b border-[#4A0012]">
                      <th className="p-1 font-bold w-4 text-center">الأسبوع</th>
                      <th className="p-1 font-bold w-12">تاريخ الاجتماع</th>
                      {slots.map((s) => (
                        <th key={s.slotIndex} className="p-0.5 font-bold">
                          {s.defaultTitle}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-neutral-800">
                    {schedule.map((meeting) => (
                      <tr key={meeting.weekIndex} className="hover:bg-stone-50/80 dark:hover:bg-neutral-800/40 transition">
                        <td className="p-0.5 font-black text-center font-mono text-stone-500">
                          {meeting.weekIndex}
                        </td>
                        <td className="p-0.5 font-bold text-stone-900 dark:text-white whitespace-nowrap">
                          {meeting.formattedDateAr}
                        </td>
                        {meeting.slots.map((sl) => (
                          <td key={sl.slotIndex} className="p-0.5 space-y-0.5">
                            {/* Assigned Servant Selectors */}
                            <div className="flex flex-wrap items-center gap-0.5">
                              {sl.assignedServantIds.map((sId, orderIdx) => (
                                <select
                                  key={orderIdx}
                                  value={sId}
                                  onChange={(e) =>
                                    handleManualServantChange(
                                      meeting.weekIndex,
                                      sl.slotIndex,
                                      orderIdx,
                                      e.target.value
                                    )
                                  }
                                  className="bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-lg text-xs font-bold py-0.5 px-1 text-stone-800 dark:text-neutral-200 focus:ring-1 focus:ring-amber-500"
                                >
                                  {servants.map((sv) => (
                                    <option key={sv.id} value={sv.id}>
                                      {sv.name}
                                    </option>
                                  ))}
                                </select>
                              ))}
                            </div>

                            {/* Lesson Title Input */}
                            <div className="print:hidden">
                              <Input
                                value={sl.lessonTitle}
                                onChange={(e) =>
                                  handleUpdateLessonTitle(
                                    meeting.weekIndex,
                                    sl.slotIndex,
                                    e.target.value
                                  )
                                }
                                placeholder="اسم الدرس / موضوع الفقرة..."
                                className="h-2 text-xs bg-stone-50 dark:bg-neutral-800/50 border-stone-200 dark:border-neutral-700 rounded-lg"
                              />
                            </div>
                            {sl.lessonTitle && (
                              <div className="hidden print:block text-[11px] font-semibold text-gray-700">
                                الدرس: {sl.lessonTitle}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Servants Management */}
        {activeTab === "servants" && (
          <div className="space-y-0.5">
            {/* Add Servant Card */}
            <Card className="rounded-2xl border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <CardHeader className="pb-0.5">
                <CardTitle className="text-base font-bold text-[#4A0012] dark:text-amber-300">
                  إضافة خادم جديد إلى الفصل
                </CardTitle>
                <CardDescription className="text-xs">
                  أضف بيانات الخدام لتوزيعهم تلقائياً وفقاً لشروطهم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddServant} className="flex flex-wrap gap-0.5 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-stone-600 dark:text-neutral-400 mb-1">
                      اسم الخادم:
                    </label>
                    <Input
                      value={newServantName}
                      onChange={(e) => setNewServantName(e.target.value)}
                      placeholder="مثال: يوحنا عادل"
                      className="rounded-xl text-xs h-2"
                    />
                  </div>
                  <div className="w-11">
                    <label className="block text-xs font-bold text-stone-600 dark:text-neutral-400 mb-1">
                      رقم الهاتف (اختياري):
                    </label>
                    <Input
                      value={newServantPhone}
                      onChange={(e) => setNewServantPhone(e.target.value)}
                      placeholder="012xxxxxxxx"
                      className="rounded-xl text-xs h-2 font-mono"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!newServantName.trim()}
                    className="bg-[#4A0012] hover:bg-[#6B1124] text-white font-bold text-xs rounded-xl h-2 px-1 gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة الخادم
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Servants List with Constraint Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
              {servants.map((s) => (
                <Card key={s.id} className="rounded-2xl border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-1 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center text-xs">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                            {s.name}
                          </h4>
                          {s.phone && (
                            <span className="text-[11px] text-stone-400 font-mono">
                              {s.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveServant(s.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition"
                        title="حذف الخادم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Constraint: Restrict slot */}
                    <div className="pt-2 border-t border-stone-100 dark:border-neutral-800 space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 dark:text-neutral-400 block">
                        شروط وموانع الفقرات:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {slots.map((sl) => {
                          const isRestricted = s.restrictedSlots.includes(sl.slotIndex);
                          return (
                            <button
                              key={sl.slotIndex}
                              type="button"
                              onClick={() => handleToggleSlotRestriction(s.id, sl.slotIndex)}
                              className={cn(
                                "px-1.5 py-1 rounded-lg text-[10px] font-bold border transition",
                                isRestricted
                                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300"
                                  : "bg-stone-50 dark:bg-neutral-800 text-stone-600 dark:text-neutral-300 border-stone-200 dark:border-neutral-700 hover:bg-stone-100"
                              )}
                            >
                              {isRestricted ? `✕ ممنوع من ${sl.defaultTitle}` : `✓ متاح لـ ${sl.defaultTitle}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === "settings" && (
          <Card className="rounded-2xl border-[#EBE9E0] dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-1 space-y-0.5 max-w-2xl">
            <h3 className="text-base font-bold text-[#4A0012] dark:text-amber-400">
              إعدادات موعد الاجتماع وقواعد التوزيع
            </h3>

            <div className="space-y-0.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-neutral-300 mb-1">
                  اسم الأسرة أو الاجتماع:
                </label>
                <Input
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-neutral-300 mb-1">
                    تاريخ بدء الفصل:
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-neutral-300 mb-1">
                    يوم الاجتماع الأسبوعي:
                  </label>
                  <select
                    value={meetingDayOfWeek}
                    onChange={(e) => setMeetingDayOfWeek(Number(e.target.value))}
                    className="w-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl text-xs p-1 font-bold"
                  >
                    <option value={6}>السبت</option>
                    <option value={0}>الأحد</option>
                    <option value={1}>الأثنين</option>
                    <option value={2}>الثلاثاء</option>
                    <option value={3}>الأربعاء</option>
                    <option value={4}>الخميس</option>
                    <option value={5}>الجمعة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-0.5">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-neutral-300 mb-1">
                    عدد الأسابيع المخططة:
                  </label>
                  <Input
                    type="number"
                    min={4}
                    max={52}
                    value={numberOfWeeks}
                    onChange={(e) => setNumberOfWeeks(Number(e.target.value))}
                    className="rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 dark:text-neutral-300 mb-1">
                    الحد الأدنى للفاصل بين مرات الشرح للخادم:
                  </label>
                  <select
                    value={minSpacingWeeks}
                    onChange={(e) => setMinSpacingWeeks(Number(e.target.value))}
                    className="w-full bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl text-xs p-1 font-bold"
                  >
                    <option value={2}>أسبوعان على الأقل (مرة كل أسبوعين)</option>
                    <option value={3}>3 أسابيع على الأقل (مرة كل 3 أسابيع)</option>
                    <option value={1}>أسبوع واحد (غير متتالي في نفس الأسبوع)</option>
                  </select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full bg-[#4A0012] hover:bg-[#6B1124] text-white font-bold text-xs rounded-xl py-1 mt-1"
            >
              حفظ الإعدادات وإعادة إنشاء الجدول
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
