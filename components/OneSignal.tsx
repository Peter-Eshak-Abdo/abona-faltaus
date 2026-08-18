'use client';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function PushNotificationSetup() {
  useEffect(() => {
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
        allowLocalhostAsSecureOrigin: true, // مهم وقت التطوير
        debug: false,
        welcomeNotification: {
          disable: true,
          message: 'اهلا بك في موقع ابونا فلتاؤس',
        },
      });

      // طلب إذن إشعارات الـ Web Push فقط بدون إيميل
      OneSignal.Slidedown.promptPush();
    };

    initOneSignal();
  }, []);

  return null;
}
