"use client";
import React, { useState, useEffect } from "react";
import { Download, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface OfflineAudioButtonProps {
  src: string;
  title: string;
}

const CACHE_NAME = "archive-audio-cache";

export default function OfflineAudioButton({ src, title }: OfflineAudioButtonProps) {
  const t = useTranslations('Al7an.offline');
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
      toast.error(t('notSupported'));
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(10);
      toast.info(t('downloading', { title }));

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
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(targetUrl, response.clone());
        setIsOfflineReady(true);
        toast.success(t('saved'));
      } else {
        throw new Error("فشل تحميل الملف الصوتي");
      }
    } catch (err: any) {
      console.error("Audio download error:", err);
      toast.error(err.message || "تعذر تحميل اللحن أوفلاين");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(audioUrl);
      await cache.delete(r2Url);
      setIsOfflineReady(false);
      toast.info(t('removed'));
    } catch (err) {
      console.error("Cache delete error:", err);
    }
  };

  if (isOfflineReady) {
    return (
      <div className="flex items-center gap-0.25">
        <span
          className="flex items-center gap-0.25 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-0.5 py-0.25 rounded-full font-medium shadow-xs"
          title={t('readyBtn')}
        >
          <Check size={13} className="text-emerald-400" />
          <span>{t('readyBtn')}</span>
        </span>
        <button
          onClick={handleDelete}
          className="p-0.25 text-neutral-400 hover:text-red-400 hover:bg-red-950/40 rounded-full transition-colors"
          title={t('deleteBtn')}
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
      className={`flex items-center gap-0.25 text-xs px-0.5 py-0.25 rounded-full font-medium transition-all shadow-xs ${
        isDownloading
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait"
          : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 hover:border-neutral-500 active:scale-95"
      }`}
      title={t('saveBtn')}
    >
      {isDownloading ? (
        <>
          <Loader2 size={13} className="animate-spin text-amber-400" />
          <span>{downloadProgress}%</span>
        </>
      ) : (
        <>
          <Download size={13} className="text-neutral-400 group-hover:text-white" />
          <span>{t('saveBtn')}</span>
        </>
      )}
    </button>
  );
}
