import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_SECRET ||
  process.env.SUPABASE_SERVIC_ROLE_SECRET ||
  "";

if (!serviceRoleKey && process.env.NODE_ENV === "production") {
  console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not defined. Admin operations will fail.");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
