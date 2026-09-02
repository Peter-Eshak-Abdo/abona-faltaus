import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { searchOrthodoxCorpus } from "@/lib/orthodox-rag";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-pro",
];

export interface SlideItem {
  id: string;
  slideType: "cover" | "content" | "verse" | "quote" | "activity" | "conclusion";
  title: string;
  subtitle?: string;
  points: string[];
  verse?: {
    text: string;
    ref: string;
  };
  quote?: {
    text: string;
    author: string;
  };
  notes?: string;
  illustrationPrompt?: string;
  backgroundTheme?: "orthodox-dark" | "coptic-gold" | "royal-blue" | "parchment" | "deep-burgundy";
}

export async function POST(req: Request) {
  try {
    const {
      topic,
      targetAudience = "إعدادي وثانوي",
      slidesCount = 6,
      style = "تفاعلي وروحي",
      mainGoal = "",
      theme = "orthodox-dark",
      includeVerse = true,
      includePatristicQuote = true,
      includeActivity = true,
      customNotes = "",
    } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: "يرجى تحديد موضوع العرض التقديمي" }, { status: 400 });
    }

    // 1. RAG Enrichment for Orthodox authenticity
    let ragContext = "";
    try {
      const ragResults = await searchOrthodoxCorpus(topic, { limit: 4 });
      if (ragResults && ragResults.length > 0) {
        ragContext = ragResults
          .map((r) => `[المصدر: ${r.work_title ? `${r.work_title} - ${r.author}` : "تراث كنسي"}]\n${r.content}`)
          .join("\n\n");
      }
    } catch (e) {
      console.warn("RAG search failed for slides generation:", e);
    }

    const systemPrompt = `أنت خبير كنسي ولاهوتي وتربوي متخصص في تصميم العروض التقديمية والدروس لمدارس الأحد واجتماعات الشباب والخدمة في الكنيسة القبطية الأرثوذكسية.
مهمتك إعداد محتوى عرض تقديمي متكامل واحترافي بنظام الشرائح (Slides) بتنسيق JSON حصراً ومطابق تماماً للمواصفات المعطاة.

القواعد الصارمة:
1. ارجع فقط كود JSON صالح بدون أي نصوص تمهيدية أو تنسيقات Markdown خارج كتلة JSON.
2. الشرائح يجب أن تكون مرتبة ومنسقة بحيث:
   - الشريحة 1: غلاف (cover) بالعنوان، العنوان الفرعي، والهدف.
   - الشريحة 2: آية ذهبية أساسية (verse) مع الشاهد التوضيحي.
   - الشرائح التالية: محاور الموضوع ونقاط عملية محددة (content) مقتضبة ومؤثرة لا تزيد عن 3 نقاط في كل شريحة لتلائم العرض.
   - شريحة قول أباء وقديسين (quote) إن أمكن وموثق بالاسم.
   - شريحة تطبيق عملي / نشاط تفاعلي (activity).
   - شريحة ختامية أو صلاة قصيرة (conclusion).
3. أسلوب الصياغة أرثوذكسي أصيل، مباشر، يناسب الفئة المستهدفة (${targetAudience}).
4. اقترح في كل شريحة وصفاً دقيقاً لصورة/أيقونة قبطية معبرة في خاصية "illustrationPrompt".`;

    const userPrompt = `موضوع العرض: ${topic}
الفئة المستهدفة: ${targetAudience}
عدد الشرائح المقترح: ${slidesCount}
أسلوب العرض: ${style}
الهدف الروحي/التعليمي: ${mainGoal || "غرس الفضيلة والتعليم الأرثوذكسي السليم"}
ملاحظات إضافية من الخادم: ${customNotes || "لا يوجد"}
الثيم المفضل: ${theme}

${ragContext ? `مراجع كنسية مقترحة للاستئناس:\n${ragContext}\n` : ""}

أرجع مصفوفة الشرائح JSON بالصيغة التالية تماماً:
{
  "presentationTitle": "${topic}",
  "theme": "${theme}",
  "slides": [
    {
      "id": "slide-1",
      "slideType": "cover",
      "title": "عنوان الشريحة",
      "subtitle": "عنوان فرعي أو آية مميزة",
      "points": [],
      "notes": "ملاحظات وتوجيهات للخادم أثناء الإلقاء",
      "illustrationPrompt": "وصف دقيق للأيقونة أو الصورة القبطية المناسبة لهذه الشريحة",
      "backgroundTheme": "${theme}"
    },
    {
      "id": "slide-2",
      "slideType": "verse",
      "title": "الآية الذهبية",
      "points": ["تأمل مختصر جداً في الآية"],
      "verse": {
        "text": "نص الآية بدقة",
        "ref": "الشاهد (مثال: يو 3: 16)"
      },
      "notes": "كيفية تحفيظ الآية للمخدومين",
      "illustrationPrompt": "أيقونة قبطية أو مشهد كتابي للآية",
      "backgroundTheme": "${theme}"
    }
  ]
}`;

    let generatedJson: any = null;
    let lastError: any = null;

    for (const modelName of MODELS) {
      try {
        const response = await generateText({
          model: google(modelName),
          system: systemPrompt,
          prompt: userPrompt,
          temperature: 0.4,
        });

        const rawText = response.text.trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedJson = JSON.parse(jsonMatch[0]);
          if (generatedJson.slides && Array.isArray(generatedJson.slides)) {
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed for slides generation:`, err?.message);
      }
    }

    if (!generatedJson || !generatedJson.slides) {
      throw lastError || new Error("فشل توليد محتوى الشرائح بالذكاء الاصطناعي");
    }

    return NextResponse.json({
      success: true,
      data: generatedJson,
    });
  } catch (error: any) {
    console.error("AI Slides Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إعداد العرض التقديمي" },
      { status: 500 }
    );
  }
}
