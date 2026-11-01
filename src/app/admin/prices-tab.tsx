"use client";

import { createContext, use, useState, useTransition } from "react";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";
import { hr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { addDays } from "date-fns";
import { LoaderCircle, X } from "lucide-react";
import { useMediaQuery, useToday } from "@/lib/calendar";
import { site } from "@/lib/config";
import { formatDate, fromIso, nightsBetween, toIso } from "@/lib/dates";
import type { DayPrice } from "@/lib/types";
import { clearPrices, setPrices } from "./actions";

const eur = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtShort = (iso: string) => formatDate(iso, "hr-HR", { weekday: "short", day: "numeric", month: "numeric" });
const fmtDM = (iso: string) => formatDate(iso, "hr-HR", { day: "numeric", month: "numeric", year: "numeric" });

/** All days from `from` to `to`, both inclusive. */
const daysOf = (from: string, to: string) =>
  Array.from({ length: nightsBetween(from, to) + 1 }, (_, i) => toIso(addDays(fromIso(from), i)));

/** Consecutive days with the same price, merged into ranges for the overview list. */
function groupRanges(prices: DayPrice[]) {
  const ranges: { from: string; to: string; price: number }[] = [];
  for (const p of prices) {
    const last = ranges.at(-1);
    if (last && last.price === p.priceEur && toIso(addDays(fromIso(last.to), 1)) === p.day) last.to = p.day;
    else ranges.push({ from: p.day, to: p.day, price: p.priceEur });
  }
  return ranges;
}

const PriceContext = createContext<Map<string, number> | null>(null);

/** Day cell with that night's price (or a dash) underneath. */
function PriceDayButton(props: DayButtonProps) {
  const map = use(PriceContext);
  const { day, modifiers, children, ...rest } = props;
  const price = map?.get(toIso(day.date));
  return (
    <DayButton day={day} modifiers={modifiers} {...rest}>
      <span className="block leading-none">{children}</span>
      <span className="vg-price mt-1 block leading-none">{price !== undefined ? price : "–"}</span>
    </DayButton>
  );
}

export function PricesTab({ prices, setPricesState }: { prices: DayPrice[]; setPricesState: (p: DayPrice[]) => void }) {
  const today = useToday();
  const wide = useMediaQuery("(min-width: 700px)");
  const [month, setMonth] = useState<Date>();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (!today) return <p className="p-8 text-center text-muted">Učitavanje…</p>;

  const map = new Map(prices.map((p) => [p.day, p.priceEur]));
  const end = to || from;
  const selectedDays = from ? daysOf(from, end) : [];
  const selectedPrices = new Set(selectedDays.map((d) => map.get(d)));
  const ranges = groupRanges(prices.filter((p) => p.day >= today));

  const reset = () => {
    setFrom("");
    setTo("");
    setPrice("");
  };

  /** Select a single day or a range; prefill the price when the selection shares one. */
  const pick = (startDay: string, endDay: string) => {
    setFrom(startDay);
    setTo(endDay === startDay ? "" : endDay);
    setMsg(null);
    const ps = new Set(daysOf(startDay, endDay).map((d) => map.get(d)));
    const only = ps.size === 1 ? [...ps][0] : undefined;
    setPrice(only !== undefined ? String(only) : "");
  };

  // First tap = first night; second tap (later day) = last night; otherwise start over.
  const onDay = (day: Date) => {
    const iso = toIso(day);
    if (from && !to && iso > from) pick(from, iso);
    else pick(iso, iso);
  };

  const save = () =>
    start(async () => {
      const res = await setPrices(from, end, Number(price));
      setPricesState(res.prices);
      setMsg(res.ok ? { ok: true, text: "Cijena spremljena ✓" } : { ok: false, text: res.error ?? "Greška." });
      if (res.ok) reset();
    });

  const clear = () =>
    start(async () => {
      const res = await clearPrices(from, end);
      setPricesState(res.prices);
      setMsg(res.ok ? { ok: true, text: "Cijena uklonjena, datumi su sada „na upit” ✓" } : { ok: false, text: res.error ?? "Greška." });
      if (res.ok) reset();
    });

  const nights = selectedDays.length;
  const hasAnyPrice = [...selectedPrices].some((p) => p !== undefined);

  return (
    <div className="space-y-4 p-4">
      <p className="rounded-2xl bg-sea-light/60 p-4 text-sm">
        Cijena je <strong>po noći za cijelu kuću</strong>. Dodirnite prvu i zadnju noć (npr. 1.7. i 31.8.), upišite
        cijenu i spremite. Dani bez cijene na stranici pišu <strong>„na upit”</strong>. Minimalni boravak je{" "}
        {site.minNights} noćenja za cijelu godinu.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-2 sm:p-4">
        <PriceContext value={map}>
          <DayPicker
            mode="range"
            className="vg-calendar vg-priced mx-auto w-fit"
            locale={hr}
            weekStartsOn={1}
            numberOfMonths={wide ? 2 : 1}
            month={month ?? fromIso(today)}
            onMonthChange={setMonth}
            selected={from ? { from: fromIso(from), to: fromIso(end) } : undefined}
            onSelect={(_, day) => onDay(day)}
            modifiers={{ priced: prices.map((p) => fromIso(p.day)), past: { before: fromIso(today) } }}
            modifiersClassNames={{ priced: "vg-priced-day", past: "vg-past" }}
            components={{ DayButton: PriceDayButton }}
          />
        </PriceContext>
        <p className="mt-2 text-center text-xs text-muted">Broj ispod datuma = cijena po noći u € · „–” = na upit</p>
      </div>

      {msg && !from && (
        <p className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? "bg-olive/10 text-olive" : "bg-terracotta/10 text-terracotta-dark"}`}>
          {msg.text}
        </p>
      )}

      {from && (
        <div className="relative rounded-2xl border border-line bg-paper p-4 shadow-sm">
          <button onClick={reset} className="absolute right-2 top-2 rounded-full p-2 text-muted" aria-label="Zatvori">
            <X className="size-5" />
          </button>
          <p className="text-lg font-semibold">
            {to ? `${fmtShort(from)} → ${fmtShort(to)}` : fmtShort(from)}
          </p>
          <p className="text-sm text-muted">
            {nights} {nights === 1 ? "noć" : "noći"}
            {!to && " · dodirnite još jedan dan za raspon"}
            {selectedPrices.size > 1 && " · trenutno različite cijene"}
          </p>

          <label className="mt-4 block text-sm font-medium">
            Cijena po noći (€)
            <input
              inputMode="numeric"
              autoFocus
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="npr. 650"
              className="mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-lg outline-none focus:border-sea"
            />
          </label>
          {price && nights > 1 && (
            <p className="mt-1 text-sm text-muted">
              {nights} × {eur.format(Number(price))} = {eur.format(nights * Number(price))}
            </p>
          )}

          {msg && !msg.ok && <p className="mt-2 text-sm font-medium text-terracotta-dark">{msg.text}</p>}

          <button
            onClick={save}
            disabled={pending || !price}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sea py-3.5 text-lg font-semibold text-white disabled:opacity-40"
          >
            {pending && <LoaderCircle className="size-5 animate-spin" />}
            Spremi cijenu
          </button>
          {hasAnyPrice && (
            <button
              onClick={clear}
              disabled={pending}
              className="mt-3 w-full rounded-full border-2 border-line py-3 font-semibold text-muted hover:bg-sand"
            >
              Ukloni cijenu (na upit)
            </button>
          )}
        </div>
      )}

      <section>
        <h2 className="mb-2 mt-6 px-1 font-serif text-2xl font-semibold">Postavljene cijene</h2>
        {ranges.length === 0 ? (
          <p className="px-1 text-muted">Još nema cijena. Svi datumi su „na upit”.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {ranges.map((r) => (
              <li key={r.from}>
                <button
                  type="button"
                  onClick={() => {
                    pick(r.from, r.to);
                    setMonth(fromIso(r.from));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-sand"
                >
                  <span>
                    <span className="block font-medium">
                      {r.from === r.to ? fmtDM(r.from) : `${fmtDM(r.from)} – ${fmtDM(r.to)}`}
                    </span>
                    <span className="text-sm text-muted">
                      {nightsBetween(r.from, r.to) + 1} {nightsBetween(r.from, r.to) === 0 ? "noć" : "noći"}
                    </span>
                  </span>
                  <span className="font-serif text-xl font-semibold">{eur.format(r.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
