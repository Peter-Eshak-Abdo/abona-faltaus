"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaHome, FaArrowRight } from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-1 bg-linear-to-b from-blue-50 to-white overflow-hidden relative">

      {/* خلفية زخرفية خفيفة */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-md p-1 rounded-3xl shadow-2xl border border-white/50 w-full max-w-lg text-center relative z-10"
      >
        {/* أنيميشن رقم 404 يهتز */}
        <motion.h1
          className="text-8xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 mb-1"
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">يبدو أنك ضللت الطريق</h2>
        <p className="text-gray-600 mb-6">الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها.</p>

        {/* الصورة تطفو لأعلى وأسفل */}
        <motion.div
          className="flex justify-center mb-1"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Image
            src="/images/IMG-20240512-WA0001.jpg"
            alt="404 Image"
            width={300}
            height={200}
            className="rounded-2xl shadow-lg object-cover max-h-[250px]"
          />
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 p-1 rounded-xl font-medium transition-colors"
          >
            <FaArrowRight />
            العودة للسابق
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white p-1 rounded-xl font-medium shadow-lg shadow-blue-500/30 w-full sm:w-auto"
            >
              <FaHome />
              الصفحة الرئيسية
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
