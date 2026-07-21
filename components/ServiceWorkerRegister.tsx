// components/ServiceWorkerRegister.tsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ServiceWorkerRegister() {
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // console.log("✅ SW registered", reg.scope);

          const hasAsked = localStorage.getItem("asked_offline_download");
          if (!hasAsked) {
            setShowOfflinePrompt(true);
          }
        })
        .catch((err) => console.error("❌ SW failed:", err));
    }
  }, []);

  const handleDownloadAll = () => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CACHE_ALL_FILES" });
      toast.success("جاري تحميل الملفات للعمل بدون إنترنت...");
    }
    localStorage.setItem("asked_offline_download", "true");
    setShowOfflinePrompt(false);
  };

  const handleLater = () => {
    localStorage.setItem("asked_offline_download", "true");
    setShowOfflinePrompt(false);
  };

  if (!showOfflinePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-zinc-900 p-1 rounded-2xl shadow-2xl border border-blue-500 flex flex-col gap-1">
      <p className="text-sm font-bold text-center">هل تريد تحميل ملفات الموقع ليعمل بدون إنترنت (أوفلاين)؟</p>
      <div className="flex gap-1 justify-center">
        <button onClick={handleDownloadAll} className="bg-blue-600 text-white px-1 py-0.5 rounded-lg text-sm w-full">تحميل الآن</button>
        <button onClick={handleLater} className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-1 py-0.5 rounded-lg text-sm w-full">لاحقاً</button>
      </div>
    </div>
  );
}
