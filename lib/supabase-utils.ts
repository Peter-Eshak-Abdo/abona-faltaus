import { supabase } from "@/lib/supabase"
import type { Quiz, Group, GameState } from "@/types/quiz";

// دالة لتوليد كود رقمي عشوائي فريد من 8 إلى 10 أرقام
export const generateUniqueQuizCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    // توليد كود من 8 أرقام عشوائية تبدأ برقم غير صفري
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const { data } = await supabase.from("quizzes").select("id").eq("code", code).maybeSingle();
    if (!data) return code;
  }
  // في حال وجود تصادم نادر جداً، توليد كود من 10 أرقام
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// --- Quiz Operations ---
export const createQuiz = async (quiz: Omit<Quiz, "id" | "createdAt"> & { code?: string }) => {
  const generatedCode = quiz.code || (await generateUniqueQuizCode());
  
  const insertPayload: any = {
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
    shuffle_questions: quiz.shuffle_questions || false,
    shuffle_choices: quiz.shuffle_choices || false,
    created_by: quiz.created_by || "guest",
    created_at: new Date().toISOString(),
    deleted_at: null,
    is_deleted: false,
    code: generatedCode,
  };

  const { data, error } = await supabase
    .from("quizzes")
    .insert([insertPayload])
    .select()
    .single();

  if (error) {
    // إذا كان حقل code غير موجود بعد في جدول Supabase كـ column، نحاول الإدخال بدونه ونحفظ الكود داخل JSON أو البيانات
    if (error.message?.includes("code") || error.code === "PGRST204") {
      delete insertPayload.code;
      const fallback = await supabase.from("quizzes").insert([insertPayload]).select().single();
      if (fallback.error) throw fallback.error;
      await supabase.from("game_state").insert([{ quiz_id: fallback.data.id }]);
      return { id: fallback.data.id, code: generatedCode };
    }
    throw error;
  }

  // إنشاء صفحة حالة اللعبة تلقائياً عند إنشاء المسابقة
  await supabase.from("game_state").insert([{ quiz_id: data.id }]);

  return { id: data.id, code: data.code || generatedCode };
};

export const getQuiz = async (quizIdOrCode: string): Promise<Quiz | null> => {
  const clean = quizIdOrCode.trim();
  const isNumericCode = /^\d{8,10}$/.test(clean);
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  let data: any = null;

  if (isNumericCode) {
    // البحث في admin_code
    try {
      const res = await supabase.from("quizzes").select("*").eq("admin_code", clean).maybeSingle();
      if (res.data) data = res.data;
    } catch {
      // ignore
    }
  }

  // 3. إذا كان UUID صالحاً نبحث في حقل id
  if (!data && isUUID) {
    try {
      const res = await supabase.from("quizzes").select("*").eq("id", clean).maybeSingle();
      if (res.data) data = res.data;
    } catch {
      // ignore
    }
  }

  // 4. إذا لم يكن كود رقمي ولا UUID نبحث ككود نصي في admin_code
  if (!data && !isNumericCode && !isUUID) {
    try {
      const res = await supabase.from("quizzes").select("*").eq("admin_code", clean.toUpperCase()).maybeSingle();
      if (res.data) data = res.data;
    } catch {
      // ignore
    }
  }

  // 5. إذا لم نجد في السيرفر، نبحث في التاريخ المحلي والكاش
  if (!data && typeof window !== "undefined") {
    try {
      const savedHistory = localStorage.getItem("my_quizzes_history");
      if (savedHistory) {
        const history: any[] = JSON.parse(savedHistory);
        const match = history.find((h) => h.code === clean || h.id === clean);
        if (match && match.id) {
          const res = await supabase.from("quizzes").select("*").eq("id", match.id).maybeSingle();
          if (res.data) {
            data = res.data;
            if (!data.code && match.code) data.code = match.code;
          }
        }
      }

      if (!data) {
        const { getLocalQuizList } = await import("@/lib/offline-quiz-store");
        const localList = await getLocalQuizList();
        const localMatch = localList.find((q: any) => q.code === clean || q.id === clean || q.admin_code === clean);
        if (localMatch) data = localMatch;
      }
    } catch (e) {
      console.warn("Local lookup fallback error:", e);
    }
  }

  if (!data) return null;

  return {
    id: data.id,
    code: data.code || data.admin_code || "",
    admin_code: data.admin_code,
    title: data.title,
    description: data.description,
    questions: data.questions,
    shuffleQuestions: data.shuffle_questions,
    shuffleChoices: data.shuffle_choices,
    createdAt: new Date(data.created_at || Date.now()),
    createdBy: data.created_by,
  } as unknown as Quiz;
};

export const updateQuiz = async (quizId: string, updates: any) => {
  // console.log("🛠️ جاري تحديث المسابقة رقم:", quizId, "بالبيانات:", updates);

  const { data, error } = await supabase
    .from("quizzes")
    .update(updates)
    .eq("id", quizId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("❌ خطأ أثناء التحديث في Supabase:", error);
    throw error;
  }

  console.log("✅ تم التحديث بنجاح، البيانات الجديدة من السيرفر:", data);
  return data as unknown as Quiz;
};

export const deleteQuiz = async (quizId: string) => {
  // 1. جلب بيانات المسابقة قبل الحذف
  const { data: quizData } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizData) {
    // 2. نقلها للسلة
    await supabase.from("trashed_quizzes").insert([
      {
        original_id: quizId,
        data: quizData,
        created_by: quizData.created_by,
      },
    ]);

    // 3. حذفها (سيتم حذف المجموعات والحالة تلقائياً بسبب ON DELETE CASCADE)
    await supabase.from("quizzes").delete().eq("id", quizId);
  }
};

export const getUserQuizzes = async (userId: string): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(
    (q: {
      created_at: string | number | Date;
      shuffle_questions: any;
      shuffle_choices: any;
    }) => ({
      ...q,
      createdAt: new Date(q.created_at),
      shuffleQuestions: q.shuffle_questions,
      shuffleChoices: q.shuffle_choices,
    }),
  ) as unknown as Quiz[];
};

// --- Group Operations ---
export const joinQuizAsGroup = async (quizId: string, groupData: any) => {
  // التأكد من عدم تكرار اسم المجموعة
  const { data: existingGroup } = await supabase
    .from("quiz_groups")
    .select("id")
    .eq("quiz_id", quizId)
    .eq("group_name", groupData.groupName)
    .maybeSingle();

  if (existingGroup) throw new Error("اسم المجموعة موجود بالفعل");

  const { data, error } = await supabase
    .from("quiz_groups")
    .insert([
      {
        quiz_id: quizId,
        group_name: groupData.groupName,
        members: groupData.members,
        saint_name: groupData.saintName,
        saint_image: groupData.saintImage,
        score: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getQuizGroups = (
  quizId: string,
  callback: (groups: Group[]) => void,
) => {
  // جلب البيانات لأول مرة
  supabase
    .from("quiz_groups")
    .select("*")
    .eq("quiz_id", quizId)
    .order("joined_at", { ascending: true })
    .then(({ data }: { data: any }) => {
      if (data) callback(data as unknown as Group[]);
    });

  // الاشتراك في التغييرات اللحظية
  const channel = supabase
    .channel(`groups-${quizId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "quiz_groups",
        filter: `quiz_id=eq.${quizId}`,
      },
      () => {
        // إعادة الجلب عند حدوث أي تغيير
        supabase
          .from("quiz_groups")
          .select("*")
          .eq("quiz_id", quizId)
          .order("joined_at", { ascending: true })
          .then(({ data }: { data: any }) => {
            if (data) callback(data as unknown as Group[]);
          });
      },
    )
    .subscribe();
  // إرجاع دالة لإلغاء الاشتراك عند تدمير الكومبوننت
  return () => {
    supabase.removeChannel(channel);
  };
};

// --- Game State Operations ---
export const startQuiz = async (quizId: string) => {
  const { error } = await supabase.from("game_state").upsert(
    {
      quiz_id: quizId,
      is_active: true,
      current_question_index: 0,
      show_results: false,
      started_at: new Date().toISOString(),
      // لو الأعمدة التالية سببت 400 احذفها مؤقتاً للتأكد
      question_start_time: new Date().toISOString(),
      show_question_only: true,
    },
    { onConflict: "quiz_id" } as any,
  );

  if (error) {
    console.error("❌ خطأ في بدء المسابقة (400):", error.message);
    throw error;
  }

  // تصفير المجموعات والردود
  await supabase.from("quiz_groups").update({ score: 0 }).eq("quiz_id", quizId);
  await supabase.from("quiz_responses").delete().eq("quiz_id", quizId);
};

export const nextQuestion = async (quizId: string, newIndex: number) => {
  await supabase
    .from("game_state")
    .update({
      current_question_index: newIndex,
      question_start_time: new Date().toISOString(),
      show_results: false,
      show_question_only: true,
    })
    .eq("quiz_id", quizId);
};

export const showQuestionResults = async (quizId: string) => {
  await supabase
    .from("game_state")
    .update({ show_results: true })
    .eq("quiz_id", quizId);
};

export const endQuiz = async (quizId: string) => {
  await supabase
    .from("game_state")
    .update({ is_active: false, show_results: true })
    .eq("quiz_id", quizId);
};

export const subscribeToGameState = (
  quizId: string,
  callback: (state: GameState) => void,
) => {
  // جلب الحالة الحالية أولاً
  supabase
    .from("game_state")
    .select("quiz_id, is_active, current_question_index, show_results")
    .eq("quiz_id", quizId)
    .maybeSingle()
    .then(({ data }: { data: any }) => {
      if (data) callback(data as unknown as GameState);
    });

  const channel = supabase
    .channel(`state-${quizId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_state",
        filter: `quiz_id=eq.${quizId}`,
      },
      (payload: { new: unknown }) => {
        callback(payload.new as unknown as GameState);
      },
    )
    .subscribe();
  // إرجاع دالة لإلغاء الاشتراك
  return () => {
    supabase.removeChannel(channel);
  };
};

// --- Responses & Scoring ---
export const submitResponse = async (
  quizId: string,
  groupId: string,
  response: any,
) => {
  await supabase.from("quiz_responses").insert([
    {
      quiz_id: quizId,
      group_id: groupId,
      question_index: response.questionIndex,
      choice_index: response.choiceIndex,
      is_correct: response.isCorrect,
      time_taken: response.timeTaken,
    },
  ]);
};

export const getQuestionResponses = async (
  quizId: string,
  questionIndex: number,
) => {
  const { data } = await supabase
    .from("quiz_responses")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("question_index", questionIndex);
  return data || [];
};

export const updateGroupScores = async (
  quizId: string,
  scores: Record<string, number>,
) => {
  // في Supabase نحدث كل مجموعة على حدة (أو باستخدام RPC لسرعة أكبر)
  const promises = Object.entries(scores).map(([groupId, score]) =>
    supabase.from("quiz_groups").update({ score }).eq("id", groupId),
  );
  await Promise.all(promises);
};

// --- Trash Management ---
export const getTrashedQuizzes = async (userId: string) => {
  const { data } = await supabase
    .from("trashed_quizzes")
    .select("*")
    .eq("created_by", userId)
    .order("deleted_at", { ascending: false });

  return (data || []).map(
    (t: {
      data: any;
      id: string;
      deleted_at: string | number | Date;
      expires_at: string | number | Date;
    }) => ({
      ...(t.data as object),
      trashId: t.id,
      deletedAt: new Date(t.deleted_at),
      expiresAt: new Date(t.expires_at),
    }),
  );
};

export const restoreQuiz = async (trashId: string) => {
  const { data: trash } = await supabase
    .from("trashed_quizzes")
    .select("*")
    .eq("id", trashId)
    .single();
  if (trash) {
    await supabase.from("quizzes").insert([trash.data]);
    await supabase.from("trashed_quizzes").delete().eq("id", trashId);
  }
};
export { supabase };
