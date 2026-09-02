import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-pro",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, count = 5, audience = "عام", type = "mixed", difficulty = "medium" } = body;

    if (!topic) {
      return NextResponse.json({ error: "الموضوع مطلوب" }, { status: 400 });
    }

    const systemPrompt = `أنت خبير كنسي ولاهوتي في صياغة أسئلة المسابقات التفاعلية للأقباط الأرثوذكس.
المطلوب منك توليد مسابقة بأسلوب كاهوت (Kahoot) بناءً على المعايير التالية:
- الموضوع: ${topic}
- عدد الأسئلة: ${count}
- الفئة المستهدفة: ${audience}
- نوع الأسئلة: ${type === "choice" ? "اختيار من متعدد فقط" : type === "tf" ? "صح أو خطأ فقط" : "ميكس متنوع بين صح وخطأ واختيار من متعدد"}
- مستوى الصعوبة: ${difficulty}

شروط وقواعد الأسئلة:
1. السؤال يجب أن يكون واضحاً ومباشراً ودقيقاً أرثوذكسياً وكتابياً.
2. لكل سؤال 4 خيارات (أو خيارين للصح والخطأ: "صح" و "خطأ").
3. حدد رقم الخيار الصحيح (1-based index: 1, 2, 3, أو 4).
4. حدد وقت الإجابة بالثواني (افتراضياً 20 أو 30 ثانية).
5. اكتب تفسيراً أو مرجعاً كتابياً مختصراً في حقل 'explanation'.

يجب أن يكون الرد عبارة عن JSON صالح فقط بدون أي كود ماركداون إضافي أو نصوص قبل وبعد JSON، على الشكل التالي:
{
  "title": "عنوان المسابقة المقترح",
  "description": "وصف قصير للمسابقة",
  "questions": [
    {
      "title": "نص السؤال هنا؟",
      "type": "multiple-choice", // أو "true-false"
      "timeLimit": 20,
      "points": 1000,
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correctAnswer": 1, // رقم الخيار الصحيح (1, 2, 3, أو 4)
      "explanation": "شاهد كتابي أو توضيح"
    }
  ]
}`;

    let generatedQuiz: any = null;
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout per model to failover immediately

        const response = await generateText({
          model: google(modelName),
          system: systemPrompt,
          prompt: `قم بتوليد مسابقة متكاملة عن: ${topic}`,
          temperature: 0.7,
          abortSignal: controller.signal,
        });

        clearTimeout(timeout);

        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedQuiz = JSON.parse(jsonMatch[0]);
          break;
        }
      } catch (err: any) {
        console.warn(`Quiz generation model ${modelName} error:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedQuiz || !Array.isArray(generatedQuiz.questions)) {
      return NextResponse.json(
        { error: "فشل توليد المسابقة بالذكاء الاصطناعي، يرجى المحاولة مرة أخرى.", details: lastError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, quiz: generatedQuiz });
  } catch (err: any) {
    console.error("Quiz generate API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
