"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Euro, ExternalLink, LogOut } from "lucide-react";
import type { Booking, DayPrice } from "@/lib/types";
import { loadAdminData, logout } from "./actions";
import { goToLogin } from "./safe-call";
import { CalendarTab } from "./calendar-tab";
import { PricesTab } from "./prices-tab";

export function AdminApp({ initialBookings, initialPrices }: { initialBookings: Booking[]; initialPrices: DayPrice[] }) {
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
        <PricesTab prices={prices} setPricesState={setPrices} />
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
