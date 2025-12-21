'use client';

import { useState, useEffect } from 'react';

export default function PwaManager() {
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    // 1. التعامل مع زر التثبيت (Install Prompt)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // منع المتصفح من إظهار الرسالة التلقائية
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. التعامل مع الـ Service Worker (للتحديث والـ Offline)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // ملاحظة: next-pwa ينشئ window.workbox
      // إذا كنت تستخدم أحدث نسخة قد تحتاج لطريقة مختلفة، لكن هذه الطريقة التقليدية

      // هنا سنفترض وجود logic بسيط لأن next-pwa يخفي التعقيدات
      // للتخصيص الكامل نحتاج استخدام workbox-window
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* زر التثبيت العائم */}
      {showInstallBtn && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-900 text-white p-1 rounded-xl shadow-2xl z-50 flex justify-between items-center animate-slide-up">
          <div>
            <p className="font-bold">ثبت التطبيق الآن</p>
            <p className="text-xs text-blue-200">لتصفح أسرع وبدون إنترنت</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-blue-900 p-1 rounded-lg font-bold text-sm"
          >
            تثبيت
          </button>
        </div>
      )}

      {/* رسالة جاهز للأوفلاين (يمكنك استخدام Toast Library زي Sonner) */}
      {isOfflineReady && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white p-1 rounded-full text-sm shadow-lg z-50">
          ✅ تم تحميل الملفات، التطبيق يعمل الآن بدون إنترنت
        </div>
      )}
    </>
  );
}
