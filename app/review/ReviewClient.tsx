'use client';

import { useState, useEffect } from 'react';

export default function ReviewClient() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب تاريخ التقييمات
  const fetchHistory = async () => {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    if (Array.isArray(data)) setReviews(data);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !rating) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedback.trim(), rating, is_public: isPublic }),
      });

      if (response.ok) {
        setFeedback('');
        setRating(null);
        await fetchHistory(); // تحديث القائمة فوراً
        alert("تم إرسال تقييمك بنجاح! شكراً لمشاركتك.");
      } else {
        alert("حدث خطأ أثناء إرسال التقييم، حاول مرة أخرى.");
      }
    } catch (err) {
      console.error(err);
      alert("تعذر الاتصال بالسيرفر لإرسال التقييم.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* نموذج إرسال تقييم جديد */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
            رأيك أو اقتراحك
          </label>
          <textarea
            className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-blue-500 bg-zinc-50 dark:bg-zinc-800 text-sm outline-none text-zinc-900 dark:text-zinc-100 min-h-[90px]"
            placeholder="اكتب ملاحظاتك، استفسارك أو اقتراحاتك هنا بكل صراحة..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">التقييم العام (من 10):</span>
            <div className="flex items-center gap-1 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-lg transition-transform hover:scale-125 ${rating && star <= rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                  title={`${star} / 10`}
                >
                  ★
                </button>
              ))}
              {rating && <span className="text-xs font-bold text-amber-500 mr-1.5">{rating}/10</span>}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">نشر التقييم للعامة</span>
          </label>
        </div>

        <button
          disabled={isSubmitting || !feedback.trim() || !rating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم 🚀'}
        </button>
      </form>

      {/* عرض التقييمات السابقة */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-500 px-1">الملاحظات والتقييمات الأخيرة:</h2>
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-h-[450px] overflow-y-auto space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="space-y-2">
              <div className={`p-4 rounded-2xl ${rev.is_public ? 'bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700' : 'bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40'}`}>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className={`font-bold ${rev.is_public ? 'text-zinc-600 dark:text-zinc-400' : 'text-blue-600 dark:text-blue-300'}`}>
                    {rev.is_public ? 'تقييم عام' : 'رسالة خاصة للمسؤول'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">{rev.rating}/10 ⭐</span>
                    <span className="text-zinc-400 text-[10px]">{new Date(rev.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">{rev.feedback_text}</p>
              </div>

              {/* رد المسؤول */}
              {rev.admin_reply && (
                <div className="mr-4 p-3 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                  <p className="text-[11px] font-bold text-green-700 dark:text-green-300 mb-0.5">رد الإدارة:</p>
                  <p className="text-xs text-green-900 dark:text-green-100">{rev.admin_reply}</p>
                </div>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-center py-8 text-xs text-zinc-400">لا توجد تقييمات منشورة بعد، كن أول من يشارك!</p>
          )}
        </div>
      </div>
    </div>
  );
}
