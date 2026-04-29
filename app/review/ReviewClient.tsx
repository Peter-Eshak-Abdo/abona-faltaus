'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    if (!feedback || rating === null) {
      setMessage('الرجاء تعبئة جميع الحقول المطلوبة (الملاحظات والتقييم).');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, feedback, rating }),
      });

      if (response.ok) {
        setMessage('شكراً لك! تم استلام ملاحظاتك بنجاح.');
        setName('');
        setEmail('');
        setFeedback('');
        setRating(null);
        // Optionally redirect or show a success state
        // router.push('/thank-you-for-feedback');
      } else {
        const errorData = await response.json();
        setMessage(`حدث خطأ: ${errorData.error || 'الرجاء المحاولة مرة أخرى.'}`);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setMessage('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.includes('شكراً') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
          اسمك (اختياري):
        </label>
        <input
          type="text"
          id="name"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
          بريدك الإلكتروني (اختياري، للتواصل):
        </label>
        <input
          type="email"
          id="email"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="feedback" className="block text-gray-700 text-sm font-bold mb-2">
          ملاحظاتك أو اقتراحاتك: <span className="text-red-500">*</span>
        </label>
        <textarea
          id="feedback"
          rows={5}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          ما مدى رضاك عن التطبيق؟ <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`text-2xl ${rating && star <= rating ? 'text-yellow-500' : 'text-gray-300'} focus:outline-none`}
              onClick={() => setRating(star)}
              aria-label={`${star} star rating`}
            >
              ★
            </button>
          ))}
        </div>
        {rating === null && <p className="text-red-500 text-xs italic mt-2">الرجاء اختيار تقييم.</p>}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          disabled={isSubmitting || !feedback || rating === null}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال الملاحظات'}
        </button>
      </div>
    </form>
  );
}
