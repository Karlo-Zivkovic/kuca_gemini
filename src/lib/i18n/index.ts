import en, { type Dict } from "./en";
import hr from "./hr";
import de from "./de";
import pl from "./pl";
import fr from "./fr";
import cs from "./cs";
import no from "./no";
import sv from "./sv";

export const locales = ["hr", "en", "de", "pl", "fr", "cs", "no", "sv"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, Dict> = { hr, en, de, pl, fr, cs, no, sv };

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDict = (locale: Locale): Dict => dictionaries[locale];

/** BCP-47 tags used for <html lang>, Intl formatting and hreflang. */
export const localeTag: Record<Locale, string> = {
  hr: "hr-HR",
  en: "en-GB",
  de: "de-DE",
  pl: "pl-PL",
  fr: "fr-FR",
  cs: "cs-CZ",
  no: "nb-NO", // URL /no, Norwegian Bokmål
  sv: "sv-SE",
};

export type { Dict };
