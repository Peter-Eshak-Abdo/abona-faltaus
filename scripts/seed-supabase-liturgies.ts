import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

if (fs.existsSync(".env.local")) dotenv.config({ path: ".env.local" });
if (fs.existsSync(".env")) dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadLiturgies() {
  console.log("--- 1. Uploading Liturgies Data ---");
  const p = path.join(process.cwd(), "lib", "liturgies", "data", "full_liturgies_data.json");
  if (!fs.existsSync(p)) {
    console.log("Liturgy file not found:", p);
    return;
  }
  const items = JSON.parse(fs.readFileSync(p, "utf-8"));
  console.log(`Found ${items.length} liturgy documents.`);

  for (const doc of items) {
    const payload = {
      id: doc.id,
      slug: doc.slug || doc.id,
      title: doc.title,
      subtitle: doc.subtitle || "",
      description: doc.description || "",
      icon_name: doc.iconName || "FaChurch",
      accent_color: doc.accentColor || "amber",
      groups: doc.groups || [],
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("liturgies").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error(`Error uploading liturgy ${doc.id}:`, error.message);
    } else {
      console.log(`Uploaded liturgy: ${doc.id} (${doc.title?.arabic || ""})`);
    }
  }
}

async function uploadTasbeha() {
  console.log("\n--- 2. Uploading Tasbeha Data ---");
  const p = path.join(process.cwd(), "lib", "tasbeha", "data", "full_tasbeha_data.json");
  if (!fs.existsSync(p)) {
    console.log("Tasbeha file not found:", p);
    return;
  }
  const items = JSON.parse(fs.readFileSync(p, "utf-8"));
  console.log(`Found ${items.length} tasbeha documents.`);

  for (const doc of items) {
    const payload = {
      id: doc.id,
      slug: doc.slug || doc.id,
      title: doc.title,
      subtitle: doc.subtitle || "",
      description: doc.description || "",
      icon_name: doc.iconName || "FaMusic",
      accent_color: doc.accentColor || "emerald",
      groups: doc.groups || [],
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from("tasbeha").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error(`Error uploading tasbeha ${doc.id}:`, error.message);
    } else {
      console.log(`Uploaded tasbeha: ${doc.id} (${doc.title?.arabic || ""})`);
    }
  }
}

async function uploadAgpeya() {
  console.log("\n--- 2.5. Uploading Agpeya Data ---");
  const { AGPEYA_HOURS } = await import("../lib/agpeya-data");
  console.log(`Found ${AGPEYA_HOURS.length} Agpeya canonical hours.`);

  for (const hour of AGPEYA_HOURS) {
    const payload = {
      id: hour.id,
      hour_number: hour.order,
      title: {
        arabic: hour.nameAr,
        coptic: hour.nameCoptic,
        english: hour.nameEn
      },
      subtitle: hour.themeAr,
      sections: [
        { type: "introduction", items: hour.introduction },
        { type: "psalms", items: hour.psalms },
        { type: "gospel", items: hour.gospel },
        { type: "litanies", items: hour.litanies },
        { type: "conclusion", items: hour.conclusion }
      ]
    };

    const { error } = await supabase.from("agpeya").upsert(payload);
    if (error) {
      console.error(`Error uploading Agpeya ${hour.id}:`, error.message);
    } else {
      console.log(`Uploaded Agpeya: ${hour.id} (${hour.nameAr})`);
    }
  }
}

async function uploadSynaxarium() {
  console.log("\n--- 3. Uploading Synaxarium Data ---");
  const p = path.join(process.cwd(), "data", "synaxarium", "synaxarium_complete.json");
  if (!fs.existsSync(p)) {
    console.log("Synaxarium file not found:", p);
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(p, "utf-8"));
  
  // Transform dictionary
  const items = Object.entries(rawData).map(([key, val]: [string, any]) => ({
    key,
    ...val
  }));

  console.log(`Found ${items.length} synaxarium daily entries.`);

  // Upload in chunks of 50
  const CHUNK_SIZE = 50;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE).map((item: any) => {
      const dateObj = item.date || {};
      const cMonth = dateObj.month_index || 1;
      const cDay = dateObj.day || 1;
      const storiesAr = item.stories_ar || item.stories || item.events || [];
      const storiesEn = item.stories_en || [];

      return {
        id: `synax_${String(cMonth).padStart(2, '0')}_${String(cDay).padStart(2, '0')}`,
        coptic_month: cMonth,
        coptic_day: cDay,
        title: {
          arabic: dateObj.title_ar || storiesAr[0]?.name || item.key || "السنكسار",
          coptic: dateObj.title_cop || "",
          english: dateObj.title_en || storiesEn[0]?.name || "Synaxarium"
        },
        events: storiesAr,
        full_text_ar: storiesAr.map((s: any) => `${s.name || ""}\n${s.text || ""}`).join("\n\n"),
        full_text_en: storiesEn.map((s: any) => `${s.name || ""}\n${s.text || ""}`).join("\n\n")
      };
    });

    const { error } = await supabase.from("synaxarium").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`Error uploading synaxarium chunk ${i}-${i + CHUNK_SIZE}:`, error.message);
    } else {
      console.log(`Uploaded synaxarium chunk ${i + 1} to ${Math.min(i + CHUNK_SIZE, items.length)}`);
    }
  }
}

async function uploadHyperlinks() {
  console.log("\n--- 4. Uploading Hyperlink Graph ---");
  const p = path.join(process.cwd(), "data", "liturgy_hyperlink_graph.json");
  if (!fs.existsSync(p)) return;
  const graph = JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, Array<{ from_section: string; label: string; target: string }>>;

  const entries: Array<{ source_file: string; from_section: string; label: string; target: string }> = [];
  for (const [sourceFile, links] of Object.entries(graph)) {
    for (const l of links) {
      entries.push({
        source_file: sourceFile,
        from_section: l.from_section,
        label: l.label,
        target: l.target
      });
    }
  }
  console.log(`Total hyperlinks to upload: ${entries.length}`);

  const CHUNK_SIZE = 100;
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    const chunk = entries.slice(i, i + CHUNK_SIZE);
    const { error } = await supabase.from("liturgy_hyperlinks").upsert(chunk);
    if (error) {
      console.error(`Error uploading hyperlinks chunk ${i}:`, error.message);
    }
  }
  console.log("Hyperlinks upload completed!");
}

async function main() {
  await uploadLiturgies();
  await uploadTasbeha();
  await uploadAgpeya();
  await uploadSynaxarium();
  await uploadHyperlinks();
  console.log("\n All Coptic Datasets Synchronized with Supabase!");
}

main();
