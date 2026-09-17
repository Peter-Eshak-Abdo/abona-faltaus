// components/ServiceWorkerRegister.tsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ServiceWorkerRegister() {
  const [showOfflinePrompt, setShowOfflinePrompt] = useState(false);

  useEffect(() => {
    // إزالة علامة إعادة التحميل عند استقرار الصفحة بنجاح
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chunk_reload_attempt");

      const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
        const errorMsg = "message" in event ? event.message : String((event as any).reason);
        if (
          errorMsg &&
          (errorMsg.includes("Loading chunk") ||
            errorMsg.includes("ChunkLoadError") ||
            errorMsg.includes("Failed to fetch dynamically imported module"))
        ) {
          const hasReloaded = sessionStorage.getItem("chunk_reload_attempt");
          if (!hasReloaded) {
            sessionStorage.setItem("chunk_reload_attempt", "true");
            window.location.reload();
          }
        }
      };

      window.addEventListener("error", handleChunkError);
      window.addEventListener("unhandledrejection", handleChunkError);

      return () => {
        window.removeEventListener("error", handleChunkError);
        window.removeEventListener("unhandledrejection", handleChunkError);
      };
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // فحص التحديثات عند التصفح
          reg.update();

          const hasAsked = localStorage.getItem("asked_offline_download");
          if (!hasAsked) {
            setShowOfflinePrompt(true);
          }
        })
        .catch((err) => console.error("❌ SW failed:", err));
    }
  }, []);

  const handleDownloadAll = async () => {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg.active) {
        reg.active.postMessage({ type: "CACHE_ALL_FILES" });
        toast.success("جاري تحميل الملفات للعمل بدون إنترنت...");
      } else if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CACHE_ALL_FILES" });
        toast.success("جاري تحميل الملفات للعمل بدون إنترنت...");
      }
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
