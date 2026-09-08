"use client";

import { useState, useEffect } from "react";

export default function OfflineNotification() {
  const [showStatus, setShowStatus] = useState(false);
  const [status, setStatus] = useState<"downloading" | "ready">("downloading");

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // 1. مراقبة حالة تثبيت وجاهزية الكاش
      navigator.serviceWorker.ready.then(() => {
        const hasShown = sessionStorage.getItem("offline_ready_banner_shown");
        if (!hasShown) {
          setStatus("ready");
          setShowStatus(true);
          sessionStorage.setItem("offline_ready_banner_shown", "true");
          setTimeout(() => {
            setShowStatus(false);
          }, 6000);
        }
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setStatus("ready");
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 6000);
      });

      // 2. تتبع انقطاع وعودة الإنترنت
      const onOffline = () => {
        setStatus("ready");
        setShowStatus(true);
      };
      const onOnline = () => {
        setShowStatus(false);
      };

      window.addEventListener("offline", onOffline);
      window.addEventListener("online", onOnline);

      return () => {
        window.removeEventListener("offline", onOffline);
        window.removeEventListener("online", onOnline);
      };
    }
  }, []);

  if (!showStatus) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
      {status === "downloading" ? (
        <>
          {/* دائرة تحميل */}
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              جاري تجهيز الموقع...
            </span>
            <span className="text-xs text-zinc-500">
              يتم تحميل الملفات للعمل بدون إنترنت
            </span>
          </div>
        </>
      ) : (
        <>
          {/* علامة صح خضراء */}
          <div className="h-8 w-8 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              الموقع جاهز أوفلاين!
            </span>
            <span className="text-xs text-zinc-500">
              يمكنك تصفح الموقع الآن بدون إنترنت
            </span>
          </div>
        </>
      )}
    </div>
  );
}
