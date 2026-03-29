export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // لو مفيش code، يمكن السيشن اتعملت خلاص في الكلاينت
  if (!code) {
    console.log("⚠️ No code in URL, checking session state...");
    // لو مفيش كود، نرجعه للصفحة المطلوبة ونخلي الكلاينت هو اللي يتعامل
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.error("❌ Exchange Error:", error.message);
  return NextResponse.redirect(`${origin}/auth/login?error=auth-code-error`);
}
