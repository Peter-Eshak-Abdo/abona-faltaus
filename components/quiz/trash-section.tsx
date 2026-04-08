"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Trash2, X } from "lucide-react"

export default function TrashSection({ userId, onClose, onRestore }: any) {
  const [trashed, setTrashed] = useState<any[]>([])
  const supabase = createClient()

  const loadTrash = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("created_by", userId)
      .eq("is_deleted", true)
    setTrashed(data || [])
  }

  useEffect(() => { loadTrash() }, [userId])

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from("quizzes").update({ is_deleted: false }).eq("id", id)
    if (!error) {
      setTrashed(prev => prev.filter(q => q.id !== id))
      onRestore()
    }
  }

  const handlePermanentDelete = async (id: string) => {
    if (confirm("سيتم حذف المسابقة نهائياً من السيرفر، هل أنت متأكد؟")) {
      const { error } = await supabase.from("quizzes").delete().eq("id", id)
      if (!error) setTrashed(prev => prev.filter(q => q.id !== id))
    }
  }

  return (
    <Card className="mt-1 border-red-200 bg-red-50/20 backdrop-blur-sm shadow-inner" dir="rtl">
      <CardHeader className="flex flex-row items-center justify-between border-b border-red-100 pb-3">
        <div className="flex items-center gap-1">
          <Trash2 className="text-red-600" size={20} />
          <CardTitle className="text-red-600 text-lg font-bold">سلة المحذوفات</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-red-100">
          <X size={18} />
        </Button>
      </CardHeader>
      <CardContent className="pt-1">
        {trashed.length === 0 ? (
          <p className="text-center py-1 text-gray-500 font-medium">لا توجد مسابقات محذوفة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {trashed.map(q => (
              <div key={q.id} className="bg-white p-1 rounded-xl border border-red-100 flex justify-between items-center shadow-sm">
                <span className="font-bold text-gray-700">{q.title}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleRestore(q.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                    <RotateCcw size={14} className="ml-1" /> استعادة
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(q.id)}>
                    حذف نهائي
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
