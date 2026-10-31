"use client";

import Link from "next/link";
import { setConsent, useConsent } from "@/lib/consent";
import type { Dict, Locale } from "@/lib/i18n";

export function ConsentBanner({ t, lang }: { t: Dict["cookies"]; lang: Locale }) {
  const consent = useConsent();
  if (consent !== null) return null; // undefined = not hydrated yet, string = decided

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-paper p-4 shadow-xl sm:p-5"
    >
      <p className="text-sm leading-relaxed text-muted">
        {t.text}{" "}
        <Link href={`/${lang}/privacy`} className="underline underline-offset-2 hover:text-ink">
          {t.more}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setConsent("denied")}
          className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-stone"
        >
          {t.decline}
        </button>
        <button
          type="button"
          onClick={() => setConsent("granted")}
          className="rounded-full bg-sea px-5 py-2 text-sm font-semibold text-white hover:bg-sea-dark"
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
