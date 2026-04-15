'use client';
import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // التحقق من حالة اشتراك المستخدم الحالية
    const checkSubscription = async () => {
      const state = OneSignal.User.PushSubscription.optedIn;
      setIsSubscribed(!!state);
    };
    checkSubscription();
  }, []);

  const handleToggle = async () => {
    if (isSubscribed) {
      await OneSignal.User.PushSubscription.optOut(); // إيقاف الإشعارات
      setIsSubscribed(false);
    } else {
      await OneSignal.User.PushSubscription.optIn(); // تفعيل الإشعارات
      setIsSubscribed(true);
    }
  };

  return (
    <div className="container mt-1 p-1 border rounded shadow-sm">
      <h3 className="mb-1">إعدادات الإشعارات</h3>

      <div className="form-check form-switch fs-5 mb-1">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="dailyNotifications"
          checked={isSubscribed}
          onChange={handleToggle}
        />
        <label className="form-check-label ms-1" htmlFor="dailyNotifications">
          تفعيل إشعارات آية اليوم وأقوال الآباء
        </label>
      </div>

      <p className="text-muted small">
        * الإشعارات تصلك يومياً الساعة 9 صباحاً، 5 عصراً، و 9 مساءً.
      </p>
    </div>
  );
}
