'use client';
import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminReviewsClient from '@/components/AdminReviewsClient';

export default async function AdminPage() {
  const supabase = await createClient({ cookies });

  // 1. جلب بيانات المستخدم المسجل حالياً
  const { data: { user }, error } = await supabase.auth.getUser();

  // 2. تحديد الإيميل الخاص بك كمسؤول
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_GMAIL;

  // 3. التحقق: إذا لم يكن مسجل دخول أو الإيميل غير مطابق، اطرده برا الصفحة
  if (error || !user || user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  return (
    <div className="container mx-auto p-1">
      <h1 className="text-2xl font-bold">لوحة تحكم المسؤول</h1>
      <AdminReviewsClient />
    </div>
  );
}
