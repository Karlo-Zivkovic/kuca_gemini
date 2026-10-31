"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { de, enGB, hr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { addMonths } from "date-fns";
import { bookedMatchers, isNightBooked, rangeHasBookedNight, useMediaQuery, useToday, type IsoRange } from "@/lib/calendar";
import { formatDate, fromIso, nightsBetween, toIso } from "@/lib/dates";
import { track } from "@/lib/consent";
import type { Dict, Locale } from "@/lib/i18n";
import { localeTag } from "@/lib/i18n";
import type { Season } from "@/lib/types";
import { useStay } from "./booking-context";

const dpLocale = { hr, en: enGB, de };

export function BookingCalendar({
  booked,
  seasons,
  t,
  lang,
}: {
  booked: IsoRange[];
  seasons: Season[];
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
  const season = arrival ? seasons.find((s) => s.startsOn <= arrival && arrival <= s.endsOn) : undefined;
  const tooShort = season && nights > 0 && nights < season.minNights;
  const tag = localeTag[lang];

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-3 sm:p-6">
        <DayPicker
          mode="range"
          className="vg-calendar mx-auto w-fit"
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
        />

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
            {tooShort && (
              <p className="mt-1 text-sm text-muted">{t.minStayNote.replace("{n}", String(season.minNights))}</p>
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
