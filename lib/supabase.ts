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
//         // storageKey: "abona-faltaus-auth-token", // اسم ثابت عشان النسخ ما تضيعش من بعض
//       },
//     },
//   );
//   return client;
// };

// export const supabase = createClient();
//-----------------------------------------------------------------------
// import { createClient, SupabaseClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// const getSupabase = () => {
//   if (typeof window === "undefined") {
//     return createClient(supabaseUrl, supabaseKey);
//   }

//   if (!(window as any).supabaseClientInstance) {
//     (window as any).supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
//       auth: {
//         persistSession: true,
//         autoRefreshToken: true,
//         detectSessionInUrl: true,
//       },
//     });
//   }

//   return (window as any).supabaseClientInstance;
// };

// export const supabase = getSupabase() as SupabaseClient;
//-----------------------------------------------------------------------------------
import { createBrowserClient } from "@supabase/ssr";

// حزمة @supabase/ssr تقوم تلقائياً بمنع تكرار النسخ (Singleton) في المتصفح
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
