import { Metadata } from "next";
import Link from "next/link";
import { FaWifi } from "react-icons/fa";

export const metadata: Metadata = {
  title: "أنت غير متصل بالإنترنت | أبونا فلتاؤس",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-2">
      <FaWifi className="text-6xl text-gray-400 mb-1 opacity-50" />
      <h1 className="text-3xl font-bold mb-1 text-gray-800 dark:text-gray-100">أنت غير متصل بالإنترنت</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md leading-relaxed">
        عذراً، هذه الصفحة لم يتم تحميلها مسبقاً للعمل بدون إنترنت. يرجى التحقق من اتصالك بالشبكة والمحاولة مرة أخرى.
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-2 py-1 rounded-full font-bold shadow-md hover:bg-blue-700 transition active:scale-95"
      >
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
