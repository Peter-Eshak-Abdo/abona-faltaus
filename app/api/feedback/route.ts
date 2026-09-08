import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { FeedbackInputSchema } from "@/lib/security-validation";
import { sendAdminNotification } from "@/lib/onesignal";

// جلب التقييمات
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = (process.env.NEXT_PUBLIC_GMAIL!).toLowerCase();
  const isAdmin = user?.email?.toLowerCase() === adminEmail;

  let query = supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (isAdmin) {
    // Admin sees all feedback
  } else if (user) {
    query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
  } else {
    query = query.eq("is_public", true);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// إرسال تقييم جديد
export async function POST(request: Request) {
  // 1. Rate Limiting: Max 5 submissions per minute per IP
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`feedback_post_${ip}`, { limit: 5, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetTime);
  }

  // 2. Input validation & sanitization via Zod
  const rawBody = await request.json().catch(() => null);
  const validation = FeedbackInputSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: "البيانات المدخلة غير صحيحة", details: validation.error.format() },
      { status: 400 }
    );
  }

  const { name, email, feedback, rating, is_public } = validation.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from("feedback")
      .insert([
        {
          name: name || user?.user_metadata?.full_name || null,
          email: email || user?.email || null,
          feedback_text: feedback,
          rating: rating,
          is_public: is_public,
          user_id: user?.id || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 3. تنبيه المسؤول فوراً (OneSignal)
    const senderName = name || user?.user_metadata?.full_name || email || "مستخدم في الموقع";
    try {
      await sendAdminNotification({
        title: `تقييم جديد (${rating}/10) ⭐ من ${senderName}`,
        message: feedback.length > 100 ? `${feedback.substring(0, 100)}...` : feedback,
        url: "/admin/reviews",
      });
    } catch (pushErr) {
      console.warn("Could not send admin push notification:", pushErr);
    }

    return NextResponse.json({ message: "تم بنجاح", data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
