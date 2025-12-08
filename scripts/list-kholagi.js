import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data", "coptish-datastore", "output");
console.log("Checking path:", dataDir);

fs.stat(dataDir, (err, st) => {
  if (err) {
    console.error("stat error:", err.code, err.message);
    return;
  }
  console.log("Exists. isDirectory:", st.isDirectory());
  fs.readdir(dataDir, (err, files) => {
    if (err) return console.error("readdir error:", err.code, err.message);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));
    console.log("All files count:", files.length);
    console.log("JSON files count:", jsonFiles.length);
    console.log("First 20 json files:", jsonFiles.slice(0, 20));
    if (jsonFiles.length > 0) {
      const first = path.join(dataDir, jsonFiles[0]);
      console.log("Reading first JSON:", first);
      fs.readFile(first, "utf8", (err, data) => {
        if (err) return console.error("readFile error:", err.code, err.message);
        console.log("First JSON snippet (300 chars):", data.slice(0, 300));
      });
    }
  });
});
