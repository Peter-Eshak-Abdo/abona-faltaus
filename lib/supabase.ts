// import { createBrowserClient } from "@supabase/ssr";

// let client: ReturnType<typeof createBrowserClient> | null = null;

// export const createClient = () => {
//   if (client) return client;

//   client = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       auth: {
//         persistSession: true,
//         autoRefreshToken: true,
//         detectSessionInUrl: true,
//         storageKey: "abona-faltaus-auth-token", // اسم ثابت عشان النسخ ما تضيعش من بعض
//       },
//     },
//   );
//   return client;
// };

// export const supabase = createClient();
//-----------------------------------------------------------------------
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseInstance: SupabaseClient;

if (typeof window === "undefined") {
  const globalForSupabase = globalThis as unknown as {
    supabase: SupabaseClient;
  };
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createClient(supabaseUrl, supabaseKey);
  }
  supabaseInstance = globalForSupabase.supabase;
} else {
  if (!(window as any).supabaseClientInstance) {
    (window as any).supabaseClientInstance = createClient(
      supabaseUrl,
      supabaseKey,
    );
  }
  supabaseInstance = (window as any).supabaseClientInstance;
}

export const supabase = supabaseInstance;
