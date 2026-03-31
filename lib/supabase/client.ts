import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "pkce", // تأكيد استخدام PKCE
        persistSession: true, // إجباري
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // storageKey: "abona-auth-v1", // اسم فريد للسيشن
      },
    },
  );

export const supabase = createClient();
