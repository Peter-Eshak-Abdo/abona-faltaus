# 🔧 Backend Plan — backend.md
## موقع أبونا فلتاؤس — خطة الـ Backend الكاملة

> **الوضع الحالي:** الـ Frontend مظبوط تقريباً، الـ Backend ناقص كتير
> **الهدف:** Backend قوي، آمن، سريع، متكامل مع Supabase

---

## 🗄️ قاعدة البيانات — Supabase Tables

### الجداول الموجودة (المفترض):
- `bible_verses` ✅
- `daily_verses_pool` ✅
- `fathers_quotes` ✅
- `quizzes` ✅
- `quiz_groups` ✅
- `game_state` ✅
- `answers` ✅
- `meeting_days` ✅
- `bible_favorites` ✅
- `conversations` ✅
- `messages` ✅
- `feedback` ✅
- `profiles` ✅
- `trashed_quizzes` ✅

### جداول ناقصة يجب إنشاؤها:

---

## 📝 Migration 1: إضافة Admin Code للمسابقات

```sql
-- إضافة عمود admin_code لجدول quizzes
ALTER TABLE public.quizzes
ADD COLUMN IF NOT EXISTS admin_code VARCHAR(10) UNIQUE;

-- إنشاء index لسرعة البحث
CREATE INDEX IF NOT EXISTS idx_quizzes_admin_code
ON public.quizzes(admin_code);

-- دالة لإنشاء كود عشوائي
CREATE OR REPLACE FUNCTION generate_admin_code()
RETURNS VARCHAR(10) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(10) := '';
  i INT;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- تحديث الصفوف الموجودة التي ليس لها كود
UPDATE public.quizzes
SET admin_code = generate_admin_code()
WHERE admin_code IS NULL;
```

---

## 📝 Migration 2: جدول الإشعارات المجدولة

```sql
CREATE TABLE IF NOT EXISTS public.notification_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'verse', 'quote', 'confession', 'mass'
  cron_expression VARCHAR(100), -- '0 9 * * *' = كل يوم 9 صباحاً
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- بيانات افتراضية
INSERT INTO public.notification_schedules (type, cron_expression) VALUES
  ('verse', '0 7 * * *'),      -- آية كل يوم 7 صباحاً
  ('quote', '0 20 * * *'),     -- قول آباء 8 مساءً
  ('mass', '0 6 * * 0'),       -- تذكير القداس كل أحد
  ('confession', '0 18 * * 5'); -- تذكير الاعتراف كل جمعة
```

---

## 📝 Migration 3: تتبع استخدام المحتوى (Analytics)

```sql
CREATE TABLE IF NOT EXISTS public.content_views (
  id BIGSERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL, -- 'hymn', 'bible', 'quiz', 'chat'
  content_id VARCHAR(200),           -- slug أو id
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_views_type ON public.content_views(content_type);
CREATE INDEX idx_content_views_created ON public.content_views(created_at);
```

---

## 📝 Migration 4: جدول المقالات (Articles)

```sql
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category VARCHAR(100),       -- 'faith', 'liturgy', 'history'
  is_published BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.article_likes (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (article_id, user_id)
);
```

---

## 📝 Migration 5: الـ RLS Policies (Row Level Security)

```sql
-- =====================================
-- quizzes: المستخدم يرى مسابقاته فقط
-- =====================================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (auth.uid() = created_by OR is_deleted = false);

CREATE POLICY "Users can insert own quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = created_by);

-- =====================================
-- bible_favorites: المستخدم يرى مفضلاته فقط
-- =====================================
ALTER TABLE public.bible_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites" ON public.bible_favorites
  FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- meeting_days: عام للقراءة، محدود للكتابة
-- =====================================
ALTER TABLE public.meeting_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read meeting days" ON public.meeting_days
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can create meeting days" ON public.meeting_days
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creator can update meeting days" ON public.meeting_days
  FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

-- =====================================
-- conversations: المستخدم يرى محادثاته فقط
-- =====================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- messages: المستخدم يرى رسائله فقط
-- =====================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own messages" ON public.messages
  FOR ALL USING (
    auth.uid() = (
      SELECT user_id FROM public.conversations
      WHERE id = conversation_id
    )
  );

-- =====================================
-- feedback: عام للإدراج، مقيد للقراءة
-- =====================================
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback" ON public.feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users see own feedback or public" ON public.feedback
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_public = true OR
    auth.email() = current_setting('app.admin_email', true)
  );

-- =====================================
-- profiles: العام يرى الاسم فقط، المستخدم يعدل ملفه
-- =====================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 📝 Migration 6: إضافة meeting_days.created_by

```sql
-- إضافة عمود created_by لـ meeting_days لو مش موجود
ALTER TABLE public.meeting_days
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- index
CREATE INDEX IF NOT EXISTS idx_meeting_days_created_by
ON public.meeting_days(created_by);
```

---

## 🌐 API Routes المطلوبة

### الموجودة حالياً:
| Route | الحالة | ملاحظات |
|-------|--------|---------|
| `POST /api/chat` | ✅ | يحتاج تحسين ترتيب النماذج |
| `GET /api/bible-sync` | ✅ | يعمل |
| `GET /api/daily-verse` | ✅ | يعمل مع OneSignal |
| `GET /api/daily-quote` | ✅ | يعمل |
| `POST /api/tts` | ✅ | يعمل |
| `GET /api/send-confession-notification` | ✅ | يعمل |
| `GET /api/send-mass-notification` | ✅ | يعمل |
| `GET /api/callback` | ✅ | OAuth callback |
| `GET /api/add-fav-from-notification` | ✅ | يعمل |
| `GET/POST /api/feedback` | ✅ | يعمل |
| `POST /api/readings` | 🟡 | يعمل لكن يحتاج ملفات البيانات |
| `GET /api/cron/daily-summary` | ✅ | يعمل |

### API Routes ناقصة يجب إنشاؤها:

---

### 🆕 `GET /api/admin/feedback`

```ts
// app/api/admin/feedback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // تأكد إن المستخدم أدمن
  if (!user || user.email !== process.env.NEXT_PUBLIC_GMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

---

### 🆕 `POST /api/admin/reply`

```ts
// app/api/admin/reply/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/onesignal";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.NEXT_PUBLIC_GMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, reply, userId } = await request.json();

  const { error } = await supabase
    .from("feedback")
    .update({ admin_reply: reply, replied_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // إرسال Push Notification للمستخدم
  if (userId) {
    await sendPushNotification(userId, `رد الإدارة على تقييمك: ${reply}`);
  }

  return NextResponse.json({ success: true });
}
```

---

### 🆕 `GET /api/quizzes/verify-admin-code`

```ts
// app/api/quizzes/verify-admin-code/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const quizId = searchParams.get("quizId");

  if (!code || !quizId) {
    return NextResponse.json({ valid: false, error: "Missing params" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("id", quizId)
    .eq("admin_code", code.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  return NextResponse.json({ valid: true, quiz: data });
}
```

---

### 🆕 `POST /api/articles`

```ts
// app/api/articles/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, category, likes_count, views_count, created_at, author_id")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, content, category } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("articles")
    .insert([{ title, content, category, author_id: user.id }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
```

---

### 🆕 `POST /api/articles/[id]/like`

```ts
// app/api/articles/[id]/like/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Toggle like
  const { data: existing } = await supabase
    .from("article_likes")
    .select("article_id")
    .eq("article_id", id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    await supabase.from("article_likes").delete()
      .eq("article_id", id).eq("user_id", user.id);
    await supabase.rpc("decrement_article_likes", { article_id: id });
    return NextResponse.json({ liked: false });
  } else {
    await supabase.from("article_likes").insert({ article_id: id, user_id: user.id });
    await supabase.rpc("increment_article_likes", { article_id: id });
    return NextResponse.json({ liked: true });
  }
}
```

**دالة RPC في Supabase:**
```sql
CREATE OR REPLACE FUNCTION increment_article_likes(article_id UUID)
RETURNS VOID AS $$
  UPDATE articles SET likes_count = likes_count + 1 WHERE id = article_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_article_likes(article_id UUID)
RETURNS VOID AS $$
  UPDATE articles SET likes_count = GREATEST(0, likes_count - 1) WHERE id = article_id;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

### 🆕 تحسين `POST /api/chat` — Error Handling كامل

```ts
// app/api/chat/route.ts — نسخة محسّنة
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { supabase } from "@/lib/supabase";
import { CopticSystemPrompt } from "@/lib/prompt";
import quotesCacheData from "@/public/quotes.json";
import topicsCacheData from "@/public/verses_topics.json";

export const runtime = "nodejs";
export const maxDuration = 30;

// نماذج مرتبة من الأسرع للأبطأ
const MODELS = [
  "gemini-3.6-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.5-flash",
];

function normalize(term: string): string {
  if (!term) return "";
  return term
    .replace(/[ًٌٍَُِْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .trim()
    .toLowerCase();
}

async function searchBible(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) return [];
  try {
    const { data } = await supabase
      .from("bible_verses")
      .select("vocalized_text, book_name, chapter_number, verse_number")
      .ilike("plain_text", `%${searchTerm}%`)
      .limit(5);
    return (data || []).map((v: any) => ({
      text: v.vocalized_text,
      ref: `${v.book_name.replace(/^\d+-/, "")} ${v.chapter_number}:${v.verse_number}`,
    }));
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  // ✅ Validate request
  let messages: any[];
  try {
    const body = await request.json();
    messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ✅ Rate limit check (بسيط)
  const lastMsg = messages[messages.length - 1];
  const userText = Array.isArray(lastMsg?.parts)
    ? lastMsg.parts.map((p: any) => p.text || "").join("")
    : lastMsg?.content || "";

  if (!userText.trim()) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  if (userText.length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000 chars)" }, { status: 400 });
  }

  // ✅ Build context
  const searchTerm = normalize(userText);
  const [bibleVerses, topicVerses, quotes] = await Promise.allSettled([
    searchBible(searchTerm),
    Promise.resolve(
      (topicsCacheData as any[])
        .filter((v) => normalize(v.topic).includes(searchTerm))
        .slice(0, 5)
        .map((v) => ({ text: v.verse, ref: v.ref }))
    ),
    Promise.resolve(
      (quotesCacheData as any[])
        .filter((q) => normalize(q.quote).includes(searchTerm) || normalize(q.topic || "").includes(searchTerm))
        .slice(0, 3)
    ),
  ]);

  const finalVerses = [
    ...(bibleVerses.status === "fulfilled" ? bibleVerses.value : []),
    ...(topicVerses.status === "fulfilled" ? topicVerses.value : []),
  ].slice(0, 7);

  const finalQuotes = quotes.status === "fulfilled" ? quotes.value : [];

  const systemPrompt = `${CopticSystemPrompt}

المراجع المتاحة:
الآيات: ${finalVerses.map((v) => `${v.text} (${v.ref})`).join(" | ") || "لا يوجد"}
الأقوال: ${finalQuotes.map((q: any) => `"${q.quote}" - ${q.author}`).join(" | ") || "لا يوجد"}
`;

  const coreMessages = messages.map((m: any) => ({
    role: m.role as "user" | "assistant",
    content: Array.isArray(m.parts)
      ? m.parts.map((p: any) => p.text || "").join("")
      : m.content || "",
  }));

  // ✅ Try models in order
  let lastError: any;
  for (const modelName of MODELS) {
    try {
      const result = await streamText({
        model: google(modelName),
        system: systemPrompt,
        messages: coreMessages,
        maxTokens: 4096,
      });
      return result.toTextStreamResponse();
    } catch (err: any) {
      lastError = err;
      // فقط تابع لو Rate Limit أو Overloaded
      const status = err?.statusCode || err?.status;
      if (status !== 429 && status !== 503) break;
    }
  }

  console.error("All AI models failed:", lastError?.message);
  return NextResponse.json(
    { error: "الخدمة مشغولة حالياً، جرب بعد لحظة." },
    { status: 503 }
  );
}
```

---

## 🔐 Supabase Edge Functions المقترحة

### Function 1: `auto-generate-quiz-code`
```ts
// يُشغَّل تلقائياً عند إنشاء quiz جديد
// supabase/functions/generate-quiz-code/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { record } = await req.json(); // trigger payload
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (!record.admin_code) {
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    await supabase.from("quizzes").update({ admin_code: code }).eq("id", record.id);
  }

  return new Response("OK");
});
```

**Database Trigger:**
```sql
CREATE OR REPLACE TRIGGER on_quiz_created
  AFTER INSERT ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://YOUR_PROJECT.supabase.co/functions/v1/generate-quiz-code',
    'POST',
    '{"Content-Type": "application/json"}',
    '{}',
    '1000'
  );
```

---

## ⏰ Cron Jobs (Vercel Cron)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/daily-verse",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/daily-quote",
      "schedule": "0 20 * * *"
    },
    {
      "path": "/api/send-mass-notification",
      "schedule": "0 6 * * 0"
    },
    {
      "path": "/api/send-confession-notification",
      "schedule": "0 18 * * 5"
    },
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 23 * * *"
    }
  ]
}
```

---

## 🔒 Environment Variables المطلوبة

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # سري — للـ server-side فقط

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=xxx
ONESIGNAL_REST_API_KEY=xxx

# Cron Security
CRON_SECRET=random-long-string-here

# App Config
NEXT_PUBLIC_SITE_URL=https://abona-faltaus.vercel.app
NEXT_PUBLIC_GMAIL=your@email.com
NEXT_PUBLIC_GITHUB=https://github.com/Peter-Eshak-Abdo
NEXT_PUBLIC_GITHUB_REPO=https://github.com/Peter-Eshak-Abdo/abona-faltaus
NEXT_PUBLIC_PORTFOLIO=https://your-portfolio.com

# Google Analytics
GOOGLE_TAG_ID=G-XXXXXXXX
GOOGLE_SITE_VERIFICATION=xxx
```

---

## 🛡️ Error Handling — كل الحالات

### Pattern عام لكل API Route:

```ts
// lib/api-helpers.ts
import { NextResponse } from "next/server";

export function apiError(message: string, status = 500) {
  console.error(`[API Error ${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
}

export function requireAuth(user: any) {
  if (!user) throw new Error("UNAUTHORIZED");
}

export function requireAdmin(user: any) {
  if (!user || user.email !== process.env.NEXT_PUBLIC_GMAIL) {
    throw new Error("FORBIDDEN");
  }
}

// Wrapper لكل route
export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") return apiError("Unauthorized", 401);
    if (err.message === "FORBIDDEN") return apiError("Forbidden", 403);
    if (err.message === "NOT_FOUND") return apiError("Not Found", 404);
    return apiError(err.message || "Internal Server Error", 500);
  }
}
```

**استخدام:**
```ts
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    requireAuth(user);
    // ... باقي الكود
    return NextResponse.json(data);
  });
}
```

---

## 📊 Supabase Indexes المهمة (للسرعة)

```sql
-- Bible verses search
CREATE INDEX IF NOT EXISTS idx_bible_plain_text
ON public.bible_verses USING gin(to_tsvector('arabic', plain_text));

-- Quiz queries
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by
ON public.quizzes(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quizzes_not_deleted
ON public.quizzes(created_by) WHERE is_deleted = false;

-- Game state
CREATE INDEX IF NOT EXISTS idx_game_state_quiz_id
ON public.game_state(quiz_id);

-- Answers
CREATE INDEX IF NOT EXISTS idx_answers_quiz_question
ON public.answers(quiz_id, question_id);

-- Daily verses pool
CREATE INDEX IF NOT EXISTS idx_daily_verses_unused
ON public.daily_verses_pool(used_date) WHERE used_date IS NULL;

-- Meeting days
CREATE INDEX IF NOT EXISTS idx_meeting_days_code
ON public.meeting_days(code);
```

---

## ✅ خطوات التطبيق (بالترتيب)

### المرحلة 1 — الأساس (أسبوع 1)
- [x] تطبيق كل الـ Migrations على Supabase (الملف جاهز: `supabase/migrations/20260817_phase1_foundation.sql`)
- [x] تطبيق الـ RLS Policies
- [x] إنشاء الـ Indexes
- [x] إضافة `vercel.json` بالـ Cron Jobs
- [x] إصلاح Multiple GoTrueClient

### المرحلة 2 — API Routes (أسبوع 2)
- [x] إنشاء `/api/admin/feedback`
- [x] إنشاء `/api/admin/reply`
- [x] إنشاء `/api/quizzes/verify-admin-code`
- [x] تحسين `/api/chat` بـ Error Handling الكامل
- [x] إضافة `lib/api-helpers.ts`

### المرحلة 3 — المقالات (أسبوع 3)
- [x] إنشاء جدول `articles` و `article_comments` و `article_likes` (مضمن في Migration المرحلة 1)
- [x] إنشاء `/api/articles` (GET + POST)
- [x] إنشاء `/api/articles/[id]/like`
- [x] Frontend للمقالات (`/articles` و `ArticlesClient.tsx`)

### المرحلة 4 — Polish (أسبوع 4)
- [x] إنشاء Admin Code للمسابقات تلقائياً (عبر SQL Trigger & Function في `supabase/migrations/20260817_phase4_polish.sql`)
- [x] إضافة Search Index للكتاب المقدس (Full Text Search + RPC `search_bible_verses` + `/api/bible/search`)
- [x] Analytics tracking (`/api/analytics/track` + `content_views` tracking)
- [x] فحص وهيكلة كل الـ Cron Jobs المحددة في `vercel.json`

