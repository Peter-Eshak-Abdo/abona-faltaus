import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@xenova/transformers";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// محرك الذكاء الاصطناعي المحلي (Local Fallback - Unlimited & Free 0 Quota)
let localExtractor: any = null;
async function getLocalExtractor() {
  if (!localExtractor) {
    console.log("Loading Local Transformers Embedding Model (multilingual-e5-small / 768-ready)...");
    localExtractor = await pipeline("feature-extraction", "Xenova/all-mpnet-base-v2");
  }
  return localExtractor;
}

// قائمة الموديلات السحابية
const CLOUD_MODELS = [
  "gemini-embedding-001",
  "gemini-embedding-2",
  "gemini-embedding-2-preview",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getRobustEmbedding(text: string): Promise<number[] | null> {
  // 1. تجربة النماذج السحابية
  if (genAI) {
    for (const modelName of CLOUD_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.embedContent({
          content: { parts: [{ text }], role: "user" },
          outputDimensionality: 768,
        } as any);

        const vec = res.embedding?.values;
        if (vec && Array.isArray(vec) && vec.length === 768) {
          return vec;
        }
      } catch (err: any) {
        // إذا كان خطأ كوتة 429 ننتقل للنموذج التالي مباشرة
        continue;
      }
    }
  }

  // 2. إذا انتهت كوتة السحابة -> استخدام الموديل المحلي المجاني اللامحدود
  try {
    const extractor = await getLocalExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const vec = Array.from(output.data) as number[];
    if (vec && vec.length === 768) {
      return vec;
    }
  } catch (localErr: any) {
    console.error("Local embedding failed:", localErr.message);
  }

  return null;
}

async function importBatchFile(filePath: string) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Indexing: ${path.basename(resolvedPath)}`);
  console.log(`========================================\n`);

  const rawData = fs.readFileSync(resolvedPath, "utf-8");
  const items: any[] = JSON.parse(rawData);

  let successCount = 0;
  let alreadyExistsCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.content || !item.work_title || !item.author) {
      continue;
    }

    // منع التكرار تماماً: فحص هل النص موجود مسبقاً في قاعدة البيانات
    const { data: existing } = await supabase
      .from("orthodox_documents")
      .select("id")
      .eq("content", item.content)
      .limit(1);

    if (existing && existing.length > 0) {
      alreadyExistsCount++;
      continue; // تم رفعه مسبقاً، تخطي فوري
    }

    const textToEmbed = `${item.work_title} - ${item.author} - ${item.reference_location || ""}\n${item.content}`;
    const embedding = await getRobustEmbedding(textToEmbed);

    if (!embedding) {
      console.error(`[Skip] Could not embed index ${i}: ${item.work_title}`);
      continue;
    }

    const { error } = await supabase.from("orthodox_documents").insert({
      corpus_category: item.corpus_category || "liturgy",
      author: item.author,
      work_title: item.work_title,
      reference_location: item.reference_location || null,
      content: item.content,
      embedding: embedding,
      metadata: item.metadata || {},
    });

    if (error) {
      console.error(`[DB Error ${i}]:`, error.message);
    } else {
      successCount++;
      console.log(`[${i + 1}/${items.length}] ✓ Indexed: ${item.work_title.slice(0, 38)}`);
    }

    await sleep(200);
  }

  console.log(`\n✅ Batch Summary: ${path.basename(resolvedPath)} | Newly Indexed: ${successCount} | Already Exists (Skipped): ${alreadyExistsCount}\n`);
}

const target = process.argv[2];
if (!target) {
  console.log("Usage: npx tsx scripts/import-rag-json.ts <path-to-json>");
  process.exit(1);
}

importBatchFile(target).catch(console.error);
