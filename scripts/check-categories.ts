import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { supabase } from "../lib/supabase";

async function checkCategories() {
  const { data, error } = await supabase
    .from("orthodox_documents")
    .select("corpus_category, count:id")
    .limit(10);

  const { data: rows } = await supabase
    .from("orthodox_documents")
    .select("corpus_category, author, work_title")
    .limit(100);

  const categoryCounts: Record<string, number> = {};
  rows?.forEach((r: any) => {
    categoryCounts[r.corpus_category] = (categoryCounts[r.corpus_category] || 0) + 1;
  });

  console.log("Sample category distribution:", categoryCounts);
}

checkCategories().catch(console.error);
