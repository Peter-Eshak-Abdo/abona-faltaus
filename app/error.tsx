"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaRedo, FaExclamationTriangle } from "react-icons/fa";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-1 bg-red-50/50">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-1 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center"
      >
        <motion.div
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1 text-red-500 text-4xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <FaExclamationTriangle />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">حدث خطأ غير متوقع!</h2>

        <p className="text-gray-500 mb-1 leading-relaxed">
          نعتذر عن هذا العطل. قد تكون مشكلة مؤقتة في الاتصال أو في السيرفر.
        </p>

        <div className="bg-gray-50 p-1 rounded-xl mb-1 border border-gray-100">
          <p className="text-sm text-gray-600 italic font-serif">
            "وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعًا لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ"
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={
              () => reset()
            }
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
          >
            <FaRedo />
            حاول مرة أخرى
          </motion.button>

          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-500 hover:text-gray-800 text-sm mt-1 underline decoration-gray-300 underline-offset-4"
          >
            أو العودة للصفحة الرئيسية
          </button>
        </div>
      </motion.div>
    </div>
  );
}
