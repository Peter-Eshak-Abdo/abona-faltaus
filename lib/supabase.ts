import { createBrowserClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // بيئة الخادم: عميل مستقل عديم الحالة (Stateless) يمنع تسريب الجلسات ومشاكل الكوكيز
    return createJsClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  // بيئة المتصفح: Singleton محكم لمنع تكرار النسخ (Multiple GoTrueClient instances)
  if (!_browserClient) {
    _browserClient = createBrowserClient(url, key);
  }
  return _browserClient;
};

// Proxy شفاف يضمن استدعاء العميل المناسب وفقاً للبيئة الحالية (Client vs Server)
export const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    const client = getSupabaseClient() as any;
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
