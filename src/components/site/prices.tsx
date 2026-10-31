import { Clock } from "lucide-react";
import { site } from "@/lib/config";
import { formatRange } from "@/lib/dates";
import { localeTag, type Dict, type Locale } from "@/lib/i18n";
import type { Season } from "@/lib/types";

export function Prices({ seasons, t, lang }: { seasons: Season[]; t: Dict; lang: Locale }) {
  const tag = localeTag[lang];
  const eur = new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  return (
    <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <h3 className="font-serif text-2xl font-semibold">{t.prices.title}</h3>

      {seasons.length === 0 ? (
        <p className="mt-4 text-muted">{t.prices.noSeasons}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {seasons.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{formatRange(s.startsOn, s.endsOn, tag)}</p>
                <p className="text-sm text-muted">
                  {t.prices.minStay} {s.minNights} {t.availability.nights}
                </p>
              </div>
              {s.priceEur ? (
                <p className="text-right">
                  <span className="font-serif text-2xl font-semibold">{eur.format(s.priceEur)}</span>
                  <span className="block text-xs text-muted">{t.prices.perNight}</span>
                </p>
              ) : (
                <p className="text-right text-sm font-medium text-muted">{t.prices.onRequest}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        {t.prices.notes.map((n) => (
          <li key={n}>· {n}</li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
        <p className="flex items-center gap-2">
          <Clock className="size-4 text-sea" />
          <span>
            {t.times.checkIn} <strong>{site.checkIn}</strong>
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Clock className="size-4 text-sea" />
          <span>
            {t.times.checkOut} <strong>{site.checkOut}</strong>
          </span>
        </p>
      </div>
    </div>
  );
}
