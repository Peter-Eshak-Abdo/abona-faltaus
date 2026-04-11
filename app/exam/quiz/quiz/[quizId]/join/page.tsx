"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SAINTS_DATA } from "@/lib/saints-data"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function JoinQuizPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;
  const router = useRouter();
  const supabase = createClient();

  // --- الـ States المختصرة ---
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedSaint, setSelectedSaint] = useState<any>(null);
  // مصفوفة واحدة تبدأ بـ 5 خانات فارغة
  const [members, setMembers] = useState<string[]>(Array(5).fill(""));
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const membersSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
      setQuiz(data);
    };
    fetchQuiz();

    const channel = supabase
      .channel(`game-state-${quizId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_state',
        filter: `quiz_id=eq.${quizId}`
      }, (payload) => {
        if (payload.new.is_active && hasJoined) {
          router.push(`/exam/quiz/quiz/${quizId}/play`);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [quizId, hasJoined, router]);

  const handleJoin = async () => {
    if (!selectedSaint) return alert("يرجى اختيار اسم الفريق (الشفيع)");

    // تصفية الأسماء الفارغة
    const filledMembers = members.filter(n => n.trim() !== "");
    if (filledMembers.length === 0) return alert("يرجى إدخال اسم عضو واحد على الأقل");

    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_groups")
      .insert({
        quiz_id: quizId,
        group_name: selectedSaint.name,
        members: filledMembers,
        saint_image: selectedSaint.src,
        score: 0
      })
      .select().single();

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      localStorage.setItem(`team_id_${quizId}`, data.id);
      setHasJoined(true);
      setLoading(false);
    }
  };

  // دالة تحديث العدد بقت أبسط بكتير
  const handleCountChange = (newCount: number) => {
    setMembers(prev => {
      if (newCount > prev.length) {
        return [...prev, ...Array(newCount - prev.length).fill("")];
      }
      return prev.slice(0, newCount);
    });
  };

  if (!quiz) return <div className="p-2 text-center font-bold">جاري تحميل البيانات...</div>;

  if (hasJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#46178f] text-white p-1 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <div className="bg-white p-1 rounded-full mb-1 inline-block shadow-xl">
            <img src={selectedSaint?.src} className="w-12 h-20 rounded-full object-cover" alt="saint" />
          </div>
          <h1 className="text-4xl font-black mb-1">عاش يا أبطال فريق
            <p className="font-bold text-5xl">{selectedSaint?.name}</p>
            <div className="flex flex-wrap gap-1 justify-center p-1 bg-black/20 rounded-lg max-h-[60px] overflow-y-auto custom-scrollbar">
              {members?.map((name: string, index: number) => (
                <span key={index} className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-slate-300">
                  {name}
                </span>
              ))}
            </div>
          </h1>

          <p className="text-xl opacity-80">الفريق سجل بنجاح، خليكم جاهزين..</p>
          <div className="mt-1 flex gap-1 justify-center">
            {[0, 200, 400].map((delay) => (
              <div key={delay} className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-1" dir="rtl">
      <Card className="max-w-4xl mx-auto shadow-2xl border-none overflow-hidden">
        <CardHeader className="bg-[#46178f] text-white text-center py-1">
          <CardTitle className="text-5xl font-black">{quiz.title}</CardTitle>
          <p className="opacity-70 font-bold">انضم للمسابقة الآن</p>
        </CardHeader>

        <CardContent className="p-1 space-y-1">
          {/* 1. اختيار الشفيع */}
          <section>
            <h3 className="text-xl font-black mb-1 text-slate-800 flex items-center gap-1">
              <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-sm">1</span>
              اختار اسم الفريق (شفيعك)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
              {SAINTS_DATA.map((saint) => {
                const isSelected = selectedSaint?.name === saint.name;
                return (
                  <button
                    key={saint.name}
                    onClick={() => {
                      setSelectedSaint(saint);
                      setTimeout(() => membersSectionRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
                    }}
                    className={`flex flex-col items-center p-1 rounded-2xl transition-all border-2
                      ${isSelected ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={saint.src} className="w-20 h-10 rounded-full object-cover mb-1 shadow-sm" alt={saint.name} />
                    <span className="text-xs font-black text-center">{saint.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. أسماء الأعضاء */}
          <section ref={membersSectionRef} className="pt-1 border-t">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-1">
                <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-sm">2</span>
                أسماء الأعضاء
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border">
                <button onClick={() => handleCountChange(Math.max(1, members.length - 1))} className="w-3 h-3 bg-white rounded-xl shadow-sm font-black text-xl text-blue-600 hover:bg-blue-50">-</button>
                <span className="font-black text-2xl text-blue-700 w-2 text-center">{members.length}</span>
                <button onClick={() => handleCountChange(Math.min(10, members.length + 1))} className="w-3 h-3 bg-white rounded-xl shadow-sm font-black text-xl text-blue-600 hover:bg-blue-50">+</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {members.map((name, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <input
                    type="text"
                    placeholder={`اسم العضو ${index + 1}...`}
                    className="w-full p-1 rounded-xl border-2 border-zinc-100 focus:border-blue-500 focus:bg-white outline-none font-bold bg-zinc-50/50 transition-all"
                    value={name}
                    onChange={(e) => {
                      const newMembers = [...members];
                      newMembers[index] = e.target.value;
                      setMembers(newMembers);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          <Button
            disabled={loading}
            onClick={handleJoin}
            className="w-full py-1 text-2xl font-black bg-green-400 hover:bg-green-700 rounded-2xl transition-all shadow-[0_8px_0_0_#15803d] active:translate-y-1 active:shadow-none"
          >
            {loading ? "جاري الانضمام..." : "انضم الآن 🚀"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
