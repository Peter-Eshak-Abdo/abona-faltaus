import fs from "fs";
import path from "path";

const date = process.argv[2] || "2025-12-08";
const base = path.join(
  process.cwd(),
  "data",
  "coptish-datastore",
  "output",
  "readings",
  "annual"
);
const json = path.join(base, date + ".json");
const yml = path.join(base, date + ".yml");

function print(p) {
  console.log("Reading file:", p);
  const raw = fs.readFileSync(p, "utf8");
  console.log(raw.slice(0, 2000));
}

if (fs.existsSync(json)) print(json);
else if (fs.existsSync(yml)) print(yml);
else console.error("No file for", date, "at", base);
