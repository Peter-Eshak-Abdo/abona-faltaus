import fs from "fs";
import path from "path";

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const targetDirs = ["./app", "./components", "./lib"];
const files = targetDirs.flatMap(walk);
console.log(`[INFO] Found ${files.length} TypeScript files.`);

const spacingPrefixes = [
  "p-", "px-", "py-", "pt-", "pb-", "pl-", "pr-", "ps-", "pe-",
  "m-", "mx-", "my-", "mt-", "mb-", "ml-", "mr-", "ms-", "me-",
  "-m-", "-mx-", "-my-", "-mt-", "-mb-", "-ml-", "-mr-", "-ms-", "-me-",
  "gap-", "gap-x-", "gap-y-",
  "space-x-", "space-y-", "-space-x-", "-space-y-",
  "top-", "bottom-", "left-", "right-", "inset-", "inset-x-", "inset-y-",
  "-top-", "-bottom-", "-left-", "-right-",
  "w-", "h-", "min-w-", "max-w-", "min-h-", "max-h-", "size-"
];

let totalOccurrences = 0;
const affectedFiles = new Set();
const prefixCounts = {};
const sampleTransformations = [];

for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  // Match string literals and template strings
  const stringRegex = /"([^"\r\n]+)"|'([^'\r\n]+)'|`([^`]+)`/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const rawStr = match[1] || match[2] || match[3] || "";
    // Only look at strings containing spacing-like classes
    const tokens = rawStr.split(/[\s,]+/);
    for (const tok of tokens) {
      const cleanTok = tok.split(":").pop();
      for (const prefix of spacingPrefixes) {
        if (cleanTok.startsWith(prefix)) {
          const val = cleanTok.slice(prefix.length);
          if (/^(\d+(\.\d+)?)$/.test(val)) {
            const num = parseFloat(val);
            const multiplied = (num * 4).toString().replace(/\.0$/, "");
            affectedFiles.add(f);
            totalOccurrences++;
            prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
            if (sampleTransformations.length < 25) {
              sampleTransformations.push({
                file: path.basename(f),
                original: tok,
                target: tok.replace(new RegExp(`${prefix}${val}$`), `${prefix}${multiplied}`)
              });
            }
            break;
          }
        }
      }
    }
  }
}

console.log(`[ANALYSIS] Files affected: ${affectedFiles.size} of ${files.length}`);
console.log(`[ANALYSIS] Total spacing utility tokens: ${totalOccurrences}`);
console.log("\n[ANALYSIS] Prefix frequency:");
console.log(JSON.stringify(prefixCounts, null, 2));
console.log("\n[ANALYSIS] Sample transformations:");
console.table(sampleTransformations);
