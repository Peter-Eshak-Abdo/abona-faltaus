import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NotesSystemPrompt } from "@/lib/notes-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-3.1-pro",
];

function cleanAIResponse(text: string): string {
  // إزالة أي مقدمات شائعة بالذكاء الاصطناعي
  const intros = [
    /^(بالتأكيد[!،.]?\s*)/i,
    /^(إليك[^:\n]*[:.]\s*)/i,
    /^(حسناً[،.]\s*)/i,
    /^(سأقدم لك[^:\n]*[:.]\s*)/i,
    /^(فيما يلي[^:\n]*[:.]\s*)/i,
    /^(هذا هو[^:\n]*[:.]\s*)/i,
    /^(مرحباً[^:\n]*[:.]\s*)/i,
    /^(سلام ونعمة[^:\n]*[:.]\s*)/i,
    /^(أهلاً بك[^:\n]*[:.]\s*)/i,
  ];

  // إزالة أي خواتم شائعة
  const outros = [
    /(\s*أتمنى[^.\n]*[.!]?)$/i,
    /(\s*نسأل الله[^.\n]*[.!]?)$/i,
    /(\s*في حال احتجت[^.\n]*[.!]?)$/i,
    /(\s*يسعدني مساعدتك[^.\n]*[.!]?)$/i,
    /(\s*لا تتردد[^.\n]*[.!]?)$/i,
    /(\s*دمت في سلام المسيح[.!]?)$/i,
  ];

  let cleaned = text.trim();
  intros.forEach((r) => {
    cleaned = cleaned.replace(r, "");
  });
  outros.forEach((r) => {
    cleaned = cleaned.replace(r, "");
  });

  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      noteText,
      requirements = {},
      options = {},
      extraDetails = "",
      extraSources = [],
      format = "word", // "word" | "pptx" | "full"
    } = body;

    const { topic, audience, duration, style, mainGoal } = requirements;

    const optionsInstructions = `
[عناصر الدرس المطلوب تضمينها وفقاً لاختيار الخادم]:
${options.includeVerses ? "✅ آيات كتابية — أضف آيات ذات صلة مع شواهدها الدقيقة (السفر والإصحاح والعدد)." : "❌ بدون آيات كتابية."}
${options.includeFatherQuotes ? "✅ أقوال آباء — أضف قولاً أو اثنين موثقين من آباء الكنيسة الأرثوذكسية." : "❌ بدون أقوال آباء."}
${options.includePrayer ? "✅ صلاة — أضف صلاة قصيرة روحية نابعة من فكرة الدرس." : "❌ بدون صلاة."}
${options.includeActivity ? "✅ نشاط / تطبيق — أضف نشاطاً تفاعلياً وتطبيقاً عملياً مناسباً للمرحلة العمرية." : "❌ بدون نشاط تطبيقي."}
${options.includeSummary ? "✅ خلاصة — أختم بخلاصة وتركيز للدرس في 3 نقاط محددة." : "❌ بدون خلاصة."}
`;

    const extraDetailsSection = extraDetails?.trim()
      ? `\n\n[تفاصيل وملاحظات إضافية خاصة من الخادم — يجب مراعاتها والتركيز عليها]:\n${extraDetails}`
      : "";

    const cleanSources = Array.isArray(extraSources)
      ? extraSources.filter((s: string) => s && s.trim())
      : [];

    const extraSourcesSection =
      cleanSources.length > 0
        ? `\n\n[مصادر ومراجع إضافية مخصصة استند عليها]:\n${cleanSources.map((s: string, idx: number) => `${idx + 1}. ${s}`).join("\n")}`
        : "";

    let formatSpecificInstruction = "";
    if (format === "pptx") {
      formatSpecificInstruction = `
[صيغة المخرجات الخاصة بالـ PowerPoint]:
حوّل هذه الأفكار إلى شرائح عرض (Slides). كل شريحة فكرة واحدة واضحة.
التنسيق الدقيق لكل شريحة:
SLIDE_TITLE: [عنوان مختصر]
SLIDE_POINTS:
- نقطة مختصرة
- نقطة مختصرة
SLIDE_VERSE: [آية واحدة فقط إن وجدت]
---
`;
    } else {
      formatSpecificInstruction = `
[صيغة المخرجات للدرس المقروء / Word]:
اكتب شرحاً تفصيلياً كاملاً متكاملاً للخادم بناءً على هذه النوتة والمعايير.
يجب أن يكون الشرح فقرات واضحة وثرية تصلح للقراءة الكاملة والشرح للمخدومين مباشرة.
`;
    }

    const systemPrompt = `
${NotesSystemPrompt}

[المعايير المحددة للدرس]:
- الموضوع أو العنوان: ${topic || "مستخرج من النوتة"}
- المرحلة والسن المستهدف: ${audience || "إعدادي وثانوي"}
- المدة المقترحة للشرح: ${duration || "30 دقيقة"}
- أسلوب وطريقة التقديم: ${style || "تفاعلي وروحي"}
- الهدف الأساسي: ${mainGoal || "غير محدد"}

${optionsInstructions}
${extraDetailsSection}
${extraSourcesSection}
${formatSpecificInstruction}

[تعليمات نهائية حرجة]:
- ابدأ ردك بالحرف الأول من المحتوى مباشرة، لا تكتب أي كلمة قبله مطلقاً.
- انتهِ بالكلمة الأخيرة من المحتوى مباشرة، لا تكتب أي كلمة بعده.
- ممنوع كتابة أي مقدمات أو تحيات أو عبارات توديعية.
`;

    const userPrompt = `
محتوى نوتة وأفكار الخادم:
"""
${noteText || "يرجى تحضير الدرس بالكامل بناءً على الموضوع والمعايير المحددة أعلاه."}
"""
`;

    let generatedText = "";
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await generateText({
          model: google(modelName),
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.6,
        });

        if (response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(
          `Model ${modelName} in notes generate failed:`,
          err?.message || err,
        );
        lastError = err;
      }
    }

    if (!generatedText) {
      return NextResponse.json(
        {
          error: "تعذر توليد الدرس حالياً. يرجى المحاولة مرة أخرى.",
          details: lastError?.message,
        },
        { status: 503 },
      );
    }

    const cleanedResult = cleanAIResponse(generatedText);

    return NextResponse.json({
      result: cleanedResult,
      content: cleanedResult,
    });
  } catch (error: any) {
    console.error("Notes generate route error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
