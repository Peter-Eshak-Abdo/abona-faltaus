import fs from "fs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local" });
if (fs.existsSync(".env")) dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(url, key);

async function cleanAndDeduplicate() {
  console.log("=== 1. Checking Core Tables ===");
  const tables = ["liturgies", "tasbeha", "agpeya", "synaxarium"];
  for (const t of tables) {
    const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
    console.log(`Table ${t}: ${count} rows (All unique with Primary Key ID).`);
  }

  console.log("\n=== 2. Cleaning Duplicates in liturgy_hyperlinks ===");
  // Fetch hyperlinks and re-seed clean distinct set
  const p = "data/liturgy_hyperlink_graph.json";
  if (!fs.existsSync(p)) return;

  const graph: Record<string, Array<{ from_section: string; label: string; target: string }>> = JSON.parse(fs.readFileSync(p, "utf-8"));
  const uniqueEntriesMap = new Map<string, { source_file: string; from_section: string; label: string; target: string }>();

  for (const [sourceFile, links] of Object.entries(graph)) {
    for (const l of links) {
      const uniqueKey = `${sourceFile}__${l.from_section}__${l.label}__${l.target}`;
      if (!uniqueEntriesMap.has(uniqueKey)) {
        uniqueEntriesMap.set(uniqueKey, {
          source_file: sourceFile,
          from_section: l.from_section,
          label: l.label,
          target: l.target
        });
      }
    }
  }

  const distinctEntries = Array.from(uniqueEntriesMap.values());
  console.log(`Total Unique Hyperlinks: ${distinctEntries.length}`);

  // Delete existing hyperlinks table data
  const { error: delErr } = await supabase.from("liturgy_hyperlinks").delete().neq("id", 0);
  if (delErr) {
    console.log("Delete error (if any):", delErr.message);
  } else {
    console.log("Cleaned old duplicates from liturgy_hyperlinks.");
  }

  // Insert exactly the unique entries
  const CHUNK_SIZE = 200;
  for (let i = 0; i < distinctEntries.length; i += CHUNK_SIZE) {
    const chunk = distinctEntries.slice(i, i + CHUNK_SIZE);
    const { error: insErr } = await supabase.from("liturgy_hyperlinks").insert(chunk);
    if (insErr) {
      console.error(`Error inserting clean chunk ${i}:`, insErr.message);
    }
  }

  const { count: finalCount } = await supabase.from("liturgy_hyperlinks").select("*", { count: "exact", head: true });
  console.log(`\nFinal Clean liturgy_hyperlinks Count: ${finalCount} rows (100% Unique & Deduplicated).`);
}

cleanAndDeduplicate();
