"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FaBookOpen, FaPlus } from "react-icons/fa";

export default function DayPortalPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [mode, setMode] = useState<"enter" | "create">("enter");
  const [error, setError] = useState("");

  const handleEnterDay = () => {
    if (code.length === 12) {
      localStorage.setItem("last_day_code", code);
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
      .from('meeting_days')
      .insert([{ code: newCode, title, verses: [] }]);

    if (dbError) {
      setError("حدث خطأ أثناء الإنشاء، حاول مرة أخرى.");
      setIsCreating(false);
    } else {
      localStorage.setItem("last_day_code", newCode);
      router.push(`/bible/day/${newCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-1 text-zinc-900 dark:text-zinc-100 font-arabic">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-1 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">

        <div className="flex justify-center mb-1 text-blue-600">
          <FaBookOpen size={12} />
        </div>

        <h1 className="text-2xl font-black text-center mb-1">فقرات وعروض الاجتماع</h1>
        <p className="text-center text-zinc-500 mb-1">اعرض الآيات بشكل كامل ورتبها لاجتماعك بسهولة.</p>

        <div className="flex gap-1 mb-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            className={`flex-1 py-1 font-bold rounded-lg transition ${mode === "enter" ? 'bg-white dark:bg-zinc-700 shadow text-blue-600' : 'text-zinc-500'}`}
            onClick={() => { setMode("enter"); setError(""); }}
          >
            الدخول بكود
          </button>
          <button
            className={`flex-1 py-1 font-bold rounded-lg transition ${mode === "create" ? 'bg-white dark:bg-zinc-700 shadow text-blue-600' : 'text-zinc-500'}`}
            onClick={() => { setMode("create"); setError(""); }}
          >
            إنشاء يوم جديد
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center font-bold mb-1">{error}</p>}

        {mode === "enter" ? (
          <div className="space-y-1">
            <div>
              <label className="block text-sm font-bold mb-1">كود اليوم (12 رقم)</label>
              <input
                type="text"
                maxLength={12}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full p-1 border rounded-xl text-center tracking-[0.2em] font-bold text-2xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="space-y-1">
            <div>
              <label className="block text-sm font-bold mb-1">اسم اليوم أو عنوان الفقرة</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-1 border rounded-xl font-bold bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: اجتماع الشباب - المحبة"
              />
            </div>
            <button
              onClick={handleCreateDay}
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 rounded-xl transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-1"
            >
              {isCreating ? "جاري الإنشاء..." : <><FaPlus /> إنشاء الكود</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
