'use client';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function PushNotificationSetup() {
  useEffect(() => {
    const initOneSignal = async () => {
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID as string,
        allowLocalhostAsSecureOrigin: true, // مهم وقت التطوير
        debug: true,
        welcomeNotification: {
          disable: true,
          title: "أهلاً بك في تطبيق أبونا فلتاؤس",
          message: "شكراً لاشتراكك! ستصلك آيات وأقوال يومية بركة لحياتك.",
        },
      });

      // ده اللي بيطلع الـ Popup اللي بيطلب الإذن من المستخدم
      OneSignal.Slidedown.promptPush();
    };

    initOneSignal();
  }, []);

  return null;
}
