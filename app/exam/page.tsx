"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ExamPage() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center py-5"
    >
      <motion.h1
        className="mb-5 text-center font-bold text-blue-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        نظام الاختبارات الإلكتروني
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* كارت الأسئلة المجمعة */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white shadow-lg rounded-lg h-full">
            <div className="p-4 flex flex-col justify-between">
              <div>
                <h5 className="text-center text-blue-600 font-bold">
                  الأسئلة المجمعة
                </h5>
                <p className="text-center text-gray-600">
                  نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                </p>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 px-4 rounded mt-3"
                onClick={() => router.push("/exam/exam-settings")}
                type="button"
              >
                ابدأ الاختبار المجمع
              </button>
            </div>
          </div>
        </motion.div>

        {/* كارت الأسئلة المجمعة اونلاين */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white shadow-lg rounded-lg h-full">
            <div className="p-4 flex flex-col justify-between">
              <div>
                <h5 className="text-center text-blue-600 font-bold">
                  الأسئلة المجمعة اونلاين
                </h5>
                <p className="text-center text-gray-600">
                  نظام تقسيم الأسئلة لمجموعات مع وقت محدد لكل مجموعة.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-1/2 py-2 px-4 rounded mt-3"
                  onClick={() => router.push("/exam/group/admin")}
                >
                  إنشاء غرفة
                </button>
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white w-1/2 py-2 px-4 rounded mt-3"
                  onClick={() => router.push("/exam/group/join")}
                >
                  انضم إلى غرفة
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* كارت الأسئلة الفردية */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white shadow-lg rounded-lg h-full">
            <div className="p-4 flex flex-col justify-between">
              <div>
                <h5 className="text-center text-green-600 font-bold">
                  الأسئلة الفردية
                </h5>
                <p className="text-center text-gray-600">
                  نظام الأسئلة الفردية مع إمكانية التنقل بين الأسئلة بحرية.
                </p>
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 text-white w-full py-2 px-4 rounded mt-3"
                onClick={() => router.push("/exam/individual-questions")}
              >
                ابدأ الاختبار الفردي
              </button>
            </div>
          </div>
        </motion.div>

        {/* كارت الأسئلة كاهوت */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white shadow-lg rounded-lg h-full">
            <div className="p-4 flex flex-col justify-between">
              <div>
                <h5 className="text-center text-green-600 font-bold">
                  الأسئلة الكاهوتية
                </h5>
                <p className="text-center text-gray-600">
                  نظام الأسئلة الكاهوتية مع إمكانية التنقل بين الأسئلة بحرية.
                </p>
              </div>
              <button
                className="bg-green-600 hover:bg-green-700 text-white w-full py-2 px-4 rounded mt-3"
                onClick={() => router.push("/exam/quiz/dashboard")}
              >
                ابدأ الاختبار الكاهوتي
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
