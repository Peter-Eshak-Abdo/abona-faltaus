import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { withErrorHandling, requireAuth } from "@/lib/api-helpers";

// GET /api/articles - جلب المقالات المنشورة
export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("id, title, content, category, likes_count, views_count, created_at, author_id")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data || []);
  });
}

// POST /api/articles - إضافة مقال جديد للمستخدم المسجل
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    requireAuth(user);

    const body = await request.json();
    const { title, content, category } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "العنوان والمحتوى مطلوبان لإنشاء المقال" },
        { status: 400 }
      );
    }

    // إذا كان الكاتب هو الأدمن، يتم نشر المقال تلقائياً
    const isAdmin = user!.email === process.env.NEXT_PUBLIC_GMAIL;

    const { data, error } = await supabase
      .from("articles")
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          category: category || "عام",
          author_id: user!.id,
          is_published: isAdmin, // منشور مباشرة لو الأدمن
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data, { status: 201 });
  });
}
