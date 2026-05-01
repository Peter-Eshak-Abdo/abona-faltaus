'use client';
import { useState, useEffect } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const fetchAll = async () => {
    const res = await fetch('/api/admin/feedback'); // سننشئ هذا المسار
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => { fetchAll(); }, []);

  const sendReply = async (id: string, userId: string) => {
    await fetch('/api/admin/reply', {
      method: 'POST',
      body: JSON.stringify({ id, reply: replyText[id], userId })
    });
    alert('تم إرسال الرد وتنبيه المستخدم');
    fetchAll();
  };

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold mb-1">لوحة تحكم التقييمات</h1>
      <div className="grid gap-1">
        {reviews.map((rev: any) => (
          <div key={rev.id} className="border p-1 rounded bg-white shadow">
            <div className="flex justify-between">
              <span className={rev.is_public ? 'text-green-600' : 'text-red-600'}>
                {rev.is_public ? '🌍 عام' : '🔒 خاص'}
              </span>
              <span>{rev.rating}/10 ⭐</span>
            </div>
            <p className="my-1 font-medium">{rev.feedback_text}</p>

            {!rev.admin_reply ? (
              <div className="mt-1 flex gap-1">
                <input
                  type="text"
                  className="flex-1 border p-1 rounded"
                  placeholder="اكتب ردك هنا..."
                  onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                />
                <button onClick={() => sendReply(rev.id, rev.user_id)} className="bg-blue-500 text-white p-1 rounded">رد</button>
              </div>
            ) : (
              <p className="text-sm bg-gray-100 p-1 rounded">ردك: {rev.admin_reply}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
