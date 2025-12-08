import fs from "fs";
import path from "path";
const dataDir = path.join(process.cwd(), "data", "coptish-datastore", "output");

fs.readdir(dataDir, (err, files) => {
  if (err) return console.error("ERR reading dir:", err);
  console.log("files count:", files.length);
  files
    .filter((f) => f.endsWith(".json"))
    .slice(0, 20)
    .forEach((f) => console.log(f));
});
