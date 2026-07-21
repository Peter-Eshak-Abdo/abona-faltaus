"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle } from "lucide-react";

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaMessage, setShowPwaMessage] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "installed">("idle");

  useEffect(() => {
    // الاستماع لطلب التثبيت من المتصفح
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const pwaClosed = localStorage.getItem("pwa_message_closed");
      if (!pwaClosed) setShowPwaMessage(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // الاستماع لانتهاء عملية التحميل الأوفلاين (Caching)
    if (typeof window !== "undefined" && "serviceWorker" in navigator && (window as any).workbox !== undefined) {
      const wb = (window as any).workbox;
      wb.addEventListener("installed", (event: any) => {
        if (!event.isUpdate) {
          setInstallStatus("installed");
          setTimeout(() => setInstallStatus("idle"), 6000); // إخفاء رسالة النجاح بعد 6 ثواني
        }
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setInstallStatus("installing");

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPwaMessage(false);
    } else {
      setInstallStatus("idle");
    }
  };

  const closePwaMessage = () => {
    localStorage.setItem("pwa_message_closed", "true");
    setShowPwaMessage(false);
  };

  return (
    <AnimatePresence>
      {/* رسالة التثبيت (زر التحميل) */}
      {showPwaMessage && installStatus === "idle" && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-1 left-1/2 -translate-x-1/2 z-100 bg-blue-700 text-white p-1 rounded-2xl shadow-2xl flex flex-col items-center gap-1 w-[90%] max-w-sm border border-white/20"
        >
          <div className="flex justify-between w-full items-start">
            <p className="text-sm font-bold leading-relaxed text-right">
              حمل التطبيق الآن لتتصفح الألحان والكتاب المقدس بدون الحاجة للإنترنت!
            </p>
            <button onClick={closePwaMessage} className="p-0.5 bg-white/20 rounded-full hover:bg-white/30 transition mr-1 shrink-0">
              <X size={8} />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full bg-white text-blue-700 font-bold py-1 rounded-xl flex items-center justify-center gap-1 hover:bg-gray-100 transition active:scale-95"
          >
            <Download size={10} />
            تحميل التطبيق الفعلي
          </button>
        </motion.div>
      )}

      {/* رسالة نجاح التحميل 100% */}
      {installStatus === "installed" && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-1.5 left-1/2 -translate-x-1/2 z-100 bg-green-600 text-white px-1.5 py-1 rounded-full shadow-lg flex items-center gap-3 w-max max-w-[90%]"
        >
          <CheckCircle size={11} className="shrink-0" />
          <span className="text-sm font-bold text-center">
            تم تحميل الموقع 100%! يمكنك الآن استخدامه أوفلاين.
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
