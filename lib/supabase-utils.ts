import { createClient } from "@/lib/supabase/client";
import type { Quiz, Group, GameState } from "@/types/quiz";

const supabase = createClient();

// --- Quiz Operations ---
export const createQuiz = async (quiz: Omit<Quiz, "id" | "createdAt">) => {
  const { data, error } = await supabase
    .from("quizzes")
    .insert([
      {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        shuffle_questions: quiz.shuffle_questions || false,
        shuffle_choices: quiz.shuffle_choices || false,
        created_by: quiz.created_by,
        created_at: new Date().toISOString(),
        deleted_at: null,
        is_deleted: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // إنشاء صفحة حالة اللعبة تلقائياً عند إنشاء المسابقة
  await supabase.from("game_state").insert([{ quiz_id: data.id }]);

  return data.id;
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    questions: data.questions,
    shuffleQuestions: data.shuffle_questions,
    shuffleChoices: data.shuffle_choices,
    createdAt: new Date(data.created_at),
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
export { createClient };

