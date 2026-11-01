"use client";

import { useState, useTransition } from "react";
import { CalendarDays, Euro, ExternalLink, LoaderCircle, LogOut, Plus, Trash2 } from "lucide-react";
import type { Booking, Season } from "@/lib/types";
import { deleteSeason, logout, saveSeason } from "./actions";
import { CalendarTab } from "./calendar-tab";

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
