import ReviewClient from './ReviewClient';

export const metadata = {
  title: 'مراجعة وتقييم',
  description: 'شاركنا رأيك واقتراحاتك لتحسين التطبيق.',
};

export default function ReviewPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">شاركنا رأيك</h1>
      <p className="text-lg text-center mb-8">
        نحن نقدر وقتك وملاحظاتك القيمة. ساعدنا في تحسين التطبيق من خلال الإجابة على بعض الأسئلة أو تقديم اقتراحاتك.
      </p>
      <ReviewClient />
    </div>
  );
}
