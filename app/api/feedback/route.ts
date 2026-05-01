import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// جلب التقييمات (التاريخ)
export async function GET() {
  const supabase = await createClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ reviews: [] });

  // جلب تقييمات المستخدم الحالية + التقييمات العامة للآخرين (اختياري)
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// إرسال تقييم جديد
export async function POST(request: Request) {
  const { name, email, feedback, rating, is_public } = await request.json();
  const supabase = await createClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          name: name || null,
          email: email || null,
          feedback_text: feedback,
          rating: rating,
          is_public: is_public ?? true,
          user_id: user?.id || null,
        },
      ]).select().single();

    if (error) throw error;

    // --- تنبيه المسؤول فوراً (OneSignal) ---
    // يمكنك استدعاء دالة هنا لإرسال Push Notification لجهازك كمسؤول

    return NextResponse.json({ message: 'تم بنجاح', data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
