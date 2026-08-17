# 📋 خطة تطوير موقع أبونا فلتاؤس — plan.md

> **الحالة:** تحليل شامل بناءً على كود المشروع + متطلبات الكرازة  
> **الهدف:** موقع سريع، يعمل 100% أوفلاين، بدون أخطاء Runtime، مع Backend متكامل

---

## 🔴 الأخطاء الحرجة (يجب إصلاحها أولاً)

### 1. خطأ Multiple GoTrueClient Instances
**الملف:** `lib/supabase.ts`  
**المشكلة:** رسالة `Multiple GoTrueClient instances detected` تظهر في الكونسول  
**السبب:** استيراد `supabase` من أماكن متعددة ينشئ instances متعددة  
**الحل:**
```ts
// lib/supabase.ts — الحل النهائي
import { createBrowserClient } from "@supabase/ssr";

let _supabase: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = (() => {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  if (!_supabase) {
    _supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
})();
```

---

### 2. خطأ Image Width/Height (eagle.webp)
**الملف:** `components/LogoHeader.tsx`  
**المشكلة:** `Image with src "/images/eagle.webp" has either width or height modified, but not the other`  
**الحل:**
```tsx
// بدل:
className="rounded-full border-blue-300 justify-self-start flex-none w-auto h-full"

// استخدم:
className="rounded-full border-blue-300"
style={{ width: "auto", height: "40px" }}
```

---

### 3. PWA Offline — صفحات بترفع `no-response`
**المشكلة:** صفحات `/al7an/snawi`, `/al7an`, `/bible`, `/chat` بتديّ `no-response` في وضع الأوفلاين  
**السبب:** في `next.config.js` الـ `runtimeCaching` مش بيغطي navigate requests بشكل كافي  
**الحل في `next.config.js`:**
```js
// في workboxOptions.runtimeCaching — استبدل قاعدة navigate بالآتي:
{
  urlPattern: ({ request }) => request.mode === "navigate",
  handler: "NetworkFirst",
  options: {
    cacheName: "pages-cache",
    networkTimeoutSeconds: 3,
    expiration: { maxEntries: 150, maxAgeSeconds: 365 * 24 * 60 * 60 },
    cacheableResponse: { statuses: [0, 200] },
    // ✅ أضف هذا:
    plugins: [
      {
        handlerDidError: async ({ request }) => {
          return caches.match('/~offline') || Response.error();
        },
      },
    ],
  },
},
```

---

### 4. خطأ Logic في صفحة الألحان `Al7anClient.tsx`
**الملف:** `app/al7an/Al7anClient.tsx`  
**المشكلة:**
```ts
const monasba = monasbat[mons as keyof typeof monasbat] as string;
// monasbat هو مصفوفة strings مش object — الـ keyof مش هيشتغل صح
```
**الحل:**
```ts
// امسح السطر ده وخلي العرض يعتمد على `activeMonasba` من الـ state
// الكود شغال لكن فيه نتيجة غلط في عرض اسم المناسبة
```

---

### 5. خطأ `_isPending` في TypeScript
**الملف:** `lib/offline-quiz-store.ts`
```ts
await addToLocalList({ ...quiz, id: localId, _isPending: true } as any);
// ✅ تمام لكن يفضل تعمل interface صريح
```

---

## 🟡 نقاط الكرازة — التفصيل الكامل

### أ) الصفحة الرئيسية (home)

| النقطة | الحالة | الخطوات المطلوبة |
|--------|--------|-----------------|
| ما يحملش كل الملفات غير الي يدخل صفحته | 🔴 | استخدم `dynamic import` + `lazy loading` لكل component ثقيل في الـ menu |
| رسالة PWA تختفي لو قفلها | ✅ محلول في PwaManager | — |
| يوضح زرار تحميل في رسالة PWA | ✅ | — |
| يوضح إن في تسجيل دخول بجوجل | ✅ | — |
| يضغط على الدائرة في النص | ✅ | — |
| إضافة التاريخ القبطي | ✅ | — |
| يسأل يحمل أوفلاين | ✅ في ServiceWorkerRegister | — |
| زرار في الإعدادات لمعرفة حالة الأوفلاين ومسح الكاش | ✅ في settings | — |
| **إصلاح أخطاء الأوفلاين** | 🔴 | راجع البند 3 أعلاه |

**خطوات Lazy Loading للصفحة الرئيسية:**
```tsx
// app/(home)/page.tsx — أضف dynamic imports
const Al7anPage = dynamic(() => import('@/app/al7an/page'), { ssr: false });
// في HomeClient.tsx — كل section يُحمل فقط لما يُضغط عليه
```

---

### ب) صفحة الكتاب المقدس (bible)

| النقطة | الحالة | الخطوات |
|--------|--------|---------|
| الاستايل UI | ✅ | — |
| صفحة إنشاء يوم (نوتة) | ✅ (`/bible/day`) | — |
| بعد التحميل الأول يحتاج Refresh | 🔴 | الحل: بعد `localforage.setItem` أضف `window.location.reload()` مرة واحدة بـ flag |
| القراءة بصوت تتحسن | 🟡 | استبدل msedge-tts بـ Web Speech API fallback أسرع، أو أضف loading state واضح |

**إصلاح مشكلة الـ Refresh:**
```ts
// في bible-utils.ts بعد حفظ البيانات
if (!data || data.length === 0) {
  data = await loadBible(...);
  await localforage.setItem("offline_bible_data", data);
  // ✅ الحل: flag في localStorage
  if (!localStorage.getItem("bible_loaded_once")) {
    localStorage.setItem("bible_loaded_once", "true");
    window.location.reload();
  }
}
```

---

### ج) صفحة الشات بوت (chat)

| النقطة | الحالة | الخطوات |
|--------|--------|---------|
| الاستايل UI | ✅ | — |
| يرد بسرعة | 🟡 | الحل موجود في route.ts بـ fallback models — تأكد إن `gemini-2.5-flash-lite` هو الأول |
| يرد بتخصص من Prompt | ✅ | — |
| كتاب المقدس وتفسير | ✅ | — |

**تحسين السرعة:**
```ts
// في app/api/chat/route.ts — رتّب النماذج من الأسرع للأبطأ
const geminiModels = [
  "gemini-2.0-flash",        // الأسرع
  "gemini-1.5-flash",        // سريع
  "gemini-1.5-flash-8b",     // خفيف
  "gemini-2.5-flash",        // احتياطي
];
```

---

### د) صفحة الامتحانات (exam)

| النقطة | الحالة | الخطوات |
|--------|--------|---------|
| الاستايل الصفحة الرئيسية | 🔴 | إعادة تصميم بطاقات الـ 3 خيارات |
| كود عشوائي 10 أحرف للدخول كـ Admin | 🔴 | ← تفصيل أدناه |

**إضافة كود Admin للمسابقة:**
```sql
-- في Supabase: أضف عمود لجدول quizzes
ALTER TABLE quizzes ADD COLUMN admin_code VARCHAR(10) UNIQUE;
```
```ts
// في CreateQuizDialog.tsx عند الإنشاء
const adminCode = Math.random().toString(36).substring(2, 12).toUpperCase();
// احفظه في quizzes.admin_code
```
```tsx
// في صفحة host — أضف input للكود
// في middleware أو page — تحقق من الكود قبل السماح بالدخول
```

---

### هـ) صفحة تسجيل الدخول (auth/signin)

| النقطة | الحالة |
|--------|--------|
| الاستايل UI | ✅ محلول |

---

### و) الأخطاء / Alerts

| الخطأ | الحالة | الحل |
|-------|--------|------|
| Multiple GoTrueClient | 🔴 | راجع البند 1 |
| Image eagle.webp width/height | 🔴 | راجع البند 2 |

---

### ز) صفحة الألحان

| النقطة | الحالة | الخطوات |
|--------|--------|---------|
| الاستايل UI | ✅ | — |
| الكلمات عربي قبطي معرب | ✅ | — |
| السرعة / Lazy Loading | 🟡 | تحميل `al7an-all.json` بـ dynamic import |
| الأوفلاين | 🟡 | صوت الألحان محفوظ في Cache — لكن الصفحة نفسها؟ راجع PWA |

---

## 🚀 خطة PWA — 100% Offline

### المتطلبات:
1. كل صفحات الـ navigation تشتغل بدون نت
2. الكتاب المقدس كامل محفوظ في IndexedDB
3. ملفات الألحان تتحمل يدوياً وتُحفظ
4. الشات بوت يظهر رسالة واضحة إنه يحتاج نت

### الخطوات:

**الخطوة 1: تصحيح `next.config.js`**
```js
// أضف هذه الصفحات لـ precache
additionalManifestEntries: [
  { url: '/', revision: null },
  { url: '/al7an', revision: null },
  { url: '/bible', revision: null },
  { url: '/exam', revision: null },
  { url: '/~offline', revision: null },
],
```

**الخطوة 2: Service Worker Custom Handler**
```js
// في public/sw-custom.js أو عبر workboxOptions
// لو الصفحة مش موجودة في الكاش → ارجع /~offline
```

**الخطوة 3: تحسين صفحة `/~offline`**
- تظهر الصفحات المحفوظة للمستخدم
- زرار "حمّل الآن" يعمل CACHE_ALL_FILES
- تظهر حالة الكاش الحالية

---

## ⚡ خطة الأداء (Performance)

### 1. تقليل حجم Bundle
```bash
# افحص الـ bundle size
npx @next/bundle-analyzer
```

**المشاكل المتوقعة:**
- `al7an-all.json` يُحمل في كل صفحة ← استخدم dynamic import
- `framer-motion` ثقيل ← استخدم `LazyMotion` + `domAnimation`

### 2. React Query للـ Caching
```tsx
// يوجد بالفعل QueryProvider — تأكد من استخدامه في:
// - bible_verses queries
// - quiz data
// - conversations
```

### 3. Image Optimization
```tsx
// كل الصور تستخدم next/image ✅
// تأكد إن priority={true} على الصور Above the fold فقط
```

### 4. تقليل API Calls
```tsx
// في components/home/Widgets.tsx
// cache الآية لـ 2 ساعة ✅ موجود
// GitHub commits cache لـ 30 دقيقة ✅ موجود
```

---

## 📋 قائمة التحقق النهائية (Checklist)

### أخطاء يجب إصلاحها:
- [ ] إصلاح Multiple GoTrueClient
- [ ] إصلاح Image eagle.webp
- [ ] إصلاح PWA offline للصفحات الأساسية
- [ ] إصلاح مشكلة Refresh بعد تحميل الكتاب المقدس
- [ ] إصلاح منطق `monasbat[mons]` في Al7anClient

### ميزات مطلوبة:
- [ ] Admin Code للمسابقات الكاهوتية
- [ ] تحسين سرعة الشات (ترتيب النماذج)
- [ ] Lazy loading للصفحة الرئيسية
- [ ] تحسين صوت القراءة في الكتاب المقدس

### اختبارات مطلوبة:
- [ ] Lighthouse Score > 90 لكل صفحة
- [ ] PWA installable وتعمل أوفلاين
- [ ] اختبار على Android Chrome و iOS Safari
- [ ] اختبار بدون إنترنت لكل صفحة رئيسية
