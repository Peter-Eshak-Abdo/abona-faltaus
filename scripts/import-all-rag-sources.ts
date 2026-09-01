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

// تهيئة Supabase مع زيادة مهلة الشبكة وتفعيل retry تلقائي
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const CLOUD_MODELS = [
  "gemini-embedding-001",
  "text-embedding-004",
  "gemini-embedding-2",
  "gemini-embedding-2-preview"
];

let localExtractor: any = null;
async function getLocalExtractor() {
  if (!localExtractor) {
    console.log("⚡ Loading Local Transformers Model (all-mpnet-base-v2)...");
    localExtractor = await pipeline("feature-extraction", "Xenova/all-mpnet-base-v2");
  }
  return localExtractor;
}

let consecutiveFailures = 0;
let modelIndex = 0;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Cloud timeout")), ms);
    promise.then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

async function getRobustEmbedding(text: string): Promise<number[] | null> {
  if (genAI && consecutiveFailures < 3) {
    const modelName = CLOUD_MODELS[modelIndex % CLOUD_MODELS.length];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const res: any = await withTimeout(
        model.embedContent({
          content: { parts: [{ text }], role: "user" },
          outputDimensionality: 768,
        } as any),
        1500
      );

      const vec = res.embedding?.values;
      if (vec && Array.isArray(vec) && vec.length === 768) {
        consecutiveFailures = 0;
        return vec;
      }
    } catch (err: any) {
      consecutiveFailures++;
      modelIndex = (modelIndex + 1) % CLOUD_MODELS.length;
    }
  }

  try {
    const extractor = await getLocalExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const vec = Array.from(output.data) as number[];
    if (vec && vec.length === 768) {
      return vec;
    }
  } catch (localErr: any) {
    console.error("Local embedding error:", localErr.message);
  }

  return null;
}

// دالة رفع قوية مع إعادة المحاولة في حالة انقطاع الشبكة (Retry Mechanism)
async function insertWithRetry(batch: any[], maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase.from("orthodox_documents").insert(batch);
      if (!error) return true;
      console.warn(`  ⚠️ Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Attempt ${attempt}/${maxRetries} network error: ${err.message || err}`);
    }
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  return false;
}

// فحص النصوص الفاسدة (Scanned OCR Noise)
function isGarbageText(text: string): boolean {
  if (!text || text.length < 50) return true;
  // فحص نسبة الرموز الإنجليزية غير المفهومة في التفاسير العربية
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const copticChars = (text.match(/[\u2C80-\u2CFF\u03E2-\u03EF]/g) || []).length;
  
  // إذا كان النص ليس قبطياً وأغلب حروفه مشوهة/إنجليزية متقطعة بنسبة تتجاوز 60%
  if (arabicChars + copticChars === 0 && englishChars > 30) return true;
  if (arabicChars > 0 && englishChars / (arabicChars + englishChars) > 0.6) return true;
  return false;
}

async function runIndexAll() {
  const sourcesDir = path.resolve("data/rag_sources");
  if (!fs.existsSync(sourcesDir)) {
    console.error("Sources directory not found:", sourcesDir);
    process.exit(1);
  }

  await getLocalExtractor();

  const files = fs.readdirSync(sourcesDir).filter((f) => f.endsWith(".json"));
  console.log(`\n========================================`);
  console.log(`🚀 Found ${files.length} JSON sources in ${sourcesDir}`);
  console.log(`========================================\n`);

  let grandTotalIndexed = 0;
  let grandTotalSkipped = 0;

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const fileName = files[fIdx];
    const filePath = path.join(sourcesDir, fileName);
    console.log(`\n[${fIdx + 1}/${files.length}] 📂 Processing: ${fileName}`);

    let rawData = "";
    try {
      rawData = fs.readFileSync(filePath, "utf-8");
    } catch (e) {
      console.error(`  ❌ Failed to read ${fileName}, skipping.`);
      continue;
    }

    let items: any[] = [];
    try {
      items = JSON.parse(rawData);
    } catch (e) {
      console.error(`  ❌ Invalid JSON in ${fileName}, skipping.`);
      continue;
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log(`  ℹ️ Empty file. Skipped.`);
      continue;
    }

    // تنقية النصوص التالفة قبل أي شيء
    const cleanItems = items.filter((i) => i.content && !isGarbageText(i.content));
    if (cleanItems.length === 0) {
      console.log(`  ⚠️ All items in ${fileName} were corrupted/scanned noise. Skipped.`);
      continue;
    }

    // فحص المحتوى المرفوع مسبقاً في قاعدة البيانات
    const contents = cleanItems.map((i) => i.content);
    const existingContentsSet = new Set<string>();

    for (let c = 0; c < contents.length; c += 100) {
      const chunkContents = contents.slice(c, c + 100);
      try {
        const { data: existingRows } = await supabase
          .from("orthodox_documents")
          .select("content")
          .in("content", chunkContents);

        if (existingRows) {
          existingRows.forEach((r) => existingContentsSet.add(r.content));
        }
      } catch (err: any) {
        console.warn("  ⚠️ Check existing query warning:", err.message);
      }
    }

    const itemsToProcess = cleanItems.filter((i) => !existingContentsSet.has(i.content));
    const alreadyExistsCount = items.length - itemsToProcess.length;

    if (itemsToProcess.length === 0) {
      console.log(`  -> All items (${items.length}) already exist or filtered. Skipped!`);
      grandTotalSkipped += alreadyExistsCount;
      continue;
    }

    console.log(`  🔍 ${alreadyExistsCount} skipped (existing/noise), indexing ${itemsToProcess.length} items...`);

    let successCount = 0;
    const BATCH_INSERT_SIZE = 15; // تقليل الحجم لضمان ثبات الشبكة ومنع timeout
    let currentBatch: any[] = [];

    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      const textToEmbed = `${item.work_title} - ${item.author} - ${item.reference_location || ""}\n${item.content}`;
      const embedding = await getRobustEmbedding(textToEmbed);

      if (embedding) {
        currentBatch.push({
          corpus_category: item.corpus_category || "dogmatics",
          author: item.author,
          work_title: item.work_title,
          reference_location: item.reference_location || null,
          content: item.content,
          embedding: embedding,
          metadata: item.metadata || {},
        });
      }

      if (currentBatch.length >= BATCH_INSERT_SIZE || i === itemsToProcess.length - 1) {
        if (currentBatch.length > 0) {
          const ok = await insertWithRetry(currentBatch);
          if (ok) {
            successCount += currentBatch.length;
            console.log(`  ✓ Uploaded ${i + 1}/${itemsToProcess.length} items (+${currentBatch.length})`);
          } else {
            console.error(`  ❌ Failed to insert batch around item ${i + 1}`);
          }
          currentBatch = [];
        }
      }
    }

    grandTotalIndexed += successCount;
    grandTotalSkipped += alreadyExistsCount;
    console.log(`  -> Finished ${fileName} | Added: ${successCount} | Skipped: ${alreadyExistsCount}`);
  }

  console.log(`\n========================================`);
  console.log(`🎉 Finished All Files!`);
  console.log(`- Total Newly Indexed: ${grandTotalIndexed}`);
  console.log(`- Total Skipped: ${grandTotalSkipped}`);
  console.log(`========================================\n`);
}

runIndexAll().catch(console.error);
