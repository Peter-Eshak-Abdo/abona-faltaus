"use client";
import React, { useState, useEffect } from "react";
import { Download, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OfflineAudioButtonProps {
  src: string;
  title: string;
}

const CACHE_NAME = "archive-audio-cache";

export default function OfflineAudioButton({ src, title }: OfflineAudioButtonProps) {
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const cleanSrc = src ? src.trim() : "";
  const audioUrl = `https://archive.org/download/abona-faltaus-audio/${encodeURIComponent(cleanSrc + ".mp3")}`;
  const r2Url = `https://pub-08244638454a477bbf9f9548b1fdb3b5.r2.dev/al7an/${encodeURIComponent(cleanSrc + ".mp3")}`;

  // فحص هل الملف موجود بالفعل في الكاش
  useEffect(() => {
    let isMounted = true;
    const checkCache = async () => {
      if (typeof window === "undefined" || !("caches" in window) || !cleanSrc) return;
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = (await cache.match(audioUrl)) || (await cache.match(r2Url));
        if (isMounted) {
          setIsOfflineReady(!!match);
        }
      } catch (err) {
        console.error("Cache check error:", err);
      }
    };

    checkCache();
    return () => {
      isMounted = false;
    };
  }, [cleanSrc, audioUrl, r2Url]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;

    if (!("caches" in window)) {
      toast.error("متصفحك لا يدعم خاصية الحفظ بدون إنترنت");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      toast.info(`جاري تحميل لحن "${title}" للاستماع أوفلاين...`);

      let response: Response | null = null;
      let targetUrl = audioUrl;

      // نجرب archive.org الأول
      try {
        response = await fetch(audioUrl);
      } catch {
        // Fallback إلى R2
        targetUrl = r2Url;
        response = await fetch(r2Url);
      }

      if (!response || !response.ok) {
        // تجربة الرابط الاحتياطي لو الأول فشل
        if (targetUrl !== r2Url) {
          targetUrl = r2Url;
          response = await fetch(r2Url);
        }
      }

      if (!response || !response.ok) {
        throw new Error("تعذر جلب ملف الصوت من السيرفر");
      }

      setDownloadProgress(60);

      // حفظ الملف في الكاش
      const cache = await caches.open(CACHE_NAME);
      await cache.put(targetUrl, response.clone());

      // أيضاً نحفظ تحت اسم الرابط الرئيسي لضمان العثور عليه
      if (targetUrl !== audioUrl) {
        await cache.put(audioUrl, response);
      }

      setDownloadProgress(100);
      setIsOfflineReady(true);
      setIsDownloading(false);
      toast.success(`تم حفظ لحن "${title}" أوفلاين بنجاح! يمكنك تشغيله في أي وقت بدون إنترنت.`);
    } catch (err) {
      console.error("Download error:", err);
      setIsDownloading(false);
      toast.error("فشل تحميل اللحن أوفلاين. يرجى التأكد من اتصال الإنترنت.");
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!("caches" in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);
      await cache.delete(r2Url);
      setIsOfflineReady(false);
      toast.info(`تم حذف لحن "${title}" من الذاكرة المحلية.`);
    } catch (err) {
      console.error("Delete cache error:", err);
    }
  };

  if (isOfflineReady) {
    return (
      <div className="flex items-center gap-1">
        <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Check size={14} className="text-emerald-400" />
          متاح أوفلاين
        </span>
        <button
          onClick={handleRemove}
          title="حذف من الأوفلاين لتوفير المساحة"
          className="p-1 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
        isDownloading
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait"
          : "bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/30 hover:border-orange-500/60 active:scale-95"
      }`}
      title="تحميل هذا اللحن ليعمل بدون إنترنت"
    >
      {isDownloading ? (
        <>
          <Loader2 size={13} className="animate-spin text-amber-400" />
          <span>جاري الحفظ {downloadProgress > 0 ? `${downloadProgress}%` : ""}</span>
        </>
      ) : (
        <>
          <Download size={13} className="text-orange-400" />
          <span>حفظ أوفلاين</span>
        </>
      )}
    </button>
  );
}
