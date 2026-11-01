import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { galleryPhotos, heroPhoto, photoSrc, site } from "@/lib/config";
import { getPublicAvailability, getPublicSeasons } from "@/lib/data";
import { getDict, hasLocale, localeTag, type Dict, type Locale } from "@/lib/i18n";
import { BookingProvider } from "@/components/site/booking-context";
import { BookingCalendar } from "@/components/site/booking-calendar";
import { ContactForm, DirectContact } from "@/components/site/contact-form";
import { Gallery } from "@/components/site/gallery";
import { Header } from "@/components/site/header";
import { MapEmbed } from "@/components/site/map-embed";
import { Prices } from "@/components/site/prices";
import { About, Facts, Faq, Footer, Hero, Reviews, SectionHeading } from "@/components/site/sections";
import { WhatsAppFloat } from "@/components/site/whatsapp";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <BookingProvider>
      <JsonLd t={t} lang={lang} />
      <Header t={t.nav} lang={lang} />
      <main>
        <Hero t={t} />
        <Facts t={t.facts} />
        <About t={t} />

        <section id="gallery" className="bg-paper py-14 sm:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading kicker={t.gallery.kicker} title={t.gallery.title} />
            <Gallery photos={galleryPhotos} t={t.gallery} />
          </div>
        </section>

        <Reviews t={t.reviews} lang={lang} />

        <section id="availability" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
          <SectionHeading kicker={t.availability.kicker} title={t.availability.title}>
            {t.availability.subtitle}
          </SectionHeading>
          <Availability t={t} lang={lang} />
        </section>

        <section id="location" className="bg-paper py-14 sm:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading kicker={t.location.kicker} title={t.location.title}>
              {t.location.intro}
            </SectionHeading>
            <div className="grid gap-8 lg:grid-cols-[5fr_3fr]">
              <MapEmbed showLabel={t.location.showMap} note={t.location.mapNote} title={`${site.name}: map`} />
              <div>
                <ul className="divide-y divide-line">
                  {t.location.distances.map((d) => (
                    <li key={d.label} className="flex justify-between gap-4 py-2.5 text-[0.95rem]">
                      <span className="text-muted">{d.label}</span>
                      <span className="shrink-0 font-semibold">{d.value}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={site.links.googleMaps}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sea underline underline-offset-4"
                >
                  {t.location.openInMaps} <ExternalLink className="size-4" />
                </a>
                <h3 className="mt-8 font-serif text-2xl font-semibold">{t.location.gettingThere}</h3>
                <p className="mt-2 leading-relaxed text-muted">{t.location.gettingThereText}</p>
              </div>
            </div>
          </div>
        </section>

        <Faq t={t.faq} />

        <section id="contact" className="bg-stone/60 py-14 sm:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading kicker={t.contact.kicker} title={t.contact.title}>
              {t.contact.subtitle}
            </SectionHeading>
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <ContactForm t={t} lang={lang} />
              <DirectContact t={t} />
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} lang={lang} />
      <WhatsAppFloat greeting={t.whatsapp.greeting} forWord={t.whatsapp.forDates} label={t.whatsapp.floating} />
    </BookingProvider>
  );
}

/** Cached server data (bookings + seasons), revalidated when mom edits them. */
async function Availability({ t, lang }: { t: Dict; lang: Locale }) {
  const [booked, seasons] = await Promise.all([getPublicAvailability(), getPublicSeasons()]);
  return (
    <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
      <BookingCalendar booked={booked} seasons={seasons} t={t.availability} lang={lang} />
      <Prices seasons={seasons} t={t} lang={lang} />
    </div>
  );
}

function JsonLd({ t, lang }: { t: Dict; lang: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "VacationRental",
    name: site.name,
    description: t.meta.description,
    url: `${site.url}/${lang}`,
    image: [`${site.url}${photoSrc(heroPhoto)}`, ...galleryPhotos.slice(0, 5).map((p) => `${site.url}${photoSrc(p)}`)],
    telephone: site.phone,
    inLanguage: localeTag[lang],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressRegion: "Splitsko-dalmatinska",
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    checkinTime: site.checkIn,
    checkoutTime: site.checkOut,
    containsPlace: {
      "@type": "Accommodation",
      additionalType: "EntirePlace",
      occupancy: { "@type": "QuantitativeValue", value: site.maxGuests },
      numberOfBedrooms: site.bedrooms,
      numberOfBathroomsTotal: site.bathrooms,
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "privatePool", value: true },
        { "@type": "LocationFeatureSpecification", name: "hotTub", value: true },
        { "@type": "LocationFeatureSpecification", name: "freeParking", value: true },
        { "@type": "LocationFeatureSpecification", name: "airConditioning", value: true },
        { "@type": "LocationFeatureSpecification", name: "wifi", value: true },
        { "@type": "LocationFeatureSpecification", name: "petsAllowed", value: true },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.reviews.vrbo.score,
      bestRating: site.reviews.vrbo.outOf,
      ratingCount: site.reviews.vrbo.count,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
