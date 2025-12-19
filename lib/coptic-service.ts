// lib/coptic-service.ts
import fs from 'fs';
import path from 'path';

const BASE_PATH = path.join(process.cwd(), 'data/coptish-datastore/output');

export type FileSystemItem = {
  name: string;
  type: 'file' | 'directory';
  path: string;
};

export type FileContext = {
  data: any;           // محتوى الملف الخام
  siblings: string[];  // الملفات المجاورة
  currentIndex: number;
  prev: string | null;
  next: string | null;
  parentPath: string;
};

export type PathResult =
  | { type: 'directory'; items: FileSystemItem[] }
  | { type: 'file'; context: FileContext }
  | { type: 'redirect'; path: string }
  | { type: 'error'; message: string };

export async function explorePath(relativePath: string = ''): Promise<PathResult> {
  // حماية المسار
  if (relativePath.includes('..')) return { type: 'error', message: 'Invalid path' };

  const fullPath = path.join(BASE_PATH, relativePath);

  try {
    if (!fs.existsSync(fullPath)) {
      return { type: 'error', message: 'المسار غير موجود. تأكد من تشغيل npm run output:generate' };
    }

    const stats = fs.statSync(fullPath);

    // --- حالة المجلد ---
    if (stats.isDirectory()) {
      const allItems = fs.readdirSync(fullPath);

      // لو المجلد يحتوي على ملفات JSON، نعمل تحويل تلقائي لأول ملف
      const jsonFiles = allItems.filter(f => f.toLowerCase().endsWith('.json'));
      if (jsonFiles.length > 0) {
        jsonFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        return {
            type: 'redirect',
            path: relativePath ? `${relativePath}/${jsonFiles[0]}` : jsonFiles[0]
        };
      }

      // لو مجلد تفرعي، نعرض محتوياته
      const items = allItems.map((item) => {
        const itemPath = path.join(fullPath, item);
        const itemStats = fs.statSync(itemPath);
        if (item.startsWith('.')) return null; // تجاهل الملفات المخفية

        return {
          name: item.replace('.json', ''),
          type: itemStats.isDirectory() ? 'directory' : 'file',
          path: relativePath ? `${relativePath}/${item}` : item,
        } as FileSystemItem;
      }).filter(Boolean) as FileSystemItem[];

      return { type: 'directory', items };
    }

    // --- حالة الملف ---
    else if (stats.isFile() && relativePath.endsWith('.json')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(content);

      // منطق السابق والتالي
      const parentDir = path.dirname(fullPath);
      const parentRelativePath = path.dirname(relativePath) === '.' ? '' : path.dirname(relativePath);

      const siblings = fs.readdirSync(parentDir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const currentFileName = path.basename(fullPath);
      const currentIndex = siblings.indexOf(currentFileName);

      const prevFile = currentIndex > 0 ? siblings[currentIndex - 1] : null;
      const nextFile = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

      const prev = prevFile ? (parentRelativePath ? `${parentRelativePath}/${prevFile}` : prevFile) : null;
      const next = nextFile ? (parentRelativePath ? `${parentRelativePath}/${nextFile}` : nextFile) : null;

      return {
        type: 'file',
        context: { data, siblings, currentIndex, prev, next, parentPath: parentRelativePath }
      };
    }

    return { type: 'error', message: 'نوع الملف غير مدعوم' };

  } catch (error) {
    console.error(error);
    return { type: 'error', message: 'حدث خطأ في السيرفر' };
  }
}
