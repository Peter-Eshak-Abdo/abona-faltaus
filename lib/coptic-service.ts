// lib/coptic-service.ts
import fs from "fs";
import path from "path";

const BASE_PATH = path.join(process.cwd(), "data/coptish-datastore/output");

export type FileSystemItem = {
  name: string;
  type: "file" | "directory";
  path: string;
};

// نوع البيانات الجديد الذي يرجع للمتصفح
export type FileContext = {
  data: any; // محتوى الملف
  siblings: string[]; // قائمة الملفات في نفس المجلد (للـ Dropdown)
  currentIndex: number; // ترتيب الملف الحالي
  prev: string | null; // رابط الملف السابق
  next: string | null; // رابط الملف التالي
  parentPath: string; // مسار المجلد الأب
};

export type PathResult =
  | { type: "directory"; items: FileSystemItem[] }
  | { type: "file"; context: FileContext }
  | { type: "redirect"; path: string } // أمر بالتحويل التلقائي
  | { type: "error"; message: string };

export async function explorePath(
  relativePath: string = ""
): Promise<PathResult> {
  if (relativePath.includes(".."))
    return { type: "error", message: "Invalid path" };

  const fullPath = path.join(BASE_PATH, relativePath);

  try {
    if (!fs.existsSync(fullPath)) {
      return {
        type: "error",
        message: 'Path not found. Run "npm run output:generate"',
      };
    }

    const stats = fs.statSync(fullPath);

    // --- حالة 1: المسار عبارة عن مجلد ---
    if (stats.isDirectory()) {
      const allItems = fs.readdirSync(fullPath);

      // 1. فلترة ملفات JSON فقط
      const jsonFiles = allItems.filter((f) =>
        f.toLowerCase().endsWith(".json")
      );

      // 2. لو المجلد يحتوي على ملفات JSON، قم بالتحويل لأول ملف فوراً
      if (jsonFiles.length > 0) {
        // ترتيب الملفات لضمان فتح "أول" ملف منطقياً
        jsonFiles.sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true })
        );
        const firstFile = jsonFiles[0];
        // نرجع أمر بالتحويل (Redirect)
        return {
          type: "redirect",
          path: relativePath ? `${relativePath}/${firstFile}` : firstFile,
        };
      }

      // 3. لو مفيهوش ملفات (فيه مجلدات تانية)، اعرض القائمة
      const items = allItems
        .map((item) => {
          const itemPath = path.join(fullPath, item);
          const itemStats = fs.statSync(itemPath);
          // نتجاهل الملفات غير الـ JSON والمجلدات المخفية
          if (itemStats.isFile() && !item.endsWith(".json")) return null;
          if (item.startsWith(".")) return null;

          return {
            name: item.replace(".json", ""),
            type: itemStats.isDirectory() ? "directory" : "file",
            path: relativePath ? `${relativePath}/${item}` : item,
          } as FileSystemItem;
        })
        .filter(Boolean) as FileSystemItem[];

      return { type: "directory", items };
    }

    // --- حالة 2: المسار عبارة عن ملف ---
    else if (stats.isFile() && relativePath.endsWith(".json")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const data = JSON.parse(content); // هنا كان الخطأ، الآن نحن متأكدين أنه JSON

      // منطق جلب السابق والتالي (Siblings Logic)
      const parentDir = path.dirname(fullPath);
      // نحسب المسار النسبي للأب عشان الروابط
      const parentRelativePath =
        path.dirname(relativePath) === "." ? "" : path.dirname(relativePath);

      const siblings = fs
        .readdirSync(parentDir)
        .filter((f) => f.endsWith(".json"))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const currentFileName = path.basename(fullPath);
      const currentIndex = siblings.indexOf(currentFileName);

      const prevFile = currentIndex > 0 ? siblings[currentIndex - 1] : null;
      const nextFile =
        currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

      // تكوين الروابط الكاملة
      const prevPath = prevFile
        ? parentRelativePath
          ? `${parentRelativePath}/${prevFile}`
          : prevFile
        : null;
      const nextPath = nextFile
        ? parentRelativePath
          ? `${parentRelativePath}/${nextFile}`
          : nextFile
        : null;

      return {
        type: "file",
        context: {
          data,
          siblings, // قائمة أسماء الملفات فقط
          currentIndex,
          prev: prevPath,
          next: nextPath,
          parentPath: parentRelativePath,
        },
      };
    }

    return { type: "error", message: "Unknown type or invalid file format" };
  } catch (error) {
    console.error("Error exploring path:", error);
    return {
      type: "error",
      message: "Server Error: Check console for details",
    };
  }
}
