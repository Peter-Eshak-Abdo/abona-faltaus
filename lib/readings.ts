// lib/readings.ts
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

const BASE = path.join(
  process.cwd(),
  "data",
  "coptish-datastore",
  "output",
  "readings",
  "annual"
);

export function todayDateString(): string {
  // Get Cairo date YYYY-MM-DD
  const d = new Date();
  // produce "YYYY-MM-DD" according to Cairo timezone
  const s = d.toLocaleString("en-CA", { timeZone: "Africa/Cairo" }); // "YYYY-MM-DD, HH:MM:SS"
  return s.split(",")[0];
}

async function readPossibleJsonOrYaml(fullPath: string) {
  const raw = await fs.readFile(fullPath, "utf8");
  if (fullPath.endsWith(".json")) return JSON.parse(raw);
  return yaml.load(raw as string);
}

export async function listAvailableDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(BASE);
    const dates = new Set<string>();
    for (const f of files) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})\.(json|yml|yaml)$/i);
      if (m) dates.add(m[1]);
    }
    return Array.from(dates).sort();
  } catch (err) {
    return [];
  }
}

export async function loadReadingByDate(dateStr: string): Promise<any | null> {
  const jsonPath = path.join(BASE, `${dateStr}.json`);
  const ymlPath = path.join(BASE, `${dateStr}.yml`);
  const yamlPath = path.join(BASE, `${dateStr}.yaml`);
  try {
    try {
      await fs.access(jsonPath);
      return await readPossibleJsonOrYaml(jsonPath);
    } catch {}
    try {
      await fs.access(ymlPath);
      return await readPossibleJsonOrYaml(ymlPath);
    } catch {}
    try {
      await fs.access(yamlPath);
      return await readPossibleJsonOrYaml(yamlPath);
    } catch {}
    return null;
  } catch (err) {
    return null;
  }
}

export async function loadTodayReading() {
  const d = todayDateString();
  const r = await loadReadingByDate(d);
  return { date: d, reading: r };
}
