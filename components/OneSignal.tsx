'use client';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function PushNotificationSetup() {
  useEffect(() => {
    const initOneSignal = async () => {
      // حط الـ App ID بتاعك هنا
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
        allowLocalhostAsSecureOrigin: true, // مهم وقت التطوير
        debug: true,
      });

      // ده السطر اللي بيطلع الـ Popup اللي بيطلب الإذن من المستخدم
      OneSignal.Slidedown.promptPush();
    };

    initOneSignal();
  }, []);

  return null;
}
