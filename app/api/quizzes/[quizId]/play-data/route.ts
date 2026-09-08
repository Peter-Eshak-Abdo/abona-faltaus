import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const { quizId } = await params;

  try {
    const supabase = await createClient();

    // Fetch quiz questions
    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("id, title, questions")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) {
      return NextResponse.json({ error: "المسابقة غير موجودة" }, { status: 404 });
    }

    // Fetch current game state
    const { data: gameState, error: gsError } = await supabase
      .from("game_state")
      .select("*")
      .eq("quiz_id", quizId)
      .single();

    const questions = quizData.questions || [];
    const currentIdx = gameState?.current_question_index ?? 0;
    const rawQuestion = questions[currentIdx];

    // CRITICAL SECURITY RULE:
    // Strip correctAnswer and explanation from the payload sent to the student frontend!
    let sanitizedQuestion = null;
    if (rawQuestion) {
      sanitizedQuestion = {
        id: rawQuestion.id,
        type: rawQuestion.type,
        text: rawQuestion.text,
        choices: rawQuestion.choices,
        timeLimit: rawQuestion.timeLimit || 20,
        // Notice: correctAnswer and explanation are excluded!
      };
    }

    return NextResponse.json({
      gameState,
      currentQuestion: sanitizedQuestion,
      totalQuestions: questions.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}
