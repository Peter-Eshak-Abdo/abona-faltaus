import { createBrowserClient } from "@supabase/ssr";
import dotenv from "dotenv";

if (typeof window === "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

let _supabase: ReturnType<typeof createBrowserClient> | null = null;

// حزمة @supabase/ssr مع Singleton pattern محكم لمنع تكرار النسخ (Multiple GoTrueClient instances)
export const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (typeof window === "undefined") {
    return createBrowserClient(url, key);
  }
  if (!_supabase) {
    _supabase = createBrowserClient(url, key);
  }
  return _supabase;
};

export const supabase = getSupabaseClient();

