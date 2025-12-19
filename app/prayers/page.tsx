// app/prayers/page.tsx
import { explorePath } from '@/lib/coptic-service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrayerViewer from '@/components/PrayerViewer'; // استيراد المكون الجديد

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function PrayersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const currentPath = resolvedParams.path || '';

  // 1. جلب البيانات
  const result = await explorePath(currentPath);

  // 2. التحويل التلقائي (Auto Redirect)
  // لو دخلت فولدر وفيه ملفات، هوديك لأول ملف علطول
  if (result.type === 'redirect') {
    redirect(`/prayers?path=${result.path}`);
  }

  // حساب الـ Breadcrumbs
  const pathParts = currentPath.split('/').filter(Boolean);
  const parentPath = pathParts.slice(0, -1).join('/');

  return (
    <div className="min-h-screen bg-gray-100 font-sans" dir="rtl">

      {/* Navbar simple */}
      <nav className="bg-white shadow p-1 flex items-center gap-1 text-sm z-30 relative">
        <Link href="/prayers" className="text-blue-600 font-bold hover:underline">الرئيسية</Link>
        {pathParts.map((part, index) => {
          const href = pathParts.slice(0, index + 1).join('/');
          // لو إحنا في آخر حتة (اسم الملف)، منعرضوش في الـ Breadcrumb عشان منكررش العنوان
          const isLast = index === pathParts.length - 1;
          if (isLast && result.type === 'file') return null;

          return (
            <span key={index} className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <Link href={`/prayers?path=${href}`} className="hover:text-blue-600 truncate max-w-[100px] md:max-w-none">
                {part.replace('.json', '')}
              </Link>
            </span>
          );
        })}
      </nav>

      {/* Error View */}
      {result.type === 'error' && (
        <div className="p-1 text-center">
          <div className="bg-red-100 text-red-700 p-1 rounded inline-block border border-red-300">
            {result.message}
          </div>
        </div>
      )}

      {/* Directory View (Folder Grid) */}
      {result.type === 'directory' && (
        <div className="max-w-8xl mx-auto p-1">
          <h1 className="text-2xl font-bold mb-1 text-gray-700">المجلدات:</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {/* زر الرجوع */}
            {currentPath && (
              <Link
                href={`/prayers?path=${parentPath}`}
                className="flex flex-col items-center justify-center p-1 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
              >
                <span className="text-3xl mb-1">↩️</span>
                <span className="font-bold">عودة</span>
              </Link>
            )}

            {result.items.map((item) => (
              <Link
                key={item.path}
                href={`/prayers?path=${item.path}`}
                className="flex flex-col items-center justify-center p-1 bg-white rounded-xl shadow hover:shadow-lg hover:translate-y-0.5 transition border border-gray-100 text-center"
              >
                <div className="mb-1 text-4xl">
                  {item.type === 'directory' ? '📁' : '📄'}
                </div>
                <span className="text-sm font-bold text-gray-700 wrap-break-words w-full">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* File View (The Prayer Viewer) */}
      {result.type === 'file' && (
        <PrayerViewer context={result.context} />
      )}
    </div>
  );
}
