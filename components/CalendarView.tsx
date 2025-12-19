'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarView() {
  const router = useRouter();
  // التاريخ الافتراضي: اليوم
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const handleGo = () => {
    // هنا بنفترض إن أسماء الملفات في الفولدر بالتاريخ
    // مثلا: 2024-01-01.json
    // لو الهيكلية عندك مختلفة (مثلا فولدر للسنة وفولدر للشهر) بنعدل السطر ده
    const fileName = `annual/${selectedDate}.json`;
    router.push(`?path=readings/${fileName}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-1 rounded-xl shadow-lg border text-center mt-1">
      <h2 className="text-2xl font-bold text-blue-900 mb-1">📅 القراءات اليومية</h2>

      <div className="space-y-1">
        <div>
          <label className="block text-gray-700 font-bold mb-1">اختر التاريخ:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-1 border rounded-lg text-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          onClick={handleGo}
          className="w-full bg-blue-600 text-white font-bold py-1 rounded-lg hover:bg-blue-700 transition shadow"
        >
          عرض القراءات
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        التقويم القبطي والسنكسار يتم ضبطهم تلقائياً مع التاريخ الميلادي.
      </p>
    </div>
  );
}
