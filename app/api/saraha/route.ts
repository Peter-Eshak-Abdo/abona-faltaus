import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// GET: جلب صندوق الخادم ورسائله (للخادم) أو جلب بيانات الرابط (للمخدوم)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const userId = searchParams.get("userId");
    const linkId = searchParams.get("linkId");

    // 1. إذا كان المطلوب جلب صفحة المخدوم بالـ slug
    if (slug) {
      const { data: link, error } = await supabaseAdmin
        .from("saraha_links")
        .select("id, slug, title, description, is_active, user_id")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !link) {
        return NextResponse.json({ error: "الرابط غير موجود أو تم إيقافه" }, { status: 404 });
      }

      return NextResponse.json({ success: true, link });
    }

    // 2. إذا كان المطلوب جلب لوحة تحكم الخادم
    if (userId) {
      const { data: links, error: linkErr } = await supabaseAdmin
        .from("saraha_links")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (linkErr) throw linkErr;

      let msgQuery = supabaseAdmin
        .from("saraha_messages")
        .select("*")
        .eq("servant_id", userId);

      if (linkId) {
        msgQuery = msgQuery.eq("link_id", linkId);
      }

      const { data: messages, error: msgErr } = await msgQuery.order("created_at", { ascending: false });

      if (msgErr) throw msgErr;

      return NextResponse.json({
        success: true,
        links: links || [],
        messages: messages || [],
      });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Saraha GET error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// POST: إرسال سؤال مجهول جديد من المخدوم أو إنشاء رابط جديد من الخادم
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // أ. إنشاء رابط جديد للخادم
    if (action === "create_link") {
      const { userId, slug, title, description } = body;
      if (!userId || !slug) {
        return NextResponse.json({ error: "بيانات الرابط غير مكتملة" }, { status: 400 });
      }

      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

      const { data, error } = await supabaseAdmin
        .from("saraha_links")
        .insert({
          user_id: userId,
          slug: cleanSlug,
          title: title?.trim() || "صندوق أسئلة واستفسارات الخدمة",
          description: description?.trim() || "اكتب سؤالك بكل صراحة وبدون ظهور هويتك.",
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({ error: "هذا الرابط مستخدم بالفعل، اختر اسماً آخر" }, { status: 400 });
        }
        throw error;
      }

      return NextResponse.json({ success: true, link: data });
    }

    // ب. إرسال رسالة مجهولة تماماً من المخدوم
    if (action === "send_message") {
      const { linkId, servantId, content } = body;
      if (!linkId || !servantId || !content?.trim()) {
        return NextResponse.json({ error: "يرجى كتابة نص السؤال أو الاستفسار" }, { status: 400 });
      }

      // إدراج الرسالة بدون تسجيل أي IP أو User Agent أو بيانات شخصية (مجهولة 100%)
      const { data, error } = await supabaseAdmin
        .from("saraha_messages")
        .insert({
          link_id: linkId,
          servant_id: servantId,
          content: content.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "تم إرسال سؤالك للخادم بنجاح وبسرية تامة.",
      });
    }

    // ج. تحديث حالة الرابط أو حذف رسالة
    if (action === "delete_message") {
      const { messageId, userId } = body;
      const { error } = await supabaseAdmin
        .from("saraha_messages")
        .delete()
        .eq("id", messageId)
        .eq("servant_id", userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Saraha POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
