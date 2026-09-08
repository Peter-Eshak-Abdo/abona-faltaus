// lib/security-validation.ts
import { z } from "zod";

/**
 * Sanitize text input by removing dangerous HTML tags, javascript pseudo-protocols,
 * and malicious script tags to prevent stored/reflected XSS attacks.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "") // strip html tags
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .trim();
}

// Zod schema for Feedback / Review submissions
export const FeedbackInputSchema = z.object({
  feedback: z
    .string()
    .min(2, "الرسالة قصيرة جداً")
    .max(3000, "الرسالة طويلة جداً")
    .transform(sanitizeInput),
  rating: z
    .number()
    .int()
    .min(1, "التقييم يجب أن يكون بين 1 و 10")
    .max(10, "التقييم يجب أن يكون بين 1 و 10"),
  is_public: z.boolean().default(true),
  name: z.string().max(100).optional().transform((val) => (val ? sanitizeInput(val) : undefined)),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة").max(200).optional().or(z.literal("")),
});

// Zod schema for Admin Reply
export const AdminReplySchema = z.object({
  id: z.string().uuid("معرف الرسالة غير صالح"),
  reply: z.string().min(1, "الرد لا يمكن أن يكون فارغاً").max(2000).transform(sanitizeInput),
  userId: z.string().optional().nullable(),
});

// Zod schema for Quiz Answer Submission (Server-side validation)
export const QuizSubmitAnswerSchema = z.object({
  quizId: z.string().min(1, "معرف المسابقة مطلوب"),
  teamId: z.string().min(1, "معرف الفريق مطلوب"),
  questionIndex: z.number().int().min(0),
  choiceIndex: z.number().int().min(0).max(10),
  timeTaken: z.number().min(0).max(600).default(0),
});

// Zod schema for Solo/Individual Question Verification
export const IndividualQuestionVerifySchema = z.object({
  questionId: z.string().min(1, "معرف السؤال مطلوب"),
  selectedAnswer: z.string().min(1, "الإجابة المختارة مطلوبة"),
});
