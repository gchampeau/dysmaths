import {defineRouting} from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "es"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true
});

export type AppLocale = (typeof routing.locales)[number];

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  es: "Español"
};

export function isValidLocale(locale: string): locale is AppLocale {
  return routing.locales.includes(locale as AppLocale);
}
