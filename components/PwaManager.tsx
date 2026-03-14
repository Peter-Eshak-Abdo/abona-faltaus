'use client';
import { useState, useEffect } from 'react';

export default function PwaManager() {
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  useEffect(() => {
    // 1. التعامل مع زر التثبيت
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. التحقق من جاهزية الأوفلاين باستخدام Workbox
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // ننتظر حتى يتم تحميل الـ Window بالكامل لضمان عمل Workbox
      window.addEventListener('load', () => {
        const wb = (window as any).workbox;

        if (wb) {
          // الحدث ده بيشتغل لما الـ Service Worker يخلص تحميل كل الـ Assets (Precaching)
          wb.addEventListener('activated', (event: any) => {
            // isUpdate = false معناها أول مرة يتحمل بالكامل
            if (!event.isUpdate) {
              setIsOfflineReady(true);
              // إخفاء الرسالة بعد 6 ثوانٍ
              setTimeout(() => setIsOfflineReady(false), 6000);
            }
          });

          wb.register();
        }
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallBtn(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* رسالة الجاهزية التامة للأوفلاين */}
      {isOfflineReady && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-md animate-bounce">
          <div className="bg-green-600 text-white p-1 rounded-2xl shadow-2xl flex items-center gap-1 border-2 border-green-400">
            <div className="bg-white rounded-full p-1 text-green-600 text-xl">✅</div>
            <div>
              <p className="font-bold text-sm">التطبيق جاهز للعمل بدون إنترنت!</p>
              <p className="text-[10px] opacity-90">تم حفظ كافة الملفات بنجاح (Offline Mode 100%)</p>
            </div>
          </div>
        </div>
      )}

      {/* زر التثبيت */}
      {showInstallBtn && (
        <div className="fixed bottom-6 left-4 right-4 bg-blue-700 text-white p-1 rounded-2xl shadow-2xl z-50 flex justify-between items-center ring-4 ring-blue-500/20">
          <div>
            <p className="font-bold">ثبت التطبيق على جهازك</p>
            <p className="text-xs text-blue-100 italic">استخدمه كأنه تطبيق موبايل حقيقي</p>
          </div>
          <button onClick={handleInstallClick} className="bg-white text-blue-700 p-1 rounded-xl font-black text-sm active:scale-95 transition-transform">
            تثبيت
          </button>
        </div>
      )}
    </>
  );
}
