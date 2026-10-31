import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Bath, BedDouble, BedSingle, Check, ExternalLink, Star, Trees, Users, Waves } from "lucide-react";
import { heroPhoto, PHOTO_H, PHOTO_W, photoSrc, site } from "@/lib/config";
import type { Dict, Locale } from "@/lib/i18n";
import { WhatsAppLink } from "./whatsapp";
import { CookieSettingsButton } from "./cookie-settings-button";

export function SectionHeading({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">{kicker}</p>
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-[2.6rem]">{title}</h2>
      {children && <p className="mt-4 text-base leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

/* --------------------------------- Hero --------------------------------- */

export function Hero({ t }: { t: Dict }) {
  return (
    <section className="relative isolate flex min-h-[92svh] items-end overflow-hidden text-white">
      <Image
        src={photoSrc(heroPhoto)}
        alt={t.gallery.alts[heroPhoto]}
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
    { icon: Waves, value: "", label: t.pool },
    { icon: Waves, value: "", label: t.hotTub },
    { icon: Trees, value: "1.200", label: t.garden },
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

export function About({ t }: { t: Dict }) {
  const bedrooms: { label: string; icon: typeof BedDouble }[] = [
    ...[1, 2, 3, 4].map(() => ({ label: t.rooms.king, icon: BedDouble })),
    ...[5, 6].map(() => ({ label: t.rooms.twin, icon: BedSingle })),
    ...[7, 8].map(() => ({ label: t.rooms.single, icon: BedSingle })),
  ];
  return (
    <section id="villa" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
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
        <div className="grid grid-cols-5 grid-rows-2 gap-3">
          <Image
            src={photoSrc("dinner-party")}
            alt={t.gallery.alts["dinner-party"]}
            width={PHOTO_W}
            height={PHOTO_H}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="col-span-5 aspect-[2/1] h-auto w-full rounded-2xl object-cover"
          />
          <Image
            src={photoSrc("hot-tub-lounge")}
            alt={t.gallery.alts["hot-tub-lounge"]}
            width={PHOTO_W}
            height={PHOTO_H}
            sizes="(min-width: 1024px) 320px, 60vw"
            className="col-span-3 aspect-[4/3] h-full w-full rounded-2xl object-cover"
          />
          <Image
            src={photoSrc("pool-sunset-dog")}
            alt={t.gallery.alts["pool-sunset-dog"]}
            width={PHOTO_W}
            height={PHOTO_H}
            sizes="(min-width: 1024px) 220px, 40vw"
            className="col-span-2 aspect-[3/4] h-full w-full rounded-2xl object-cover object-[80%_50%]"
          />
        </div>
      </div>

      <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
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

      <div className="mt-20">
        <h3 className="mb-8 font-serif text-3xl font-semibold">{t.amenities.title}</h3>
        <div className="grid gap-8 sm:grid-cols-3">
          {t.amenities.groups.map((g) => (
            <div key={g.name}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-olive">{g.name}</p>
              <ul className="space-y-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[0.95rem]">
                    <Check className="mt-0.5 size-4 shrink-0 text-sea" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Reviews ------------------------------- */

export function Reviews({ t }: { t: Dict["reviews"] }) {
  const v = site.reviews.vrbo;
  const cats = Object.entries(v.categories) as [keyof typeof v.categories, number][];
  return (
    <section className="bg-sea-dark py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f0b89c]">{t.kicker}</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-[2.6rem]">{t.title}</h2>
            <div className="mt-8 flex items-end gap-4">
              <span className="font-serif text-6xl font-semibold leading-none">{v.score.toFixed(1)}</span>
              <div className="pb-1">
                <div className="flex gap-0.5 text-[#f5c26b]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-sm text-white/80">
                  {t.exceptional} · {v.count} {t.reviewsCount} {t.on} Vrbo
                </p>
              </div>
            </div>
            <a
              href={site.links.vrbo}
              target="_blank"
              rel="noopener"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-[#f0b89c]"
            >
              {t.readMore} <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <ul className="space-y-3">
              {cats.map(([key, score]) => (
                <li key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/85">{t.categories[key]}</span>
                    <span className="font-semibold">{score.toFixed(1)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-[#f0b89c]" style={{ width: `${(score / v.outOf) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <p className="text-sm font-semibold text-white/85">{t.themesTitle}</p>
              <ul className="mt-3 space-y-2.5">
                {t.themes.map((theme) => (
                  <li key={theme} className="flex gap-2.5 text-[0.95rem]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#f0b89c]" />
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ --------------------------------- */

export function Faq({ t }: { t: Dict["faq"] }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
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
