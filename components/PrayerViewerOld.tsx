'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileContext } from '@/lib/coptic-service';

// تعريفات مرنة للبيانات
type CommonData = {
  title?: any;
  text?: string | string[]; // النص ممكن يكون سترينج أو مصفوفة
  introduction?: string;
  ref?: string;
  sections?: any[];
  readings?: any[];
  // مفاتيح القطمارس الشهيرة
  vespers?: any;
  matins?: any;
  liturgy?: any;
  [key: string]: any; // أي مفاتيح أخرى
};

type Props = {
  context: FileContext;
};

export default function PrayerViewer({ context }: Props) {
  const { data, siblings, currentIndex, prev, next, parentPath } = context;
  const contentData = data as CommonData; // التعامل مع البيانات بمرونة
  const router = useRouter();

  // State للتحكم في العرض
  const [showCoptic, setShowCoptic] = useState(true);
  const [showArabic, setShowArabic] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStartX !== null) {
      const diff = touchStartX - endX;
      if (diff > 50 && prev) router.push(`?path=${prev}`);
      else if (diff < -50 && next) router.push(`?path=${next}`);
    }
    setTouchStartX(null);
  };

  // --- دالة ذكية لعرض أي جزء من المحتوى (Recursive Renderer) ---
  const renderContent = (node: any, depth = 0): React.ReactNode => {
    if (!node) return null;

    // 1. لو ده مصفوفة (Array)، نلف عليها
    if (Array.isArray(node)) {
      return node.map((item, idx) => (
        <div key={idx} className="border-b last:border-0">
          {renderContent(item, depth)}
        </div>
      ));
    }

    // 2. لو كائن (Object) وفيه "text" -> ده غالباً قراءة أو صلاة
    if (typeof node === 'object' && (node.text || node.sections)) {
      return (
        <div className={`p-1 ${depth > 0 ? 'bg-gray-50/50' : ''}`}>

          {/* العنوان (Title) */}
          {node.title && (
            <div className="mb-1 text-center">
              {typeof node.title === 'object' ? (
                <>
                  {showCoptic && node.title.coptic && <h4 className="text-blue-800 font-bold font-coptic text-lg">{node.title.coptic}</h4>}
                  {showArabic && node.title.arabic && <h4 className="text-gray-800 font-bold">{node.title.arabic}</h4>}
                  {node.title.english && <h4 className="text-gray-500 text-sm">{node.title.english}</h4>}
                </>
              ) : (
                <h3 className="font-bold text-blue-900">{node.title}</h3>
              )}
            </div>
          )}

          {/* المعلومات الإضافية (Ref & Intro) */}
          {(node.introduction || node.ref) && (
            <div className="bg-yellow-50 p-1 rounded text-center text-sm mb-3 text-gray-700 border border-yellow-100">
              {node.introduction && <p>{node.introduction}</p>}
              {node.ref && <span className="font-bold text-blue-600 block mt-1">{node.ref}</span>}
            </div>
          )}

          {/* النص الكتابي (Text) */}
          {node.text && (
            <div className="text-lg leading-loose text-justify text-gray-800 font-serif" dir="rtl">
              {Array.isArray(node.text)
                ? node.text.map((t: any, i: number) => (
                  // معالجة لو النص عبارة عن آيات فيها لغات
                  typeof t === 'object'
                    ? <div key={i} className="mb-1">{showArabic ? t.arabic : t.english}</div>
                    : <p key={i}>{t}</p>
                ))
                : <p>{node.text}</p>
              }
            </div>
          )}

          {/* لو فيه أقسام فرعية (Recursion) */}
          {node.sections && renderContent(node.sections, depth + 1)}
        </div>
      );
    }

    // 3. معالجة خاصة للقطمارس (Vespers, Matins, Liturgy)
    const liturgyKeys = ['vespers', 'matins', 'liturgy'];
    return liturgyKeys.map(key => {
      if (node[key]) {
        const arTitles: Record<string, string> = { vespers: 'العشية', matins: 'باكر', liturgy: 'القداس' };
        return (
          <div key={key} className="mb-1 border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-blue-900 text-white p-1 text-center font-bold text-xl">
              {arTitles[key]}
            </div>
            {/* ندخل جوه القسم ونعرض اللي فيه سواء قراءات أو مزمور أو إنجيل */}
            {renderContent(node[key], depth + 1)}
          </div>
        );
      }
      return null;
    });
  };

  // --- دوال التنقل (Swipe & GoTo) ---
  const goToFile = (f: string) => {
    const p = parentPath ? `${parentPath}/${f}` : f;
    router.push(`?path=${p}`);
    setMenuOpen(false);
  };

  // ... (نفس كود Swipe السابق) ...

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">

      {/* Navbar Controls */}
      <div className="bg-white p-1 shadow-sm border-b sticky top-0 z-20 flex justify-between items-center">
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 p-1 bg-gray-100 rounded text-sm font-bold">
            {siblings[currentIndex]?.replace('.json', '')} ▼
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 w-40 max-h-60 overflow-y-auto bg-white shadow-xl border z-50 rounded-lg mt-1">
              {siblings.map((f, i) => (
                <button key={f} onClick={() => goToFile(f)} className={`w-full text-right p-1 border-b text-sm ${i === currentIndex ? 'bg-blue-50 font-bold' : ''}`}>
                  {f.replace('.json', '')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 text-sm bg-gray-50 p-1 rounded">
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showCoptic} onChange={e => setShowCoptic(e.target.checked)} /> <span>قبطي</span></label>
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={showArabic} onChange={e => setShowArabic(e.target.checked)} /> <span>عربي</span></label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-1 md:p-1 bg-gray-100">
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow min-h-[500px] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
>

          {/* Main Title Header */}
          <header className="bg-linear-to-b from-blue-50 to-white p-1 text-center border-b">
            {contentData.title && (
              typeof contentData.title === 'object' ? (
                <>
                  <h1 className="text-2xl font-bold text-blue-900 mb-1">{contentData.title.coptic || contentData.title.english}</h1>
                  <h2 className="text-xl text-gray-700">{contentData.title.arabic}</h2>
                </>
              ) : <h1 className="text-2xl font-bold">{contentData.title}</h1>
            )}
          </header>

          {/* Dynamic Content Rendering */}
          <div className="divide-y">
            {/* هنا السحر: الدالة دي هتدور على الداتا وتعرضها مهما كان مكانها */}
            {renderContent(contentData)}

            {/* Fallback لو ملقاش أي حاجة معروفة */}
            {!contentData.text && !contentData.sections && !contentData.vespers && !contentData.matins && !contentData.liturgy && (
              <div className="p-1 text-center text-gray-400">
                <p>لا يوجد محتوى نصي مباشر للعرض.</p>
                <details className="mt-1 text-left dir-ltr">
                  <summary>Raw JSON</summary>
                  <pre className="bg-gray-900 text-green-400 p-1 text-xs overflow-auto">{JSON.stringify(contentData, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>

        </article>
      </div>
    </div>
  );
}
