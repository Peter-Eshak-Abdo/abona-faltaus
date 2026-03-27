"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TrashSection({ userId, onClose, onRestore }: any) {
  const [trashed, setTrashed] = useState<any[]>([])

  useEffect(() => {
    const loadTrash = async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("created_by", userId)
        .eq("is_deleted", true)
      setTrashed(data || [])
    }
    loadTrash()
  }, [userId])

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from("quizzes").update({ is_deleted: false }).eq("id", id)
    if (!error) {
      setTrashed(prev => prev.filter(q => q.id !== id))
      onRestore()
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (confirm("سيتم حذف المسابقة نهائياً، هل أنت متأكد؟")) {
      const { error } = await supabase.from("quizzes").delete().eq("id", id)
      if (!error) setTrashed(prev => prev.filter(q => q.id !== id))
    }
  }

  return (
    <Card className="mt-1 border-dashed border-2 border-red-200 bg-red-50/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-red-600">سلة المحذوفات</CardTitle>
        <Button variant="ghost" onClick={onClose}>إغلاق</Button>
      </CardHeader>
      <CardContent>
        {trashed.length === 0 ? <p className="text-center py-1">السلة فارغة</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {trashed.map(q => (
              <div key={q.id} className="bg-white p-1 rounded-lg border flex justify-between items-center">
                <span>{q.title}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleRestore(q.id)}>استعادة</Button>
                  <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(q.id)}>حذف نهائي</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
