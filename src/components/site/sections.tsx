import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlarmSmoke,
  Archive,
  Armchair,
  Baby,
  Bath,
  Beef,
  BedDouble,
  BedSingle,
  Blend,
  Bubbles,
  Blinds,
  BriefcaseMedical,
  CakeSlice,
  CalendarDays,
  Car,
  Check,
  ChefHat,
  Coffee,
  CookingPot,
  DoorOpen,
  Droplet,
  Droplets,
  ExternalLink,
  EthernetPort,
  FerrisWheel,
  Fence,
  FireExtinguisher,
  Flame,
  FlameKindling,
  Flower2,
  Heater,
  KeyRound,
  LampDesk,
  Luggage,
  Microwave,
  Mountain,
  PawPrint,
  Quote,
  Refrigerator,
  Sandwich,
  Shirt,
  ShowerHead,
  SoapDispenserDroplet,
  Snowflake,
  Soup,
  Sparkles,
  Star,
  Sun,
  Table,
  ThermometerSun,
  Umbrella,
  UserCheck,
  Vault,
  Wind,
  Wine,
  Trees,
  Tv,
  Users,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  WavesLadder,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { heroSrc, site } from "@/lib/config";
import { gallerySrc, hostPhoto, photoById } from "@/lib/photos";
import { localeTag, type Dict, type Locale } from "@/lib/i18n";
import { reviewsFor } from "@/lib/reviews";
import { WhatsAppLink } from "./whatsapp";
import { CookieSettingsButton } from "./cookie-settings-button";
import { FloorPlan } from "./floor-plan";

export function SectionHeading({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{kicker}</p>
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-[2.6rem]">{title}</h2>
      {children && <p className="mt-4 text-base leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

/** Picks the right plural form ("23 recenzije", "16 recenzija") using the language's own rules. */
function plural(tag: string, n: number, forms: { one: string; few: string; other: string }) {
  const form = new Intl.PluralRules(tag).select(n);
  return form === "one" ? forms.one : form === "few" ? forms.few : forms.other;
}

/* --------------------------------- Hero --------------------------------- */

export function Hero({ t }: { t: Dict }) {
  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden text-white">
      <Image
        src={heroSrc}
        alt={t.gallery.heroAlt}
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[50%_60%]"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/25 to-black/40" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/85 sm:text-sm">{t.hero.eyebrow}</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold leading-none sm:text-7xl">Villa Gemini</h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">{t.hero.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#availability"
            className="rounded-full bg-terracotta px-6 py-3 font-semibold shadow-lg hover:bg-terracotta-dark"
          >
            {t.hero.ctaAvailability}
          </a>
          <WhatsAppLink
            message={t.whatsapp.greeting}
            source="hero"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-semibold shadow-lg hover:bg-whatsapp-dark"
          >
            {t.hero.ctaWhatsapp}
          </WhatsAppLink>
        </div>
        <p className="mt-6 flex items-center gap-2 text-sm text-white/80">
          <Check className="size-4" /> {t.hero.directNote}
        </p>
      </div>
    </section>
  );
}

/* --------------------------------- Facts -------------------------------- */

export function Facts({ t }: { t: Dict["facts"] }) {
  const items = [
    { icon: Users, value: String(site.maxGuests), label: t.guests },
    { icon: BedDouble, value: String(site.bedrooms), label: t.bedrooms },
    { icon: Bath, value: String(site.bathrooms), label: t.bathrooms },
    { icon: WavesLadder, value: "", label: t.pool },
    { icon: Bubbles, value: "", label: t.hotTub },
    { icon: Trees, value: "500", label: t.garden },
  ];
  return (
    <div className="border-b border-line bg-paper">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
        {items.map(({ icon: Icon, value, label }) => (
          <li key={label} className="flex items-center gap-3 px-4 py-5 sm:justify-center">
            <Icon className="size-6 shrink-0 text-sea" strokeWidth={1.5} />
            <span className="text-sm leading-tight">
              {value && <strong className="mr-1 font-serif text-xl font-semibold">{value}</strong>}
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- About -------------------------------- */

// Photos stacked beside the villa text.
const aboutPhotos = ["078", "051", "066"];

// Icon keys used by `amenities.groups[].items[].icon` in the dictionaries.
const amenityIcons: Record<string, LucideIcon> = {
  pool: WavesLadder,
  hotTub: Bubbles,
  garden: Fence,
  terrace: Sun,
  bbq: Beef,
  dining: Utensils,
  lounge: Armchair,
  shower: ShowerHead,
  ac: Snowflake,
  wifi: Wifi,
  tv: Tv,
  kitchen: CookingPot,
  washer: WashingMachine,
  fireplace: Flame,
  workspace: LampDesk,
  linen: BedDouble,
  playground: FerrisWheel,
  parking: Car,
  pets: PawPrint,
  firepit: FlameKindling,
  outdoorFurniture: Armchair,
  lounger: Umbrella,
  gardenView: Flower2,
  mountain: Mountain,
  fridge: Refrigerator,
  stove: ChefHat,
  microwave: Microwave,
  dishwasher: Droplets,
  kettle: Droplet,
  coffee: Coffee,
  toaster: Sandwich,
  blender: Blend,
  cookware: Soup,
  dishes: UtensilsCrossed,
  wine: Wine,
  baking: CakeSlice,
  diningTable: Table,
  pillows: BedSingle,
  blackout: Blinds,
  wardrobe: Archive,
  safe: Vault,
  drying: Wind,
  iron: Shirt,
  hairdryer: Wind,
  toiletries: SoapDispenserDroplet,
  hotWater: ThermometerSun,
  heating: Heater,
  ethernet: EthernetPort,
  crib: BedSingle,
  travelCrib: Baby,
  highChair: Baby,
  smoke: AlarmSmoke,
  extinguisher: FireExtinguisher,
  firstAid: BriefcaseMedical,
  entrance: DoorOpen,
  selfCheckin: KeyRound,
  host: UserCheck,
  luggage: Luggage,
  longStay: CalendarDays,
  cleaning: Sparkles,
};

function AmenityItem({ icon, text }: { icon: string; text: string }) {
  const Icon = amenityIcons[icon] ?? Check;
  return (
    <li className="flex items-center gap-4 text-[0.95rem] leading-snug">
      <Icon className="size-6 shrink-0 text-sea" strokeWidth={1.5} aria-hidden />
      {text}
    </li>
  );
}

export function About({ t }: { t: Dict }) {
  // Same numbering as the floor plan: 1–4 ground floor, 5–6 first floor, 7–8 gallery.
  const bedIcons = [BedDouble, BedSingle, BedDouble, BedDouble, BedDouble, BedDouble, BedSingle, BedSingle];
  const bedrooms = t.rooms.beds.map((label, i) => ({ label, icon: bedIcons[i] }));
  return (
    <section id="villa" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{t.about.kicker}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-[2.6rem]">{t.about.title}</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
            {t.about.paragraphs.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
        </div>
        {/* Wide photos stacked beside the text (kept at their natural shape, so they stay sharp) */}
        <div className="flex flex-col gap-3">
          {aboutPhotos.map((id) => {
            const p = photoById(id);
            return (
              <Image
                key={id}
                src={gallerySrc(id)}
                alt={t.gallery.subjects[p.subject]}
                width={p.w}
                height={p.h}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="h-auto w-full rounded-2xl"
              />
            );
          })}
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <h3 className="font-serif text-3xl font-semibold">{t.rooms.title}</h3>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <Bath className="size-5 text-sea" strokeWidth={1.5} /> {t.rooms.bathrooms}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bedrooms.map(({ label, icon: Icon }, i) => (
            <li key={i} className="rounded-xl border border-line bg-paper p-4">
              <Icon className="size-6 text-sea" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold">
                {t.rooms.bedroom} {i + 1}
              </p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </li>
          ))}
        </ul>
      </div>

      <FloorPlan t={t.floorPlan} />

      <div className="mt-14">
        <h3 className="mb-8 font-serif text-3xl font-semibold">{t.amenities.title}</h3>
        <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.amenities.highlights.map((item) => (
            <AmenityItem key={item.text} {...item} />
          ))}
        </ul>

        <details className="group mt-10">
          <summary className="inline-flex cursor-pointer list-none rounded-xl border border-ink px-6 py-3 font-semibold transition hover:bg-ink/5 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              {t.amenities.showAll.replace(
                "{n}",
                String(new Set(t.amenities.groups.flatMap((g) => g.items.map((i) => i.text))).size),
              )}
            </span>
            <span className="hidden group-open:inline">{t.amenities.showLess}</span>
          </summary>
          <div className="mt-10 gap-x-10 sm:columns-2 lg:columns-3">
            {t.amenities.groups.map((g) => (
              <div key={g.name} className="mb-10 break-inside-avoid">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-olive">{g.name}</p>
                <ul className="space-y-4">
                  {g.items.map((item) => (
                    <AmenityItem key={item.text} {...item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

/* -------------------------------- Reviews ------------------------------- */

export function Reviews({ t, lang }: { t: Dict["reviews"]; lang: Locale }) {
  const ratings = [
    { name: "Airbnb", label: t.guestFavourite, digits: 2, ...site.reviews.airbnb },
    { name: "Vrbo", label: t.exceptional, digits: 1, ...site.reviews.vrbo },
  ];
  const stars = (
    <div className="flex gap-0.5 text-[#f5c26b]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-4 fill-current" />
      ))}
    </div>
  );

  return (
    <section className="bg-sea-dark py-14 text-white sm:py-18">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Heading left, overall score right */}
        {/* The two score cards stay side by side; the heading gives way, so longer
            translations (German) don't push one card below the other. */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:min-w-0 lg:flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0b89c]">{t.kicker}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-[2.6rem]">{t.title}</h2>
          </div>
          <div className="flex flex-wrap gap-3 sm:flex-nowrap lg:shrink-0">
            {ratings.map((r) => (
              <div key={r.name} className="flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10">
                <span className="font-serif text-5xl font-semibold leading-none">
                  {new Intl.NumberFormat(localeTag[lang], {
                    minimumFractionDigits: r.digits,
                    maximumFractionDigits: r.digits,
                  }).format(r.score)}
                  <span className="text-xl text-white/60">/{r.outOf}</span>
                </span>
                <span className="max-w-[11rem]">
                  {stars}
                  <span className="mt-1 block text-sm text-white/80">
                    {r.label} {t.on} {r.name}
                  </span>
                  <span className="block text-xs text-white/60">{plural(localeTag[lang], r.count, t.reviewsCount).replace("{n}", String(r.count))}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,19rem)_1fr]">
          {/* The host: small round photo on phones, tall card on desktop */}
          <figure className="flex items-center gap-4 lg:block">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 lg:aspect-[3/4] lg:size-auto lg:w-full lg:rounded-2xl lg:ring-1 lg:ring-white/10">
              <Image
                src={gallerySrc(hostPhoto.id)}
                alt={t.hostAlt}
                fill
                sizes="(min-width: 1024px) 304px, 96px"
                className="object-cover object-[50%_40%]"
              />
            </div>
            <figcaption className="lg:mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0b89c]">{t.hostLabel}</p>
              <p className="mt-1 font-serif text-2xl font-semibold">{t.hostName}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/75">{t.hostNote}</p>
            </figcaption>
          </figure>

          {/* Real guest quotes */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {reviewsFor(lang).map((r) => (
              <li key={r.name} className="flex flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 max-sm:nth-[n+4]:hidden">
                <Quote className="size-7 text-[#f0b89c]" aria-hidden />
                <blockquote lang={r.lang} className="mt-3 flex-1">
                  {r.title && <p className="font-serif text-xl font-semibold leading-snug">{r.title}</p>}
                  <p className={`leading-relaxed text-white/85 ${r.title ? "mt-2" : "font-serif text-xl font-semibold leading-snug text-white"}`}>
                    “{r.quote}”
                  </p>
                </blockquote>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="flex items-center gap-2 text-white/60">
                    {stars}
                    {r.source}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
          <span className="text-white/80">{t.readAllOn}</span>
          {[
            ["Vrbo", site.links.vrboReviews],
            ["Airbnb", site.links.airbnbReviews],
          ].map(([name, href]) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[#f0b89c]"
            >
              {name} <ExternalLink className="size-4" />
            </a>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ --------------------------------- */

export function Faq({ t }: { t: Dict["faq"] }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-18">
      <SectionHeading kicker={t.kicker} title={t.title} />
      <div className="divide-y divide-line rounded-2xl border border-line bg-paper">
        {t.items.map((item) => (
          <details key={item.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {item.q}
              <span className="text-xl text-terracotta transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Footer -------------------------------- */

export function Footer({ t, lang }: { t: Dict; lang: Locale }) {
  return (
    <footer className="bg-ink pb-24 pt-14 text-white/80 sm:pb-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-3xl font-semibold text-white">Villa Gemini</p>
          <p className="mt-1 text-sm">{t.footer.tagline}</p>
          <address className="mt-4 text-sm not-italic leading-relaxed">
            {site.address.street}, {site.address.postalCode} {site.address.city}, {site.address.island}
            <br />
            <a href={`tel:${site.phone}`} className="hover:text-white">
              {site.phoneDisplay}
            </a>{" "}
            ·{" "}
            <a href={`mailto:${site.email}`} className="hover:text-white">
              {site.email}
            </a>
          </address>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:items-end">
          <Link href={`/${lang}/privacy`} className="hover:text-white">
            {t.footer.privacy}
          </Link>
          <CookieSettingsButton label={t.footer.cookieSettings} />
          <p className="text-white/50">© Villa Gemini · {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
