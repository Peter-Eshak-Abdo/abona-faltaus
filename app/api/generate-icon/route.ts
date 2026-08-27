import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildEnhancedOrthodoxPrompt, IconStyleType, AspectRatioType, ICON_STYLES } from "@/lib/orthodox-prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateIconRequest {
  prompt: string;
  style: IconStyleType;
  aspectRatio?: AspectRatioType;
}

// 1. ترجمة وتحسين وصف الأيقونة بالإنجليزية + توليد الشرح اللاهوتي بالعربية
async function preparePromptAndInsight(
  geminiKey: string,
  userPrompt: string,
  style: IconStyleType
): Promise<{ englishPrompt: string; theologicalInsight: string }> {
  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;

  if (!geminiKey) {
    return {
      englishPrompt: `${styleDef.systemDirective}. Subject: ${userPrompt}. Composition: Centered canonical sacred composition, radiant golden halos, vivid liturgical colors, highly reverent Orthodox Christian sacred art.`,
      theologicalInsight: "",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const promptEngineeringQuery = [
      "You are a master Coptic & Eastern Byzantine Orthodox Iconographer and professional AI art prompt engineer.",
      `The user requested an authentic sacred Orthodox Christian artwork described as: "${userPrompt}"`,
      `Selected Orthodox Art Style: "${styleDef.title}" (${style}).`,
      `Art Style Canon & Directives:`,
      styleDef.systemDirective,
      "",
      "CRITICAL INSTRUCTIONS FOR 'englishPrompt':",
      "- You must write an authentic, canonical prompt for image generation.",
      "- If Coptic: Must strictly describe a 2D Coptic icon in Dr. Isaac Fanous school, egg tempera on wooden board, large spiritual eyes, golden halos with Coptic cross markers, vivid liturgical colors, clean geometric outlines, Coptic robes.",
      "- If Byzantine: Must strictly describe Mount Athos / Hagia Sophia style, gold leaf/mosaic background, assist gold lines on drapery, IC XC / MP ΘY monograms, solemn sacred ascetic posture.",
      "- If Realistic: Must strictly describe reverent 19th-century Eastern Orthodox sacred church fine art with radiant heavenly golden light, glowing halos, noble serene holy faces.",
      "- NEVER produce dark gloomy horror, fantasy RPG, modern casual rooms, or renaissance secular paintings.",
      "- Combine subject details + medium + specific iconographic vestments + holy halos + lighting + strict exclusion keywords.",
      "",
      "Respond ONLY in valid JSON format with two keys:",
      '1. "englishPrompt": The complete, highly descriptive English prompt ready for text-to-image AI.',
      '2. "theologicalInsight": A profound, reverent, 3-4 line spiritual/theological reflection in authentic Arabic church language explaining the iconography symbolism (halo, colors, gestures, spiritual blessing) for the faithful.'
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptEngineeringQuery,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const rawEnglish = parsed.englishPrompt || `${userPrompt}, ${styleDef.systemDirective}`;
    // Bounded guarantee: Prefix with the core style signature
    const finalPrompt = `${styleDef.systemDirective}\n\nSacred Scene Details: ${rawEnglish}`;

    return {
      englishPrompt: finalPrompt,
      theologicalInsight: parsed.theologicalInsight || "",
    };
  } catch (err) {
    console.warn("Prompt prep error:", err);
    return {
      englishPrompt: `${styleDef.systemDirective}. Subject: ${userPrompt}. Composition: Centered canonical sacred composition, radiant golden halos, vivid liturgical colors, highly reverent Orthodox Christian sacred art.`,
      theologicalInsight: "",
    };
  }
}

import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 2. التوليد عبر Replicate والـ LoRA المدرب
async function generateWithReplicate(
  promptText: string,
  style: IconStyleType,
  aspectRatio: AspectRatioType
): Promise<{ imageUrl: string; mimeType: string } | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  try {
    let styleTrigger = "";
    if (style === "coptic") {
      styleTrigger = `coptic_icon_style, traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic style, egg tempera, golden halo, authentic Coptic iconography`;
    } else if (style === "byzantine") {
      styleTrigger = `sweet_publishing_style, classic bible story illustration, vintage watercolor comic storybook art, Jim Padgett style`;
    } else if (style === "realistic") {
      styleTrigger = `lumo_film_style, cinematic historical biblical drama, realistic 35mm film still, The LUMO Project, authentic first century biblical scene, natural lighting, dramatic film photography`;
    }

    const fullPrompt = `${styleTrigger}, ${promptText}`;
    const modelIdentifier = "peter-eshak-abdo/biblical-multistyle-lora:d22e4f4de382abffbf614bd2052de1cdafde707ee0a1115e237a3d22996a65fb";

    const output: any = await replicate.run(
      modelIdentifier as `${string}/${string}`,
      {
        input: {
          prompt: fullPrompt,
          num_outputs: 1,
          aspect_ratio: aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 95,
        },
      }
    );

    const rawItem: any = Array.isArray(output) ? output[0] : output;
    let resultUrl = "";

    if (typeof rawItem === "string") {
      resultUrl = rawItem;
    } else if (rawItem?.href) {
      resultUrl = String(rawItem.href);
    } else if (typeof rawItem?.url === "function") {
      resultUrl = String(rawItem.url());
    } else if (rawItem?.url?.href) {
      resultUrl = String(rawItem.url.href);
    } else if (rawItem?.url) {
      resultUrl = String(rawItem.url);
    } else if (rawItem) {
      resultUrl = String(rawItem);
    }

    resultUrl = resultUrl.trim();

    if (resultUrl.startsWith("http")) {
      return {
        imageUrl: resultUrl,
        mimeType: "image/webp",
      };
    }
  } catch (err: any) {
    console.warn("Replicate LoRA Generation Error:", err?.message || err);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body: GenerateIconRequest = await request.json();
    const { prompt, style = "coptic", aspectRatio = "1:1" } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "برجاء كتابة وصف الأيقونة أو الصورة المطلوبة" },
        { status: 400 }
      );
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json(
        { error: "النص طويل جداً، يرجى كتابة وصف في حدود 1000 حرف" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const styleDetails = ICON_STYLES[style] || ICON_STYLES.coptic;

    // ترجمة وهندسة البرومبت وتحضير التأمل اللاهوتي
    const { englishPrompt, theologicalInsight } = await preparePromptAndInsight(apiKey, prompt, style);

    // توليد الصورة عبر Replicate والـ LoRA المدرب
    let imageResult: { imageUrl: string; mimeType: string } | null = null;
    
    imageResult = await generateWithReplicate(englishPrompt, style, aspectRatio);

    if (!imageResult?.imageUrl) {
      return NextResponse.json(
        { error: "تعذر توليد الصورة في الوقت الحالي، يرجى المحاولة مرة أخرى أو تعديل الوصف." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.imageUrl,
      mimeType: imageResult.mimeType,
      prompt: prompt.trim(),
      style,
      styleTitle: styleDetails.title,
      aspectRatio,
      theologicalInsight: theologicalInsight || `أيقونة مباركة تجسد ${prompt} بـ ${styleDetails.title}. شفاعة القديسين وبركتهم تكون معك ومعنا جميعاً آمين.`,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API /api/generate-icon error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء توليد الأيقونة", details: error?.message },
      { status: 500 }
    );
  }
}
