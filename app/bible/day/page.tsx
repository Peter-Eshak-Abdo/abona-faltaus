"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaBookOpen, FaPlus, FaCopy, FaEdit, FaTrash, FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

type DayHistory = { code: string; title: string };

export default function DayPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState<"enter" | "create">("enter");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("my_days_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (newCode: string, newTitle: string, existingHistory: DayHistory[] = history) => {
    let updated = [...existingHistory];
    const index = updated.findIndex((h) => h.code === newCode);
    if (index > -1) {
      updated[index].title = newTitle;
    } else {
      updated.unshift({ code: newCode, title: newTitle });
    }
    setHistory(updated);
    localStorage.setItem("my_days_history", JSON.stringify(updated));
  };

  const removeFromHistory = async (codeToRemove: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا اليوم؟ سيتم حذفه من قاعدة البيانات أيضاً.")) return;

    await supabase.from("meeting_days").delete().eq("code", codeToRemove);

    const updated = history.filter((h) => h.code !== codeToRemove);
    setHistory(updated);
    localStorage.setItem("my_days_history", JSON.stringify(updated));
  };

  const handleEnterDay = async () => {
    if (code.length === 12) {
      const { data, error: dbError } = await supabase.from('meeting_days').select('title').eq('code', code).single();
      if (dbError || !data) {
        setError("الكود غير صحيح أو اليوم غير موجود");
        return;
      }
      saveHistory(code, data.title);
      router.push(`/bible/day/${code}`);
    } else {
      setError("الكود يجب أن يكون 12 رقم");
    }
  };

  const handleCreateDay = async () => {
    if (!title.trim()) {
      setError("يرجى كتابة اسم اليوم/الفقرة");
      return;
    }
    setIsCreating(true);
    setError("");

    const newCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();

    const { error: dbError } = await supabase
      .from("meeting_days")
      .insert([{ code: newCode, title, verses: [] }]);

    if (dbError) {
      setError("حدث خطأ أثناء الإنشاء، حاول مرة أخرى.");
      setIsCreating(false);
    } else {
      saveHistory(newCode, title);
      router.push(`/bible/day/${newCode}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("تم نسخ الكود: " + text);
  };

  const startEditing = (item: DayHistory) => {
    setEditingCode(item.code);
    setEditTitle(item.title);
  };

  const saveEditedTitle = async (code: string) => {
    if (!editTitle.trim()) return;
    await supabase.from("meeting_days").update({ title: editTitle }).eq("code", code);
    saveHistory(code, editTitle);
    setEditingCode(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-start p-0.5 text-zinc-900 dark:text-zinc-100 font-arabic pt-1">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-1 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 mb-1">

        {/* <div className="flex justify-around mb-1 text-blue-600 item-center">
          <div>
          </div>
          </div>
          */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <div className="w-3 h-3 rounded-full overflow-hidden bg-white relative flex items-center justify-center">
              <Link href="/bible" className="p-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition">
                <FaArrowRight />
              </Link>
            </div>
          </div>
          <div className="flex flex-row">
            <FaBookOpen size={18} />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-start ps-0.5">فقرات الاجتماع</h1>
              <span className="text-xs text-[#564243] flex items-center">
                <p className="text-center text-zinc-500 mb-1 text-sm">اعرض الآيات بشكل كامل ورتبها لاجتماعك بسهولة.</p>
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-0.5 mb-1 bg-zinc-100 dark:bg-zinc-800 p-0.25 rounded-xl">
          <button
            className={`flex-1 py-0.5 font-bold rounded-lg transition ${mode === "enter" ? "bg-white dark:bg-zinc-700 shadow text-blue-600" : "text-zinc-500"}`}
            onClick={() => { setMode("enter"); setError(""); }}
          >
            الدخول بكود
          </button>
          <button
            className={`flex-1 py-0.5 font-bold rounded-lg transition ${mode === "create" ? "bg-white dark:bg-zinc-700 shadow text-blue-600" : "text-zinc-500"}`}
            onClick={() => { setMode("create"); setError(""); }}
          >
            إنشاء فقرة جديد
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center font-bold mb-1">{error}</p>}

        {mode === "enter" ? (
          <div className="space-y-1">
            <div>
              <label className="block text-sm font-bold mb-0.5">كود الفقرة (12 رقم)</label>
              <input
                type="text"
                maxLength={12}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full p-0.5 border rounded-xl text-center tracking-[0.2em] font-bold text-2xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                dir="ltr"
                placeholder="123456789012"
              />
            </div>
            <button
              onClick={handleEnterDay}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded-xl transition shadow-lg shadow-blue-500/30"
            >
              عرض الآيات
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            <div>
              <label className="block text-sm font-bold mb-0.5">اسم اليوم أو عنوان الفقرة</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-0.5 border rounded-xl font-bold bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: اجتماع الشباب - المحبة"
              />
            </div>
            <button
              onClick={handleCreateDay}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-0.5"
            >
              {isCreating ? "جاري الإنشاء..." : <><FaPlus /> إنشاء الكود</>}
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-1 rounded-3xl shadow border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-black mb-1">الفقرات السابقة</h2>
          <div className="space-y-1">
            {history.map((item) => (
              <div key={item.code} className="bg-zinc-50 dark:bg-zinc-800 p-0.5 rounded-xl flex flex-col gap-0.5 border border-zinc-100 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  {editingCode === item.code ? (
                    <div className="flex w-full gap-0.5">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 p-0.25 border rounded font-bold dark:bg-zinc-700 dark:border-zinc-600 outline-none"
                      />
                      <button onClick={() => saveEditedTitle(item.code)} className="text-green-600 p-0.5"><FaCheck /></button>
                      <button onClick={() => setEditingCode(null)} className="text-red-500 p-0.5"><FaTimes /></button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-md cursor-pointer hover:text-blue-600 transition" onClick={() => router.push(`/bible/day/${item.code}`)}>
                        {item.title}
                      </h3>
                      <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-700 px-0.5 py-0.25 rounded text-zinc-600 dark:text-zinc-300">
                        {item.code}
                      </span>
                    </>
                  )}
                </div>

                {editingCode !== item.code && (
                  <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-0.5">
                    <button
                      onClick={() => router.push(`/bible/day/${item.code}`)}
                      className="text-sm text-blue-600 font-bold flex items-center gap-0.25 hover:underline"
                    >
                      دخول <FaArrowLeft size={10} />
                    </button>
                    <div className="flex gap-0.5">
                      <button onClick={() => copyToClipboard(item.code)} className="p-0.5 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="نسخ الكود">
                        <FaCopy />
                      </button>
                      <button onClick={() => startEditing(item)} className="p-0.5 text-zinc-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition" title="تعديل الاسم">
                        <FaEdit />
                      </button>
                      <button onClick={() => removeFromHistory(item.code)} className="p-0.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="حذف">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
