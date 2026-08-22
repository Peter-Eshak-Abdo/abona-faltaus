import { Link } from 'lucide-react';
import { FaArrowRight } from 'react-icons/fa';
import ReviewClient from './ReviewClient';

export const metadata = {
  title: 'مراجعة وتقييم - ابونا فلتاؤس تفاحة',
  description: 'شاركنا رأيك واقتراحاتك لتحسين التطبيق.',
};

export default function ReviewPage() {
  return (
    <div className="max-w-7xl mx-auto p-1 font-sans" dir="rtl">
      <div className="text-center mb-1">
        <Link href="/" className="p-0.5 m-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline">
          <FaArrowRight size={18} />
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black mb-1 text-zinc-900 dark:text-zinc-100">شاركنا رأيك ومقترحاتك</h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          نقدر ملاحظاتك القيمة دائماً.. ساعدنا في تحسين وتطوير الموقع لخدمة الجميع
        </p>
      </div>
      <ReviewClient />
    </div>
  );
}
