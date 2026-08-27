"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LogoHeader() {
  const t = useTranslations("Common");

  return (
    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full flex flex-col items-center shadow-xl/30 inset-shadow-sm border-white/20 w-11/12 md:w-50 z-30 py-0.5">
      <div className="flex items-center justify-between w-full px-0.5 gap-0.5">
        <Image
          src="/images/eagle.webp"
          alt="Logo"
          width={60}
          height={40}
          className="rounded-full border-blue-300 justify-self-start flex-none w-auto h-auto"
          priority
          loading="eager"
        />
        <h1 className="font-bold text-2xl md:text-4xl flex-initial grow text-center">
          {t("appName")}
        </h1>
        <div className="flex items-center gap-0.5 shrink-0">
          <LanguageSwitcher compact className="hidden sm:inline-flex" />
          <Image
            src="/images/eagle.webp"
            alt="Logo"
            width={60}
            height={40}
            className="rounded-full border-blue-300 justify-self-end flex-none w-auto h-auto"
            style={{ transform: "scaleX(-1)" }}
            priority
            loading="eager"
          />
        </div>
      </div>
      <div className="sm:hidden mt-0.25">
        <LanguageSwitcher compact />
      </div>
    </div>
  );
}
