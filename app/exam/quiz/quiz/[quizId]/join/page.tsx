"use client"

import { useState, useEffect, use, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SAINTS_DATA } from "@/lib/saints-data"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function JoinQuizPage({ params: paramsPromise }: { params: Promise<{ quizId: string }> }) {
  const params = use(paramsPromise);
  const quizId = params.quizId;
  const router = useRouter();
  const supabase = createClient();

  const [quiz, setQuiz] = useState<any>(null);
  const [selectedSaint, setSelectedSaint] = useState<any>(null);
  const [useCustomName, setUseCustomName] = useState(false);
  const [customTeamName, setCustomTeamName] = useState("");
  const [memberCount, setMemberCount] = useState(5);
  const [memberNames, setMemberNames] = useState<string[]>(Array(5).fill(""));
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const membersSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data } = await supabase.from("quizzes").select("*").eq("id", quizId).single();
      setQuiz(data);
    };
    fetchQuiz();

    // الاشتراك في حالة اللعبة - لو بدأت انقل الفريق فوراً لصفحة اللعب
    const channel = supabase
      .channel(`game-state-${quizId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state', filter: `quiz_id=eq.${quizId}` },
        (payload) => {
          if (payload.new.is_active && hasJoined) {
            router.push(`/exam/quiz/quiz/${quizId}/play`);
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [quizId, hasJoined, router]);

  const handleSaintSelect = (saint: any) => {
    setSelectedSaint(saint);
    // سكرول تلقائي لأسماء الأعضاء بعد 300ms عشان يلحق يشوف الاختيار
    setTimeout(() => {
      membersSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleJoin = async () => {
    const finalName = useCustomName ? customTeamName : selectedSaint?.name;
    if (!finalName) return alert("يرجى اختيار اسم الفريق");
    const filledMembers = memberNames.filter(n => n.trim() !== "");
    if (filledMembers.length === 0) return alert("يرجى إدخال أسماء الأعضاء");

    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_groups")
      .insert({
        quiz_id: quizId,
        group_name: finalName,
        members: filledMembers, // هنا Supabase هيقبلها كـ text[]
        saint_image: !useCustomName ? selectedSaint?.src : null,
        score: 0
      })
      .select().single();

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      localStorage.setItem(`team_id_${quizId}`, data.id);
      setHasJoined(true); // دي اللي هتعرض شاشة "انتظر الأدمن"
      setLoading(false);
    }
  };

  if (!quiz) return <div className="p-2 text-center font-bold">جاري تحميل البيانات...</div>;

  // إذا تم الانضمام، نعرض شاشة الانتظار (Lobby) للفريق
  if (hasJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#46178f] text-white p-1 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <div className="bg-white p-1 rounded-full mb-1 inline-block">
            <img src={selectedSaint?.src || "/placeholder-avatar.png"} className="w-24 h-24 rounded-full object-cover" />
          </div>
          <h1 className="text-4xl font-black mb-1">عاش يا أبطال!</h1>
          <p className="text-xl opacity-80">الفريق سجل بنجاح، خليكم جاهزين..</p>
          <div className="mt-8 flex gap-1 justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
          <p className="mt-1 text-sm opacity-60">أول ما الأدمن يبدأ، المسابقة هتفتح تلقائياً</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-1" dir="rtl">
      <Card className="max-w-7xl mx-auto shadow-2xl border-none">
        <CardHeader className="bg-[#46178f] text-white text-center rounded-t-xl">
          <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-1 space-y-1">

          <section>
            <h3 className="text-lg font-bold mb-1 text-slate-800">1. اختار اسم الفريق (شفيعك)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-1">
              {SAINTS_DATA.map((saint) => {
                const isSelected = selectedSaint?.name === saint.name;
                const isAnySelected = selectedSaint !== null;
                return (
                  <button
                    key={saint.name}
                    onClick={() => handleSaintSelect(saint)}
                    className={`flex flex-col items-center p-1 rounded-xl transition-all duration-300
                      ${isSelected ? 'bg-blue-100 ring-4 ring-blue-500 scale-110 z-10' : 'opacity-100'}
                      ${isAnySelected && !isSelected ? 'grayscale opacity-40 scale-95' : ''}`}
                  >
                    <img src={saint.src} className="w-16 h-16 rounded-full object-cover mb-1 shadow-md" />
                    <span className="text-[11px] font-bold text-center leading-tight">{saint.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section ref={membersSectionRef} className="pt-1 border-t">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-lg font-bold text-slate-800">2. أسماء الأعضاء</h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                <button onClick={() => setMemberCount(Math.max(1, memberCount - 1))} className="font-bold text-xl">-</button>
                <span className="font-black text-blue-700">{memberCount}</span>
                <button onClick={() => setMemberCount(Math.min(10, memberCount + 1))} className="font-bold text-xl">+</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {memberNames.map((name, i) => (
                <Input
                  key={i}
                  placeholder={`اسم العضو رقم ${i + 1}`}
                  value={name}
                  onChange={(e) => {
                    const next = [...memberNames];
                    next[i] = e.target.value;
                    setMemberNames(next);
                  }}
                  className="bg-white border-2 focus:border-blue-500"
                />
              ))}
            </div>
          </section>

          <Button
            disabled={loading}
            onClick={handleJoin}
            className="w-full py-1 text-2xl font-black bg-green-600 hover:bg-green-700 transition-all shadow-[0_5px_0_0_#15803d] active:translate-y-1 active:shadow-none"
          >
            {loading ? "جاري الانضمام..." : "انضم الآن 🚀"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
