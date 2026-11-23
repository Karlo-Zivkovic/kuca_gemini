"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Euro, ExternalLink, LogOut } from "lucide-react";
import type { Booking, DayPrice } from "@/lib/types";
import { loadAdminData, logout } from "./actions";
import { goToLogin } from "./safe-call";
import { CalendarTab } from "./calendar-tab";
import { PricesTab } from "./prices-tab";

export function AdminApp({
  initialBookings,
  initialPrices,
}: {
  initialBookings: Booking[];
  initialPrices: DayPrice[];
}) {
  const [tab, setTab] = useState<"calendar" | "prices">("calendar");
  const [bookings, setBookings] = useState(initialBookings);
  const [prices, setPrices] = useState(initialPrices);

  // The app can stay open for days on mom's phone: reload the data whenever it comes back
  // to the foreground, so changes made on another device show up.
  useEffect(() => {
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await loadAdminData();
        if (res.expired) goToLogin();
        else {
          setBookings(res.bookings);
          setPrices(res.prices);
        }
      } catch {
        // Offline: keep showing what we have; the next save reports the problem.
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);

  return (
    <div className="mx-auto min-h-dvh max-w-3xl pb-10">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold leading-none">
              Villa Gemini
            </p>
            <p className="text-xs text-muted">
              {tab === "calendar" ? "Zauzetost" : "Cijene"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="/"
              target="_blank"
              className="rounded-full p-2.5 text-muted hover:bg-stone"
              aria-label="Otvori stranicu"
            >
              <ExternalLink className="size-5" />
            </a>
            <form action={logout}>
              <button
                className="rounded-full p-2.5 text-muted hover:bg-stone"
                aria-label="Odjava"
              >
                <LogOut className="size-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Calendar / prices switch */}
        <div
          className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-stone/70 p-1"
          role="tablist"
        >
          {(
            [
              ["calendar", "Kalendar", CalendarDays],
              ["prices", "Cijene", Euro],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition ${
                tab === key ? "bg-sea text-white shadow" : "text-muted"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === "calendar" ? (
        <CalendarTab bookings={bookings} setBookings={setBookings} />
      ) : (
        <PricesTab prices={prices} setPricesState={setPrices} />
      )}
    </div>
  );
}
