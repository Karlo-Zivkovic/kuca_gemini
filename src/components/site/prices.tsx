import { CalendarCheck, Clock, Euro } from "lucide-react";
import { site } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/** Info card next to the calendar: minimum stay, how prices work, check-in/out. */
export function Prices({ t }: { t: Dict }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
      <h3 className="font-serif text-2xl font-semibold">{t.prices.title}</h3>

      <ul className="mt-4 space-y-3 text-[0.95rem]">
        <li className="flex gap-3">
          <CalendarCheck className="mt-0.5 size-5 shrink-0 text-sea" />
          <strong className="font-semibold">{t.prices.minStay.replace("{n}", String(site.minNights))}</strong>
        </li>
        <li className="flex gap-3">
          <Euro className="mt-0.5 size-5 shrink-0 text-sea" />
          <span className="text-muted">{t.prices.calendarHint}</span>
        </li>
      </ul>

      <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-muted">
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
