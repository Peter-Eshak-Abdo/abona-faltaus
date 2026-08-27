import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en", "cop"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ar",
  localePrefix: "as-needed",
  localeDetection: true,
});

export function isRtlLocale(locale: string): boolean {
  return locale === "ar" || locale === "cop";
}

export function htmlLang(locale: string): string {
  if (locale === "cop") return "cop";
  if (locale === "en") return "en";
  return "ar";
}
