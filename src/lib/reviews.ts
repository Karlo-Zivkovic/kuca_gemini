// Real guest reviews. Add new ones at the top.
//
// Vrbo (https://www.vrbo.com/en-gb/p4364367): quotes verbatim in the guest's language
// (only obvious typos fixed).
//
// Airbnb (https://www.airbnb.com/rooms/1681296825413855210): the listing shows Airbnb's automatic
// Croatian translation. `hr` is that text (excerpts ending at a sentence); the other languages are
// faithful translations of it. Replace with the guests' original wording when available.

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
      pl: "Mieliśmy wspaniały pobyt i gorąco polecamy ten dom! Jest przestronny, piękny i bardzo dobrze wyposażony we wszystko, czego potrzebowaliśmy przez cały pobyt.",
      fr: "Nous avons passé un séjour merveilleux et recommandons vivement cette maison ! Elle est spacieuse, belle et très bien équipée avec tout ce dont nous avions besoin pendant tout le séjour.",
      cs: "Měli jsme nádherný pobyt a vřele tento dům doporučujeme! Je prostorný, krásný a velmi dobře vybavený vším, co jsme během celého pobytu potřebovali.",
      no: "Vi hadde et fantastisk opphold og anbefaler dette huset på det varmeste! Det er romslig, vakkert og svært godt utstyrt med alt vi trengte under hele oppholdet.",
      sv: "Vi hade en underbar vistelse och kan varmt rekommendera det här huset! Det är rymligt, vackert och mycket välutrustat med allt vi behövde under hela vistelsen.",
    },
  },
  {
    name: "Matt",
    quote: {
      hr: "Divno smo se proveli! Kuća je bila vrlo velika i imala je dovoljno prostora da se naša obitelj od 12 članova udobno smjesti.",
      en: "We had a wonderful time! The house was very big, with plenty of room for our family of 12 to stay comfortably.",
      de: "Wir hatten eine wunderbare Zeit! Das Haus war sehr groß und bot genug Platz, damit unsere 12-köpfige Familie bequem wohnen konnte.",
      pl: "Świetnie się bawiliśmy! Dom był bardzo duży i miał dość miejsca, by nasza 12-osobowa rodzina wygodnie się zmieściła.",
      fr: "Nous avons passé un moment merveilleux ! La maison était très grande, avec assez de place pour que notre famille de 12 personnes soit à l'aise.",
      cs: "Užili jsme si to skvěle! Dům byl velmi velký a měl dost místa, aby se naše dvanáctičlenná rodina pohodlně vešla.",
      no: "Vi hadde det fantastisk! Huset var veldig stort, med god plass til at familien vår på 12 bodde komfortabelt.",
      sv: "Vi hade det underbart! Huset var mycket stort, med gott om plats för vår familj på 12 personer att bo bekvämt.",
    },
  },
  {
    name: "Thomas",
    quote: {
      hr: "Fanica i njezin suprug bili su divni domaćini. Kuća je bila iznimno udobna, dobro uređena i vrlo ugodna.",
      en: "Fanica and her husband were wonderful hosts. The house was extremely comfortable, well furnished and very pleasant.",
      de: "Fanica und ihr Mann waren wunderbare Gastgeber. Das Haus war äußerst komfortabel, schön eingerichtet und sehr angenehm.",
      pl: "Fanica i jej mąż byli wspaniałymi gospodarzami. Dom był niezwykle wygodny, ładnie urządzony i bardzo przyjemny.",
      fr: "Fanica et son mari ont été des hôtes merveilleux. La maison était extrêmement confortable, bien aménagée et très agréable.",
      cs: "Fanica a její manžel byli úžasní hostitelé. Dům byl mimořádně pohodlný, pěkně zařízený a velmi příjemný.",
      no: "Fanica og mannen hennes var fantastiske verter. Huset var svært komfortabelt, fint innredet og veldig behagelig.",
      sv: "Fanica och hennes man var underbara värdar. Huset var mycket bekvämt, fint inrett och väldigt trivsamt.",
    },
  },
  {
    name: "Zvonimir",
    quote: {
      hr: "Našoj grupi prijatelja svidio se boravak u smještaju koji iznajmljuje Fanica! Bio je savršen za naše veliko godišnje okupljanje.",
      en: "Our group of friends loved staying at Fanica's place! It was perfect for our big annual get-together.",
      de: "Unserer Freundesgruppe hat der Aufenthalt bei Fanica sehr gefallen! Es war perfekt für unser großes jährliches Treffen.",
      pl: "Nasza grupa przyjaciół była zachwycona pobytem u Fanicy! Dom był idealny na nasze duże coroczne spotkanie.",
      fr: "Notre groupe d'amis a adoré séjourner chez Fanica ! C'était parfait pour notre grande réunion annuelle.",
      cs: "Naší skupině přátel se pobyt u Fanicy moc líbil! Bylo to ideální pro naše velké každoroční setkání.",
      no: "Vennegjengen vår elsket oppholdet hos Fanica! Det var perfekt for den store årlige samlingen vår.",
      sv: "Vårt vänsällskap älskade att bo hos Fanica! Det var perfekt för vår stora årliga träff.",
    },
  },
  {
    name: "Istvan",
    quote: {
      hr: "Sve je bilo savršeno! Savršeno za obitelji!",
      en: "Everything was perfect! Perfect for families!",
      de: "Alles war perfekt! Perfekt für Familien!",
      pl: "Wszystko było idealne! Idealne dla rodzin!",
      fr: "Tout était parfait ! Parfait pour les familles !",
      cs: "Všechno bylo dokonalé! Ideální pro rodiny!",
      no: "Alt var perfekt! Perfekt for familier!",
      sv: "Allt var perfekt! Perfekt för familjer!",
    },
  },
  {
    name: "Daria",
    quote: {
      hr: "Prekrasan dom, savršen za obiteljski odmor za nekoliko obitelji, potpuno opremljena kuhinja, kupaonice i spavaće sobe čiste i udobne, odličan bazen i prostor za roštilj.",
      en: "A beautiful home, perfect for a holiday with several families: a fully equipped kitchen, clean and comfortable bathrooms and bedrooms, a great pool and barbecue area.",
      de: "Ein wunderschönes Zuhause, perfekt für einen Urlaub mit mehreren Familien: voll ausgestattete Küche, saubere und bequeme Bäder und Schlafzimmer, toller Pool und Grillplatz.",
      pl: "Piękny dom, idealny na wakacje kilku rodzin: w pełni wyposażona kuchnia, czyste i wygodne łazienki i sypialnie, świetny basen i miejsce na grilla.",
      fr: "Une très belle maison, parfaite pour des vacances à plusieurs familles : cuisine entièrement équipée, salles de bain et chambres propres et confortables, superbe piscine et coin barbecue.",
      cs: "Krásný dům, ideální na dovolenou několika rodin: plně vybavená kuchyně, čisté a pohodlné koupelny a ložnice, skvělý bazén a místo na grilování.",
      no: "Et nydelig hjem, perfekt for ferie med flere familier: fullt utstyrt kjøkken, rene og komfortable bad og soverom, flott basseng og grillplass.",
      sv: "Ett vackert hem, perfekt för semester med flera familjer: fullt utrustat kök, rena och bekväma badrum och sovrum, fin pool och grillplats.",
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
