"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { FaArrowRight } from "react-icons/fa";
import { useLocale } from "next-intl";

interface BackButtonProps {
  className?: string;
  iconSize?: number;
  title?: string;
  fallbackUrl?: string;
  children?: React.ReactNode;
}

export default function BackButton({
  className = "p-0.5 m-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition self-baseline text-zinc-700 dark:text-zinc-200 flex items-center justify-center",
  iconSize = 18,
  title = "الرجوع للخلف",
  fallbackUrl = "/",
  children,
}: BackButtonProps) {
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
      title={title}
      aria-label={title}
    >
      {children ? (
        children
      ) : (
        <FaArrowRight
          size={iconSize}
          className={isRtl ? "" : "rotate-180"}
        />
      )}
    </button>
  );
}
