# 📋 خطة العمل — أبونا فلتاؤس
**التاريخ:** الأسبوع القادم
**إجمالي المهام:** 23 مهمة مقسمة على 5 أيام

---

## 🗓️ اليوم الأول — الاختبارات والمصادقة (Auth + Tests)

### 1. Unit Tests شاملة
**الأولوية:** 🔴 عالية
**الملفات المتأثرة:** `/lib/`, `/app/api/`, `/components/`

**التفاصيل:**
```
- اكتب tests لـ lib/supabase.ts (singleton pattern)
- اكتب tests لـ lib/bible-utils.ts (loadBible, normalizeArabic)
- اكتب tests لـ lib/supabase-utils.ts (createQuiz, updateQuiz, deleteQuiz)
- اكتب tests لـ app/api/chat/route.ts (POST handler)
- اكتب tests لـ app/api/daily-verse/route.ts
- اكتب tests لـ components/bible/BibleSearch.tsx (normalizeArabic + handleSearch)
- اكتب tests لـ components/quiz/CreateQuizDialog.tsx (validateAndSubmit)
```

**الأدوات:** Jest + React Testing Library
**الملف الموجود:** `package.json` → `"test": "jest --watchAll=false --passWithNoTests"`

**خطوات التنفيذ:**
```bash
# إنشاء مجلد الاختبارات
mkdir -p __tests__/lib __tests__/api __tests__/components

# مثال على اختبار supabase-utils
# __tests__/lib/supabase-utils.test.ts
```

---

### 2. صفحة auth/profile — إزالة الهيدر + زرار Back + تصغير المقاسات
**الأولوية:** 🔴 عالية
**الملف:** `app/auth/profile/page.tsx` + `components/AccountInfo.tsx`

**التغييرات المطلوبة:**
```tsx
// app/auth/profile/page.tsx
// 1. احذف <LogoHeader /> من الصفحة
// 2. أضف زرار Back في أعلى AccountInfo
// 3. قلل padding و margin للكارت

// في AccountInfo.tsx:
// - الكارت: max-w-sm بدل max-w-md
// - أضف زرار رجوع في أعلى الكارت:
<button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-stone-500 mb-2 hover:text-stone-800">
  <FaArrowRight size={14} /> رجوع
</button>
// - قلل p-1 → p-0.5 في CardContent
// - الصورة: w-16 h-16 بدل w-24 h-24
```

---

### 3. auth/signup — تحسين Error Handling للباسورد
**الأولوية:** 🔴 عالية
**الملف:** `app/auth/signup/page.tsx`

**التغييرات:**
```tsx
// أضف state للـ password errors
const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

// دالة validation
const validatePassword = (pass: string) => {
  const errors = [];
  if (pass.length < 8) errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
  if (!/[A-Z]/.test(pass)) errors.push("يجب أن تحتوي على حرف كبير واحد على الأقل");
  if (!/[0-9]/.test(pass)) errors.push("يجب أن تحتوي على رقم واحد على الأقل");
  return errors;
};

// Strength indicator مرئي:
// ضعيف (أحمر) / متوسط (برتقالي) / قوي (أخضر)
// أضف progress bar تحت input الباسورد

// في handleSignUp، قبل الإرسال:
const errors = validatePassword(password);
if (errors.length > 0) {
  setPasswordErrors(errors);
  setLoading(false);
  return;
}
```

---

### 4. auth/signin — تحسينات UI/UX
**الأولوية:** 🟡 متوسطة
**الملف:** `app/auth/signin/page.tsx`

**التغييرات:**
```
- أضف "تذكرني" checkbox
- أضف "نسيت كلمة المرور؟" link → /auth/reset-password
- حسن رسائل الخطأ (ترجمة أخطاء Supabase للعربية)
- أضف loading spinner على زرار Google
- أضف animation خفيفة للكارت (framer-motion)
- أضف مؤشر قوة الاتصال (يعرض رسالة لو offline)
- حسن التباعد والخطوط
- أضف "أو سجل بـ Google" بشكل أوضح مع الأيقونة
```

---

## 🗓️ اليوم الثاني — الصفحة الرئيسية + الكتاب المقدس

### 5. الشواهد تبقى عربي (الرئيسية + الإشعارات)
**الأولوية:** 🔴 عالية
**الملفات:**
- `app/api/daily-verse/route.ts`
- `app/api/daily-quote/route.ts`

**التغيير:**
```ts
// في daily-verse/route.ts — السطر الذي يبني notificationBody
// حاليًا:
const notificationBody = `(${verse.verse_number}) ${verse.vocalized_text} ${reference}`;
// يبقى كذا ✅ (عربي بالفعل)

// في daily-quote/route.ts
// حاليًا:
const message = `☦️ ${quoteEntry.quote}\n👤 ${quoteEntry.author}`;
// يبقى كذا ✅ (عربي بالفعل)

// المشكلة في headings:
// حاليًا: headings: { en: "آية اليوم", ar: "آية اليوم" }
// تأكد إن content بالعربي وليس en فقط
// أضف: contents: { ar: notificationBody } بدل en
```

---

### 6. صفحة الكتاب المقدس — عرض الآيات يأخذ العرض كامل
**الأولوية:** 🔴 عالية
**الملف:** `components/bible/VerseItem.tsx`

**التغيير:**
```tsx
// السطر الحالي:
className="space-y-0 text-xl md:text-2xl leading-loose font-arabic px-0.5 max-w-8xl mx-auto"

// يصبح:
className="space-y-0 text-xl md:text-2xl leading-loose font-arabic px-0.5 max-w-8xl mx-auto w-full"
```

---

### 7. الصفحة الرئيسية — كاش السيشن (منع flash تسجيل الدخول)
**الأولوية:** 🔴 عالية
**الملف:** `components/home/HomeClient.tsx`

**المشكلة:** كل مرة بتحمل بيظهر "برجاء تسجيل الدخول" ثم يتغير للاسم.

**الحل:**
```tsx
// في بداية الكومبوننت، اقرأ الـ session من localStorage أولاً:
const [user, setUser] = useState<any>(() => {
  // تحقق سريع من session مخزنة
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('sb-user-cache');
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }
  return null; // null = لا يعرض أي حاجة حتى يتأكد
});

// في checkUser:
const checkUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const currentUser = session?.user || null;
  setUser(currentUser);
  if (currentUser) {
    localStorage.setItem('sb-user-cache', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('sb-user-cache');
  }
};

// أضف listener على auth state change لتحديث الكاش
```

---

### 8. صفحة الكتاب المقدس — TTS مش شغال
**الأولوية:** 🔴 عالية
**الملفات:** `app/api/tts/route.ts`, `components/bible/BibleSidebar.tsx`

**التشخيص والحل:**
```
المشكلة: msedge-tts قد يكون محجوب على Vercel serverless

الحل البديل:
1. استخدم Web Speech API في المتصفح مباشرة (بدون API call):
   - في BibleSidebar.tsx، في toggleAudio:
   - لو السيرفر فشل، استخدم مباشرة speechSynthesis

2. أو استبدل msedge-tts بـ edge-tts-node

3. الحل الأسرع — استخدم browser-only TTS:
```
```tsx
// في toggleAudio في BibleSidebar.tsx
// احذف الـ fetch('/api/tts') واستخدم مباشرة:
const utterance = new SpeechSynthesisUtterance(textToRead);
utterance.lang = 'ar-EG';
const voices = window.speechSynthesis.getVoices();
const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
if (arabicVoice) utterance.voice = arabicVoice;
window.speechSynthesis.speak(utterance);
setIsPlaying(true);
```

---

### 13. بعد إنشاء اجتماع — لا يودي للعرض على طول
**الأولوية:** 🟡 متوسطة
**الملف:** `app/bible/day/page.tsx`

**التغيير في handleCreateDay:**
```tsx
// احذف:
router.push(`/bible/day/${newCode}`);

// استبدل بـ:
// أظهر الكود للمستخدم أولاً وخليه يدوس "عرض" بنفسه
// أو redirect لـ /bible/day (صفحة القائمة) مش للعرض المباشر
router.push(`/bible/day`); // يرجع للقائمة اللي فيها الكود الجديد
// الكود الجديد هيظهر في history تلقائياً عشان saveHistory بتتنادى
```

---

### 14. Dialog إضافة إلى اليوم — تحسين الشكل والرسائل
**الأولوية:** 🟡 متوسطة
**الملف:** `components/bible/DayModal.tsx`

**التغييرات:**
```tsx
// 1. حسن شكل الـ Dialog:
//    - أضف عنوان واضح "إضافة الآية إلى اجتماع"
//    - أضف وصف "أدخل كود الاجتماع المكون من 12 رقم"
//    - كبر الـ input وحسن الـ font

// 2. بعد الإضافة الناجحة:
// احذف: setDayMessage("تمت الإضافة بنجاح!");
// استبدل بـ:
toast.success(`تمت الإضافة بنجاح إلى اجتماع "${dayData.title}"`);
// ثم أقفل الـ dialog

// 3. أضف زرار "نسخ الكود الأخير" لو عنده كود محفوظ
const lastCode = localStorage.getItem("last_day_code");
```

---

### 15. زرار "تفسير" في الكتاب المقدس → يودي للشات مع الآية
**الأولوية:** 🟡 متوسطة
**الملف:** `components/bible/SelectionToolbar.tsx`

**التغيير:**
```tsx
// في SelectionToolbar، أضف زرار تفسير:
import { useRouter } from 'next/navigation';
const router = useRouter();

// دالة التفسير:
const handleExplain = () => {
  const text = getSelectedText();
  const prompt = encodeURIComponent(`تفسير: ${text}`);
  router.push(`/chat?prompt=${prompt}`);
  setSelectedVerses([]);
};

// في الـ JSX أضف:
<button onClick={handleExplain} className="w-3 h-3 flex flex-col items-center justify-center rounded-xl text-green-400 hover:bg-white/10 transition-colors">
  <FaBook size={18} />
  <span className="text-[11px] font-bold mt-0.5">تفسير</span>
</button>

// في صفحة /chat/page.tsx، اقرأ الـ query param:
// const searchParams = useSearchParams();
// const initialPrompt = searchParams.get('prompt');
// وضعها كـ initial value في الـ input
```

---

## 🗓️ اليوم الثالث — صفحة الألحان

### 9. صفحة الألحان — cols حتى للحن واحد
**الأولوية:** 🟡 متوسطة
**الملف:** `app/al7an/page.tsx` (UnifiedAl7anClient)

**المشكلة:** `layoutMode === "cols"` بس الـ flex مش شغال صح لو عنده جزء واحد

**الحل:**
```tsx
// في عرض الكلمات، الـ div الخاص بالـ verse:
// احذف الشرط اللي بيحكم على عدد الأعمدة
// واعمل دايمًا:
className={`p-0.25 rounded-lg border border-white/5 transition-all bg-white/10 ${
  layoutMode === "cols"
    ? "flex flex-row divide-x divide-x-reverse divide-white/20 items-stretch w-full min-h-[60px]"
    : "flex flex-col gap-0.25 text-center"
}`}

// كل لغة تاخد flex-1 بغض النظر عن عدد اللغات المفعلة
// الـ min-width لكل عمود: min-w-0 (لمنع overflow)
```

---

### 10. صفحة الألحان — المشاركة تشارك اللينك مع اسم اللحن والمناسبة
**الأولوية:** 🟡 متوسطة
**الملف:** `app/al7an/page.tsx`

**تحسين handleShare:**
```tsx
const handleShare = async () => {
  if (!selectedHymn) return;

  const monasbaLabel = monasbaName[activeMonasba as keyof typeof monasbaName] ?? activeMonasba;

  const shareData = {
    title: `${selectedHymn.name} — ${monasbaLabel}`,
    text: `🎵 ${selectedHymn.name}\n📅 مناسبة: ${monasbaLabel}\n\nاستمع من موقع أبونا فلتاؤس:`,
    url: `${window.location.origin}/al7an/${encodeURIComponent(activeMonasba)}`,
  };

  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast.success("تم نسخ رابط اللحن!");
    }
  } catch (err) {
    console.error(err);
  }
};
```

---

### 11. صفحة الألحان — تكبير/تصغير + تحكم بالكيبورد على الكمبيوتر
**الأولوية:** 🟢 منخفضة
**الملف:** `app/al7an/page.tsx`

**الإضافات:**
```tsx
// 1. أضف state للـ font size:
const [lyricsFontSize, setLyricsFontSize] = useState(16);

// 2. أضف زراري تكبير/تصغير في الـ header (على الكمبيوتر فقط):
<div className="hidden lg:flex items-center gap-1">
  <button onClick={() => setLyricsFontSize(s => Math.max(12, s - 2))} className="text-white/60 hover:text-white px-1 py-0.5 bg-white/10 rounded text-sm">A-</button>
  <span className="text-white/50 text-xs">{lyricsFontSize}px</span>
  <button onClick={() => setLyricsFontSize(s => Math.min(32, s + 2))} className="text-white/60 hover:text-white px-1 py-0.5 bg-white/10 rounded text-sm">A+</button>
</div>

// 3. Keyboard shortcuts:
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedHymn) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // تنقل بين الألحان
      const hymns = merged[activeMonasba] || [];
      const currentIdx = hymns.findIndex(h => h.name === selectedHymn.name);
      if (e.key === 'ArrowRight' && currentIdx > 0) {
        setSelectedHymn(hymns[currentIdx - 1]);
      }
      if (e.key === 'ArrowLeft' && currentIdx < hymns.length - 1) {
        setSelectedHymn(hymns[currentIdx + 1]);
      }
    }
    if (e.key === ' ') {
      e.preventDefault();
      togglePlay();
    }
    if (e.key === '+' || e.key === '=') setLyricsFontSize(s => Math.min(32, s + 2));
    if (e.key === '-') setLyricsFontSize(s => Math.max(12, s - 2));
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [selectedHymn, activeMonasba, isPlaying]);
```

---

### 12. صفحة الألحان — لا تخفي كل اللغات (على الأقل لغة واحدة)
**الأولوية:** 🔴 عالية
**الملف:** `app/al7an/page.tsx`

**الحل:**
```tsx
// في onChange كل checkbox:
// منع إخفاء اللغات لو مفيش لغة تانية مفعلة

const activeCount = [showAr, showCopt, showArCopt].filter(Boolean).length;

<input
  type="checkbox"
  checked={showAr}
  onChange={e => {
    // لو هيلغي التيك ومفيش غيره، امنعه
    if (!e.target.checked && activeCount <= 1) return;
    setShowAr(e.target.checked);
  }}
/>

// نفس المنطق لـ showCopt و showArCopt
```

---

## 🗓️ اليوم الرابع — المسابقة (Quiz/Kahoot)

### 21. مسابقة كاهوت — تاريخ الإنشاء "Invalid Date"
**الأولوية:** 🔴 عالية
**الملف:** `components/quiz/QuizCard.tsx`

**المشكلة:**
```tsx
// في QuizCard:
const createdDate = new Date(quiz.createdAt).toLocaleDateString('ar-EG');
// قد يكون quiz.createdAt undefined أو بصيغة غير صحيحة

// الحل:
const rawDate = quiz.created_at || quiz.createdAt;
const createdDate = rawDate
  ? new Date(rawDate).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  : 'غير محدد';
```

**في supabase-utils.ts:**
```ts
// في getUserQuizzes، تأكد إن الـ mapping صح:
return (data || []).map(q => ({
  ...q,
  id: q.id,
  created_at: q.created_at, // ← احتفظ بالـ snake_case
  createdAt: new Date(q.created_at), // ← وحوّله
}));
```

---

### 22. مسابقة كاهوت — Dashboard UI/UX
**الأولوية:** 🔴 عالية
**الملف:** `app/exam/quiz/dashboard/page.tsx` + `components/quiz/QuizCard.tsx`

**التحسينات:**
```
Dashboard:
- أضف header واضح مع إحصائيات (عدد المسابقات، إجمالي الأسئلة)
- أضف search/filter للمسابقات
- حسن شبكة الكروت (responsive أفضل)
- أضف skeleton loading بدل النص العادي
- أضف empty state جميل لو مفيش مسابقات

QuizCard:
- أضف badge "جديد" للمسابقات الأحدث من أسبوع
- أضف عدد الفرق اللي لعبتها من قبل (لو متاح)
- حسن أزرار Edit/Delete (icon buttons أوضح)
- أضف tooltip على الأزرار
- حسن estimated time display
```

---

### 23. مسابقة كاهوت — كود المسابقة للـ Join
**الأولوية:** 🔴 عالية
**الملف:** `app/exam/quiz/quiz/[quizId]/host/page.tsx`

**المشكلة:** مفيش كود مخصص غير الـ UUID الطويل.

**الحل — أضف كود قصير:**
```ts
// في lib/supabase-utils.ts، في createQuiz:
// أضف عمود join_code في جدول quizzes (6 أرقام)
const joinCode = Math.floor(100000 + Math.random() * 900000).toString();

// في الـ insert:
await supabase.from("quizzes").insert([{
  ...quizData,
  join_code: joinCode,
}]);

// في صفحة الـ host، أظهر الكود بشكل واضح:
<div className="text-center bg-yellow-400 text-black p-2 rounded-2xl">
  <p className="text-sm font-bold">كود الدخول</p>
  <p className="text-7xl font-black tracking-widest">{quiz.join_code}</p>
  <p className="text-xs opacity-70">أدخل هذا الكود في صفحة الانضمام</p>
</div>

// في صفحة الجوين، أضف خيار Join بالكود القصير:
// بدل UUID → اقبل كود 6 أرقام
const { data } = await supabase
  .from("quizzes")
  .select("id")
  .eq("join_code", enteredCode)
  .single();
if (data) router.push(`/exam/quiz/quiz/${data.id}/join`);
```

---

## 🗓️ اليوم الخامس — التنظيف وصفحة المقالات والمراجعات

### 16. صفحة المقالات — ما يظهرش بعد الإرسال
**الأولوية:** 🟡 متوسطة
**الملف:** `app/review/ReviewClient.tsx`

**المشكلة:** بعد الإرسال مظهرش الرسالة في القائمة

**الحل:**
```tsx
// في handleSubmit، بعد الإرسال الناجح:
if (response.ok) {
  setFeedback('');
  setRating(null);
  await fetchHistory(); // ← هذه موجودة، تأكد إنها تشتغل

  // أضف رسالة نجاح مرئية:
  toast.success("تم إرسال مقالتك بنجاح! شكراً لمشاركتك.");
}

// تأكد إن fetch('/api/feedback') GET بترجع البيانات صح
// في app/api/feedback/route.ts GET:
// المشكلة المحتملة: الـ query بتفلتر على user_id
// لو المستخدم مش logged in، مش هيشوف حاجة
// الحل: أضف fallback لو مش logged in
```

---

### 17 + 18. مسح ملفات الألحان والمقالات القديمة
**الأولوية:** 🟡 متوسطة

**الملفات للحذف:**
```bash
# ملفات الألحان المكررة/القديمة:
rm app/al7an/page\ copy.tsx
rm app/al7an/Al7anClient.tsx  # لو اتستبدل بـ UnifiedAl7anClient

# ملفات makalat:
# ابحث عن مجلد app/mkalat وامسحه
rm -rf app/mkalat/

# ملفات components قديمة:
rm components/PrayerViewerOld.tsx
```

---

### 19. صفحة review + Admin بالإيميل
**الأولوية:** 🟡 متوسطة
**الملفات:** `app/review/`, `app/admin/reviews/page.tsx`

**للـ Review Page:**
```
- تأكد إن صفحة /review شغالة بشكل صحيح
- الـ API /api/feedback يرجع البيانات بعد الإرسال
- أضف Toaster في الصفحة لو مش موجود
```

**للـ Admin:**
```tsx
// في app/admin/reviews/page.tsx:
// الكود الحالي يتحقق من الإيميل من process.env.NEXT_PUBLIC_GMAIL ✅
// تأكد إن المتغير موجود في .env.local و Vercel

// أضف في AdminReviewsClient.tsx:
// زرار Reply يعمل بشكل صحيح
// أنشئ /api/admin/reply route:
```
```ts
// app/api/admin/reply/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, reply } = await req.json();
  const supabase = await createClient();

  await supabase
    .from('feedback')
    .update({ admin_reply: reply })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
```

---

### 20. إلغاء OneSignal رسالة الإيميل
**الأولوية:** 🟡 متوسطة
**الملف:** `components/OneSignal.tsx`

**التغيير:**
```tsx
// في OneSignal.init():
// أضف:
notifyButton: { enable: false },
promptOptions: {
  slidedown: {
    prompts: [{
      type: "push",
      // احذف أو عطل email channel:
      // autoPrompt: false,  // لا تطلب الإيميل تلقائياً
    }]
  }
},
// أو أضف خيار channel_count:
// channels: { email: false } // لو متاح في الـ SDK
```

---

## 📊 ملخص الأولويات

| # | المهمة | الأولوية | اليوم | الوقت المقدر |
|---|--------|----------|-------|--------------|
| 1 | Unit Tests | 🔴 عالية | 1 | 4 ساعات |
| 2 | profile page | 🔴 عالية | 1 | 1 ساعة |
| 3 | signup password errors | 🔴 عالية | 1 | 1.5 ساعة |
| 4 | signin UI/UX | 🟡 متوسطة | 1 | 2 ساعة |
| 5 | الشواهد عربي | 🔴 عالية | 2 | 30 دقيقة |
| 6 | VerseItem w-full | 🔴 عالية | 2 | 5 دقائق |
| 7 | Session Cache | 🔴 عالية | 2 | 1 ساعة |
| 8 | TTS fix | 🔴 عالية | 2 | 1 ساعة |
| 9 | Hymns cols 1 item | 🟡 متوسطة | 3 | 30 دقيقة |
| 10 | Hymns share | 🟡 متوسطة | 3 | 30 دقيقة |
| 11 | Hymns keyboard | 🟢 منخفضة | 3 | 2 ساعة |
| 12 | Hymns min 1 lang | 🔴 عالية | 3 | 20 دقيقة |
| 13 | Bible day no redirect | 🟡 متوسطة | 2 | 15 دقيقة |
| 14 | DayModal UI | 🟡 متوسطة | 2 | 1 ساعة |
| 15 | تفسير button | 🟡 متوسطة | 2 | 30 دقيقة |
| 16 | مقالات after submit | 🟡 متوسطة | 5 | 30 دقيقة |
| 17 | حذف ملفات الألحان | 🟡 متوسطة | 5 | 15 دقيقة |
| 18 | حذف makalat | 🟡 متوسطة | 5 | 10 دقيقة |
| 19 | Review + Admin | 🟡 متوسطة | 5 | 2 ساعة |
| 20 | OneSignal email | 🟡 متوسطة | 5 | 30 دقيقة |
| 21 | Quiz Invalid Date | 🔴 عالية | 4 | 20 دقيقة |
| 22 | Quiz Dashboard UI | 🔴 عالية | 4 | 3 ساعة |
| 23 | Quiz Join Code | 🔴 عالية | 4 | 2 ساعة |

---

## ⚠️ تنبيهات مهمة

### قبل البداية:
1. **Supabase Migration** — مهمة 23 (كود المسابقة) تحتاج migration جديدة:
   ```sql
   ALTER TABLE quizzes ADD COLUMN join_code VARCHAR(6) UNIQUE;
   UPDATE quizzes SET join_code = LPAD(FLOOR(RANDOM() * 900000 + 100000)::text, 6, '0');
   ```

2. **Environment Variables** — تأكد من وجود:
   ```
   NEXT_PUBLIC_GMAIL=your@email.com
   CRON_SECRET=your-secret
   ONESIGNAL_REST_API_KEY=...
   NEXT_PUBLIC_ONESIGNAL_APP_ID=...
   ```

3. **Build Test** — بعد كل مجموعة من التغييرات:
   ```bash
   npm run build
   npm run type-check
   ```

### ترتيب التنفيذ المقترح (لو وقت ضيق):
```
Priority 1: 7, 8 (حل مشاكل UX أساسية)
Priority 2: 23, 22 (المسابقة - الأهم للمستخدمين)
Priority 3: 9, 10, 11, 13, 14, 15 (تحسينات)
Priority 4: 1, 16, 17, 18, 19 (تنظيف وتوثيق)
```

---

*آخر تحديث: أُنشئ تلقائياً بناءً على تحليل الكود*


## الي تم الوصول اليه
# متبقي
1. عايز Test كامل زيUnit
واسم المستخدم عادي
14. لما يدوس علي زرار اضافة الي اليوم بيظهر dialog لايزم يبقي شكةواضح اكتر ولما يضيف الاية يكتبلةتم الاضافة بنجاح الي اجتماع (اسم الاجتماع) وتتقفل الdialog عادي
15. في صفحة الكتاب المقدس لما اختار آية جمب زراير مشاركة تضيف زرار تفسير فيودية لصفحة شات بوت /chat ويكون حاطط الآية في البرمب المستخدم وقبلية كلمة تفسير
16. في صحة المقالات بعد ما كتبت مقال جابلي رسالة تم ارسال المقال بنجاح وبعد كده مظهرش اي حاجة
19. اشغل صفحة review واشغل الادمن الي هو بالايميل والي هيبقي انا
23. في صفحة مسابقة كاهوت فين الكود مالمسابقة يعني المفرود انه بعد ما انشئ المسابقة يظهرلي الكود بتاعتها زي بالظبط فكره الفقرة بتاعت صفحة الكتاب المقدس

في رقم 19 صفحة الريفيو جاب رسالة حدث خطأ أثناء إرسال التقييم، حاول مرة أخرى. api/feedback:1  Failed to load resource: the server responded with a status of 500 ()
