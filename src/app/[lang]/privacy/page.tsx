import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, hasLocale } from "@/lib/i18n";
import { BookingProvider } from "@/components/site/booking-context";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDict(lang).privacyPage.title, alternates: { canonical: `/${lang}/privacy` } };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <BookingProvider>
      <Header t={t.nav} lang={lang} alwaysSolid />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-32 sm:px-6">
        <h1 className="font-serif text-5xl font-semibold">{t.privacyPage.title}</h1>
        <div className="mt-10 space-y-8">
          {t.privacyPage.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-serif text-2xl font-semibold">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}
        </div>
        <Link href={`/${lang}`} className="mt-12 inline-block font-semibold text-sea underline underline-offset-4">
          ← {t.privacyPage.back}
        </Link>
      </main>
      <Footer t={t} lang={lang} />
    </BookingProvider>
  );
}
