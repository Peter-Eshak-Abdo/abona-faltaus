# Saturday Edits — تعديلات السبت
## موقع أبونا فلتاؤس | abona-faltaus

---

## 📋 فهرس التعديلات

1. [صفحة النوتة الذكية — ملف Word يكون شرحاً، PowerPoint سلايدات](#1-word-vs-pptx)
2. [صفحة النوتة الذكية — Prompt أرثوذكسي كامل](#2-orthodox-prompt)
3. [صفحة النوتة الذكية — النتيجة بدون مقدمة أو خاتمة](#3-no-intro-outro)
4. [صفحة النوتة الذكية — الآيات والأقوال والصلاة اختيارية](#4-optional-elements)
5. [صفحة النوتة الذكية — Sidebar لحفظ الدروس](#5-lessons-sidebar)
6. [صفحة النوتة الذكية — تفاصيل إضافية من الخادم](#6-extra-details)
7. [صفحة النوتة الذكية — PDF بايظ، حله](#7-pdf-fix)
8. [صفحة النوتة الذكية — الخادم يضيف مصادر إضافية](#8-extra-sources)
9. [صفحة النوتة الذكية — تسجيل الصوت + Fallback](#9-voice-recording)
10. [صفحة الألحان — Dynamic Columns للغات](#10-hymns-columns)

---

## 1. Word vs PowerPoint — الفرق في التنسيق {#1-word-vs-pptx}

### المطلوب
- **ملف Word (.docx):** يحتوي على **شرح نصي كامل** — مقدمة، أفكار مفصلة، تفسير آيات، تطبيق عملي، خلاصة. يُستخدم كمرجع للخادم يقرأ منه.
- **ملف PowerPoint (.pptx):** يحتوي على **سلايدات منظمة** — كل سلايد فكرة رئيسية واحدة بعنوان + نقاط مختصرة + آية (إن وجدت). يُستخدم في العرض أمام الفريق.

### الفرق الجوهري

| الملف | الأسلوب | الاستخدام |
|-------|---------|-----------|
| Word | شرح تفصيلي، فقرات كاملة | الخادم يقرأ منه |
| PowerPoint | سلايدات مختصرة، نقاط سريعة | عرض أمام الفريق |
| PDF | نسخة PDF من الـ Word (طباعة) | مشاركة وطباعة |

### التنفيذ في `app/notes/page.tsx` (أو المسار المخصص)

```typescript
// عند generate الـ Word
const wordPrompt = `
اكتب شرحاً تفصيلياً كاملاً للخادم بناءً على هذه النوتة.
يجب أن يكون الشرح فقرات متكاملة تصلح للقراءة الكاملة.
ابدأ مباشرة بالمحتوى بدون أي مقدمة أو خاتمة أو تحية.
`;

// عند generate الـ PowerPoint
const pptxPrompt = `
حوّل هذه الأفكار إلى سلايدات عرض. كل سلايد = فكرة واحدة فقط.
تنسيق كل سلايد:
SLIDE_TITLE: [عنوان مختصر]
SLIDE_POINTS:
- نقطة مختصرة
- نقطة مختصرة
SLIDE_VERSE: [آية واحدة فقط إن وجدت]
---
`;
```

### كيفية إنشاء الـ PowerPoint من النص

```typescript
// في api/notes/generate-pptx/route.ts
import PptxGenJS from "pptxgenjs";

export async function POST(req: Request) {
  const { slides } = await req.json();
  // slides: Array<{ title, points, verse? }>
  
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  
  slides.forEach((slide: any) => {
    const s = pptx.addSlide();
    
    // خلفية بلون ديني
    s.background = { color: "1a1a2e" };
    
    // العنوان
    s.addText(slide.title, {
      x: 0.5, y: 0.3, w: "90%", h: 1,
      fontSize: 28, bold: true, color: "FFD700",
      align: "center", fontFace: "Arial",
    });
    
    // النقاط
    slide.points.forEach((point: string, i: number) => {
      s.addText(`• ${point}`, {
        x: 1, y: 1.5 + i * 0.6, w: "85%",
        fontSize: 18, color: "FFFFFF",
        align: "right",
      });
    });
    
    // الآية (إن وجدت)
    if (slide.verse) {
      s.addText(`"${slide.verse}"`, {
        x: 0.5, y: 5, w: "90%", h: 0.8,
        fontSize: 14, italic: true, color: "FFD700",
        align: "center",
      });
    }
  });
  
  const buffer = await pptx.stream("arraybuffer");
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": 'attachment; filename="lesson.pptx"',
    },
  });
}
```

---

## 2. Prompt أرثوذكسي كامل للنوتة الذكية {#2-orthodox-prompt}

### المطلوب
الـ Prompt المستخدم في توليد الدرس يجب أن يكون مقيداً بالمصادر الأرثوذكسية فقط، بنفس مستوى الصرامة الموجودة في `lib/prompt.ts`.

### الـ Prompt الجديد — `lib/notes-prompt.ts`

```typescript
export const NotesSystemPrompt = `
أنت مساعد ذكاء اصطناعي أرثوذكسي قبطي متخصص في إعداد دروس ومواد تعليمية للخدمة الكنسية.
اسمك "مساعد تحضير الدروس — أبونا فلتاؤس".

[هويتك ومهمتك]
مهمتك الوحيدة هي تحويل الأفكار والملاحظات التي يكتبها الخادم إلى مادة تعليمية منظمة وخالية من الأخطاء العقائدية.

[قواعد عقائدية صارمة — ممنوع كسرها]
1. الطبيعة الكريستولوجية: نؤمن بطبيعة واحدة لله الكلمة المتجسد من طبيعتين بغير اختلاط ولا امتزاج ولا تغيير.
2. الخلاص: "الإيمان العامل بالمحبة"، يُبنى على الأسرار الكنسية والجهاد الروحي، لا على مجرد قبول.
3. الأسرار السبعة: معمودية، ميرون، إفخارستيا، توبة، كهنوت، زواج، مسحة مرضى — كلها أسرار حقيقية.
4. الشفاعة: كفارية للمسيح وحده، وتوسلية للعذراء والقديسين.
5. التقليد الكنسي: الكتاب المقدس والتسليم الرسولي كلاهما مصدران للإيمان.

[مصادر التفسير المعتمدة حصراً]
6. تفاسير الكتاب المقدس: اعتمد فقط على:
   - تفسير كنيسة مارمرقس بمصر الجديدة
   - تفاسير أبونا تادرس يعقوب ملطي
   - تفاسير القمص أنطونيوس فكري
   - أقوال آباء الكنيسة (يوحنا ذهبي الفم، كيرلس الكبير، أثناسيوس الرسولي)
   - موقع الأنبا تكلا: https://st-takla.org

[مصادر مناهج الكرازة]
7. عند الإشارة لمناهج الخدمة، استخدم:
   - مناهج التربية الكنسية (كنيسة مارمرقس بطلخا)
   - مناهج مهرجان الكرازة القبطي السنوي
   - مناهج المجمع المقدس للكنيسة القبطية الأرثوذكسية

[قواعد الآيات الكتابية]
8. لا تؤلف أو تستنتج آيات من ذاكرتك — فقط اذكر الشاهد (السفر والإصحاح والعدد) بدقة.
9. إذا ذكرت آية، اذكرها بنصها المضبوط مع الشاهد كاملاً.

[قواعد المخرجات — مهم جداً]
10. ابدأ الرد مباشرة بالمحتوى — بدون أي مقدمة أو تحية أو "بالتأكيد" أو "إليك الدرس".
11. انتهِ عند نهاية المحتوى — بدون أي خاتمة أو "أتمنى أن يفيدك" أو "في حال احتجت".
12. الكلام يكون من الخادم للمخدومين مباشرة — أسلوب مباشر، واضح، بدون تعقيد.
13. إذا كان الطلب يخص مرحلة عمرية، اضبط الأسلوب:
    - أطفال (6-12): لغة بسيطة، قصص، أمثلة من الحياة اليومية
    - شباب (13-18): لغة عصرية، تحديات حياتية، حوار
    - خدام (18+): لغة أعمق، مراجع، تحليل

[ممنوع تماماً]
- ذكر تفاسير من طوائف أخرى (بروتستانت، كاثوليك، إلخ)
- استخدام كلمات من خارج الموروث الأرثوذكسي
- الابتكار العقائدي أو الاجتهاد الشخصي
- أي تحية أو مقدمة أو خاتمة في الرد
`;
```

---

## 3. النتيجة بدون مقدمة أو خاتمة {#3-no-intro-outro}

### المشكلة الحالية
الـ AI يرد بـ "بالتأكيد! إليك الدرس..." أو "أتمنى أن يفيدك هذا الدرس..." وهذا لا يُريد.

### الحل — في `api/notes/generate/route.ts`

```typescript
// أضف في نهاية الـ system prompt:
const systemPrompt = `
${NotesSystemPrompt}

[تعليمات نهائية حرجة]
- ابدأ ردك بالحرف الأول من المحتوى مباشرة، لا تكتب أي كلمة قبله.
- انتهِ بالكلمة الأخيرة من المحتوى مباشرة، لا تكتب أي كلمة بعده.
- إذا وجدت أي جملة بدت كمقدمة (مثل: بالتأكيد، إليك، حسناً، سأقدم لك...)، احذفها.
- إذا وجدت أي جملة بدت كخاتمة (مثل: أتمنى، نسأل الله، في حال...)، احذفها.
`;

// بعد استقبال الرد من الـ AI، نظّفه:
function cleanAIResponse(text: string): string {
  // إزالة مقدمات شائعة
  const intros = [
    /^(بالتأكيد[!،.]?\s*)/i,
    /^(إليك[^.]*[:.]\s*)/i,
    /^(حسناً[،.]\s*)/i,
    /^(سأقدم لك[^.]*[:.]\s*)/i,
    /^(فيما يلي[^.]*[:.]\s*)/i,
    /^(هذا هو[^.]*[:.]\s*)/i,
  ];
  
  // إزالة خواتم شائعة
  const outros = [
    /(\s*أتمنى[^.]*[.!])$/i,
    /(\s*نسأل الله[^.]*[.!])$/i,
    /(\s*في حال[^.]*[.!])$/i,
    /(\s*يسعدني[^.]*[.!])$/i,
    /(\s*لا تتردد[^.]*[.!])$/i,
  ];
  
  let cleaned = text.trim();
  intros.forEach(r => { cleaned = cleaned.replace(r, ""); });
  outros.forEach(r => { cleaned = cleaned.replace(r, ""); });
  
  return cleaned.trim();
}
```

---

## 4. الآيات والأقوال والصلاة اختيارية {#4-optional-elements}

### المطلوب
قبل توليد الدرس، يظهر للمستخدم checkboxes يختار منها ما يريد تضمينه:

```
☑ آيات كتابية
☑ أقوال آباء
☐ صلاة افتتاحية
☐ نشاط / تطبيق عملي
☑ خلاصة
```

### الكود في `app/notes/page.tsx`

```tsx
// State
const [options, setOptions] = useState({
  includeVerses: true,
  includeFatherQuotes: true,
  includePrayer: false,
  includeActivity: false,
  includeSummary: true,
});

// UI
<div className="bg-white/10 rounded-2xl p-1 space-y-0.5 mb-1">
  <h3 className="font-bold text-sm text-white/70 mb-0.5">عناصر الدرس</h3>
  {[
    { key: "includeVerses", label: "آيات كتابية", icon: "📖" },
    { key: "includeFatherQuotes", label: "أقوال آباء الكنيسة", icon: "✝️" },
    { key: "includePrayer", label: "صلاة افتتاحية / ختامية", icon: "🙏" },
    { key: "includeActivity", label: "نشاط أو تطبيق عملي", icon: "🎯" },
    { key: "includeSummary", label: "خلاصة الدرس", icon: "📝" },
  ].map(({ key, label, icon }) => (
    <label key={key} className="flex items-center gap-0.5 cursor-pointer">
      <input
        type="checkbox"
        checked={options[key as keyof typeof options]}
        onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
        className="accent-amber-400 w-2 h-2"
      />
      <span className="text-sm">{icon} {label}</span>
    </label>
  ))}
</div>

// في الـ API call، ضيف الـ options في الـ prompt
const optionsText = `
عناصر يجب تضمينها:
${options.includeVerses ? "✅ آيات كتابية — أضف آيات ذات صلة مع شواهدها" : "❌ بدون آيات كتابية"}
${options.includeFatherQuotes ? "✅ أقوال آباء — أضف قولاً أو اثنين من آباء الكنيسة" : "❌ بدون أقوال آباء"}
${options.includePrayer ? "✅ صلاة — أضف صلاة قصيرة في البداية أو النهاية" : "❌ بدون صلاة"}
${options.includeActivity ? "✅ نشاط — أضف نشاطاً تطبيقياً مناسباً للمرحلة" : "❌ بدون نشاط"}
${options.includeSummary ? "✅ خلاصة — أختم بخلاصة مختصرة في 3 نقاط" : "❌ بدون خلاصة"}
`;
```

---

## 5. Sidebar لحفظ الدروس {#5-lessons-sidebar}

### المطلوب
Sidebar على غرار ChatBot يحتوي على كل الدروس المحفوظة — الضغط على أي درس يعيد فتحه كاملاً مع النوتة والمخرجات.

### هيكل Supabase

```sql
-- جدول الدروس
CREATE TABLE lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  note_content TEXT,          -- محتوى النوتة الأصلية
  requirements JSONB,         -- { age, duration, style, topic }
  options JSONB,              -- { includeVerses, includePrayer, ... }
  generated_content TEXT,     -- المحتوى المولّد من الـ AI
  extra_sources TEXT[],       -- مصادر إضافية أضافها الخادم
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_lesson" ON lesson_notes
  USING (auth.uid() = user_id);
```

### الكود — `components/notes/LessonsSidebar.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, X, PanelRight } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  created_at: string;
  note_content: string;
  requirements: any;
  options: any;
  generated_content: string;
  extra_sources: string[];
}

export default function LessonsSidebar({
  onSelectLesson,
  onNewLesson,
  currentLessonId,
}: {
  onSelectLesson: (lesson: Lesson) => void;
  onNewLesson: () => void;
  currentLessonId?: string;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_notes")
      .select("id, title, created_at, note_content, requirements, options, generated_content, extra_sources")
      .order("created_at", { ascending: false });
    if (data) setLessons(data);
    setLoading(false);
  };

  useEffect(() => { fetchLessons(); }, []);

  const deleteLesson = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("حذف هذا الدرس؟")) return;
    await supabase.from("lesson_notes").delete().eq("id", id);
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  return (
    <>
      {/* زرار فتح الـ Sidebar */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-1 right-1 z-40 p-0.5 bg-amber-600/90 text-white rounded-full shadow-lg backdrop-blur-md"
      >
        <PanelRight size={20} />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-zinc-900 text-white z-50 flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-1 border-b border-zinc-700 flex justify-between items-center">
                <h2 className="font-bold text-lg">الدروس المحفوظة</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              {/* زرار درس جديد */}
              <button
                onClick={() => { onNewLesson(); setIsOpen(false); }}
                className="mx-1 mt-1 p-0.5 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold flex items-center justify-center gap-0.5 transition"
              >
                <Plus size={16} /> درس جديد
              </button>

              {/* قائمة الدروس */}
              <div className="flex-1 overflow-y-auto p-0.5 space-y-0.25 mt-1">
                {loading ? (
                  <p className="text-center text-zinc-500 text-sm py-1">جاري التحميل...</p>
                ) : lessons.length === 0 ? (
                  <p className="text-center text-zinc-500 text-sm py-1">لا توجد دروس محفوظة بعد</p>
                ) : (
                  lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      onClick={() => { onSelectLesson(lesson); setIsOpen(false); }}
                      className={`p-0.5 rounded-xl cursor-pointer flex justify-between items-start group transition-all ${
                        currentLessonId === lesson.id
                          ? "bg-amber-600/30 border border-amber-500/50"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-0.25">
                          <BookOpen size={12} className="text-amber-400 shrink-0" />
                          <p className="font-semibold text-sm truncate">{lesson.title}</p>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.25">
                          {new Date(lesson.created_at).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteLesson(lesson.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.25 text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### حفظ الدرس بعد التوليد

```typescript
// في app/notes/page.tsx — بعد نجاح التوليد
const saveLesson = async (generatedContent: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  const { data } = await supabase
    .from("lesson_notes")
    .insert({
      user_id: user.id,
      title: requirements.topic || `درس ${new Date().toLocaleDateString("ar-EG")}`,
      note_content: noteText,
      requirements,
      options,
      generated_content: generatedContent,
      extra_sources: extraSources,
    })
    .select("id")
    .single();
  
  if (data) setCurrentLessonId(data.id);
};
```

---

## 6. تفاصيل إضافية من الخادم {#6-extra-details}

### المطلوب
فيلد إضافي يظهر فيه الخادم أي تفاصيل إضافية يريدها الـ AI يأخذها في الاعتبار — سواء كانت نصاً مكتوباً أو مسجلاً بالصوت.

### الكود في `app/notes/page.tsx`

```tsx
// State
const [extraDetails, setExtraDetails] = useState("");

// UI — قسم التفاصيل الإضافية
<div className="bg-white/5 rounded-2xl p-1 mb-1">
  <h3 className="font-bold text-sm mb-0.5 flex items-center gap-0.25">
    ✨ تفاصيل إضافية للخادم
    <span className="text-xs text-white/50 font-normal mr-0.5">(اختياري)</span>
  </h3>
  <textarea
    value={extraDetails}
    onChange={(e) => setExtraDetails(e.target.value)}
    placeholder="مثال: عندي شباب بيعانوا من ضغط الدراسة، أو في الفريق حد مات قريبه، أو عايز أركز على نقطة معينة..."
    className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl p-0.5 text-sm resize-none border border-white/10 focus:border-amber-400/50 outline-none"
    rows={3}
  />
  
  {/* زرار التسجيل الصوتي */}
  <VoiceRecorderButton onTranscript={(text) => setExtraDetails(prev => prev + " " + text)} />
</div>

// في الـ Prompt
const extraDetailsSection = extraDetails.trim()
  ? `\n\n[تفاصيل إضافية من الخادم — مهم جداً]\n${extraDetails}`
  : "";
```

---

## 7. إصلاح PDF {#7-pdf-fix}

### المشكلة
توليد PDF بمكتبات مثل `pdf-lib` أو `@react-pdf/renderer` يفشل مع العربية (RTL، Fonts).

### الحل — HTML to PDF عبر Puppeteer أو استخدام `jsPDF` بشكل صحيح

**الطريقة الموصى بها: Vercel OG Image / HTML Snapshot**

```typescript
// app/api/notes/generate-pdf/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { htmlContent, title } = await req.json();
  
  // بنبني HTML كامل فيه الـ CSS الصح للعربية
  const fullHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Amiri', 'Traditional Arabic', serif;
      font-size: 16px;
      line-height: 2;
      color: #1a1a1a;
      direction: rtl;
      padding: 40px;
      background: white;
    }
    h1 { font-size: 28px; font-weight: 700; color: #7c2d12; margin-bottom: 20px; text-align: center; }
    h2 { font-size: 22px; font-weight: 700; color: #92400e; margin: 24px 0 12px; }
    h3 { font-size: 18px; font-weight: 700; color: #b45309; margin: 16px 0 8px; }
    p { margin-bottom: 12px; text-align: justify; }
    .verse {
      background: #fef3c7;
      border-right: 4px solid #d97706;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 4px;
      font-style: italic;
      color: #92400e;
    }
    .source {
      font-size: 12px;
      color: #6b7280;
      font-family: monospace;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      margin: 4px 0;
    }
    ul { padding-right: 24px; margin-bottom: 12px; }
    li { margin-bottom: 6px; }
    .page-header {
      text-align: center;
      border-bottom: 2px solid #d97706;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>${title}</h1>
    <p class="source">كنيسة السيدة العذراء مريم بالإسماعيلية — موقع أبونا فلتاؤس</p>
  </div>
  ${htmlContent}
  <div class="footer">
    تم إنشاء هذا الدرس بواسطة موقع أبونا فلتاؤس تفاحة
    | ${new Date().toLocaleDateString("ar-EG")}
  </div>
</body>
</html>
  `;
  
  // الطريقة 1: استخدام html2pdf.js في الـ Client Side (أسهل)
  // نرجع الـ HTML ونترك الـ Client يحوله
  return NextResponse.json({ html: fullHtml });
}
```

**في الـ Client Side:**

```tsx
import html2pdf from "html2pdf.js";

const downloadPDF = async () => {
  const res = await fetch("/api/notes/generate-pdf", {
    method: "POST",
    body: JSON.stringify({ htmlContent: generatedHTML, title: lessonTitle }),
  });
  const { html } = await res.json();
  
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  
  await html2pdf()
    .from(container)
    .set({
      margin: [10, 10, 10, 10],
      filename: `${lessonTitle}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .save();
  
  document.body.removeChild(container);
};
```

**package.json:**
```bash
npm install html2pdf.js
```

---

## 8. الخادم يضيف مصادر إضافية {#8-extra-sources}

### المطلوب
قسم في الـ UI يقدر الخادم يضيف فيه روابط أو نصوص كمصادر إضافية للـ AI يستند عليها.

### الكود

```tsx
// State
const [extraSources, setExtraSources] = useState<string[]>([""]);

// UI
<div className="bg-white/5 rounded-2xl p-1 mb-1">
  <h3 className="font-bold text-sm mb-0.5">📚 مصادر إضافية</h3>
  <p className="text-xs text-white/50 mb-0.5">
    أضف روابط أو نصوص من كتب أو مقالات تريد أن يعتمد عليها الذكاء الاصطناعي
  </p>
  
  {extraSources.map((source, i) => (
    <div key={i} className="flex gap-0.25 mb-0.25">
      <input
        type="text"
        value={source}
        onChange={(e) => {
          const updated = [...extraSources];
          updated[i] = e.target.value;
          setExtraSources(updated);
        }}
        placeholder="رابط أو نص مرجعي..."
        className="flex-1 bg-white/10 text-white text-sm rounded-lg px-0.5 py-0.25 border border-white/10 focus:border-amber-400/50 outline-none"
      />
      <button
        onClick={() => setExtraSources(prev => prev.filter((_, idx) => idx !== i))}
        className="text-red-400 hover:text-red-300 p-0.25"
      >✕</button>
    </div>
  ))}
  
  <button
    onClick={() => setExtraSources(prev => [...prev, ""])}
    className="text-amber-400 text-sm hover:text-amber-300 transition mt-0.25"
  >
    + إضافة مصدر
  </button>
</div>

// في الـ Prompt
const sourcesSection = extraSources.filter(s => s.trim()).length > 0
  ? `\n\n[مصادر إضافية يجب الاستناد عليها]\n${extraSources.filter(s => s.trim()).map((s, i) => `${i + 1}. ${s}`).join("\n")}`
  : "";
```

---

## 9. تسجيل الصوت + Fallback {#9-voice-recording}

### المشكلة
`MediaRecorder` + Eleven Labs أو ElevenLabs Arabic STT قد لا يشتغل على كل المتصفحات.

### الحل — `components/notes/VoiceRecorderButton.tsx`

```tsx
"use client";
import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function VoiceRecorderButton({
  onTranscript,
}: {
  onTranscript: (text: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError("");
    
    // === المحاولة الأولى: MediaRecorder + Eleven Labs ===
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setIsProcessing(true);
        
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        
        // إرسال للـ API
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        
        try {
          const res = await fetch("/api/notes/transcribe", { method: "POST", body: formData });
          
          if (!res.ok) throw new Error("API failed");
          
          const { transcript } = await res.json();
          onTranscript(transcript);
        } catch (apiError) {
          // === Fallback: Web Speech API ===
          console.warn("ElevenLabs failed, falling back to Web Speech API");
          startWebSpeechFallback();
        } finally {
          setIsProcessing(false);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000);
      setIsRecording(true);
      
    } catch (err) {
      // === Fallback: لو MediaRecorder مش شغال ===
      console.warn("MediaRecorder not available, using Web Speech API");
      startWebSpeechFallback();
    }
  };

  const startWebSpeechFallback = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("التسجيل الصوتي غير مدعوم على هذا المتصفح. يرجى الكتابة يدوياً.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-EG";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsRecording(false);
    };
    
    recognition.onerror = () => {
      setError("فشل التسجيل. يرجى المحاولة مرة أخرى أو الكتابة يدوياً.");
      setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`flex items-center gap-0.25 px-0.5 py-0.25 rounded-lg text-sm font-semibold transition-all ${
          isRecording
            ? "bg-red-500 text-white animate-pulse"
            : isProcessing
            ? "bg-zinc-600 text-zinc-400 cursor-wait"
            : "bg-amber-600/80 hover:bg-amber-600 text-white"
        }`}
      >
        {isProcessing ? (
          <><Loader2 size={14} className="animate-spin" /> جاري المعالجة...</>
        ) : isRecording ? (
          <><MicOff size={14} /> إيقاف التسجيل</>
        ) : (
          <><Mic size={14} /> تسجيل صوتي</>
        )}
      </button>
      
      {isRecording && (
        <span className="text-xs text-red-400 animate-pulse">🔴 جاري التسجيل...</span>
      )}
      
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
```

### API Route — `app/api/notes/transcribe/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get("audio") as Blob;
  
  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }
  
  // === المحاولة الأولى: Groq Whisper (مجاني وسريع جداً مع دعم عربي ممتاز) ===
  // Groq أسرع من ElevenLabs وأرخص
  try {
    const groqFormData = new FormData();
    groqFormData.append("file", audioFile, "audio.webm");
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("language", "ar");
    groqFormData.append("response_format", "json");
    
    const groqRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqFormData,
    });
    
    if (groqRes.ok) {
      const { text } = await groqRes.json();
      return NextResponse.json({ transcript: text });
    }
  } catch (err) {
    console.warn("Groq Whisper failed, trying ElevenLabs...");
  }
  
  // === Fallback: ElevenLabs STT ===
  try {
    const elFormData = new FormData();
    elFormData.append("audio", audioFile, "audio.webm");
    
    const elRes = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY! },
      body: elFormData,
    });
    
    if (elRes.ok) {
      const { text } = await elRes.json();
      return NextResponse.json({ transcript: text });
    }
  } catch (err) {
    console.warn("ElevenLabs failed");
  }
  
  // === Fallback أخير: إرجاع خطأ والـ Client يستخدم Web Speech API ===
  return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
}
```

**ملاحظة:** Groq Whisper موصى به بدلاً من ElevenLabs لأنه:
- أسرع بكثير
- مجاني tier كافي للاستخدام العادي
- دعم عربي ممتاز
- `.env`: `GROQ_API_KEY=gsk_...`

---

## 10. صفحة الألحان — Dynamic Columns للغات {#10-hymns-columns}

### المشكلة
في `app/al7an/page.tsx`، عند إخفاء لغة من الـ checkboxes، الأعمدة لا تأخذ المساحة المتاحة.

### الملف المعني
`app/al7an/page.tsx` — قسم عرض كلمات اللحن داخل `selectedHymn`.

### الحل

```tsx
// حساب عدد الأعمدة الفعلية
const activeLanguages = [
  showAr && "ar",
  showArCopt && "ar_copt",
  showCopt && "copt",
].filter(Boolean);

const colsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
}[activeLanguages.length] ?? "grid-cols-1";

// في الـ verses map — بدل الـ flex القديم
{selectedHymn.verses && selectedHymn.verses.length > 0 ? (
  selectedHymn.verses.map((verse, index) => {
    const bgClass = index % 2 === 0 ? "bg-white/10" : "bg-white/5";
    
    return (
      <div
        key={index}
        className={`p-0.25 rounded-lg border border-white/5 transition-all ${bgClass} ${
          layoutMode === "cols"
            ? `grid ${colsClass} divide-x divide-x-reverse divide-white/20`
            : "flex flex-col gap-0.25 text-center"
        }`}
      >
        {/* عربي */}
        {showAr && verse.ar && (
          <div className="flex-1 flex items-center justify-center text-base font-bold text-white whitespace-pre-wrap leading-relaxed px-0.25">
            {verse.ar}
          </div>
        )}

        {/* قبطي معرب */}
        {showArCopt && verse.ar_copt && (
          <div className="flex-1 flex items-center justify-center text-base font-serif text-white/80 whitespace-pre-wrap px-0.25">
            {verse.ar_copt}
          </div>
        )}

        {/* قبطي */}
        {showCopt && verse.copt && (
          <div className="flex-1 flex items-center justify-center text-lg font-coptic tracking-wide text-white/90 whitespace-pre-wrap px-0.25">
            {verse.copt}
          </div>
        )}
      </div>
    );
  })
) : (/* ... existing fallback ... */)}
```

### المنطق بالتفصيل

| اللغات المفعّلة | عدد الأعمدة | الكلاس |
|----------------|-------------|--------|
| 3 لغات | 3 | `grid-cols-3` |
| 2 لغات | 2 | `grid-cols-2` |
| 1 لغة | 1 | `grid-cols-1` |

### الـ Checkboxes — تأكد من وجود حماية ضد إلغاء الكل

```tsx
// منع إلغاء كل اللغات دفعة واحدة
const handleLangChange = (lang: "ar" | "copt" | "arCopt", value: boolean) => {
  const current = { showAr, showCopt, showArCopt };
  const updated = { ...current };
  
  if (lang === "ar") updated.showAr = value;
  if (lang === "copt") updated.showCopt = value;
  if (lang === "arCopt") updated.showArCopt = value;
  
  // لو كل الخيارات هتكون false، ارفض التغيير
  if (!updated.showAr && !updated.showCopt && !updated.showArCopt) return;
  
  setShowAr(updated.showAr);
  setShowCopt(updated.showCopt);
  setShowArCopt(updated.showArCopt);
};

// في الـ checkboxes
<label className="flex items-center gap-0.25 cursor-pointer text-sm">
  <input
    type="checkbox"
    checked={showAr}
    onChange={(e) => handleLangChange("ar", e.target.checked)}
    className="accent-orange-500 w-2 h-2"
  />
  عربي
</label>
<label className="flex items-center gap-0.25 cursor-pointer text-sm font-coptic">
  <input
    type="checkbox"
    checked={showCopt}
    onChange={(e) => handleLangChange("copt", e.target.checked)}
    className="accent-orange-500 w-2 h-2"
  />
  قبطي
</label>
<label className="flex items-center gap-0.25 cursor-pointer text-sm" dir="ltr">
  <input
    type="checkbox"
    checked={showArCopt}
    onChange={(e) => handleLangChange("arCopt", e.target.checked)}
    className="accent-orange-500 w-2 h-2"
  />
  معرب
</label>
```

---

## 🗂️ ملخص الملفات المطلوب إنشاؤها أو تعديلها

| الملف | العملية | السبب |
|-------|---------|-------|
| `lib/notes-prompt.ts` | **إنشاء** | Prompt أرثوذكسي للنوتة الذكية |
| `app/notes/page.tsx` | **تعديل** | الصفحة الرئيسية للنوتة الذكية |
| `components/notes/LessonsSidebar.tsx` | **إنشاء** | Sidebar الدروس المحفوظة |
| `components/notes/VoiceRecorderButton.tsx` | **إنشاء** | زرار التسجيل الصوتي مع Fallback |
| `app/api/notes/generate/route.ts` | **إنشاء** | API توليد المحتوى |
| `app/api/notes/generate-pdf/route.ts` | **إنشاء** | API توليد PDF |
| `app/api/notes/generate-pptx/route.ts` | **إنشاء** | API توليد PowerPoint |
| `app/api/notes/transcribe/route.ts` | **إنشاء** | API تحويل الصوت لنص |
| `app/al7an/page.tsx` | **تعديل** | إصلاح الأعمدة الديناميكية |

---

## 📦 Packages المطلوب تثبيتها

```bash
npm install pptxgenjs html2pdf.js
# pptxgenjs: توليد PowerPoint
# html2pdf.js: تحويل HTML إلى PDF مع دعم العربية

# لو هتستخدم Groq Whisper (موصى به):
# أضف GROQ_API_KEY في .env.local
```

---

## 🔑 Environment Variables المطلوبة

```env
# .env.local
GROQ_API_KEY=gsk_...              # لتحويل الصوت لنص (Groq Whisper)
ELEVENLABS_API_KEY=...            # Fallback لتحويل الصوت (اختياري)
```

---

*تم إنشاء هذا الملف بتاريخ: السبت — Saturday Edits*
*ترتيب التنفيذ الموصى به: 10 ← 3 ← 4 ← 2 ← 7 ← 9 ← 5 ← 6 ← 8 ← 1*
