"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle, Share2, Plus } from "lucide-react";

// كشف iOS Safari
function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  // Safari على iOS لا يحتوي على "Chrome" أو "CriOS" أو "FxiOS"
  const isSafari = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return isSafari;
}

// كشف ما إذا كان التطبيق مُثبَّت مسبقاً (standalone mode)
function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator && (window.navigator as any).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaMessage, setShowPwaMessage] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "installed">("idle");

  useEffect(() => {
    // إذا كان التطبيق مثبتاً بالفعل → لا نعرض أي رسالة
    if (isInStandaloneMode()) return;

    const pwaClosed = localStorage.getItem("pwa_message_closed");
    if (pwaClosed) return;

    // iOS Safari → اعرض دليل التثبيت اليدوي
    if (isIosSafari()) {
      // تأخير قليل حتى يتحمل الموقع أولاً
      const timer = setTimeout(() => {
        setShowIosGuide(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop → استمع لـ beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPwaMessage(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // الاستماع لانتهاء عملية التحميل الأوفلاين (Caching)
    if (typeof window !== "undefined" && "serviceWorker" in navigator && (window as any).workbox !== undefined) {
      const wb = (window as any).workbox;
      wb.addEventListener("installed", (event: any) => {
        if (!event.isUpdate) {
          setInstallStatus("installed");
          setTimeout(() => setInstallStatus("idle"), 6000);
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

  const closeMessage = () => {
    localStorage.setItem("pwa_message_closed", "true");
    setShowPwaMessage(false);
    setShowIosGuide(false);
  };

  return (
    <AnimatePresence>
      {/* ===== رسالة Android/Desktop (beforeinstallprompt) ===== */}
      {showPwaMessage && installStatus === "idle" && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-1 left-1/2 -translate-x-1/2 z-[9999] bg-blue-700 text-white p-1 rounded-2xl shadow-2xl flex flex-col items-center gap-1 w-[90%] max-w-sm border border-white/20"
        >
          <div className="flex justify-between w-full items-start">
            <p className="text-sm font-bold leading-relaxed text-right">
              حمل التطبيق الآن لتتصفح الألحان والكتاب المقدس بدون الحاجة للإنترنت!
            </p>
            <button onClick={closeMessage} className="p-0.5 bg-white/20 rounded-full hover:bg-white/30 transition mr-1 shrink-0">
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

      {/* ===== دليل التثبيت لـ iPhone/iOS ===== */}
      {showIosGuide && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#1c1c1e] text-white rounded-t-3xl shadow-2xl border-t border-white/10 p-4"
        >
          {/* زر الإغلاق */}
          <button
            onClick={closeMessage}
            className="absolute top-3 left-3 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition"
          >
            <X size={14} />
          </button>

          {/* العنوان */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/apple-touch-icon.png"
              alt="أيقونة التطبيق"
              className="w-10 h-10 rounded-2xl shadow-md"
            />
            <div className="text-right">
              <p className="font-bold text-base">أضف التطبيق للشاشة الرئيسية</p>
              <p className="text-xs text-white/60">تجربة تطبيق كاملة بدون إنترنت 🌐</p>
            </div>
          </div>

          {/* الخطوات */}
          <div className="flex flex-col gap-2.5 mb-4">
            <Step number={1} icon={<Share2 size={16} className="text-blue-400" />}>
              اضغط على زر <span className="font-bold text-blue-400">المشاركة</span> في شريط Safari بالأسفل
            </Step>
            <Step number={2} icon={<Plus size={16} className="text-green-400" />}>
              اختر <span className="font-bold text-green-400">«Add to Home Screen»</span> أو «إضافة للشاشة الرئيسية»
            </Step>
            <Step number={3} icon={<CheckCircle size={16} className="text-yellow-400" />}>
              اضغط <span className="font-bold text-yellow-400">«Add»</span> في الأعلى ✅
            </Step>
          </div>

          {/* السهم التوجيهي إلى أسفل يمين */}
          <div className="flex justify-center">
            <div className="flex items-center gap-1 text-white/40 text-xs animate-bounce">
              <span>↓</span>
              <span>زر المشاركة في الأسفل</span>
              <span>↓</span>
            </div>
          </div>

          <button
            onClick={closeMessage}
            className="w-full mt-3 bg-white/10 text-white/80 font-medium py-2 rounded-xl text-sm hover:bg-white/20 transition"
          >
            فاهم، شكراً!
          </button>
        </motion.div>
      )}

      {/* ===== رسالة نجاح التحميل 100% ===== */}
      {installStatus === "installed" && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-1.5 left-1/2 -translate-x-1/2 z-[9999] bg-green-600 text-white px-1.5 py-1 rounded-full shadow-lg flex items-center gap-3 w-max max-w-[90%]"
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

// مكوّن خطوة بسيط
function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-white/5 rounded-2xl px-3 py-2.5">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
        {number}
      </div>
      <div className="flex items-center gap-2 flex-1">
        {icon}
        <p className="text-sm leading-snug text-right flex-1">{children}</p>
      </div>
    </div>
  );
}
