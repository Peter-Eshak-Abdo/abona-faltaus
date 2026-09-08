import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { QuizSubmitAnswerSchema } from "@/lib/security-validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;

  // 1. Rate Limiting: Max 10 requests per minute per IP
  const ip = getClientIp(request);
  const rateLimitKey = `quiz_submit_${ip}_${quizId}`;
  const rateLimit = checkRateLimit(rateLimitKey, { limit: 10, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetTime);
  }

  // 2. Validate input with Zod
  const body = await request.json().catch(() => null);
  const validation = QuizSubmitAnswerSchema.safeParse({ ...body, quizId });
  if (!validation.success) {
    return NextResponse.json(
      { error: "بيانات الإجابة غير صالحة", details: validation.error.format() },
      { status: 400 }
    );
  }

  const { teamId, questionIndex, choiceIndex, timeTaken } = validation.data;

  try {
    const supabase = await createClient();

    // 3. Fetch Quiz and verify question on server-side
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("questions, is_deleted")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) {
      return NextResponse.json({ error: "المسابقة غير موجودة" }, { status: 404 });
    }

    const questions = quizData.questions || [];
    const question = questions[questionIndex];
    if (!question) {
      return NextResponse.json({ error: "رقم السؤال غير صالح" }, { status: 400 });
    }

    // 4. SERVER-SIDE RESULT CALCULATION (Answers are NEVER sent to client beforehand)
    const isCorrect = choiceIndex === question.correctAnswer;
    const timeLimit = question.timeLimit || 20;

    let pointsAwarded = 0;
    if (isCorrect) {
      // Score calculation: speed bonus based on server rules
      const speedRatio = Math.max(0, Math.min(1, (timeLimit - timeTaken) / timeLimit));
      pointsAwarded = Math.max(500, Math.floor(1000 * speedRatio));
    }

    // 5. Fetch team to update score securely on the server
    const { data: teamData, error: teamError } = await supabase
      .from("quiz_groups")
      .select("score")
      .eq("id", teamId)
      .single();

    let newScore = 0;
    if (!teamError && teamData) {
      newScore = (teamData.score || 0) + pointsAwarded;
      await supabase
        .from("quiz_groups")
        .update({ score: newScore })
        .eq("id", teamId);
    }

    // 6. Record answer log in answers / quiz_responses table
    await supabase.from("answers").insert({
      quiz_id: quizId,
      question_id: questionIndex.toString(),
      team_id: teamId,
      answer_index: choiceIndex,
      is_correct: isCorrect,
    });

    await supabase.from("quiz_responses").insert({
      quiz_id: quizId,
      group_id: teamId,
      question_index: questionIndex,
      choice_index: choiceIndex,
      is_correct: isCorrect,
      time_taken: timeTaken,
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      pointsAwarded,
      newScore,
    });
  } catch (error: any) {
    console.error("Quiz submission server error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تسجيل الإجابة في السيرفر" },
      { status: 500 }
    );
  }
}
