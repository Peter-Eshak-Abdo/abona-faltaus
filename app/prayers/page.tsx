import { explorePath } from '@/lib/coptic-service';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrayerViewer from '@/components/PrayerViewer';

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

// مكون بسيط للتقويم (Calendar) داخل الصفحة
function SimpleCalendar() {
  return (
    <div className="max-w-md mx-auto bg-white p-1 rounded-xl shadow mt-1 text-center">
      <h2 className="text-2xl font-bold mb-1 text-blue-900">📅 القراءات اليومية</h2>
      <p className="mb-1 text-gray-600">اختر التاريخ لعرض قراءات اليوم</p>
      <form action="/prayers" method="get">
        <input type="hidden" name="path" value="readings/annual" /> {/* تعديل المسار حسب المجلد الفعلي */}
        <div className="flex gap-1">
          <input
            type="date"
            name="date_selector" // خدعة بسيطة، سنعتمد على JS أو نوجه يدوياً
            className="border p-1 rounded flex-1"
            onChange={(e) => {
              // في بيئة حقيقية يفضل استخدام Client Component للتوجيه
              // لكن هنا سنعرض مثال للتوجيه اليدوي
              window.location.href = `/prayers?path=readings/annual/${e.target.value}.json`;
            }}
          /* ملاحظة: بسبب أن هذا Server Component، التفاعل المباشر محدود.
             الأفضل استخدام Client Component للتقويم، لكن سأضع زرار للتوجيه للمجلد */
          />
        </div>
        <div className="mt-1 grid grid-cols-1 gap-1">
          <Link href="/prayers?path=readings/annual" className="bg-blue-600 text-white py-1 rounded hover:bg-blue-700 block">
            تصفح كل الأيام
          </Link>
        </div>
      </form>
    </div>
  );
}

export default async function PrayersPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const currentPath = resolvedParams.path || '';

  // 1. حالة خاصة: صفحة القراءات الرئيسية
  if (currentPath === 'readings') {
    // نقوم بتحويله لمجلد الـ annual مباشرة أو نعرض التقويم
    // للأمان، سنعرض المجلدات
    const result = await explorePath('readings');
    // ... سيتم التعامل معه بالأسفل كـ Directory
  }

  // 2. جلب البيانات
  const result = await explorePath(currentPath);

  // 3. التحويل التلقائي (Redirect)
  if (result.type === 'redirect') {
    redirect(`/prayers?path=${result.path}`);
  }

  // حساب مسار العودة (Breadcrumbs)
  const pathParts = currentPath.split('/').filter(Boolean);
  const parentPath = pathParts.slice(0, -1).join('/');

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-0 m-0" dir="rtl">

      {/* Navbar Simple */}
      <nav className="bg-white p-1 shadow-sm mb-1 flex gap-1 items-center text-sm">
        <Link href="/prayers" className="font-bold text-blue-600 hover:underline">الرئيسية</Link>
        {pathParts.map((part, idx) => (
          <span key={idx} className="flex gap-1 text-gray-500">
            <span>/</span>
            <Link href={`/prayers?path=${pathParts.slice(0, idx + 1).join('/')}`} className="hover:text-black truncate max-w-[100px]">
              {part.replace('.json', '')}
            </Link>
          </span>
        ))}
      </nav>

      {/* --- Error View --- */}
      {result.type === 'error' && (
        <div className="p-1 text-center text-red-600 bg-red-50 border border-red-200 m-1 rounded">
          ⚠️ {result.message}
        </div>
      )}

      {/* --- Directory View --- */}
      {result.type === 'directory' && (
        <div className="max-w-8xl mx-auto p-1">
          {currentPath && (
            <Link href={`/prayers?path=${parentPath}`} className="inline-block mb-1 p-1 bg-gray-200 rounded hover:bg-gray-300">
              ↩️ عودة
            </Link>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1">
            {result.items.map((item) => (
              <Link
                key={item.path}
                href={`/prayers?path=${item.path}`}
                className="bg-white p-1 rounded-xl shadow hover:shadow-lg transition text-center border border-gray-100 flex flex-col items-center gap-1"
              >
                <div className="text-4xl">{item.type === 'directory' ? '📁' : '📜'}</div>
                <div className="font-bold text-gray-700 text-sm break-words w-full">
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* --- File View --- */}
      {result.type === 'file' && (
        <PrayerViewer context={result.context} />
      )}

    </div>
  );
}
