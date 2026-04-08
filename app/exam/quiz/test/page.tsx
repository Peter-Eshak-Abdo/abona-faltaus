"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createQuiz,
  updateQuiz,
  startQuiz,
  joinQuizAsGroup,
  submitResponse,
  endQuiz,
  subscribeToGameState
} from "@/lib/supabase-utils";

export default function FullTestPage() {
  const [log, setLog] = useState<string[]>([]);
  const [testQuizId, setTestQuizId] = useState<string | null>(null);
  const [testGroupId, setTestGroupId] = useState<string | null>(null);
  const supabase = createClient();

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLog((prev) => [...prev, `[${time}] ${msg}`]);
    console.log(msg); // للطباعة في الـ Console أيضاً
  };

  const runFullTest = async () => {
    try {
      addLog("🚀 بدأ اختبار دورة الحياة الكاملة...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول أولاً!");

      // 1. إنشاء المسابقة
      addLog("⏳ 1. جاري إنشاء مسابقة...");
      const quizId = await createQuiz({
        title: "مسابقة الأبطال (اختبار)",
        description: "مسابقة لتجربة النظام الكامل",
        questions: [{
          id: "q1", type: "multiple-choice", text: "ما هي عاصمة مصر؟",
          choices: ["الإسكندرية", "القاهرة", "أسوان", "الأقصر"],
          correctAnswer: 1, timeLimit: 20
        }],
        shuffle_questions: false,
        shuffle_choices: false,
        created_by: user.id,
        created_at: "",
        deleted_at: null,
        is_deleted: false
      });
      setTestQuizId(quizId);
      addLog(`✅ تم إنشاء المسابقة! ID: ${quizId}`);

      // 2. تعديل المسابقة
      addLog("⏳ 2. جاري تعديل المسابقة...");
      const updatedQuiz = await updateQuiz(quizId, { title: "مسابقة الأبطال (مُعدلة)" });
      addLog(`✅ تم التعديل! العنوان الجديد: ${updatedQuiz?.title || "تحذير: القيمة ما زالت undefined"}`);

      // 3. انضمام فريق
      addLog("⏳ 3. جاري دخول فريق...");
      const groupId = await joinQuizAsGroup(quizId, {
        groupName: "فريق النسور",
        members: ["بيتر", "أحمد", "مينا"],
        saintName: "مارجرجس",
      });
      setTestGroupId(groupId);
      addLog(`✅ تم إنشاء الفريق! ID: ${groupId}`);

      // إعداد المستمع (Listener) قبل بدء اللعبة
      subscribeToGameState(quizId, (state) => {
        addLog(`📡 (Real-time) حالة اللعبة تغيرت: IsActive=${state.is_active}, Question=${state.current_question_index}`);
      });

      // 4. بدء المسابقة
      addLog("⏳ 4. جاري بدء المسابقة...");
      await startQuiz(quizId);
      addLog(`✅ تم البدء بنجاح!`);

      // تأخير بسيط لمحاكاة وقت التفكير
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 5. إرسال إجابة للفريق
      addLog("⏳ 5. جاري إرسال إجابة للفريق...");
      await submitResponse(quizId, groupId, {
        questionIndex: 0,
        choiceIndex: 1, // إجابة صحيحة (القاهرة)
        isCorrect: true,
        timeTaken: 5
      });
      addLog(`✅ تم تسجيل الإجابة بنجاح!`);

      // 6. إنهاء المسابقة
      addLog("⏳ 6. جاري إنهاء المسابقة...");
      await endQuiz(quizId);
      addLog(`✅ تم إنهاء المسابقة بنجاح! 🏁`);

    } catch (err: any) {
      addLog(`❌ حدث خطأ فادح: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="p-1 font-sans bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-blue-900">🧪 غرفة عمليات Supabase</h1>
        <p className="text-gray-600 mb-1">هذه الصفحة تختبر الدورة الكاملة لإنشاء مسابقة، دخول فريق، والإجابة.</p>

        <button
          onClick={runFullTest}
          className="p-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all mb-1 flex items-center gap-1"
        >
          ▶️ تشغيل الاختبار الشامل (Run All)
        </button>

        <div className="bg-gray-900 text-green-400 p-1 rounded-2xl h-[700px] overflow-y-auto font-mono text-sm shadow-inner border-4 border-gray-800">
          {log.length === 0 && <span className="text-gray-500 animate-pulse">في انتظار بدء الاختبار...</span>}
          {log.map((l, i) => (
            <div key={i} className={`mb-1 ${l.includes('❌') ? 'text-red-400' : l.includes('✅') ? 'text-green-400' : l.includes('📡') ? 'text-purple-400' : 'text-blue-300'}`}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
