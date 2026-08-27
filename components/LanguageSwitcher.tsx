"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export default function LanguageSwitcher({ className, compact }: Props) {
  const t = useTranslations("Language");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const persistLocale = async (next: AppLocale) => {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ preferred_locale: next })
          .eq("id", user.id);
      }
    } catch {
      // Cookie still applies for guests / offline
    }
  };

  const onChange = (next: string) => {
    const nextLocale = next as AppLocale;
    if (nextLocale === locale) return;

    startTransition(async () => {
      await persistLocale(nextLocale);
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  };

  return (
    <label
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-white/15 backdrop-blur-md px-0.5 py-0.25 text-sm shadow-sm",
        isPending && "opacity-60 pointer-events-none",
        className,
      )}
      title={t("hint")}
    >
      <Languages className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden />
      {!compact && (
        <span className="sr-only sm:not-sr-only sm:inline text-xs font-medium opacity-80">
          {t("label")}
        </span>
      )}
      <select
        aria-label={t("label")}
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-0 outline-none text-sm font-semibold cursor-pointer py-0.25 pe-0.5 max-w-[7.5rem]"
      >
        {locales.map((code) => (
          <option key={code} value={code} className="text-black">
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
