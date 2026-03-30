import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client; // لو النسخة موجودة، رجعها هي هي

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true, // إجباري
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "abona-auth-v1", // اسم فريد للسيشن
      },
    },
  );
}
