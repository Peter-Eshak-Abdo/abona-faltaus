import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");

    const serverSupabase = await createClient();
    const {
      data: { user: currentUser },
    } = await serverSupabase.auth.getUser();

    // 1. جلب استبيان محدد
    if (formId) {
      const { data: form, error } = await supabaseAdmin
        .from("church_forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error || !form) {
        return NextResponse.json({ error: "الاستبيان غير موجود" }, { status: 404 });
      }

      // التحقق من الصلاحيات: هل المستخدم الحالي هو المالك أو خادم معتمد؟
      const isOwner = currentUser && currentUser.id === form.user_id;
      const isAdminCollaborator =
        currentUser &&
        currentUser.email &&
        Array.isArray(form.admin_collaborators) &&
        form.admin_collaborators.includes(currentUser.email.toLowerCase().trim());

      // إذا كان المالك أو المشرف، نرسل الردود. عدا ذلك (المخدوم)، لا نرسل الردود لمنع تسريب البيانات
      let responses: any[] = [];
      if (isOwner || isAdminCollaborator) {
        const { data: fetchedResponses } = await supabaseAdmin
          .from("church_form_responses")
          .select("*")
          .eq("form_id", formId)
          .order("submitted_at", { ascending: false });

        responses = fetchedResponses || [];
      }

      return NextResponse.json({
        success: true,
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          fields: form.fields,
          is_active: form.is_active,
          user_id: form.user_id,
          admin_collaborators: isOwner || isAdminCollaborator ? form.admin_collaborators : [],
          created_at: form.created_at,
        },
        responses,
      });
    }

    // 2. جلب كافة استبيانات الخادم (يتطلب تسجيل دخول مؤكد)
    if (userId || userEmail) {
      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
      }

      // التحقق من أن المستخدم يطلب بياناته الخاصة فقط
      if (userId && currentUser.id !== userId) {
        return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الاستبيانات" }, { status: 403 });
      }

      const activeEmail = (currentUser.email || userEmail || "").toLowerCase().trim();
      let query = supabaseAdmin.from("church_forms").select("*");

      if (currentUser.id && activeEmail) {
        query = query.or(`user_id.eq.${currentUser.id},admin_collaborators.cs.{${activeEmail}}`);
      } else {
        query = query.eq("user_id", currentUser.id);
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

    const serverSupabase = await createClient();
    const {
      data: { user: currentUser },
    } = await serverSupabase.auth.getUser();

    // أ. إنشاء استبيان جديد (يتطلب تسجيل دخول)
    if (action === "create_form") {
      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول لإنشاء استبيان" }, { status: 401 });
      }

      const { title, description, fields, adminCollaborators } = body;
      if (!title?.trim()) {
        return NextResponse.json({ error: "يرجى تحديد عنوان الاستبيان" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from("church_forms")
        .insert({
          user_id: currentUser.id,
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

    // ب. تقديم إجابة استبيان من مخدوم (عام ومفتوح)
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

    // ج. تحديث خدام الإدارة (Admins) (يتطلب أن يكون المستخدم المالك الفعلي)
    if (action === "add_admin") {
      if (!currentUser) {
        return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
      }

      const { formId, newAdminEmail } = body;
      if (!formId || !newAdminEmail?.trim()) {
        return NextResponse.json({ error: "بيانات الإضافة غير مكتملة" }, { status: 400 });
      }

      const { data: form, error: formErr } = await supabaseAdmin
        .from("church_forms")
        .select("user_id, admin_collaborators")
        .eq("id", formId)
        .single();

      if (formErr || !form) {
        return NextResponse.json({ error: "الاستبيان غير موجود" }, { status: 404 });
      }

      if (form.user_id !== currentUser.id) {
        return NextResponse.json({ error: "غير مصرح لك بإضافة مدراء لهذا الاستبيان" }, { status: 403 });
      }

      const updatedAdmins = Array.from(
        new Set([...(form?.admin_collaborators || []), newAdminEmail.trim().toLowerCase()])
      );

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
