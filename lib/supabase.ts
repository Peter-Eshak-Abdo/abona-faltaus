import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_NEW!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_NEW!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
