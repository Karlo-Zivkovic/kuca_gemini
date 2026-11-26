"use client";

import { useRef } from "react";
import { CalendarDays, X } from "lucide-react";
import type { IsoRange } from "@/lib/calendar";
import { formatDate, nightsBetween } from "@/lib/dates";
import { localeTag, type Dict, type Locale } from "@/lib/i18n";
import type { DayPrice } from "@/lib/types";
import { BookingCalendar } from "./booking-calendar";
import { useStay } from "./booking-context";

/**
 * The inquiry form's dates: a button that opens the same availability calendar as the
 * "Availability" section, so guests can't ask for booked nights or a too-short stay.
 * The chosen dates live in the shared booking context and are submitted as hidden fields.
 */
export function DatesField({
  booked,
  prices,
  t,
  lang,
  error,
}: {
  booked: IsoRange[];
  prices: DayPrice[];
  t: Dict;
  lang: Locale;
  error?: string;
}) {
  const { arrival, departure } = useStay();
  const dialog = useRef<HTMLDialogElement>(null);
  const tag = localeTag[lang];
  const c = t.contact;

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;
  const nightsWord = () => {
    const form = new Intl.PluralRules(tag).select(nights);
    return form === "one" ? t.availability.night : form === "few" ? t.availability.nightsFew : t.availability.nights;
  };
  const sameYear = arrival.slice(0, 4) === departure.slice(0, 4);
  // Same year: show it once ("10 Dec → 16 Dec 2026"), so the summary fits a phone screen.
  const summary = !arrival
    ? null
    : departure
      ? `${formatDate(arrival, tag, sameYear ? { day: "numeric", month: "short" } : undefined)} → ${formatDate(departure, tag)}`
      : `${formatDate(arrival, tag)} → …`;

  const close = () => dialog.current?.close();

  return (
    <div className="sm:col-span-2">
      <span className="block text-sm font-medium">{c.dates}</span>
      <input type="hidden" name="arrival" value={arrival} />
      <input type="hidden" name="departure" value={departure} />
      <button
        id="dates-button"
        type="button"
        onClick={() => dialog.current?.showModal()}
        data-invalid={error ? true : undefined}
        aria-describedby={error ? "dates-error" : undefined}
        className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 text-left text-base outline-none transition hover:border-sea/40 focus-visible:border-sea focus-visible:ring-2 focus-visible:ring-sea/20 data-[invalid=true]:border-terracotta data-[invalid=true]:ring-2 data-[invalid=true]:ring-terracotta/20"
      >
        <CalendarDays className="size-5 shrink-0 text-sea" strokeWidth={1.75} />
        <span className="flex-1">
          <span className={`block ${summary ? "font-medium" : "text-muted"}`}>{summary ?? c.datesPick}</span>
          {nights > 0 && (
            <span className="block text-sm text-muted">
              {nights} {nightsWord()}
            </span>
          )}
        </span>
        {summary && <span className="shrink-0 text-sm font-semibold text-sea underline underline-offset-4">{c.datesChange}</span>}
      </button>
      {error && <span id="dates-error" className="mt-1 block text-xs font-medium text-terracotta-dark">{error}</span>}

      <dialog
        ref={dialog}
        aria-label={t.availability.title}
        // A click on the dark backdrop lands on the <dialog> itself: close.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[calc(100%-1.5rem)] max-w-3xl rounded-2xl bg-stone p-0 text-ink shadow-2xl backdrop:bg-black/50"
      >
        <div className="max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="font-serif text-2xl font-semibold">{t.availability.title}</h3>
            <button type="button" onClick={close} aria-label={t.floorPlan.close} className="rounded-full p-2 hover:bg-white">
              <X className="size-5" />
            </button>
          </div>
          <BookingCalendar booked={booked} prices={prices} t={t.availability} lang={lang} onDone={close} />
        </div>
      </dialog>
    </div>
  );
}
