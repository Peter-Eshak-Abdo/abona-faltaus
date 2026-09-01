'use client';
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function PushNotificationSetup() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || typeof window === 'undefined') return;

    let isMounted = true;

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          debug: false,
          notifyButton: {
            enable: false,
          } as any,
          welcomeNotification: {
            disable: true,
            message: '',
          },
        });

        // طلب الإذن فقط إذا لم يسبق للمستخدم الرفض أو الموافقة
        if (isMounted && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'default') {
            setTimeout(() => {
              try {
                OneSignal.Slidedown.promptPush();
              } catch {}
            }, 5000);
          }
        }
      } catch (err) {
        console.warn('OneSignal initialization skipped/failed:', err);
      }
    };

    // تأخير التهيئة لما بعد تفاعل المتصفح لتخفيف الـ Main Thread
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => initOneSignal());
    } else {
      setTimeout(initOneSignal, 2000);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
