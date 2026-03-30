"use client"
import { supabase } from "@/lib/supabase" // الكلاينت العادي
import { useEffect, useState } from "react"

export default function TestPage() {
  const [status, setStatus] = useState("جاري الفحص...")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function check() {
      // 1. اختبار الاتصال وجلب بيانات
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setStatus(`❌ فشل الاتصال: ${error.message}`)
      } else {
        setStatus("✅ الاتصال بـ Supabase سليم!")
        setData(data)
      }
    }
    check()
  }, [])

  return (
    <div style={{ padding: "20px", direction: "rtl" }}>
      <h2>رادار الفحص الذاتي:</h2>
      <p>الحالة: <strong>{status}</strong></p>
      {data && <p>تم قراءة بيانات بنجاح من جدول Profiles.</p>}
    </div>
  )
}
