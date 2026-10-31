"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";

/** Dates picked in the calendar, shared with the inquiry form and WhatsApp button. */
type Stay = { arrival: string; departure: string };
type Ctx = Stay & { setStay: (s: Stay) => void };

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [stay, setStay] = useState<Stay>({ arrival: "", departure: "" });
  const value = useMemo(() => ({ ...stay, setStay }), [stay]);
  return <BookingContext value={value}>{children}</BookingContext>;
}

export function useStay() {
  const ctx = use(BookingContext);
  if (!ctx) throw new Error("useStay must be used inside <BookingProvider>");
  return ctx;
}
