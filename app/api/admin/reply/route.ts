import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/onesignal";
import { requireAdmin, withErrorHandling } from "@/lib/api-helpers";
import { AdminReplySchema } from "@/lib/security-validation";

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // التحقق من صلاحية الأدمن
    requireAdmin(user);

    const body = await request.json();
    const validation = AdminReplySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "بيانات الرد غير صالحة", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { id, reply, userId } = validation.data;

    const { error } = await supabase
      .from("feedback")
      .update({
        admin_reply: reply,
        replied_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    // إرسال إشعار لحظي عبر OneSignal في حال وجود معرف المستخدم
    if (userId) {
      try {
        await sendPushNotification(userId, `رد الإدارة على تقييمك: ${reply}`);
      } catch (pushErr) {
        console.warn("Could not send OneSignal push notification:", pushErr);
      }
    }

    return NextResponse.json({ success: true });
  });
}
