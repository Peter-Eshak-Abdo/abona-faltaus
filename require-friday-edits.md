# 🔑 المتطلبات والإعدادات المطلوبة (Required API Keys & Setup)

تم إنجاز وتطوير جميع الميزات والتعديلات البرمجية بالكامل. لتشغيل الميزات التي تعتمد على خدمات خارجية بأعلى كفاءة، يرجى مراجعة وتوفير المفاتيح التالية في ملف `.env.local` لديك عند الرغبة في تفعيلها:

---

### 1️⃣ ميزة تحويل الصوت العربي إلى نص (Speech-to-Text) 🎙️
- **الخدمة الأساسية المدعومة:** **ElevenLabs Speech-to-Text (Scribe)** أو **OpenAI Whisper**.
- **المتغيرات المطلوبة في `.env.local`:**
  ```env
  # خيار 1: ElevenLabs (موصى به للتفريغ العربي الاحترافي)
  ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

  # أو خيار 2: OpenAI (بديل تلقائي)
  OPENAI_API_KEY=your_openai_api_key_here
  ```
- **المسار المتأثر:** `app/api/speech-to-text/route.ts` المستخدم في صفحة `app/preparation/page.tsx`.

---

### 2️⃣ ميزة توليد التحضير وتوليد مسابقات كاهوت بالـ AI 🪄
- **الخدمة المستخدمة:** **Google Gemini API** (Google Generative AI).
- **المتغير المطلوب في `.env.local`:**
  ```env
  GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
  # أو
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **المسارات المتأثرة:**
  - `app/api/preparation/generate/route.ts` (توليد خطة الدرس والآيات والشواهد).
  - `app/api/quizzes/generate/route.ts` (توليد أسئلة كاهوت بنوعياتها المختلفة وتصديرها).
  - `app/api/chat/route.ts` (تفسير الآيات والردود الروحية).

---

### 3️⃣ استضافة مسابقات كاهوت بكود المشرف (Admin Host Code) 🏆
- **الميزة:** تم ربط واستقرار التحقق من كود المشرف (`admin_code`) في جدول `quizzes` بـ Supabase.
- **التشغيل:** يمكن لأي خادم إدخال كود المسابقة في شاشة الاستضافة (`/exam/quiz/quiz/[quizId]/host`) للتحكم الكامل دون الحاجة لتسجيل دخول مسبق.

---

### 4️⃣ التوافق مع شاشات الآيفون وتطبيقات PWA 📱
- **التحسين:** تم تفعيل ارتفاعات العرض الديناميكية `100dvh` وهوامش الأمان `env(safe-area-inset-bottom)` في `app/globals.css` لضمان عدم قص أي أزرار أو عناصر على شاشات آيفون 15 والإصدارات المختلفة.
