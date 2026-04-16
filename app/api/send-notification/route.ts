// export async function GET() {
//   return NextResponse.json({ message: "Cron is temporarily disabled" });
// }

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
export async function GET(request: Request) {
  // حماية الـ API
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    // 1. اختبار الاتصال بالجدول وعدّ الصفوف الكلية
    const { count, error: countError } = await supabase
      .from("daily_verses_pool")
      .select("*", { count: "exact", head: true });

    // 2. اختبار سحب أول 3 صفوف عشان نشوف الأسامي صح ولا لا
    const { data: sampleData, error: sampleError } = await supabase
      .from("daily_verses_pool")
      .select("*")
      .limit(3);

    return NextResponse.json({
      connection: "Success",
      totalRowsInTable: count,
      sampleRows: sampleData,
      errors: { countError, sampleError },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
