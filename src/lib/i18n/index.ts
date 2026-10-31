import en, { type Dict } from "./en";
import hr from "./hr";
import de from "./de";

export const locales = ["hr", "en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, Dict> = { hr, en, de };

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDict = (locale: Locale): Dict => dictionaries[locale];

/** BCP-47 tags used for <html lang>, Intl formatting and hreflang. */
export const localeTag: Record<Locale, string> = {
  hr: "hr-HR",
  en: "en-GB",
  de: "de-DE",
};

export type { Dict };
