import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// حماية عشان الـ Build ميفشلش لو القيم مش موجودة لحظياً
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are missing!")
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl || "https://placeholder-url.supabase.co",
    supabaseAnonKey || "placeholder-key",
  );
}
