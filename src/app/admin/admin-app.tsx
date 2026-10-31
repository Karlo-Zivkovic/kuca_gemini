"use client";

import { useState, useTransition, type ReactNode } from "react";
import { DayPicker } from "react-day-picker";
import { hr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { CalendarDays, Euro, ExternalLink, LoaderCircle, LogOut, Plus, Trash2, X } from "lucide-react";
import { bookedMatchers, isNightBooked, rangeHasBookedNight, useMediaQuery, useToday } from "@/lib/calendar";
import { formatDate, fromIso, nightsBetween, toIso } from "@/lib/dates";
import type { Booking, Season } from "@/lib/types";
import { addBooking, deleteBooking, deleteSeason, logout, saveSeason } from "./actions";

const SOURCES = ["Airbnb", "Booking", "Vrbo", "Interhome", "Direktno", "Privatno"];
const fmt = (iso: string) => formatDate(iso, "hr-HR", { day: "numeric", month: "numeric", year: "numeric" });
const fmtShort = (iso: string) => formatDate(iso, "hr-HR", { weekday: "short", day: "numeric", month: "numeric" });

export function AdminApp({ initialBookings, initialSeasons }: { initialBookings: Booking[]; initialSeasons: Season[] }) {
  const [tab, setTab] = useState<"calendar" | "prices">("calendar");
  const [bookings, setBookings] = useState(initialBookings);
  const [seasons, setSeasons] = useState(initialSeasons);

  return (
    <div className="mx-auto min-h-dvh max-w-3xl pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="font-serif text-2xl font-semibold leading-none">Villa Gemini</p>
          <p className="text-xs text-muted">{tab === "calendar" ? "Zauzetost" : "Cijene"}</p>
        </div>
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" className="rounded-full p-2.5 text-muted hover:bg-stone" aria-label="Otvori stranicu">
            <ExternalLink className="size-5" />
          </a>
          <form action={logout}>
            <button className="rounded-full p-2.5 text-muted hover:bg-stone" aria-label="Odjava">
              <LogOut className="size-5" />
            </button>
          </form>
        </div>
      </header>

      {tab === "calendar" ? (
        <CalendarTab bookings={bookings} setBookings={setBookings} />
      ) : (
        <PricesTab seasons={seasons} setSeasons={setSeasons} />
      )}

      {/* Bottom tab bar, thumb-friendly. */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-2">
          {(
            [
              ["calendar", "Kalendar", CalendarDays],
              ["prices", "Cijene", Euro],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex flex-col items-center gap-1 py-3 text-sm font-semibold ${tab === key ? "text-sea" : "text-muted"}`}
            >
              <Icon className="size-6" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* --------------------------------- Calendar -------------------------------- */

function CalendarTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: (b: Booking[]) => void }) {
  const today = useToday();
  const wide = useMediaQuery("(min-width: 700px)");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [note, setNote] = useState("");
  const [opened, setOpened] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!today) return <p className="p-8 text-center text-muted">Učitavanje…</p>;

  const ranges = bookings.map((b) => ({ from: b.checkIn, to: b.checkOut }));
  const reset = () => {
    setArrival("");
    setDeparture("");
    setNote("");
    setError("");
  };

  const onDay = (day: Date) => {
    const iso = toIso(day);
    setError("");
    // Tap on a booked night (when not choosing a departure) opens that booking.
    if ((!arrival || departure) && isNightBooked(iso, ranges)) {
      reset();
      setOpened(bookings.find((b) => b.checkIn <= iso && iso < b.checkOut) ?? null);
      return;
    }
    setOpened(null);
    if (!arrival || departure || iso <= arrival) {
      setArrival(iso);
      setDeparture("");
      return;
    }
    if (rangeHasBookedNight(arrival, iso, ranges)) {
      setError("U tom terminu već postoji rezervacija.");
      return;
    }
    setDeparture(iso);
  };

  const save = () =>
    start(async () => {
      const res = await addBooking(arrival, departure, note);
      setBookings(res.bookings);
      if (res.ok) reset();
      else setError(res.error ?? "Greška pri spremanju.");
    });

  const remove = (b: Booking) => {
    if (!confirm(`Obrisati rezervaciju ${fmt(b.checkIn)} – ${fmt(b.checkOut)}? Datumi će ponovno biti slobodni.`)) return;
    start(async () => {
      const res = await deleteBooking(b.id);
      setBookings(res.bookings);
      setOpened(null);
    });
  };

  const upcoming = bookings.filter((b) => b.checkOut >= today);

  return (
    <div className="space-y-4 p-4">
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-2 sm:p-4">
        <DayPicker
          mode="range"
          className="vg-calendar vg-admin mx-auto w-fit"
          locale={hr}
          weekStartsOn={1}
          numberOfMonths={wide ? 2 : 1}
          defaultMonth={fromIso(today)}
          selected={arrival ? { from: fromIso(arrival), to: departure ? fromIso(departure) : undefined } : undefined}
          onSelect={(_, day) => onDay(day)}
          modifiers={{ booked: bookedMatchers(ranges), past: { before: fromIso(today) } }}
          modifiersClassNames={{ booked: "vg-booked", past: "vg-past" }}
        />
        <p className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-terracotta" /> zauzeto
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full border border-line" /> slobodno
          </span>
        </p>
      </div>

      {/* Action panel */}
      {opened ? (
        <Panel onClose={() => setOpened(null)}>
          <p className="text-sm text-muted">Rezervacija</p>
          <p className="mt-1 text-lg font-semibold">
            {fmtShort(opened.checkIn)} → {fmtShort(opened.checkOut)}
          </p>
          <p className="text-sm text-muted">{nightsBetween(opened.checkIn, opened.checkOut)} noćenja</p>
          {opened.note && <p className="mt-2 rounded-lg bg-sand px-3 py-2">{opened.note}</p>}
          <button
            onClick={() => remove(opened)}
            disabled={pending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-terracotta py-3 font-semibold text-terracotta-dark"
          >
            <Trash2 className="size-5" /> Obriši (oslobodi datume)
          </button>
        </Panel>
      ) : !arrival ? (
        <p className="rounded-2xl bg-sea-light/60 p-4 text-center">
          Dodirnite <strong>dan dolaska</strong> za novu rezervaciju,
          <br />
          ili dodirnite zauzeti dan da ga uredite.
        </p>
      ) : !departure ? (
        <Panel onClose={reset}>
          <p className="text-lg">
            Dolazak: <strong>{fmtShort(arrival)}</strong>
          </p>
          <p className="mt-1 text-muted">Sada dodirnite <strong>dan odlaska</strong>.</p>
          {error && <p className="mt-2 font-medium text-terracotta-dark">{error}</p>}
        </Panel>
      ) : (
        <Panel onClose={reset}>
          <p className="text-lg font-semibold">
            {fmtShort(arrival)} → {fmtShort(departure)}
          </p>
          <p className="text-sm text-muted">{nightsBetween(arrival, departure)} noćenja</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setNote((n) => (n.startsWith(s) ? n : `${s}${n ? ` – ${n}` : ""}`))}
                className={`rounded-full border px-3 py-1.5 text-sm ${note.startsWith(s) ? "border-sea bg-sea text-white" : "border-line"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bilješka (ime gosta, izvor…) – vidite je samo vi"
            className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-3 outline-none focus:border-sea"
          />
          {error && <p className="mt-2 font-medium text-terracotta-dark">{error}</p>}
          <button
            onClick={save}
            disabled={pending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-3.5 text-lg font-semibold text-white disabled:opacity-70"
          >
            {pending && <LoaderCircle className="size-5 animate-spin" />}
            Označi kao zauzeto
          </button>
        </Panel>
      )}

      {/* Upcoming list */}
      <section>
        <h2 className="mb-2 mt-6 px-1 font-serif text-2xl font-semibold">Nadolazeće rezervacije</h2>
        {upcoming.length === 0 ? (
          <p className="px-1 text-muted">Nema rezervacija.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {fmtShort(b.checkIn)} → {fmtShort(b.checkOut)}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {nightsBetween(b.checkIn, b.checkOut)} noćenja{b.note ? ` · ${b.note}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => remove(b)}
                  disabled={pending}
                  className="rounded-full p-2.5 text-muted hover:bg-stone hover:text-terracotta-dark"
                  aria-label="Obriši"
                >
                  <Trash2 className="size-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Panel({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="relative rounded-2xl border border-line bg-paper p-4 shadow-sm">
      <button onClick={onClose} className="absolute right-2 top-2 rounded-full p-2 text-muted" aria-label="Zatvori">
        <X className="size-5" />
      </button>
      {children}
    </div>
  );
}

/* ---------------------------------- Prices --------------------------------- */

type Draft = { id?: string; startsOn: string; endsOn: string; price: string; minNights: string };
const toDraft = (s: Season): Draft => ({
  id: s.id,
  startsOn: s.startsOn,
  endsOn: s.endsOn,
  price: s.priceEur ? String(s.priceEur) : "",
  minNights: String(s.minNights),
});

function PricesTab({ seasons, setSeasons }: { seasons: Season[]; setSeasons: (s: Season[]) => void }) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-4 p-4">
      <p className="rounded-2xl bg-sea-light/60 p-4 text-sm">
        Cijena je <strong>po noći za cijelu kuću</strong>. Ostavite cijenu praznom ako želite da piše „Cijena na
        upit”. Promjene se na stranici vide za nekoliko minuta.
      </p>
      {seasons.map((s) => (
        <SeasonCard key={s.id} draft={toDraft(s)} onSaved={setSeasons} />
      ))}
      {adding ? (
        <SeasonCard
          draft={{ startsOn: "", endsOn: "", price: "", minNights: "7" }}
          onSaved={(s) => {
            setSeasons(s);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-4 font-semibold text-sea"
        >
          <Plus className="size-5" /> Dodaj razdoblje
        </button>
      )}
    </div>
  );
}

function SeasonCard({
  draft: initial,
  onSaved,
  onCancel,
}: {
  draft: Draft;
  onSaved: (s: Season[]) => void;
  onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(d) !== JSON.stringify(initial);
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none focus:border-sea";

  const save = () =>
    start(async () => {
      const res = await saveSeason({
        id: d.id,
        startsOn: d.startsOn,
        endsOn: d.endsOn,
        priceEur: d.price.trim() ? Number(d.price) : null,
        minNights: Number(d.minNights),
      });
      setMsg(res.ok ? { ok: true, text: "Spremljeno ✓" } : { ok: false, text: res.error ?? "Greška." });
      if (res.ok) onSaved(res.seasons);
    });

  const remove = () => {
    if (!d.id) return onCancel?.();
    if (!confirm("Obrisati ovo razdoblje?")) return;
    start(async () => onSaved((await deleteSeason(d.id!)).seasons));
  };

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium">
          Od
          <input type="date" value={d.startsOn} onChange={(e) => setD({ ...d, startsOn: e.target.value })} className={field} />
        </label>
        <label className="text-sm font-medium">
          Do (uključivo)
          <input type="date" value={d.endsOn} min={d.startsOn} onChange={(e) => setD({ ...d, endsOn: e.target.value })} className={field} />
        </label>
        <label className="text-sm font-medium">
          Cijena / noć (€)
          <input
            inputMode="numeric"
            placeholder="na upit"
            value={d.price}
            onChange={(e) => setD({ ...d, price: e.target.value.replace(/[^\d]/g, "") })}
            className={field}
          />
        </label>
        <label className="text-sm font-medium">
          Min. noćenja
          <input
            inputMode="numeric"
            value={d.minNights}
            onChange={(e) => setD({ ...d, minNights: e.target.value.replace(/[^\d]/g, "") })}
            className={field}
          />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={save}
          disabled={pending || (!dirty && Boolean(d.id))}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-sea py-2.5 font-semibold text-white disabled:opacity-40"
        >
          {pending && <LoaderCircle className="size-4 animate-spin" />}
          Spremi
        </button>
        <button onClick={remove} disabled={pending} className="rounded-full p-2.5 text-muted hover:bg-stone" aria-label="Obriši razdoblje">
          <Trash2 className="size-5" />
        </button>
      </div>
      {msg && <p className={`mt-2 text-sm font-medium ${msg.ok ? "text-olive" : "text-terracotta-dark"}`}>{msg.text}</p>}
    </div>
  );
}
