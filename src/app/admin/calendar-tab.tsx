"use client";

import { createContext, use, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { DayButton, DayPicker, type DayButtonProps } from "react-day-picker";
import { hr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { ChevronDown, LoaderCircle, Phone, Trash2, Users, X } from "lucide-react";
import { rangeHasBookedNight, useMediaQuery, useToday } from "@/lib/calendar";
import { formatDate, fromIso, nightsBetween, toIso } from "@/lib/dates";
import { emptyDetails, type Booking, type BookingDetails } from "@/lib/types";
import { addBooking, deleteBooking, updateBookingDetails } from "./actions";

const SOURCES = ["Airbnb", "Booking", "Vrbo", "Interhome", "Direktno", "Privatno"];
const fmt = (iso: string) => formatDate(iso, "hr-HR", { day: "numeric", month: "numeric", year: "numeric" });
const fmtShort = (iso: string) => formatDate(iso, "hr-HR", { weekday: "short", day: "numeric", month: "numeric" });
const fmtDayMonth = (iso: string) => formatDate(iso, "hr-HR", { day: "numeric", month: "numeric" });

/** "Michael (Njemačka) · Booking", falling back to the note, then "Bez imena". */
function label(b: Booking) {
  const who = b.guestName ? b.guestName + (b.guestCountry ? ` (${b.guestCountry})` : "") : b.guestCountry;
  return [who, b.source].filter(Boolean).join(" · ") || b.note || "Bez imena";
}

const detailsOf = (b: Booking): BookingDetails => ({
  guestName: b.guestName,
  guestCountry: b.guestCountry,
  source: b.source,
  guests: b.guests,
  phone: b.phone,
  note: b.note,
});

/* ---------------------------------- Colours --------------------------------- */

// Colours that all carry white text, ordered by hue so that neighbours in this
// list look alike and colours two or more steps apart look clearly different.
const PALETTE = ["#be123c", "#c2410c", "#a16207", "#15803d", "#0f766e", "#2563eb", "#7c3aed"];

/** Steps between two palette positions, going round the colour wheel. */
const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % PALETTE.length;
  return Math.min(d, PALETTE.length - d);
};

const hash = (s: string) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
};

/**
 * Colour per booking: derived from its id (so it mostly stays put when other
 * bookings change), then moved along the palette until it is clearly different
 * from the booking just before it.
 */
function assignColors(bookings: Booking[]) {
  const sorted = [...bookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const colors = new Map<string, string>();
  let prev: number | null = null;
  for (const b of sorted) {
    let i = hash(b.id) % PALETTE.length;
    while (prev !== null && hueDistance(i, prev) < 2) i = (i + 1) % PALETTE.length;
    colors.set(b.id, PALETTE[i]);
    prev = i;
  }
  return colors;
}

/* ------------------------------- Day rendering ------------------------------ */

type Paint = {
  night?: Booking; // booking that sleeps here this night
  depart?: Booking; // booking that leaves this morning
  color: (b: Booking) => string;
  openedId?: string;
};

const PaintContext = createContext<((iso: string) => Paint) | null>(null);

/**
 * A day is coloured by its bookings:
 * - booked night → full circle in that booking's colour
 * - departure morning → top-left half in the departing booking's colour
 * - changeover (one leaves, one arrives) → both halves, one colour each
 */
function BookingDayButton(props: DayButtonProps) {
  const paintFor = use(PaintContext);
  const { day, modifiers } = props;
  if (!paintFor || modifiers.selected) return <DayButton {...props} />;

  const { night, depart, color, openedId } = paintFor(toIso(day.date));
  if (!night && !depart) return <DayButton {...props} />;

  const nightColor = night && color(night);
  const departColor = depart && color(depart);
  const background =
    nightColor && departColor
      ? `linear-gradient(135deg, ${departColor} 0 50%, ${nightColor} 50%)`
      : nightColor
        ? nightColor
        : `linear-gradient(135deg, ${departColor} 0 50%, transparent 50%)`;

  const opened = [night, depart].find((b) => b && b.id === openedId);
  const dimmed = Boolean(openedId) && !opened;

  return (
    <DayButton
      {...props}
      style={{
        ...props.style,
        background,
        color: nightColor ? "#fff" : "var(--color-ink)",
        fontWeight: 600,
        textShadow: nightColor
          ? "0 1px 2px rgb(0 0 0 / 0.35)"
          : "0 0 2px var(--color-paper), 0 0 4px var(--color-paper)",
        boxShadow: opened ? `0 0 0 2px var(--color-paper), 0 0 0 4px ${color(opened)}` : undefined,
        opacity: dimmed ? 0.4 : undefined,
      }}
    />
  );
}

/* --------------------------------- Calendar --------------------------------- */

type Popover = { bookingId: string; left: number; top: number };
const POPOVER_W = 264;

export function CalendarTab({ bookings, setBookings }: { bookings: Booking[]; setBookings: (b: Booking[]) => void }) {
  const today = useToday();
  const wide = useMediaQuery("(min-width: 700px)");
  const [month, setMonth] = useState<Date>();
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [details, setDetails] = useState<BookingDetails>(emptyDetails);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [popover, setPopover] = useState<Popover | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(() => assignColors(bookings), [bookings]);
  const color = (b: Booking) => colors.get(b.id) ?? PALETTE[0];

  // Close the popover on a tap anywhere outside it (taps on days handle themselves).
  useEffect(() => {
    if (!popover) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-popover]") && !t.closest(".rdp-day_button")) setPopover(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [popover]);

  if (!today) return <p className="p-8 text-center text-muted">Učitavanje…</p>;

  const opened = bookings.find((b) => b.id === openedId) ?? null;
  const popoverBooking = popover ? bookings.find((b) => b.id === popover.bookingId) : undefined;

  const ranges = bookings.map((b) => ({ from: b.checkIn, to: b.checkOut }));
  const bookingOn = (iso: string) => bookings.find((b) => b.checkIn <= iso && iso < b.checkOut);
  const paintFor = (iso: string): Paint => ({
    night: bookingOn(iso),
    depart: bookings.find((b) => b.checkOut === iso),
    color,
    openedId: openedId ?? undefined,
  });

  // Bookings touching the months on screen, for the legend.
  const months = wide ? 2 : 1;
  const viewStart = startOfMonth(month ?? fromIso(today));
  const viewEnd = endOfMonth(addMonths(viewStart, months - 1));
  const inView = bookings.filter((b) => b.checkIn <= toIso(viewEnd) && b.checkOut >= toIso(viewStart));

  const resetSelection = () => {
    setArrival("");
    setDeparture("");
    setDetails(emptyDetails);
    setError("");
  };

  const openBooking = (b: Booking, anchor?: HTMLElement | null) => {
    resetSelection();
    setOpenedId(b.id);
    const card = cardRef.current;
    if (anchor && card) {
      // Place the popover just under the tapped day, kept inside the card.
      const a = anchor.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const centre = a.left - c.left + a.width / 2;
      const left = Math.min(Math.max(centre - POPOVER_W / 2, 8), c.width - POPOVER_W - 8);
      setPopover({ bookingId: b.id, left, top: a.bottom - c.top + 8 });
    } else {
      setPopover(null);
    }
  };

  /**
   * Tap rules:
   * - arrival chosen, later day, no booked night in between → it becomes the departure
   *   (also when that day is another booking's arrival day: guests swap that morning)
   * - booked night otherwise → open that booking (popover + editable panel)
   * - arrival chosen, free day but a booking in between → explain the latest possible departure
   * - free day otherwise → it becomes the (new) arrival
   */
  const onDay = (day: Date, anchor: HTMLElement | null) => {
    const iso = toIso(day);
    setError("");
    setPopover(null);
    const choosingDeparture = Boolean(arrival && !departure && iso > arrival);

    if (choosingDeparture && !rangeHasBookedNight(arrival, iso, ranges)) {
      setOpenedId(null);
      setDeparture(iso);
      return;
    }

    const booked = bookingOn(iso);
    if (booked) {
      openBooking(booked, anchor);
      return;
    }

    if (choosingDeparture) {
      const next = bookings.find((b) => b.checkIn >= arrival && b.checkIn < iso);
      setError(
        next
          ? `Između je već rezervacija (${fmtShort(next.checkIn)} → ${fmtShort(next.checkOut)}). Odlazak može biti najkasnije ${fmtShort(next.checkIn)}.`
          : "U tom razdoblju već postoji rezervacija.",
      );
      return;
    }

    setOpenedId(null);
    setArrival(iso);
    setDeparture("");
  };

  const save = () =>
    start(async () => {
      const res = await addBooking(arrival, departure, details);
      setBookings(res.bookings);
      if (res.ok) resetSelection();
      else setError(res.error ?? "Greška pri spremanju.");
    });

  const remove = (b: Booking) => {
    if (!confirm(`Obrisati rezervaciju ${fmt(b.checkIn)} – ${fmt(b.checkOut)}? Datumi će ponovno biti slobodni.`)) return;
    start(async () => {
      const res = await deleteBooking(b.id);
      setBookings(res.bookings);
      setOpenedId(null);
      setPopover(null);
    });
  };

  const upcoming = bookings.filter((b) => b.checkOut >= today);

  return (
    <div className="space-y-4 p-4">
      {/* Outer wrapper is the popover's positioning context (the inner one scrolls on narrow screens). */}
      <div ref={cardRef} className="relative">
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-2 sm:p-4">
          <PaintContext value={paintFor}>
            <DayPicker
              mode="range"
              className="vg-calendar vg-admin mx-auto w-fit"
              locale={hr}
              weekStartsOn={1}
              numberOfMonths={months}
              month={month ?? fromIso(today)}
              onMonthChange={(m) => {
                setMonth(m);
                setPopover(null);
              }}
              selected={arrival ? { from: fromIso(arrival), to: departure ? fromIso(departure) : undefined } : undefined}
              onSelect={(_, day, __, e) => onDay(day, (e.target as HTMLElement).closest("button"))}
              modifiers={{ past: { before: fromIso(today) } }}
              modifiersClassNames={{ past: "vg-past" }}
              components={{ DayButton: BookingDayButton }}
            />
          </PaintContext>

          {/* Legend: who is who in the months on screen */}
          <div className="mt-3 border-t border-line px-2 pt-3">
            {inView.length === 0 ? (
              <p className="text-center text-sm text-muted">Nema rezervacija u ovom razdoblju.</p>
            ) : (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {inView.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => openBooking(b)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-sand ${
                        openedId === b.id ? "bg-sand" : ""
                      }`}
                    >
                      <span className="size-3.5 shrink-0 rounded-full" style={{ background: color(b) }} />
                      <span className="min-w-0 flex-1 truncate font-medium">{label(b)}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {fmtDayMonth(b.checkIn)}–{fmtDayMonth(b.checkOut)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-center text-xs text-muted">
              Pola kruga = dan odlaska (gosti odlaze ujutro, novi mogu doći popodne)
            </p>
          </div>
        </div>

        {popover && popoverBooking && (
          <BookingPopover
            booking={popoverBooking}
            color={color(popoverBooking)}
            style={{ left: popover.left, top: popover.top, width: POPOVER_W }}
            onClose={() => setPopover(null)}
            onEdit={() => {
              setPopover(null);
              panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        )}
      </div>

      {/* Action panel */}
      <div ref={panelRef} className="scroll-mt-20">
        {opened ? (
          <EditBookingPanel
            key={opened.id + opened.checkIn}
            booking={opened}
            color={color(opened)}
            pending={pending}
            onClose={() => {
              setOpenedId(null);
              setPopover(null);
            }}
            onSave={(d) =>
              new Promise<boolean>((resolve) =>
                start(async () => {
                  const res = await updateBookingDetails(opened.id, d);
                  setBookings(res.bookings);
                  resolve(res.ok);
                }),
              )
            }
            onDelete={() => remove(opened)}
          />
        ) : !arrival ? (
          <p className="rounded-2xl bg-sea-light/60 p-4 text-center">
            Dodirnite <strong>dan dolaska</strong> za novu rezervaciju,
            <br />
            ili dodirnite obojeni dan da vidite rezervaciju.
          </p>
        ) : !departure ? (
          <Panel onClose={resetSelection}>
            <p className="text-lg">
              Dolazak: <strong>{fmtShort(arrival)}</strong>
            </p>
            <p className="mt-1 text-muted">
              Sada dodirnite <strong>dan odlaska</strong>.
            </p>
            {error && <p className="mt-2 font-medium text-terracotta-dark">{error}</p>}
          </Panel>
        ) : (
          <Panel onClose={resetSelection}>
            <p className="text-lg font-semibold">
              {fmtShort(arrival)} → {fmtShort(departure)}
            </p>
            <p className="text-sm text-muted">{nightsBetween(arrival, departure)} noćenja</p>
            <DetailsFields value={details} onChange={setDetails} />
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
      </div>

      {/* Upcoming list */}
      <section>
        <h2 className="mb-2 mt-6 px-1 font-serif text-2xl font-semibold">Nadolazeće rezervacije</h2>
        {upcoming.length === 0 ? (
          <p className="px-1 text-muted">Nema rezervacija.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                <span className="size-3.5 shrink-0 rounded-full" style={{ background: color(b) }} />
                <button
                  type="button"
                  onClick={() => {
                    openBooking(b);
                    setMonth(startOfMonth(fromIso(b.checkIn)));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate font-semibold">{label(b)}</p>
                  <p className="truncate text-sm text-muted">
                    {fmtShort(b.checkIn)} → {fmtShort(b.checkOut)} · {nightsBetween(b.checkIn, b.checkOut)} noćenja
                    {b.guests ? ` · ${b.guests} gostiju` : ""}
                  </p>
                </button>
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

/* --------------------------------- Popover ---------------------------------- */

/** Read-only summary that appears under a tapped booked day. */
function BookingPopover({
  booking: b,
  color,
  style,
  onClose,
  onEdit,
}: {
  booking: Booking;
  color: string;
  style: React.CSSProperties;
  onClose: () => void;
  onEdit: () => void;
}) {
  const named = Boolean(b.guestName || b.guestCountry || b.source);
  return (
    <div
      data-popover
      role="dialog"
      aria-label="Rezervacija"
      style={style}
      className="absolute z-30 rounded-2xl border border-line bg-paper p-4 shadow-xl"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-1 size-3.5 shrink-0 rounded-full" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{named ? label(b) : "Bez imena"}</p>
          <p className="text-sm text-muted">
            {fmtShort(b.checkIn)} → {fmtShort(b.checkOut)} · {nightsBetween(b.checkIn, b.checkOut)} noćenja
          </p>
        </div>
        <button onClick={onClose} className="-mr-1 -mt-1 rounded-full p-1.5 text-muted" aria-label="Zatvori">
          <X className="size-4" />
        </button>
      </div>

      {(b.guests || b.phone || b.note) && (
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          {b.guests && (
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted" />
              <dd>{b.guests} gostiju</dd>
            </div>
          )}
          {b.phone && (
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted" />
              <dd>
                <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="font-medium text-sea underline underline-offset-2">
                  {b.phone}
                </a>
              </dd>
            </div>
          )}
          {b.note && <dd className="rounded-lg bg-sand px-2.5 py-1.5">{b.note}</dd>}
        </dl>
      )}

      <button
        onClick={onEdit}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-line py-2 text-sm font-semibold hover:bg-sand"
      >
        Uredi podatke <ChevronDown className="size-4" />
      </button>
    </div>
  );
}

/* ------------------------------ Edit / details ------------------------------ */

function EditBookingPanel({
  booking,
  color,
  pending,
  onClose,
  onSave,
  onDelete,
}: {
  booking: Booking;
  color: string;
  pending: boolean;
  onClose: () => void;
  onSave: (d: BookingDetails) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<BookingDetails>(detailsOf(booking));
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(detailsOf(booking));

  return (
    <Panel onClose={onClose}>
      <p className="flex items-center gap-2 text-sm text-muted">
        <span className="size-3 rounded-full" style={{ background: color }} /> Rezervacija
      </p>
      <p className="mt-1 text-lg font-semibold">
        {fmtShort(booking.checkIn)} → {fmtShort(booking.checkOut)}
      </p>
      <p className="text-sm text-muted">{nightsBetween(booking.checkIn, booking.checkOut)} noćenja</p>

      <DetailsFields
        value={draft}
        onChange={(d) => {
          setDraft(d);
          setSaved(false);
        }}
      />

      <button
        onClick={async () => setSaved(await onSave(draft))}
        disabled={pending || !dirty}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sea py-3 font-semibold text-white disabled:opacity-40"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        {saved && !dirty ? "Spremljeno ✓" : "Spremi promjene"}
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-terracotta py-3 font-semibold text-terracotta-dark"
      >
        <Trash2 className="size-5" /> Obriši (oslobodi datume)
      </button>
    </Panel>
  );
}

/** Optional guest fields, shared by "new booking" and "edit booking". */
function DetailsFields({ value: d, onChange }: { value: BookingDetails; onChange: (d: BookingDetails) => void }) {
  const set = <K extends keyof BookingDetails>(key: K, v: BookingDetails[K]) => onChange({ ...d, [key]: v });
  const field = "mt-1 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 font-normal outline-none focus:border-sea";

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-muted">Sve je neobavezno. Podatke vidite samo vi, gosti vide samo zauzete datume.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Ime gosta
          <input value={d.guestName} onChange={(e) => set("guestName", e.target.value)} placeholder="npr. Michael" className={field} />
        </label>
        <label className="text-sm font-medium">
          Odakle
          <input value={d.guestCountry} onChange={(e) => set("guestCountry", e.target.value)} placeholder="npr. Njemačka" className={field} />
        </label>
        <label className="text-sm font-medium">
          Broj gostiju
          <input
            inputMode="numeric"
            value={d.guests ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/[^\d]/g, ""));
              set("guests", n > 0 ? Math.min(n, 50) : null);
            }}
            placeholder="npr. 8"
            className={field}
          />
        </label>
        <label className="text-sm font-medium">
          Telefon
          <input
            type="tel"
            inputMode="tel"
            value={d.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="npr. +49 170 1234567"
            className={field}
          />
        </label>
      </div>

      <p className="mt-3 text-sm font-medium">Izvor</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SOURCES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => set("source", d.source === s ? "" : s)}
            className={`rounded-full border px-3 py-1.5 text-sm ${d.source === s ? "border-sea bg-sea text-white" : "border-line"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm font-medium">
        Bilješka
        <textarea
          value={d.note}
          onChange={(e) => set("note", e.target.value)}
          rows={2}
          placeholder="npr. dolaze kasno navečer, trebaju dječji krevetić"
          className={field}
        />
      </label>
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
