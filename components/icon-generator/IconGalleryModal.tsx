"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Sparkles, Heart, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";

export interface GeneratedIconItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  styleTitle: string;
  aspectRatio: string;
  theologicalInsight?: string;
  createdAt: string;
  isFavorite?: boolean;
}

interface IconGalleryModalProps {
  icon: GeneratedIconItem | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (id: string) => void;
}

export default function IconGalleryModal({
  icon,
  isOpen,
  onClose,
  onToggleFavorite,
}: IconGalleryModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !icon) return null;

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = icon.imageUrl;
      const cleanName = (icon.prompt || "orthodox-icon")
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
        .slice(0, 30);
      link.download = `${cleanName}-${icon.style}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("تم بدء تحميل الأيقونة بجودة عالية");
    } catch {
      toast.error("حدث خطأ أثناء التنزيل");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `أيقونة: ${icon.prompt}`,
          text: `${icon.prompt} - تم توليدها بالذكاء الاصطناعي الأرثوذكسي (${icon.styleTitle})`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("تم نسخ رابط الأيقونة بنجاح");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("تعذر نسخ الرابط");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0.5 sm:p-1 md:p-1.5 bg-black/85 backdrop-blur-xl overflow-y-auto" dir="rtl">
        {/* Overlay dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl bg-stone-900/95 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.15)] flex flex-col md:flex-row my-auto max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-1 left-1 z-20 w-2 h-2 rounded-full bg-black/60 text-stone-300 hover:text-white hover:bg-black/90 flex items-center justify-center transition-colors border border-white/10"
            title="إغلاق"
          >
            <X size={18} />
          </button>

          {/* Left / Image preview Area */}
          <div className="w-full md:w-1/2 bg-black/70 flex items-center justify-center p-1 relative min-h-[320px] md:min-h-[460px] overflow-hidden">
            <img
              src={icon.imageUrl}
              alt={icon.prompt}
              className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-amber-400/20"
              loading="eager"
            />
          </div>

          {/* Right / Information & Actions Area */}
          <div className="w-full md:w-1/2 p-1 md:p-1.5 flex flex-col justify-between overflow-y-auto bg-stone-900/90 text-stone-200">
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                <span className="text-xs font-bold px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <Sparkles size={13} />
                  {icon.styleTitle}
                </span>
                <span className="text-xs text-stone-400 bg-stone-800 px-0.5 py-0.25 rounded-full">
                  نسبة {icon.aspectRatio}
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-amber-100 mb-0.5 leading-snug">
                {icon.prompt}
              </h2>

              {icon.theologicalInsight && (
                <div className="my-1 p-1 rounded-2xl bg-amber-950/30 border border-amber-500/20 relative">
                  <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold mb-0.5">
                    <BookOpen size={14} />
                    <span>التأمل والشرح اللاهوتي للأيقونة</span>
                  </div>
                  <p className="text-sm text-amber-100/90 leading-relaxed font-serif">
                    {icon.theologicalInsight}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-1 pt-1 border-t border-white/10 flex flex-wrap gap-0.5">
              <button
                onClick={handleDownload}
                className="flex-1 min-w-[130px] flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold py-0.5 px-1 rounded-xl shadow-lg transition-all text-sm"
              >
                <Download size={16} />
                <span>تحميل بدقة عالية</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-0.5 bg-stone-800 hover:bg-stone-700 text-stone-200 py-0.5 px-1 rounded-xl border border-stone-700 transition-all text-sm"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                <span>{copied ? "تم النسخ" : "مشاركة"}</span>
              </button>

              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(icon.id)}
                  className={`flex items-center justify-center w-2 h-2 rounded-xl border transition-all ${
                    icon.isFavorite
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                      : "bg-stone-800 border-stone-700 text-stone-400 hover:text-rose-400"
                  }`}
                  title="حفظ في المفضلة"
                >
                  <Heart size={18} fill={icon.isFavorite ? "currentColor" : "none"} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
