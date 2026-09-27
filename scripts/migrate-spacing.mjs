import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const PREVIEW_FILE = process.argv.find(arg => arg.startsWith("--file="))?.split("=")[1];
const BACKUP_DIR = "./.spacing-backup";

const SPACING_MAP = {
  "0.25": "1",
  "0.5": "2",
  "0.75": "3",
  "1": "4",
  "1.25": "5",
  "1.5": "6",
  "1.75": "7",
  "2": "8",
  "2.25": "9",
  "2.5": "10",
  "3": "12",
  "3.5": "14",
  "4": "16",
  "5": "20",
  "6": "24",
  "7": "28",
  "8": "32",
  "9": "36",
  "10": "40",
  "11": "44",
  "12": "48",
  "13": "52",
  "14": "56",
  "15": "60",
  "16": "64",
  "17": "68",
  "18": "72",
  "20": "80",
  "24": "96",
  "25": "100",
  "12.25": "49",
  "18.75": "75",
};

const SPACING_PREFIXES = [
  "p-", "px-", "py-", "pt-", "pb-", "pl-", "pr-", "ps-", "pe-",
  "m-", "mx-", "my-", "mt-", "mb-", "ml-", "mr-", "ms-", "me-",
  "-m-", "-mx-", "-my-", "-mt-", "-mb-", "-ml-", "-mr-", "-ms-", "-me-",
  "gap-", "gap-x-", "gap-y-",
  "space-x-", "space-y-", "-space-x-", "-space-y-",
  "inset-", "top-", "bottom-", "left-", "right-",
  "-inset-", "-top-", "-bottom-", "-left-", "-right-",
  "w-", "h-", "min-w-", "max-w-", "min-h-", "max-h-", "size-"
];

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next" && file !== ".spacing-backup") {
        results = results.concat(walk(fullPath));
      }
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

function transformToken(token) {
  const parts = token.split(":");
  const core = parts[parts.length - 1];
  const variantPrefix = parts.slice(0, -1).join(":") + (parts.length > 1 ? ":" : "");

  for (const pfx of SPACING_PREFIXES) {
    if (core.startsWith(pfx)) {
      const val = core.slice(pfx.length);
      if (SPACING_MAP[val]) {
        const newVal = SPACING_MAP[val];
        return `${variantPrefix}${pfx}${newVal}`;
      }
    }
  }
  return token;
}

function transformContent(content) {
  let changeCount = 0;

  function processString(quote, str) {
    let hasSpacing = false;
    for (const pfx of SPACING_PREFIXES) {
      if (str.includes(pfx)) {
        hasSpacing = true;
        break;
      }
    }
    if (!hasSpacing) return `${quote}${str}${quote}`;

    const tokens = str.split(/(\s+)/);
    let modified = false;
    const newTokens = tokens.map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const transformed = transformToken(tok);
      if (transformed !== tok) {
        modified = true;
        changeCount++;
      }
      return transformed;
    });

    return `${quote}${newTokens.join("")}${quote}`;
  }

  // 1. Single/Double quote strings (single-line)
  let newContent = content.replace(/(["'])([^"'\r\n]+)\1/g, (match, quote, str) => {
    return processString(quote, str);
  });

  // 2. Multiline template literals `...`
  newContent = newContent.replace(/`([^`]+)`/g, (match, str) => {
    return processString("`", str);
  });

  return { newContent, changeCount };
}

if (PREVIEW_FILE) {
  const content = fs.readFileSync(PREVIEW_FILE, "utf8");
  const { newContent, changeCount } = transformContent(content);
  console.log(`[PREVIEW] File: ${PREVIEW_FILE}, Changes: ${changeCount}`);
  const oldLines = content.split("\n");
  const newLines = newContent.split("\n");
  oldLines.forEach((ol, i) => {
    const nl = newLines[i];
    if (ol !== nl) {
      console.log(`L${i + 1} - OLD: ${ol.trim()}`);
      console.log(`L${i + 1} + NEW: ${nl.trim()}`);
    }
  });
  process.exit(0);
}

const targetDirs = ["./app", "./components"];
const files = targetDirs.flatMap(walk);
console.log(`[INFO] Scanning ${files.length} TypeScript files (Mode: ${DRY_RUN ? "DRY-RUN" : "APPLY"})...`);

let totalFilesModified = 0;
let totalChanges = 0;

for (const filePath of files) {
  if (filePath.replace(/\\/g, "/").includes("components/ui/")) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const { newContent, changeCount } = transformContent(content);

  if (changeCount > 0) {
    totalFilesModified++;
    totalChanges += changeCount;

    if (!DRY_RUN) {
      const backupPath = path.join(BACKUP_DIR, filePath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.writeFileSync(backupPath, content, "utf8");
      fs.writeFileSync(filePath, newContent, "utf8");
    }
  }
}

console.log(`\n[RESULT] Modified files: ${totalFilesModified}`);
console.log(`[RESULT] Total tokens updated: ${totalChanges}`);
if (DRY_RUN) {
  console.log(`[INFO] Dry-run complete. Run with no arguments to apply changes.`);
} else {
  console.log(`[INFO] Changes applied. Backup saved in ${BACKUP_DIR}`);
}
