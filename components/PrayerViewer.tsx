'use client'; // ضروري عشان الـ Hooks

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileContext, FileSystemItem } from '@/lib/coptic-service';
import { PrayerDocument } from '@/lib/types/coptic';

type Props = {
  context: FileContext;
};

export default function PrayerViewer({ context }: Props) {
  const { data, siblings, currentIndex, prev, next, parentPath } = context;
  const prayerData = data as PrayerDocument;
  const router = useRouter();

  // 1. State للغات الظاهرة (Checkboxes)
  const [showCoptic, setShowCoptic] = useState(true);
  const [showArabic, setShowArabic] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false); // الإنجليزي مخفي افتراضياً مثلاً

  // 2. State للـ Dropdown
  const [menuOpen, setMenuOpen] = useState(false);

  // 3. منطق الـ Swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    if (touchStartX !== null) {
      const diff = touchStartX - endX;
      // سحب لليسار (التالي)
      if (diff > 50) {
        if (next) router.push(`?path=${next}`);
      }
      // سحب لليمين (السابق)
      else if (diff < -50) {
        if (prev) router.push(`?path=${prev}`);
      }
    }
    setTouchStartX(null);
  };

  const goToFile = (fileName: string) => {
    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    router.push(`?path=${fullPath}`);
    setMenuOpen(false);
  };

  // حساب عدد الأعمدة بناءً على اللغات المختارة
  const activeLangs = [showCoptic, showArabic, showEnglish].filter(Boolean).length;
  const gridColsClass = activeLangs === 3 ? 'md:grid-cols-3' : activeLangs === 2 ? 'md:grid-cols-2' : 'grid-cols-1';

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">

      {/* --- شريط التحكم العلوي --- */}
      <div className="bg-white p-1 shadow-sm border-b sticky top-0 z-20 flex flex-wrap gap-1 justify-between items-center">

        {/* Dropdown Navigation */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 p-1 bg-blue-50 text-blue-800 rounded-lg hover:bg-blue-100 font-bold border border-blue-200"
          >
            <span>📄 {siblings[currentIndex]?.replace('.json', '') || 'القائمة'}</span>
            <span className="text-xs">▼</span>
          </button>

          {menuOpen && (
            <div className="absolute top-full mt-1 right-0 w-64 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              {siblings.map((file, idx) => (
                <button
                  key={file}
                  onClick={() => goToFile(file)}
                  className={`w-full text-right p-1 border-b text-sm hover:bg-gray-50 transition-colors ${idx === currentIndex ? 'bg-blue-50 font-bold text-blue-700 border-r-4 border-r-blue-500' : 'text-gray-700'
                    }`}
                >
                  {file.replace('.json', '')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Toggles (Checkboxes) */}
        <div className="flex gap-1 text-sm font-bold items-center bg-gray-50 p-1 rounded-lg border">
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" checked={showCoptic} onChange={e => setShowCoptic(e.target.checked)} className="w-4 h-4" />
            <span>قبطي</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" checked={showArabic} onChange={e => setShowArabic(e.target.checked)} className="w-4 h-4" />
            <span>عربي</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer select-none">
            <input type="checkbox" checked={showEnglish} onChange={e => setShowEnglish(e.target.checked)} className="w-4 h-4" />
            <span>Eng</span>
          </label>
        </div>
      </div>

      {/* --- منطقة عرض الصلاة --- */}
      <div
        className="flex-1 p-1 md:p-1 bg-gray-50"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <article className="max-w-8xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden min-h-[500px]">

          {/* Header */}
          <header className="bg-linear-to-b from-blue-50 to-white p-1 text-center border-b">
            {typeof prayerData.title === 'object' ? (
              <div className="space-y-1">
                {showCoptic && prayerData.title.coptic && <h1 className="text-3xl font-bold text-blue-900 font-coptic">{prayerData.title.coptic}</h1>}
                {showArabic && prayerData.title.arabic && <h2 className="text-xl text-gray-700 font-serif">{prayerData.title.arabic}</h2>}
                {showEnglish && prayerData.title.english && <h3 className="text-lg text-gray-500">{prayerData.title.english}</h3>}
              </div>
            ) : (
              <h1 className="text-2xl font-bold">{prayerData.title}</h1>
            )}
          </header>

          {/* Verses Grid */}
          {prayerData.sections?.map((sec, sIdx) => (
            <div key={sIdx} className="divide-y">
              {sec.verses.map((verse, vIdx) => (
                <div
                  key={vIdx}
                  className={`grid ${gridColsClass} gap-1 p-1 hover:bg-amber-50/50 transition-colors ${vIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                >
                  {/* Coptic Column */}
                  {showCoptic && (
                    <div className="text-center md:text-left font-bold text-blue-900 flex flex-col justify-center">
                      {verse.coptic && <p className="text-xl leading-loose font-coptic">{verse.coptic}</p>}
                      {verse.coptic_english && <p className="text-sm text-gray-500 font-mono mt-1 opacity-80">{verse.coptic_english}</p>}
                    </div>
                  )}

                  {/* Arabic Column */}
                  {showArabic && (
                    <div className="text-center md:text-right flex flex-col justify-center" dir="rtl">
                      {verse.arabic && <p className="text-xl leading-relaxed text-gray-800 font-serif">{verse.arabic}</p>}
                    </div>
                  )}

                  {/* English Column */}
                  {showEnglish && (
                    <div className="text-center md:text-left flex flex-col justify-center">
                      {verse.english && <p className="text-lg text-gray-700">{verse.english}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Fallback for empty/different file types */}
          {!prayerData.sections && (
            <div className="p-1 bg-gray-900 text-green-400 overflow-auto" dir="ltr">
              <pre>{JSON.stringify(prayerData, null, 2)}</pre>
            </div>
          )}
        </article>
      </div>

      {/* Navigation Footer Hint */}
      <div className="p-1 text-center text-gray-400 text-xs">
        اسحب يميناً أو يساراً للتنقل بين الملفات
      </div>
    </div>
  );
}
