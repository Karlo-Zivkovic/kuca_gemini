"use client";

import { createContext, use, useState } from "react";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";
import { de, enGB, hr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { addDays, addMonths } from "date-fns";
import { bookedMatchers, isNightBooked, rangeHasBookedNight, useMediaQuery, useToday, type IsoRange } from "@/lib/calendar";
import { site } from "@/lib/config";
import { formatDate, fromIso, nightsBetween, toIso } from "@/lib/dates";
import { track } from "@/lib/consent";
import type { Dict, Locale } from "@/lib/i18n";
import { localeTag } from "@/lib/i18n";
import type { DayPrice } from "@/lib/types";
import { useStay } from "./booking-context";

const dpLocale = { hr, en: enGB, de };

/** Formats a price the local way: "€650" in English, "650 €" in Croatian/German. */
const euro = (tag: string) =>
  new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

type PriceInfo = { priceOf: (iso: string) => number | undefined; format: (n: number) => string };
const PriceContext = createContext<PriceInfo | null>(null);

/** Day cell: the date number, with that night's price underneath on free days. */
function PricedDayButton(props: DayButtonProps) {
  const info = use(PriceContext);
  const { day, modifiers, children, ...rest } = props;
  const price = info && !modifiers.booked && !modifiers.disabled ? info.priceOf(toIso(day.date)) : undefined;
  return (
    <DayButton day={day} modifiers={modifiers} {...rest}>
      <span className="block leading-none">{children}</span>
      {price !== undefined && <span className="vg-price mt-1 block leading-none">{info!.format(price)}</span>}
    </DayButton>
  );
}

export function BookingCalendar({
  booked,
  prices,
  t,
  lang,
}: {
  booked: IsoRange[];
  prices: DayPrice[];
  t: Dict["availability"];
  lang: Locale;
}) {
  const today = useToday();
  const twoMonths = useMediaQuery("(min-width: 768px)");
  const { arrival, departure, setStay } = useStay();
  const [error, setError] = useState("");

  if (!today) {
    return <div className="grid h-96 place-items-center text-muted">{t.loading}</div>;
  }

  const tag = localeTag[lang];
  const priceMap = new Map(prices.map((p) => [p.day, p.priceEur]));
  const fmt = euro(tag);
  const priceInfo: PriceInfo = { priceOf: (iso) => priceMap.get(iso), format: (n) => fmt.format(n) };

  const select = (day: Date) => {
    const iso = toIso(day);
    if (iso < today) return;
    setError("");
    const startNew = () => {
      if (isNightBooked(iso, booked)) return;
      setStay({ arrival: iso, departure: "" });
    };

    if (!arrival || departure) return startNew();
    if (iso <= arrival) return startNew();
    if (rangeHasBookedNight(arrival, iso, booked)) {
      setError(t.conflict);
      return startNew();
    }
    setStay({ arrival, departure: iso });
    track("dates_selected", { arrival, departure: iso, nights: nightsBetween(arrival, iso) });
  };

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;
  const tooShort = nights > 0 && nights < site.minNights;

  // Estimate: sum of the nightly prices from arrival up to (not including) departure.
  let total = 0;
  let unpriced = 0;
  for (let i = 0; i < nights; i++) {
    const p = priceMap.get(toIso(addDays(fromIso(arrival), i)));
    if (p === undefined) unpriced++;
    else total += p;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-3 sm:p-6">
        <PriceContext value={priceInfo}>
          <DayPicker
            mode="range"
            className="vg-calendar vg-priced mx-auto w-fit"
            locale={dpLocale[lang]}
            weekStartsOn={1}
            numberOfMonths={twoMonths ? 2 : 1}
            startMonth={fromIso(today)}
            endMonth={addMonths(fromIso(today), 24)}
            defaultMonth={arrival ? fromIso(arrival) : fromIso(today)}
            selected={arrival ? { from: fromIso(arrival), to: departure ? fromIso(departure) : undefined } : undefined}
            onSelect={(_, day) => select(day)}
            disabled={{ before: fromIso(today) }}
            modifiers={{ booked: bookedMatchers(booked) }}
            modifiersClassNames={{ booked: "vg-booked", disabled: "vg-past" }}
            components={{ DayButton: PricedDayButton }}
          />
        </PriceContext>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          <Legend className="border border-line bg-paper" label={t.free} />
          <Legend className="bg-terracotta/15 line-through" label={t.booked} />
          <Legend className="bg-sea" label={t.selected} />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-sea-light/60 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5" aria-live="polite">
        {error ? (
          <p className="font-medium text-terracotta-dark">{error}</p>
        ) : !arrival ? (
          <p className="font-medium">{t.pickArrival}</p>
        ) : !departure ? (
          <p className="font-medium">
            {t.arrival}: <strong>{formatDate(arrival, tag)}</strong> · {t.pickDeparture}
          </p>
        ) : (
          <div>
            <p className="font-medium">
              {formatDate(arrival, tag)} → {formatDate(departure, tag)} ·{" "}
              <strong>
                {nights} {nights === 1 ? t.night : t.nights}
              </strong>
            </p>
            {unpriced === 0 ? (
              <p className="mt-1">
                {t.total}: <strong className="font-serif text-xl">{fmt.format(total)}</strong>
                <span className="ml-2 text-sm text-muted">{t.totalNote}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">{unpriced === nights ? t.allOnRequest : t.partlyOnRequest}</p>
            )}
            {tooShort && <p className="mt-1 text-sm text-muted">{t.minStayNote.replace("{n}", String(site.minNights))}</p>}
          </div>
        )}
        <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
          {arrival && (
            <button
              type="button"
              onClick={() => {
                setStay({ arrival: "", departure: "" });
                setError("");
              }}
              className="rounded-full border border-sea/30 px-4 py-2 text-sm font-medium hover:bg-white"
            >
              {t.clear}
            </button>
          )}
          {departure && (
            <a href="#contact" className="rounded-full bg-terracotta px-5 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark">
              {t.continue}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block size-4 rounded-full ${className}`} aria-hidden />
      {label}
    </span>
  );
}
