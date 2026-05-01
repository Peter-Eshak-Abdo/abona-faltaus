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
    setIsSubmitting(true);
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, rating, is_public: isPublic }),
    });

    if (response.ok) {
      setFeedback('');
      setRating(null);
      fetchHistory(); // تحديث القائمة فوراً
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-1 p-1">
      {/* عرض التقييمات السابقة (نظام المحادثة) */}
      <div className="bg-gray-50 p-1 rounded-xl h-96 overflow-y-auto border space-y-1">
        {reviews.map((rev) => (
          <div key={rev.id} className={`flex flex-col ${rev.user_id ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-1 rounded-2xl ${rev.is_public ? 'bg-white' : 'bg-blue-50 border-blue-200 border'}`}>
              <p className="text-sm font-bold text-gray-600 mb-1">
                {rev.is_public ? 'تقييم عام' : 'رسالة خاصة للمسؤول'}
              </p>
              <p>{rev.feedback_text}</p>
              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>{'⭐'.repeat(rev.rating)}</span>
                <span>{new Date(rev.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            {/* رد المسؤول */}
            {rev.admin_reply && (
              <div className="max-w-[80%] mt-1 p-1 rounded-2xl bg-green-100 self-start border-r-4 border-green-500">
                <p className="text-xs font-bold text-green-700">رد الإدارة:</p>
                <p className="text-sm">{rev.admin_reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* نموذج إرسال تقييم جديد */}
      <form onSubmit={handleSubmit} className="bg-white p-1 rounded-xl shadow-lg border">
        <textarea
          className="w-full p-1 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="اكتب ملاحظاتك هنا..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />

        <div className="flex items-center justify-between mt-1">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${rating && star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
            ))}
          </div>

          <label className="flex items-center space-x-1 cursor-pointer">
            <span className="text-sm text-gray-600">تقييم عام للجميع؟</span>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4" />
          </label>
        </div>

        <button
          disabled={isSubmitting || !feedback || !rating}
          className="w-full mt-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </form>
    </div>
  );
}
