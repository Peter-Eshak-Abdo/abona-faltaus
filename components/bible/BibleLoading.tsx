"use client";
import EagleLoader from "@/components/EagleLoader";

interface BibleLoadingProps {
  loadingStatus: string;
  loadProgress: number;
  tipIndex?: number;
  tips?: string[];
}

export default function BibleLoading({
  loadingStatus,
  loadProgress,
  tips,
}: BibleLoadingProps) {
  return (
    <EagleLoader
      statusText={loadingStatus || "جاري مزامنة وتجهيز الكتاب المقدس..."}
      progress={loadProgress}
      tips={tips}
      fullScreen={true}
    />
  );
}

