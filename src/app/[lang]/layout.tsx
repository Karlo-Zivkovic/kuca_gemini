import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Manrope } from "next/font/google";
import "../globals.css";
import { getDict, hasLocale, locales, localeTag } from "@/lib/i18n";
import { heroPhoto, photoSrc, site } from "@/lib/config";
import { Analytics } from "@/components/site/analytics";
import { ConsentBanner } from "@/components/site/consent-banner";

const serif = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-serif-display",
});
const sans = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#0f4c5c" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s · ${site.name}` },
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [localeTag[l], `/${l}`]),
        ["x-default", "/en"],
      ]),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      locale: localeTag[lang].replace("-", "_"),
      images: [{ url: photoSrc(heroPhoto), width: 2144, height: 992, alt: t.gallery.alts[heroPhoto] }],
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    // data-scroll-behavior: smooth scrolling for in-page links only, instant on page navigation.
    <html lang={localeTag[lang]} data-scroll-behavior="smooth" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        {children}
        <ConsentBanner t={t.cookies} lang={lang} />
        <Analytics gaId={site.gaId} />
      </body>
    </html>
  );
}
