"use client";

import { useEffect, useRef } from "react";
import { useLocale, hasLocale } from "next-intl";
import { supabase } from "@/lib/supabase";
import { routing, type AppLocale } from "@/i18n/routing";
import { useRouter, usePathname } from "@/i18n/navigation";

/**
 * Sync preferred_locale from Supabase → cookie/router (mirrors ThemeSync).
 * Runs once per mount so a manual switcher change is not immediately overwritten.
 */
export function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const didSync = useRef(false);

  useEffect(() => {
    if (didSync.current) return;
    let cancelled = false;

    const sync = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_locale")
        .eq("id", user.id)
        .single();

      const preferred = profile?.preferred_locale as string | undefined;
      if (!preferred || !hasLocale(routing.locales, preferred)) {
        didSync.current = true;
        return;
      }

      document.cookie = `NEXT_LOCALE=${preferred}; path=/; max-age=31536000; samesite=lax`;
      didSync.current = true;

      if (preferred !== locale && !cancelled) {
        router.replace(pathname, { locale: preferred as AppLocale });
      }
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [locale, pathname, router]);

  return null;
}
