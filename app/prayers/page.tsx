import { explorePath } from '@/lib/coptic-service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrayerViewer from '@/components/PrayerViewer';
import { getDisplayName } from '@/lib/mappings';

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function getNextDirectoryStart(currentPath: string): Promise<string | null> {
  const parts = currentPath.split('/').filter(Boolean);

  // إذا كنا في الجذر أو مستوى واحد، لا نحتاج انتقال معقد حالياً
  if (parts.length < 2) return null;

  const currentFolder = parts[parts.length - 1]; // المجلد الحالي الذي نتصفحه (مثلاً 01-offering)
  const parentPath = parts.slice(0, -1).join('/'); // المجلد الأب (مثلاً liturgy-st-basil)

  // نجلب محتويات المجلد الأب لنعرف ترتيب المجلدات
  const parentContent = await explorePath(parentPath);

  if (parentContent.type === 'directory') {
    // نأخذ فقط المجلدات ونرتبها
    const folders = parentContent.items
      .filter(i => i.type === 'directory')
      .map(i => i.path.split('/').pop() || ''); // نأخذ اسم المجلد فقط

    const currentIndex = folders.indexOf(currentFolder);

    // إذا وجدنا مجلد تالي
    if (currentIndex !== -1 && currentIndex < folders.length - 1) {
      const nextFolderName = folders[currentIndex + 1];
      const nextFolderPath = `${parentPath}/${nextFolderName}`;

      // الآن نحتاج أول ملف داخل هذا المجلد التالي
      const nextFolderContent = await explorePath(nextFolderPath);
      if (nextFolderContent.type === 'directory' && nextFolderContent.items.length > 0) {
        // نرجح أول ملف أو مجلد داخل المجلد التالي
        return nextFolderContent.items[0].path;
      }
    }
  }
  return null;
}

export default async function PrayersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const currentPath = resolvedParams.path || '';

  // 1. جلب البيانات
  const result = await explorePath(currentPath);

  // 2. التحويل التلقائي
  if (result.type === 'redirect') {
    redirect(`/prayers?path=${result.path}`);
  }

  // حساب مسار العودة
  const pathParts = currentPath.split('/').filter(Boolean);
  const parentPath = pathParts.slice(0, -1).join('/');

  // --- المنطق الجديد: الانتقال للمجلد التالي ---
  let nextDirectoryPath: string | null = null;

  // نحسب المجلد التالي فقط إذا كنا نعرض ملفاً (File View)
  if (result.type === 'file') {
     // نقوم بحساب المسار للمجلد التالي (والد الملف الحالي هو المجلد الذي نبحث عن أخيه)
     // ملاحظة: currentPath يشير للملف. parentPath يشير للمجلد الحالي.
     // نحن نريد "أخو" parentPath.
     nextDirectoryPath = await getNextDirectoryStart(parentPath);
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-0 m-0" dir="rtl">

      {/* Navbar مع الأسماء الجديدة */}
      <nav className="bg-white p-1 shadow-sm mb-1 flex gap-1 items-center text-sm overflow-x-auto whitespace-nowrap">
        <Link href="/prayers" className="font-bold text-blue-600 hover:underline px-2">الرئيسية</Link>
        {pathParts.map((part, idx) => (
          <span key={idx} className="flex gap-1 text-gray-500 items-center">
            <span>/</span>
            <Link href={`/prayers?path=${pathParts.slice(0, idx + 1).join('/')}`} className="hover:text-black">
              {getDisplayName(part)}
            </Link>
          </span>
        ))}
      </nav>

      {/* Error View */}
      {result.type === 'error' && (
        <div className="p-1 text-center text-red-600 bg-red-50 m-1 rounded">
          ⚠️ {result.message}
        </div>
      )}

      {/* Directory View (عرض المجلدات) */}
      {result.type === 'directory' && (
        <div className="max-w-8xl mx-auto p-1">
          {currentPath && (
            <Link href={`/prayers?path=${parentPath}`} className="inline-block mb-1 p-1 bg-gray-200 rounded hover:bg-gray-300">
              ↩️ عودة
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-1">
            {result.items.map((item) => (
              <Link
                key={item.path}
                href={`/prayers?path=${item.path}`}
                className="bg-white p-1 rounded-xl shadow hover:shadow-md transition flex items-center gap-1 border border-gray-100"
              >
                <div className="text-3xl bg-blue-50 p-1 rounded-lg">
                    {item.type === 'directory' ? '📂' : '📜'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-lg">
                    {getDisplayName(item.name)}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-1">
                    {item.name}
                  </div>
                </div>
                <div className="text-gray-300">👈</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* File View (عرض الملف) */}
      {result.type === 'file' && (
        <PrayerViewer
            context={result.context}
            nextDirectoryLink={nextDirectoryPath} // مررنا الرابط الجديد هنا
        />
      )}
    </div>
  );
}
