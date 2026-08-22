import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { draftContent, audience, duration, style, topic, mainGoal } = body;

    const systemPrompt = `أنت مساعد وخبير أرثوذكسي قبطي لتحضير الدروس والعظات واللقاءات الروحية.
مهمتك استلام محتوى النوتة والمسودة المبدئية مع المعايير المطلوبة، وصياغة وتوليد تحضير درس متكامل وشامل ومفصل.

المعايير المحددة:
- الموضوع الرئيسي: ${topic || "مستخرج من المسودة"}
- المرحلة والسن المستهدف: ${audience || "شباب جامعي"}
- مدة الشرح التقريبية: ${duration || "30 دقيقة"}
- أسلوب وطريقة الشرح: ${style || "تفاعلي وروحي"}
- الهدف المنشود من الدرس: ${mainGoal || "غير محدد"}

محتوى مسودة المستخدم الحالية:
"""
${draftContent || "لا توجد مسودة مسبقة، يرجى إنشاء الدرس بالكامل."}
"""

المطلوب منك توليد تحضير درس احترافي باللغة العربية، منظم بدقة في أقسام واضحة:
1. **عنوان الدرس والفكرة المركزية**
2. **الهدف الروحي والسلوكي (ماذا يتعلم المخدوم؟)**
3. **الآيات والشواهد الكتابية المناسبة (مع النص والشاهد بدقة)**
4. **مقدمة مشوقة لجذب الانتباه (Story/Icebreaker)**
5. **عناصر وشرح الدرس الرئيسي (مقسم إلى نقاط واضحة ومناسبة للمدة والمرحلة)**
6. **أقوال وتأملات الآباء القديسين وتفسير روحي**
7. **الوسائل التوضيحية والأنشطة المقترحة**
8. **التطبيق العملي والتداريب الروحية للأسبوع**
9. **صلاة ختامية مرتبطة بالدرس**
10. **ملخص للشرائح (Slides Outline) جاهز للعرض التقديمي**

اكتب الرد بتنسيق Markdown غني وجميل، مباشر ومريح للقراءة والتعديل والتصدير.`;

    let generatedText = "";
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await generateText({
          model: google(modelName),
          system: systemPrompt,
          prompt: "قم بصياغة التحضير الآن بأعلى مستوى من الاحترافية والعمق الروحي والتربوي.",
          temperature: 0.7,
        });

        if (response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} in prep assistant failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedText) {
      return NextResponse.json(
        { error: "تعذر توليد التحضير حالياً. يرجى المحاولة مرة أخرى.", details: lastError?.message },
        { status: 503 }
      );
    }

    return NextResponse.json({ result: generatedText });
  } catch (error: any) {
    console.error("Prep AI generate error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
