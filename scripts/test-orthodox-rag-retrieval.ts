import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { searchOrthodoxCorpus } from "../lib/orthodox-rag";

async function testRAG() {
  const queries = [
    { query: "مفهوم الفداء وسقوط آدم", category: "patristic_commentary" },
    { query: "لاهوت السيد المسيح", category: "dogmatics" },
    { query: "قواعد اللغة القبطية", category: "liturgy" },
  ];

  console.log("\n==============================================");
  console.log("🔍 اختبار استرجاع مراجع RAG الأرثوذكسية");
  console.log("==============================================\n");

  for (const item of queries) {
    console.log(`📌 السؤال: "${item.query}" (التصنيف: ${item.category})`);
    const results = await searchOrthodoxCorpus(item.query, {
      limit: 3,
      threshold: 0.3,
      category: item.category,
    });

    console.log(`   ✓ تم استرجاع ${results.length} مراجع مطابقة:`);
    results.forEach((doc, idx) => {
      console.log(`   [${idx + 1}] ${doc.work_title} | ${doc.author} (${doc.reference_location || "عام"})`);
      console.log(`       مقتطف: ${doc.content.slice(0, 120)}...`);
    });
    console.log("--------------------------------------------------\n");
  }
}

testRAG().catch(console.error);
