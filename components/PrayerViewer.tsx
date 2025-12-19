'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileContext } from '@/lib/coptic-service';

type Props = {
  context: FileContext;
};

// ترتيب القراءات الطقسي
const LITURGY_KEYS = [
  { key: 'vespers-psalm', label: 'مزمور العشية' },
  { key: 'vespers-gospel', label: 'إنجيل العشية' },
  { key: 'evening-doxology', label: 'ذكصولوجية العشية' },
  { key: 'matins-prophecies', label: 'نبوات باكر' },
  { key: 'matins-psalm', label: 'مزمور باكر' },
  { key: 'matins-gospel', label: 'إنجيل باكر' },
  { key: 'morning-doxology', label: 'ذكصولوجية باكر' },
  { key: 'pauline-epistle', label: 'الرسالة إلى العبرانيين (البولس)' },
  { key: 'catholic-epistle', label: 'الكاثوليكون' },
  { key: 'acts-of-the-apostles', label: 'الإبركسيس' },
  { key: 'synaxarium', label: 'السنكسار' },
  { key: 'liturgy-psalm', label: 'مزمور القداس' },
  { key: 'liturgy-gospel', label: 'إنجيل القداس' },
  { key: 'prophecies', label: 'النبوات' },
  { key: 'jonah-prayer', label: 'صلاة يونان' }
];

export default function PrayerViewer({ context }: Props) {
  const { data, siblings, currentIndex, prev, next, parentPath } = context;
  const router = useRouter();

  // إعدادات اللغة (Default State)
  const [showCoptic, setShowCoptic] = useState(true);
  const [showArabic, setShowArabic] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // منطق السحب (Swipe)
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStartX !== null) {
      const diff = touchStartX - endX;
      if (diff > 50 && prev) router.push(`?path=${parentPath ? `${parentPath}/${prev}` : prev}`);
      else if (diff < -50 && next) router.push(`?path=${parentPath ? `${parentPath}/${next}` : next}`);
    }
    setTouchStartX(null);
  };

  const goToFile = (f: string) => {
    router.push(`?path=${parentPath ? `${parentPath}/${f}` : f}`);
    setMenuOpen(false);
  };

  // --------------------------------------------------------------------------
  // Renderers (دوال العرض)
  // --------------------------------------------------------------------------

  // 1. عارض وحدة النص (سطر واحد بكل اللغات المتاحة)
  const TextUnit = ({ content, isGrid = false, index = 0 }: { content: any, isGrid?: boolean, index?: number }) => {
    // تحديد عدد الأعمدة بناء على اللغات المفعلة
    const activeLangs = [showCoptic, showArabic, showEnglish].filter(Boolean).length;

    // تصميم الشبكة (للصلوات)
    const gridLayout = `grid gap-1 p-1 border-b ${activeLangs === 3 ? 'md:grid-cols-3' : activeLangs === 2 ? 'md:grid-cols-2' : 'grid-cols-1'
      } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`;

    // تصميم القائمة (للقراءات)
    const listLayout = `flex flex-col gap-1 mb-1 pb-1 border-b last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} p-2 rounded`;

    const wrapperClass = isGrid ? gridLayout : listLayout;

    return (
      <div className={wrapperClass}>
        {showArabic && content.arabic && (
          <div className={`font-serif text-gray-800 text-xl leading-loose dir-rtl ${isGrid ? 'text-center md:text-right' : 'text-center'}`}>
            {content.arabic}
          </div>
        )}
        {showCoptic && content.coptic && (
          <div className={`font-coptic text-blue-900 text-xl leading-loose ${isGrid ? 'text-center md:text-left' : 'text-center'}`}>
            {content.coptic}
          </div>
        )}
        {showEnglish && content.english && (
          <div className={`text-gray-600 text-lg ${isGrid ? 'text-center md:text-left' : 'text-center'}`}>
            {content.english}
          </div>
        )}
      </div>
    );
  };

  // 2. نمط الصلوات (Prayer Style - Grid)
  // يستخدم عندما نجد Sections في الملف
  const renderPrayerStyle = (sections: any[]) => {
    return sections.map((section: any, idx: number) => (
      <div key={idx} className="mb-1">
        {section.title && <h3 className="text-center font-bold text-gray-400 mb-1">{section.title}</h3>}
        <div className="border rounded-lg overflow-hidden shadow-sm">
          {section.verses && Array.isArray(section.verses) && section.verses.map((verse: any, vIdx: number) => (
            <TextUnit key={vIdx} content={verse} index={vIdx} isGrid={true} />
          ))}
        </div>
      </div>
    ));
  };

  // 3. نمط القراءات (Reading Style - List)
  // يستخدم عندما نجد مفاتيح قطمارس (Vespers, Gospel, etc.)
  const renderReadingStyle = (readingKeys: typeof LITURGY_KEYS) => {
    return readingKeys.map((item) => {
      const readingData = (data as any)[item.key];
      // التأكد أن البيانات مصفوفة
      if (!readingData || !Array.isArray(readingData)) return null;

      return (
        <section key={item.key} className="mb-1 border rounded-xl overflow-hidden shadow bg-white">
          <div className="bg-blue-900 text-white p-1 text-center font-bold text-xl">
            {item.label}
          </div>

          <div className="p-1">
            {readingData.map((block: any, bIdx: number) => (
              <div key={bIdx} className="mb-1">
                {/* عنوان القراءة */}
                {block.title && (
                  <div className="bg-amber-50 border border-amber-100 p-1 rounded text-center mb-1 mx-auto w-fit">
                    {showArabic && block.title.arabic && <h4 className="font-bold text-gray-800">{block.title.arabic}</h4>}
                    {showCoptic && block.title.coptic && <p className="font-coptic text-blue-800">{block.title.coptic}</p>}
                    {showEnglish && block.title.english && <p className="text-sm text-gray-500">{block.title.english}</p>}
                  </div>
                )}

                {/* نص القراءة (المصفوفة المتداخلة) */}
                {block.text && Array.isArray(block.text) && (
                  <div>
                    {block.text.map((paragraph: any, pIdx: number) => (
                      <TextUnit key={pIdx} content={paragraph} index={pIdx} isGrid={false} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    });
  };

  // --------------------------------------------------------------------------
  // Main Logic (تحديد نوع العرض)
  // --------------------------------------------------------------------------

  // هل الملف صلاة عادية؟ (لو فيه sections)
  const isPrayer = data && 'sections' in data && Array.isArray(data.sections);

  // هل الملف قراءات؟ (لو فيه أي مفتاح من مفاتيح القطمارس)
  const availableReadings = LITURGY_KEYS.filter(k => data && k.key in data);
  const isReading = availableReadings.length > 0;

  // استخراج عنوان الصفحة
  let pageTitle = { arabic: 'عرض', english: 'View', coptic: '' };
  if (data && data.title) pageTitle = { ...pageTitle, ...data.title };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      {/* Top Navbar */}
      <div className="bg-white p-1 shadow-sm border-b sticky top-0 z-20 flex justify-between items-center gap-2">
        {/* Dropdown File Switcher */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg text-sm font-bold truncate max-w-[150px]">
            {siblings[currentIndex]?.replace('.json', '')} ▼
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 w-40 max-h-[60vh] overflow-y-auto bg-white shadow-xl border z-50 rounded mt-1">
              {siblings.map((f, i) => (
                <button key={f} onClick={() => goToFile(f)} className={`w-full text-right p-1 border-b text-sm ${i === currentIndex ? 'bg-blue-50 font-bold border-r-4 border-r-blue-600' : ''}`}>
                  {f.replace('.json', '')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Checkboxes */}
        <div className="flex gap-1 text-xs font-bold bg-gray-50 p-1 rounded-lg border">
          <label className="flex items-center gap-1 px-1 cursor-pointer select-none"><input type="checkbox" checked={showArabic} onChange={e => setShowArabic(e.target.checked)} /> <span>عربى</span></label>
          <label className="flex items-center gap-1 px-1 cursor-pointer select-none"><input type="checkbox" checked={showCoptic} onChange={e => setShowCoptic(e.target.checked)} /> <span>Copt</span></label>
          <label className="flex items-center gap-1 px-1 cursor-pointer select-none"><input type="checkbox" checked={showEnglish} onChange={e => setShowEnglish(e.target.checked)} /> <span>Eng</span></label>
        </div>
      </div>

      {/* Main Content Body */}
      <div
        className="flex-1 p-1 md:p-1 bg-gray-100"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <article className="max-w-8xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden min-h-[600px]">

          {/* Header */}
          <header className="bg-blue-50 p-1 text-center border-b">
            {showCoptic && pageTitle.coptic && <h1 className="text-2xl font-bold font-coptic text-blue-900 mb-1">{pageTitle.coptic}</h1>}
            {showArabic && pageTitle.arabic && <h2 className="text-xl font-bold font-serif text-gray-800">{pageTitle.arabic}</h2>}
            {showEnglish && pageTitle.english && <h3 className="text-sm text-gray-500 mt-1">{pageTitle.english}</h3>}
          </header>

          <div className="p-1 md:p-1">
            {isPrayer ? (
              renderPrayerStyle(data.sections)
            ) : isReading ? (
              renderReadingStyle(availableReadings)
            ) : (
              <div className="text-center py-1 text-gray-400">
                <p className="text-4xl mb-1">📂</p>
                <p>لا يوجد محتوى نصي معترف به.</p>
                <details className="mt-1 text-xs text-left bg-gray-50 p-1 rounded dir-ltr overflow-auto">
                  <summary>Raw JSON Structure</summary>
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>

        </article>
      </div>

      {/* Footer Info */}
      <div className="text-center py-1 bg-gray-50 text-gray-400 text-xs border-t">
        الملف {currentIndex + 1} من {siblings.length}
      </div>
    </div>
  );
}
