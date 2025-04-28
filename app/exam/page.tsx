"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-12 text-center">نظام الاختبارات الإلكتروني</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mt-5">
        {/* بطاقة الأسئلة المجمعة */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-semibold mb-4 text-center">الأسئلة المجمعة</h2>
          <p className="text-gray-600 mb-6 text-center">
            نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة
          </p>
          <button
            onClick={() => router.push("/exam/exam-settings")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
          >
            ابدأ الاختبار المجمع
          </button>
        </div>
        <hr className="featurette-divider my-5" />

        {/* بطاقة الأسئلة الفردية */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-semibold mb-4 text-center">الأسئلة الفردية</h2>
          <p className="text-gray-600 mb-6 text-center">
            نظام الأسئلة الفردية مع إمكانية التنقل بين الأسئلة بحرية
          </p>
          <button
            onClick={() => router.push("/exam/individual-questions")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
          >
            ابدأ الاختبار الفردي
          </button>
        </div>
      </div>
    </div>
  );
}
