import ReviewClient from './ReviewClient';

export const metadata = {
  title: 'مراجعة وتقييم - ابونا فلتاؤس تفاحة',
  description: 'شاركنا رأيك واقتراحاتك لتحسين التطبيق.',
};

export default function ReviewPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans" dir="rtl">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2 text-zinc-900 dark:text-zinc-100">شاركنا رأيك ومقترحاتك</h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
          نقدر ملاحظاتك القيمة دائماً.. ساعدنا في تحسين وتطوير الموقع لخدمة الجميع
        </p>
      </div>
      <ReviewClient />
    </div>
  );
}
