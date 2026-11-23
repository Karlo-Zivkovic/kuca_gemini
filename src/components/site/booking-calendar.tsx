"use client";

import { createContext, use, useState } from "react";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";
import { cs, de, enGB, fr, hr, nb, pl, sv } from "react-day-picker/locale";
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

const dpLocale = { hr, en: enGB, de, pl, fr, cs, no: nb, sv };

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
  const [hover, setHover] = useState(""); // day under the mouse (desktop), for the range preview

  if (!today) {
    return <div className="grid h-96 place-items-center text-muted">{t.loading}</div>;
  }

  const tag = localeTag[lang];
  const priceMap = new Map(prices.map((p) => [p.day, p.priceEur]));
  const fmt = euro(tag);
  const priceInfo: PriceInfo = { priceOf: (iso) => priceMap.get(iso), format: (n) => fmt.format(n) };

  const minNights = site.minNights;
  const short = (x: string) => formatDate(x, tag, { day: "numeric", month: "short" });
  /** First booked night after `day`, if any. */
  const nextBookedAfter = (day: string) => booked.map((r) => r.from).filter((f) => f > day).sort()[0];
  /** An arrival needs at least `minNights` free nights before the next booking. */
  const roomFrom = (day: string) => {
    const next = nextBookedAfter(day);
    return !next || nightsBetween(day, next) >= minNights;
  };

  const select = (day: Date) => {
    const iso = toIso(day);
    if (iso < today) return;
    setError("");
    const gapError = () => setError(t.gapTooShort.replace("{date}", short(iso)).replace("{n}", String(minNights)));
    const startNew = () => {
      if (isNightBooked(iso, booked)) return;
      if (!roomFrom(iso)) return gapError();
      setStay({ arrival: iso, departure: "" });
    };

    if (!arrival || departure) return startNew();
    if (iso <= arrival) return startNew();
    if (rangeHasBookedNight(arrival, iso, booked)) {
      // The tapped day can't be the departure. If it's free, it becomes the new arrival: say so,
      // otherwise it looks as if the tapped (free) day itself were booked.
      if (isNightBooked(iso, booked)) {
        setError(t.conflict);
        return;
      }
      if (!roomFrom(iso)) return gapError();
      setError(t.conflictNewArrival.replaceAll("{from}", short(arrival)).replaceAll("{to}", short(iso)));
      return startNew();
    }
    if (nightsBetween(arrival, iso) < minNights) {
      const earliest = toIso(addDays(fromIso(arrival), minNights));
      setError(t.minStayPick.replace("{n}", String(minNights)).replace("{date}", short(earliest)));
      return;
    }
    setStay({ arrival, departure: iso });
    track("dates_selected", { arrival, departure: iso, nights: nightsBetween(arrival, iso) });
  };

  // While choosing the departure: which days can end the stay, and a preview up to the hovered day.
  const choosing = Boolean(arrival && !departure);
  const nextBooking = choosing ? booked.map((r) => r.from).filter((f) => f > arrival).sort()[0] : undefined;
  const lastDeparture = nextBooking ? fromIso(nextBooking) : addMonths(fromIso(today), 24);
  const firstDeparture = choosing ? addDays(fromIso(arrival), site.minNights) : undefined;
  const hoverValid =
    choosing &&
    hover > arrival &&
    nightsBetween(arrival, hover) >= site.minNights &&
    !rangeHasBookedNight(arrival, hover, booked);
  const choosingModifiers = choosing
    ? {
        canDepart: { from: firstDeparture!, to: lastDeparture },
        cannotDepart: [
          { from: addDays(fromIso(arrival), 1), to: addDays(firstDeparture!, -1) },
          ...(nextBooking ? [{ after: lastDeparture }] : []),
        ],
        preview: hoverValid ? { from: addDays(fromIso(arrival), 1), to: fromIso(hover) } : [],
        previewBad: hover > arrival && !hoverValid ? fromIso(hover) : [],
      }
    : { canDepart: [], cannotDepart: [], preview: [], previewBad: [] };
  // Before an arrival is chosen: fade the free days right before a booking where a stay can't
  // start, because fewer than minNights free nights follow.
  const noArrival = choosing
    ? []
    : booked.map((r) => ({ from: addDays(fromIso(r.from), -(site.minNights - 1)), to: addDays(fromIso(r.from), -1) }));

  const nights = arrival && departure ? nightsBetween(arrival, departure) : 0;

  // Estimate: sum of the nightly prices from arrival up to (not including) departure.
  let total = 0;
  const nightPrices: number[] = [];
  for (let i = 0; i < nights; i++) {
    const p = priceMap.get(toIso(addDays(fromIso(arrival), i)));
    if (p !== undefined) {
      total += p;
      nightPrices.push(p);
    }
  }
  const priced = nightPrices.length;
  const unpriced = nights - priced;
  const samePrice = priced > 0 && nightPrices.every((p) => p === nightPrices[0]);
  // one / few (2–4, e.g. pl "2 noce", cs "3 noci") / everything else ("5 nocy").
  const nightsWord = (n: number) => {
    const form = new Intl.PluralRules(tag).select(n);
    return form === "one" ? t.night : form === "few" ? t.nightsFew : t.nights;
  };

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
            onDayMouseEnter={(d) => setHover(toIso(d))}
            onDayMouseLeave={() => setHover("")}
            modifiers={{ booked: bookedMatchers(booked), noArrival, ...choosingModifiers }}
            modifiersClassNames={{
              booked: "vg-booked",
              disabled: "vg-past",
              noArrival: "vg-no-arrival",
              canDepart: "vg-can-depart",
              cannotDepart: "vg-cannot-depart",
              preview: "vg-preview",
              previewBad: "vg-preview-bad",
            }}
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
                {nights} {nightsWord(nights)}
              </strong>
            </p>
            {unpriced === 0 ? (
              <>
                <p className="mt-1">
                  {t.total}: <strong className="font-serif text-2xl">{fmt.format(total)}</strong>
                </p>
                <p className="text-sm text-muted">
                  {samePrice
                    ? `${nights} ${nightsWord(nights)} × ${fmt.format(nightPrices[0])}`
                    : t.avgPerNight.replace("{price}", fmt.format(Math.round(total / nights)))}
                  {" · "}
                  {t.totalNote}
                </p>
              </>
            ) : priced > 0 ? (
              <>
                <p className="mt-1">
                  {t.pricedNights.replace("{k}", String(priced)).replace("{n}", String(nights))}:{" "}
                  <strong className="font-serif text-xl">{fmt.format(total)}</strong>
                </p>
                <p className="text-sm text-muted">{t.partlyOnRequest}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">{t.allOnRequest}</p>
            )}
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
