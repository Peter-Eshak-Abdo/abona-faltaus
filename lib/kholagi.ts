import fs from "fs/promises";
import path from "path";

export type KholagiItem = {
  id: string;
  slug: string;
  title?: string;
  chapters: string[]; // each chapter is a big string or array of lines
  raw?: any;
};

export async function loadAllKholagiItems(): Promise<KholagiItem[]> {
  const dataDir = path.join(
    process.cwd(),
    "data",
    "coptish-datastore",
    "output"
  );
  try {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    const items = await Promise.all(
      jsonFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(dataDir, f), "utf8");
        let obj = null;
        try {
          obj = JSON.parse(raw);
        } catch (e) {
          obj = null;
        }
        const slug = f.replace(/\.json$/i, "");
        const parsed = normalizeItem(slug, obj);
        return parsed;
      })
    );
    return items;
  } catch (err) {
    console.error("loadAllKholagiItems error", err);
    return [];
  }
}

export async function loadKholagiItem(
  slug: string
): Promise<KholagiItem | null> {
  // const dataDir = path.join(
  //   process.cwd(),
  //   "data",
  //   "coptish-datastore",
  //   "output"
  // );
  // const filePath = path.join(dataDir, `${slug}.json`);
  // try {
  //   const raw = await fs.readFile(filePath, "utf8");
  //   const obj = JSON.parse(raw);
  //   return normalizeItem(slug, obj);
  // } catch (err) {
  //   console.warn("loadKholagiItem:", slug, err);
  //   return null;
  // }
  
  // مؤقت — للطباعة debug
  const dataDir = path.join(process.cwd(), "data", "coptish-datastore", "output");
  console.log("Kholagi: reading dataDir ->", dataDir);
  try {
    const filePath = path.join(dataDir, `${slug}.json`);
    const raw = await fs.readFile(filePath, "utf8");
    const obj = JSON.parse(raw);
    return normalizeItem(slug, obj);
  } catch (err) {
    console.warn("loadKholagiItem:", slug, err);
    return null;
  }
}

function normalizeItem(slug: string, obj: any): KholagiItem {
  // heuristics:
  // - if obj.chapters is array -> use it
  // - if obj has numeric keys or keys like '1','2' -> map to chapters by sorted keys
  // - if obj is array -> treat as chapters array (maybe each element is chapter text or lines)
  // - fallback: single chapter with whole content JSON-stringified
  let chapters: string[] = [];

  if (!obj) {
    chapters = [`{}`];
    return { id: slug, slug, title: slug, chapters, raw: obj };
  }

  if (Array.isArray(obj)) {
    // array of chapters or lines; if inner elements are strings -> each entry a chapter
    if (obj.every((el) => typeof el === "string")) {
      chapters = obj;
    } else {
      // stringify each
      chapters = obj.map((el) =>
        typeof el === "string" ? el : JSON.stringify(el)
      );
    }
  } else if (obj.chapters && Array.isArray(obj.chapters)) {
    chapters = obj.chapters.map((c: any) =>
      typeof c === "string" ? c : JSON.stringify(c)
    );
  } else {
    // collect numeric keys
    const numericKeys = Object.keys(obj)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    if (numericKeys.length > 0) {
      chapters = numericKeys.map((k) => {
        const v = obj[k];
        return typeof v === "string" ? v : JSON.stringify(v);
      });
    } else {
      // fallback: try fields like 'content','text','lines'
      if (obj.text && typeof obj.text === "string") chapters = [obj.text];
      else if (obj.content && typeof obj.content === "string")
        chapters = [obj.content];
      else if (obj.lines && Array.isArray(obj.lines))
        chapters = obj.lines.map((l: any) =>
          typeof l === "string" ? l : JSON.stringify(l)
        );
      else {
        // single chapter contains whole JSON
        chapters = [JSON.stringify(obj, null, 2)];
      }
    }
  }

  const title = obj.title || obj.name || slug;
  return { id: slug, slug, title, chapters, raw: obj };
}
