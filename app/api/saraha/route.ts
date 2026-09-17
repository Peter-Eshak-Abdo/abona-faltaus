import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// GET: جلب صندوق الخادم ورسائله (للخادم بعد التحقق) أو جلب بيانات الرابط (للمخدوم)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const userId = searchParams.get("userId");
    const linkId = searchParams.get("linkId");

    // 1. إذا كان المطلوب جلب صفحة المخدوم بالـ slug (عام ومتاح للجميع)
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

    // 2. إذا كان المطلوب جلب لوحة تحكم الخادم ورسائله (يتطلب التحقق من هوية الخادم)
    if (userId) {
      const serverSupabase = await createClient();
      const {
        data: { user: currentUser },
      } = await serverSupabase.auth.getUser();

      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول للوصول لصندوق الصراحة" }, { status: 401 });
      }

      if (currentUser.id !== userId) {
        return NextResponse.json({ error: "غير مصرح لك بالوصول لرسائل هذا الحساب" }, { status: 403 });
      }

      const { data: links, error: linkErr } = await supabaseAdmin
        .from("saraha_links")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (linkErr) throw linkErr;

      let msgQuery = supabaseAdmin
        .from("saraha_messages")
        .select("*")
        .eq("servant_id", currentUser.id);

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

    const serverSupabase = await createClient();
    const {
      data: { user: currentUser },
    } = await serverSupabase.auth.getUser();

    // أ. إنشاء رابط جديد للخادم (يتطلب تسجيل دخول)
    if (action === "create_link") {
      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول لإنشاء رابط" }, { status: 401 });
      }

      const { slug, title, description } = body;
      if (!slug) {
        return NextResponse.json({ error: "بيانات الرابط غير مكتملة" }, { status: 400 });
      }

      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

      const { data, error } = await supabaseAdmin
        .from("saraha_links")
        .insert({
          user_id: currentUser.id,
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

    // ب. إرسال رسالة مجهولة تماماً من المخدوم (عام بدون تسجيل دخول)
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

    // ج. حذف رسالة (يتطلب أن يكون المستخدم هو الخادم المستلم)
    if (action === "delete_message") {
      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
      }

      const { messageId } = body;
      const { error } = await supabaseAdmin
        .from("saraha_messages")
        .delete()
        .eq("id", messageId)
        .eq("servant_id", currentUser.id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Saraha POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
