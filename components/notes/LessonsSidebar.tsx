"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, X, PanelRight, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export interface SavedLesson {
  id: string;
  title: string;
  created_at: string;
  note_content: string;
  requirements?: any;
  options?: any;
  generated_content: string;
  extra_sources?: string[];
}

interface LessonsSidebarProps {
  onSelectLesson: (lesson: SavedLesson) => void;
  onNewLesson: () => void;
  currentLessonId?: string | null;
}

export default function LessonsSidebar({
  onSelectLesson,
  onNewLesson,
  currentLessonId,
}: LessonsSidebarProps) {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchLessons = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user || null);
      if (!session?.user) {
        // إذا لم يكن مسجلاً، جلب من LocalStorage كـ Fallback
        const localSaved = localStorage.getItem("local_saved_lessons");
        if (localSaved) {
          try {
            setLessons(JSON.parse(localSaved));
          } catch {}
        }
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("lesson_notes")
        .select("id, title, created_at, note_content, requirements, options, generated_content, extra_sources")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetch lessons warning:", error.message);
        // Fallback to local storage
        const localSaved = localStorage.getItem("local_saved_lessons");
        if (localSaved) setLessons(JSON.parse(localSaved));
      } else if (data) {
        setLessons(data);
      }
    } catch (err) {
      console.error("Fetch lessons error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const deleteLesson = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("هل أنت متأكد من حذف هذا الدرس المحفوظ؟")) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await supabase.from("lesson_notes").delete().eq("id", id);
      }

      const updated = lessons.filter((l) => l.id !== id);
      setLessons(updated);
      localStorage.setItem("local_saved_lessons", JSON.stringify(updated));
      toast.success("تم حذف الدرس");
    } catch (err) {
      console.error("Delete lesson error:", err);
      toast.error("تعذر حذف الدرس");
    }
  };

  return (
    <>
      {/* زرار فتح القائمة الجانبية */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          fetchLessons();
        }}
        className="flex items-center gap-0.25 px-0.5 py-0.25 bg-[#5c4538]/90 hover:bg-[#5c4538] text-[#e8cfae] rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all border border-[#e8cfae]/20 active:scale-95"
        title="الدروس السابقة"
      >
        <PanelRight size={16} />
        <span>الدروس المحفوظة 📚</span>
      </button>

      {/* شاشة الـ Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[310px] max-w-[85vw] bg-zinc-900 text-stone-100 z-50 flex flex-col shadow-2xl border-l border-zinc-800"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-1 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/60">
                <div className="flex items-center gap-0.25">
                  <BookOpen size={18} className="text-amber-500" />
                  <h2 className="font-black text-base text-amber-100">دروسي المحفوظة</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-0.25 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Button: درس جديد */}
              <div className="p-0.5 border-b border-zinc-800/80">
                <button
                  onClick={() => {
                    onNewLesson();
                    setIsOpen(false);
                  }}
                  className="w-full py-0.5 px-1 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-0.25 transition shadow-md"
                >
                  <Plus size={16} />
                  <span>تحضير درس جديد</span>
                </button>
              </div>

              {/* القائمة */}
              <div className="flex-1 overflow-y-auto p-1 space-y-0.25">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-1 text-zinc-500 gap-0.25">
                    <Loader2 size={24} className="animate-spin text-amber-500" />
                    <span className="text-xs">جاري تحميل دروسك...</span>
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="text-center py-2 px-1 text-zinc-500 space-y-0.25">
                    <BookOpen size={32} className="mx-auto opacity-30 text-amber-500" />
                    <p className="text-xs">لا توجد دروس محفوظة حتى الآن.</p>
                    <p className="text-[11px] text-zinc-600">
                      عندما تقوم بتوليد أي درس، سيتم حفظه هنا للرجوع إليه وتعديله في أي وقت.
                    </p>
                  </div>
                ) : (
                  lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        onSelectLesson(lesson);
                        setIsOpen(false);
                      }}
                      className={`p-0.5 rounded-2xl cursor-pointer flex justify-between items-start group transition-all border ${
                        currentLessonId === lesson.id
                          ? "bg-amber-500/20 border-amber-500/60 shadow-md"
                          : "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/50 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-0.25">
                        <p className="font-bold text-xs sm:text-sm text-stone-200 truncate">
                          {lesson.title || "درس بدون عنوان"}
                        </p>
                        <div className="flex items-center gap-0.25 text-[10px] text-zinc-400 mt-0.5">
                          <Calendar size={11} className="text-amber-500/80" />
                          <span>
                            {lesson.created_at
                              ? new Date(lesson.created_at).toLocaleDateString("ar-EG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "مسودة"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => deleteLesson(lesson.id, e)}
                        className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="حذف الدرس"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
