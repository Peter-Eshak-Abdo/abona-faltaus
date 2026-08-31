# تقرير حل التنبيهات والأخطاء (Error Alerts Resolved)

---

## 1. مشكلة ترجمات السنكسار (MISSING_MESSAGE: Synaxarium.*)
- **السبب**: استدعاء `t("loadingStories")` و `t("noStoriesFound")` و `t("noStoriesHint")` و `t("refresh")` قبل تعريفها في ملفات الترجمة.
- **الحل**: تمت إضافة جميع هذه المفاتيح كاملة في قواميس اللغات الثلاث (`messages/ar.json`، `messages/en.json`، `messages/cop.json`).

---

## 2. تنبيه السيرفيس وركر (No SW registration for postMessage)
- **السبب**: محاولة إرسال رسالة عبر `navigator.serviceWorker.controller` قبل اكتمال تفعيل الـ Service Worker (Active/Ready state).
- **الحل**: تحديث `components/ServiceWorkerRegister.tsx` لانتظار `navigator.serviceWorker.ready` والتأكد من وجود `reg.active` قبل الإرسال.

---

## 3. تنبيه Git Submodules على Vercel (Warning: Failed to fetch git submodules)
- **السبب**: وجود `.gitmodules` لمجلد `data/coptish-datastore` دون تضمين مفاتيح الـ clone على Vercel.
- **الحل**: تم تحويل البيانات لتُقرأ كملفات بيانات داخلية أو من الكاش الثابت دون الاعتماد على الـ submodule وقت الـ deployment.

---

## 4. تحذيرات الحزم القديمة (npm warn deprecated)
- التحذيرات تخص حزم التوافق الداخلي لـ `@supabase/auth-helpers-nextjs` و `workbox` ولا تؤثر على استقرار تشغيل التطبيق في الـ Production.
