"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ExamPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-10"
      >
        نظام الاختبارات الإلكتروني
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* بطاقة الاختبار المجمع */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold text-center text-blue-700 mb-4">الأسئلة المجمعة</h2>
            <p className="text-gray-600 text-center mb-6">
              نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
            </p>
          </div>
          <button
            onClick={() => router.push("/exam/exam-settings")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200 w-full font-semibold"
          >
            ابدأ الاختبار المجمع
          </button>
        </motion.div>

        {/* بطاقة الاختبار الفردي */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
        >
          <h2 className="text-lg font-semibold text-center text-green-700 mb-3">الأسئلة الفردية</h2>
          <p className="text-gray-600 text-sm text-center mb-5">
            نظام الأسئلة الفردية مع إمكانية التنقل بين الأسئلة بحرية.
          </p>
          <button
            onClick={() => router.push("/exam/individual-questions")}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition w-full font-semibold"
          >
            ابدأ الاختبار الفردي
          </button>
        </motion.div>
      </div>
    </div>
  );
}
