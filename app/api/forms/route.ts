import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");

    // 1. جلب استبيان محدد للمخدومين للإجابة عليه
    if (formId) {
      const { data: form, error } = await supabaseAdmin
        .from("church_forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error || !form) {
        return NextResponse.json({ error: "الاستبيان غير موجود" }, { status: 404 });
      }

      // جلب الردود للوحة التحكم
      const { data: responses } = await supabaseAdmin
        .from("church_form_responses")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      return NextResponse.json({ success: true, form, responses: responses || [] });
    }

    // 2. جلب كافة استبيانات الخادم والمشاريع المشترك بها كـ Admin
    if (userId || userEmail) {
      let query = supabaseAdmin.from("church_forms").select("*");

      if (userId && userEmail) {
        query = query.or(`user_id.eq.${userId},admin_collaborators.cs.{${userEmail}}`);
      } else if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: forms, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      return NextResponse.json({ success: true, forms: forms || [] });
    }

    return NextResponse.json({ error: "معاملات غير صحيحة" }, { status: 400 });
  } catch (error: any) {
    console.error("Forms GET error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // أ. إنشاء استبيان جديد
    if (action === "create_form") {
      const { userId, title, description, fields, adminCollaborators } = body;
      if (!userId || !title?.trim()) {
        return NextResponse.json({ error: "يرجى تحديد عنوان الاستبيان" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from("church_forms")
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description?.trim() || "",
          fields: fields || [],
          admin_collaborators: adminCollaborators || [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, form: data });
    }

    // ب. تقديم إجابة استبيان من مخدوم
    if (action === "submit_response") {
      const { formId, responses } = body;
      if (!formId || !responses) {
        return NextResponse.json({ error: "بيانات الاستجابة غير مكتملة" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from("church_form_responses")
        .insert({
          form_id: formId,
          responses,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, response: data });
    }

    // ج. تحديث خدام الإدارة (Admins)
    if (action === "add_admin") {
      const { formId, newAdminEmail } = body;
      const { data: form } = await supabaseAdmin
        .from("church_forms")
        .select("admin_collaborators")
        .eq("id", formId)
        .single();

      const updatedAdmins = Array.from(new Set([...(form?.admin_collaborators || []), newAdminEmail.trim().toLowerCase()]));

      const { error } = await supabaseAdmin
        .from("church_forms")
        .update({ admin_collaborators: updatedAdmins })
        .eq("id", formId);

      if (error) throw error;
      return NextResponse.json({ success: true, admins: updatedAdmins });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Forms POST error:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
