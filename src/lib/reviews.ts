// Real guest reviews. Add new ones at the top.
//
// Vrbo (https://www.vrbo.com/en-gb/p4364367): quotes verbatim in the guest's language
// (only obvious typos fixed).
//
// Airbnb (https://www.airbnb.com/rooms/1681296825413855210): the listing shows Airbnb's automatic
// Croatian translation. `hr` is that text (excerpts ending at a sentence); `en` and `de` are faithful
// translations of it. Replace with the guests' original wording when available.

import type { Locale } from "./i18n";

export type Review = {
  name: string;
  title?: string;
  quote: string;
  lang: string;
  source: "Vrbo" | "Airbnb";
};

type AirbnbReview = { name: string; quote: Record<Locale, string> };

export const airbnbReviews: AirbnbReview[] = [
  {
    name: "Robert V.",
    quote: {
      hr: "Imali smo prekrasan boravak i toplo bismo preporučili ovu kuću! Prostrana je, lijepa i vrlo dobro opremljena svime što nam je bilo potrebno tijekom cijelog boravka.",
      en: "We had a wonderful stay and would highly recommend this house! It's spacious, beautiful and very well equipped with everything we needed for our whole stay.",
      de: "Wir hatten einen wunderbaren Aufenthalt und können dieses Haus wärmstens empfehlen! Es ist geräumig, schön und sehr gut ausgestattet mit allem, was wir während unseres Aufenthalts brauchten.",
    },
  },
  {
    name: "Matt",
    quote: {
      hr: "Divno smo se proveli! Kuća je bila vrlo velika i imala je dovoljno prostora da se naša obitelj od 12 članova udobno smjesti.",
      en: "We had a wonderful time! The house was very big, with plenty of room for our family of 12 to stay comfortably.",
      de: "Wir hatten eine wunderbare Zeit! Das Haus war sehr groß und bot genug Platz, damit unsere 12-köpfige Familie bequem wohnen konnte.",
    },
  },
  {
    name: "Thomas",
    quote: {
      hr: "Fanica i njezin suprug bili su divni domaćini. Kuća je bila iznimno udobna, dobro uređena i vrlo ugodna.",
      en: "Fanica and her husband were wonderful hosts. The house was extremely comfortable, well furnished and very pleasant.",
      de: "Fanica und ihr Mann waren wunderbare Gastgeber. Das Haus war äußerst komfortabel, schön eingerichtet und sehr angenehm.",
    },
  },
  {
    name: "Zvonimir",
    quote: {
      hr: "Našoj grupi prijatelja svidio se boravak u smještaju koji iznajmljuje Fanica! Bio je savršen za naše veliko godišnje okupljanje.",
      en: "Our group of friends loved staying at Fanica's place! It was perfect for our big annual get-together.",
      de: "Unserer Freundesgruppe hat der Aufenthalt bei Fanica sehr gefallen! Es war perfekt für unser großes jährliches Treffen.",
    },
  },
  {
    name: "Istvan",
    quote: {
      hr: "Sve je bilo savršeno! Savršeno za obitelji!",
      en: "Everything was perfect! Perfect for families!",
      de: "Alles war perfekt! Perfekt für Familien!",
    },
  },
  {
    name: "Daria",
    quote: {
      hr: "Prekrasan dom, savršen za obiteljski odmor za nekoliko obitelji, potpuno opremljena kuhinja, kupaonice i spavaće sobe čiste i udobne, odličan bazen i prostor za roštilj.",
      en: "A beautiful home, perfect for a holiday with several families: a fully equipped kitchen, clean and comfortable bathrooms and bedrooms, a great pool and barbecue area.",
      de: "Ein wunderschönes Zuhause, perfekt für einen Urlaub mit mehreren Familien: voll ausgestattete Küche, saubere und bequeme Bäder und Schlafzimmer, toller Pool und Grillplatz.",
    },
  },
];

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

/**
 * Reviews for a page, alternating Airbnb and Vrbo. Airbnb quotes are shown in the page language;
 * Vrbo quotes in their original language, German first for German visitors, otherwise English first.
 */
export function reviewsFor(locale: Locale, count = 6): Review[] {
  const preferred = locale === "de" ? "de" : "en";
  const vrbo = [...reviews.filter((r) => r.lang === preferred), ...reviews.filter((r) => r.lang !== preferred)];
  const airbnb: Review[] = airbnbReviews.map((r) => ({
    name: r.name,
    quote: r.quote[locale],
    lang: locale,
    source: "Airbnb",
  }));
  const out: Review[] = [];
  for (let i = 0; out.length < count && (i < airbnb.length || i < vrbo.length); i++) {
    if (airbnb[i]) out.push(airbnb[i]);
    if (vrbo[i] && out.length < count) out.push(vrbo[i]);
  }
  return out;
}
