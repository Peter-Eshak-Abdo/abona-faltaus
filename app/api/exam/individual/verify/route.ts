import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { IndividualQuestionVerifySchema } from "@/lib/security-validation";
import { COMPREHENSIVE_QUESTIONS_BANK } from "@/lib/church-quiz-levels";

export async function POST(request: Request) {
  // 1. Rate Limiting: Max 20 attempts per minute per IP
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`indiv_verify_${ip}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.resetTime);
  }

  // 2. Validate input
  const body = await request.json().catch(() => null);
  const validation = IndividualQuestionVerifySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة", details: validation.error.format() },
      { status: 400 }
    );
  }

  const { questionId, selectedAnswer } = validation.data;

  // 3. Find question in master bank on server-side
  const question = COMPREHENSIVE_QUESTIONS_BANK.find((q) => q.id === questionId);
  if (!question) {
    return NextResponse.json({ error: "السؤال غير موجود" }, { status: 404 });
  }

  // 4. Verify answer on server side
  const isCorrect = selectedAnswer === question.correctAnswer;

  return NextResponse.json({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation || "",
    points: isCorrect ? question.points : 0,
  });
}
