import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { buildEnhancedOrthodoxPrompt, IconStyleType, AspectRatioType, ICON_STYLES } from "@/lib/orthodox-prompts";
import { lookupSaintIcon } from "@/lib/coptic-saints-database";
import Replicate from "replicate";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateIconRequest {
  prompt: string;
  style: IconStyleType;
  aspectRatio?: AspectRatioType;
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// 1. ترجمة وتحسين وصف الأيقونة بالإنجليزية + البحث المباشر في المصادر الأرثوذكسية للقديسين غير المسجلين
async function preparePromptAndInsight(
  geminiKey: string,
  userPrompt: string,
  style: IconStyleType
): Promise<{ englishPrompt: string; theologicalInsight: string; copticInscription?: string }> {
  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;
  const saintMatch = lookupSaintIcon(userPrompt);

  let saintHint = "";
  if (saintMatch) {
    saintHint = `
    - Pre-indexed Saint: "${saintMatch.arabicName}"
    - Exact Coptic Inscription: "${saintMatch.copticTitleInscription}" (${saintMatch.copticName})
    - Liturgical Colors: Tunic: ${saintMatch.canonicalColors.tunic}, Mantle: ${saintMatch.canonicalColors.mantle}
    - Key Canonical Attributes: ${saintMatch.keyAttributes.join("; ")}
    - Canonical Specifics: ${saintMatch.copticPromptGuidance}
    `;
  }

  if (!geminiKey) {
    const built = buildEnhancedOrthodoxPrompt(userPrompt, style);
    return {
      englishPrompt: built.finalPrompt,
      theologicalInsight: saintMatch?.theologicalSignificance || "",
      copticInscription: saintMatch?.copticTitleInscription,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const promptEngineeringQuery = [
      "You are a master Coptic Orthodox Synaxarium scholar, canonical iconographer, and elite AI art prompt engineer.",
      `The user requested an authentic sacred icon for: "${userPrompt}".`,
      `Art Style: "${styleDef.title}" (${style}).`,
      "",
      saintMatch
        ? `Known Saint Data:\n${saintHint}`
        : "RESEARCH INSTRUCTION: If the requested saint, martyr, or biblical scene is not in your immediate standard library, USE GOOGLE SEARCH to look up authentic Coptic Orthodox Synaxarium records (e.g. st-takla, copticchurch.net, OrthodoxWiki, Coptic Encyclopedia) to find: 1) The exact historic ecclesiastical Coptic name/spelling (in Coptic Unicode e.g., Ⲁⲡⲁ / Ⲡⲓⲁⲅⲓⲟⲥ / Ϯⲁⲅⲓⲁ), 2) Canonical vestments (monastic hood with 12 crosses, episcopal sakkos, soldier armor, martyr palm), 3) Historic attributes and holy martyrdom symbols.",
      "",
      "STRICT ICONOGRAPHY CANONICAL RULES:",
      "- If Coptic: Must strictly be 2D Coptic egg tempera icon panel in Dr. Isaac Fanous school, large spiritual almond eyes, golden halo with canonical Coptic cross engravings, flat bright liturgical pigments, crisp outlines, authentic Coptic inscription at top.",
      "- If Byzantine: Must strictly be Mount Athos iconostasis style, gold leaf background, assist gold lines, ascetic features, authentic monograms.",
      "- If Realistic: Dignified 19th-century Eastern Orthodox sacred church art, glowing halos, radiant warm light.",
      "- ALWAYS write the authentic Coptic name or Greek monogram in the prompt explicitly.",
      "- NEVER allow 3D CGI, grotesque horror, western renaissance naked figures, modern clothing, or corrupted anatomy.",
      "",
      "IMPORTANT: You MUST respond with ONLY a valid JSON code block enclosed in ```json ... ``` containing exactly these keys:",
      '1. "englishPrompt": The final ready-to-use image prompt combining canonical subject details, vestments, halo, colors, and art medium.',
      '2. "theologicalInsight": A reverent 3-4 line spiritual and theological commentary in Arabic explaining the saint/scene iconography symbols for the faithful.',
      '3. "copticInscription": The exact Coptic title/name inscription in Coptic script (e.g., "ⲠⲒⲀⲄⲒⲞⲤ ⲪⲒⲖⲞⲐⲈⲞⲤ" or "ϮⲐⲈⲞⲦⲞⲔⲞⲤ ⲘⲀⲢⲒⲀ").'
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptEngineeringQuery,
      config: {
        // Enable Google Search Grounding to retrieve live Coptic Synaxarium records for unlisted saints
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || "";
    let parsed: any = {};
    try {
      const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || textOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsed = JSON.parse(textOutput);
      }
    } catch {
      parsed = {};
    }

    const rawEnglish = parsed.englishPrompt || `${userPrompt}, ${styleDef.systemDirective}`;
    const finalPrompt = `${styleDef.systemDirective}\n\nCanonical Details: ${rawEnglish}`;

    return {
      englishPrompt: finalPrompt,
      theologicalInsight: parsed.theologicalInsight || saintMatch?.theologicalSignificance || "",
      copticInscription: parsed.copticInscription || saintMatch?.copticTitleInscription || "",
    };
  } catch (err) {
    console.warn("Prompt prep with search grounding error:", err);
    const built = buildEnhancedOrthodoxPrompt(userPrompt, style);
    return {
      englishPrompt: built.finalPrompt,
      theologicalInsight: saintMatch?.theologicalSignificance || "",
      copticInscription: saintMatch?.copticTitleInscription || "",
    };
  }
}


// دالة مساعدة لاستخراج رابط الصورة من مخرجات Replicate
function extractImageUrl(output: any): string | null {
  const rawItem = Array.isArray(output) ? output[0] : output;
  if (!rawItem) return null;
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
  } else {
    resultUrl = String(rawItem);
  }

  resultUrl = resultUrl.trim();
  return resultUrl.startsWith("http") ? resultUrl : null;
}

// 2. المحرك الأول: Replicate Fine-Tuned LoRA Model
async function generateWithPrimaryLoRA(
  promptText: string,
  style: IconStyleType,
  aspectRatio: AspectRatioType
): Promise<{ imageUrl: string; engine: string } | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;

  try {
    let styleTrigger = "";
    if (style === "coptic") {
      styleTrigger = `coptic_icon_style, traditional 2D Coptic Orthodox icon, Isaac Fanous neo-coptic style, egg tempera on wood, golden halo with coptic cross, inscribed authentic Coptic lettering, authentic Coptic iconography`;
    } else if (style === "byzantine") {
      styleTrigger = `sweet_publishing_style, traditional byzantine icon, Mount Athos iconostasis style, gold chrysography assist lines, sacred orthodox christian icon`;
    } else if (style === "realistic") {
      styleTrigger = `lumo_film_style, cinematic historical biblical drama, realistic 35mm film still, The LUMO Project, authentic first century biblical scene, natural lighting, dramatic film photography`;
    }

    const fullPrompt = `${styleTrigger}, ${promptText}`;
    const modelIdentifier = "peter-eshak-abdo/biblical-multistyle-lora:d22e4f4de382abffbf614bd2052de1cdafde707ee0a1115e237a3d22996a65fb";

    const output = await replicate.run(
      modelIdentifier as `${string}/${string}`,
      {
        input: {
          prompt: fullPrompt,
          negative_prompt: styleDef.negativePrompt,
          num_outputs: 1,
          aspect_ratio: aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 95,
        },
      }
    );

    const imageUrl = extractImageUrl(output);
    if (imageUrl) {
      return { imageUrl, engine: "Replicate Coptic LoRA" };
    }
  } catch (err: any) {
    console.warn("Primary LoRA generation failed, switching to Fallback:", err?.message || err);
  }
  return null;
}

// 3. المحرك البديل الأول (Fallback 1): Black Forest Labs FLUX.1 Schnell
async function generateWithFluxSchnell(
  promptText: string,
  aspectRatio: AspectRatioType
): Promise<{ imageUrl: string; engine: string } | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: promptText,
          aspect_ratio: aspectRatio || "1:1",
          output_format: "webp",
          output_quality: 90,
        },
      }
    );

    const imageUrl = extractImageUrl(output);
    if (imageUrl) {
      return { imageUrl, engine: "FLUX.1 Schnell" };
    }
  } catch (err: any) {
    console.warn("FLUX.1 Schnell fallback failed:", err?.message || err);
  }
  return null;
}

// 4. المحرك البديل الثاني (Fallback 2): Stability AI SDXL Lightning
async function generateWithSdxl(
  promptText: string,
  style: IconStyleType
): Promise<{ imageUrl: string; engine: string } | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const styleDef = ICON_STYLES[style] || ICON_STYLES.coptic;

  try {
    const output = await replicate.run(
      "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b467d6ac78b211e2d7334c",
      {
        input: {
          prompt: promptText,
          negative_prompt: styleDef.negativePrompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }
    );

    const imageUrl = extractImageUrl(output);
    if (imageUrl) {
      return { imageUrl, engine: "SDXL Lightning" };
    }
  } catch (err: any) {
    console.warn("SDXL Lightning fallback failed:", err?.message || err);
  }
  return null;
}

// 5. المحرك البديل الثالث (Fallback 3): Google Imagen 3 via Gemini SDK
async function generateWithImagen3(
  promptText: string,
  geminiKey: string,
  aspectRatio: AspectRatioType
): Promise<{ imageUrl: string; engine: string } | null> {
  if (!geminiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response: any = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: promptText,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio || "1:1",
        outputMimeType: "image/jpeg",
      },
    });

    const base64Img = response?.generatedImages?.[0]?.image?.imageBytes;
    if (base64Img) {
      return {
        imageUrl: `data:image/jpeg;base64,${base64Img}`,
        engine: "Google Imagen 3",
      };
    }
  } catch (err: any) {
    console.warn("Google Imagen 3 fallback failed:", err?.message || err);
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

    // 1. ترجمة وهندسة البرومبت وتحضير التأمل اللاهوتي مع الحروف القبطية
    const { englishPrompt, theologicalInsight, copticInscription } = await preparePromptAndInsight(apiKey, prompt, style);

    // 2. خطة التوليد المتسلسلة (Multi-Engine Fallback Pipeline)
    let imageResult: { imageUrl: string; engine: string } | null = null;

    // المحاولة 1: Google Imagen 3 (الأعلى دقة للقديسين وملامح الوجه النورانية)
    imageResult = await generateWithImagen3(englishPrompt, apiKey, aspectRatio);

    // المحاولة 2: Replicate LoRA مخصص
    if (!imageResult) {
      imageResult = await generateWithPrimaryLoRA(englishPrompt, style, aspectRatio);
    }

    // المحاولة 3: FLUX.1 Schnell
    if (!imageResult) {
      imageResult = await generateWithFluxSchnell(englishPrompt, aspectRatio);
    }

    // المحاولة 4: SDXL Lightning
    if (!imageResult) {
      imageResult = await generateWithSdxl(englishPrompt, style);
    }

    if (!imageResult?.imageUrl) {
      return NextResponse.json(
        { error: "تعذر توليد الصورة عبر محركات الرسم في الوقت الحالي، يرجى المحاولة مرة أخرى أو تعديل الوصف." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.imageUrl,
      engine: imageResult.engine,
      mimeType: "image/webp",
      prompt: prompt.trim(),
      style,
      styleTitle: styleDetails.title,
      aspectRatio,
      copticInscription: copticInscription || "",
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


