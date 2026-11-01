// Real guest reviews, copied from the Vrbo listing (https://www.vrbo.com/en-gb/p4364367).
// Keep quotes verbatim (only obvious typos fixed). Add new ones at the top.

import type { Locale } from "./i18n";

export type Review = {
  name: string;
  title?: string;
  quote: string;
  lang: "en" | "de" | "fr";
  source: "Vrbo";
};

export const reviews: Review[] = [
  {
    name: "Mihaela K.",
    quote: "Die Gastgeber sind eine super nette Familie.",
    lang: "de",
    source: "Vrbo",
  },
  {
    name: "Verified traveller",
    title: "Lovely hosts",
    quote: "Pool was the perfect depth for the children.",
    lang: "en",
    source: "Vrbo",
  },
  {
    name: "Markus H.",
    title: "Wundervoll, alles bestens",
    quote: "Das Haus ist einfach traumhaft und lässt keine Wünsche übrig.",
    lang: "de",
    source: "Vrbo",
  },
  {
    name: "Sven J.",
    title: "Perfect!",
    quote: "Very friendly owners, calm area, pool and fully equipped kitchen.",
    lang: "en",
    source: "Vrbo",
  },
  {
    name: "Tessa T.",
    title: "Ein Traumurlaub",
    quote: "Es hat alles sehr gut geklappt, die Vermieter sehr freundlich, tolles Haus!",
    lang: "de",
    source: "Vrbo",
  },
  {
    name: "Chris B.",
    title: "Lovely",
    quote: "Great property, lovely hosts, super helpful and friendly.",
    lang: "en",
    source: "Vrbo",
  },
  {
    name: "Kirsten H.",
    title: "Just great!",
    quote: "The villa is extremely well equipped. You will not miss anything!",
    lang: "en",
    source: "Vrbo",
  },
  {
    name: "Dominique W.",
    title: "Fabulous. Happy holiday and memories.",
    quote: "Loved it - friendly hosts and a very comfortable house.",
    lang: "en",
    source: "Vrbo",
  },
];

/** Reviews for a page: German visitors see German reviews first, everyone else English first. */
export function reviewsFor(locale: Locale, count = 6): Review[] {
  const preferred = locale === "de" ? "de" : "en";
  const first = reviews.filter((r) => r.lang === preferred);
  const rest = reviews.filter((r) => r.lang !== preferred);
  return [...first, ...rest].slice(0, count);
}
