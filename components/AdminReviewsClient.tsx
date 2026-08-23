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
    <div className="p-0.5 max-w-7xl mx-auto font-sans" dir="rtl">
      <div className="flex justify-between items-center mb-0.5">
        <div>
          <h1 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">لوحة تحكم تقييمات وآراء المستخدمين</h1>
          <p className="text-xs text-zinc-500 mt-0.5">إدارة ومراجعة الرسائل والرد عليها فوراً</p>
        </div>
        <button
          onClick={fetchAll}
          className="px-0.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
        >
          تحديث القائمة
        </button>
      </div>

      <div className="grid gap-0.25">
        {reviews.map((rev: any) => (
          <div key={rev.id} className="border border-zinc-200 dark:border-zinc-800 p-0.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm space-y-0.25">
            <div className="flex justify-between items-center text-xs">
              <span className={`px-0.5 py-0.5 rounded-full font-bold ${rev.is_public ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                {rev.is_public ? '🌍 عام للجميع' : '🔒 رسالة خاصة'}
              </span>
              <div className="flex items-center gap-0.5">
                <span className="font-bold text-amber-500">{rev.rating}/10 ⭐</span>
                <span className="text-zinc-400">{new Date(rev.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">{rev.feedback_text}</p>

            {rev.name && (
              <p className="text-xs text-zinc-500">المرسل: {rev.name} {rev.email ? `(${rev.email})` : ''}</p>
            )}

            {!rev.admin_reply ? (
              <div className="mt-0.5 flex gap-0.25 pt-0.5 border-t border-zinc-100 dark:border-zinc-800">
                <input
                  type="text"
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 p-0.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اكتب رد الإدارة هنا..."
                  value={replyText[rev.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                />
                <button
                  onClick={() => sendReply(rev.id, rev.user_id)}
                  disabled={!replyText[rev.id]?.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-1 py-0.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  إرسال الرد
                </button>
              </div>
            ) : (
              <div className="mt-0.5 p-0.5 bg-green-50 dark:bg-green-950/30 rounded-xl text-xs border border-green-200 dark:border-green-800 text-green-900 dark:text-green-200">
                <span className="font-bold">ردك: </span>
                <span>{rev.admin_reply}</span>
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-3 text-zinc-400">
            لا توجد تقييمات أو رسائل حتى الآن.
          </div>
        )}
      </div>
    </div>
  );
}
