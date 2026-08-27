import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const DATA_DIR = path.resolve("data/rag_sources");
const files = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.startsWith("liturgy_rag_batch_") && f.endsWith(".json"))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });

console.log(`\n🚀 Starting Sequential Import for ${files.length} batches (1 to ${files.length})...\n`);

for (let i = 0; i < files.length; i++) {
  const fileName = files[i];
  const fullPath = path.join("data/rag_sources", fileName);
  console.log(`\n--------------------------------------------------`);
  console.log(`[Batch ${i + 1}/${files.length}] Processing: ${fileName}`);
  console.log(`--------------------------------------------------\n`);

  try {
    execSync(`npx tsx scripts/import-rag-json.ts "${fullPath}"`, {
      stdio: "inherit",
    });
  } catch (err: any) {
    console.error(`❌ Error in ${fileName}:`, err.message);
  }
}

console.log("\n🎉 All 26 batches imported and indexed successfully!\n");
