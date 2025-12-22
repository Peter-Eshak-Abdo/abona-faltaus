"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import { Calendar as CalendarIcon, BookOpen, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- دالة مساعدة بسيطة للتحويل للقبطي (تقريبية لأغراض العرض) ---
// يفضل استخدام مكتبة 'coptic-date' لدقة أعلى، لكن هذا يكفي للبدء
function getCopticDate(date: Date) {
    // هذه خوارزمية مبسطة جداً، يفضل استبدالها بمكتبة متخصصة
    // 11 سبتمبر = 1 توت (في السنوات البسيطة)
    const startOfCopticYear = new Date(date.getFullYear(), 8, 11); // 11 Sep
    if (date < startOfCopticYear) {
       startOfCopticYear.setFullYear(date.getFullYear() - 1);
    }
    const diff = Math.floor((date.getTime() - startOfCopticYear.getTime()) / (1000 * 60 * 60 * 24));

    let month = Math.floor(diff / 30) + 1;
    let day = (diff % 30) + 1;

    // تصحيح الشهر الصغير (نسي)
    if (month > 13) month = 1;

    return { month, day };
}

export default function ReadingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // دالة جلب البيانات من الـ API الذي صنعناه
  const fetchReadings = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const { month, day } = getCopticDate(selectedDate);

      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ copticMonth: month, copticDay: day }),
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch readings", error);
    } finally {
      setLoading(false);
    }
  };

  // التحميل عند فتح الصفحة أو تغيير التاريخ
  useEffect(() => {
    if (date) {
      fetchReadings(date);
    }
  }, [date]);

  return (
    <div className="container mx-auto p-1 max-w-8xl" dir="rtl">

      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-1 gap-1">
        <h1 className="text-3xl font-bold text-primary">القطمارس اليومي</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-60 justify-start text-right font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="ml-1 h-4 w-4" />
              {date ? format(date, "PPP", { locale: arEG }) : <span>اختر يوماً</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              dir="ltr" // التقويم الإنجليزي يكون LTR لضبط الأسهم
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-1">جاري تحميل القراءات...</span>
        </div>
      ) : data ? (
        <div className="space-y-1">

          {/* عنوان اليوم */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center text-xl text-primary">
                {data.title}
                {data.season && <span className="block text-sm font-normal text-muted-foreground mt-1">({data.season})</span>}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* القراءات */}
          <ReadingCard title="مزمور باكر" content={data.readings.m_psalm} />
          <ReadingCard title="إنجيل باكر" content={data.readings.m_gospel} />
          <ReadingCard title="البولس" content={data.readings.pauline} />
          <ReadingCard title="الكاثوليكون" content={data.readings.catholic} />
          <ReadingCard title="الإبركسيس" content={data.readings.acts} />
          <ReadingCard title="مزمور القداس" content={data.readings.l_psalm} />
          <ReadingCard title="إنجيل القداس" content={data.readings.l_gospel} highlight />

        </div>
      ) : (
        <div className="text-center py-1 text-muted-foreground">
          لا توجد قراءات متاحة لهذا التاريخ.
        </div>
      )}
    </div>
  );
}

// مكون بسيط لعرض البطاقة
function ReadingCard({ title, content, highlight = false }: { title: string, content: string, highlight?: boolean }) {
  if (!content) return null;
  return (
    <Card className={cn("transition-all", highlight ? "border-primary shadow-md" : "")}>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center text-xl font-bold">
          <BookOpen className="ml-1 h-3 w-3 text-primary/70" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-loose text-lg text-justify text-foreground/90 font-serif">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
