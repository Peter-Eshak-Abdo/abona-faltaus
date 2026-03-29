export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log("🚀 [CALLBACK] Started. Origin:", origin);
  console.log("🎫 [CALLBACK] Auth Code received:", code ? "Yes (Check ✅)" : "No (Empty ❌)");

  if (code) {
    const supabase = await createClient()
    console.log("📡 [CALLBACK] Exchanging code for session...");

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("❌ [CALLBACK] Exchange Error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error&details=${encodeURIComponent(error.message)}`)
    }

    console.log("✅ [CALLBACK] Session established for user:", data.user?.email);
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error("⚠️ [CALLBACK] No code found in URL");
  return NextResponse.redirect(`${origin}/auth/login?error=no-code`)
}
