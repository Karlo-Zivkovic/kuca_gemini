"use client";

import { useSyncExternalStore } from "react";
import { addDays } from "date-fns";
import { fromIso, toIso } from "./dates";

export type IsoRange = { from: string; to: string }; // to = check-out day (exclusive night)

/** DayPicker matchers for booked *nights*: check-in day … day before check-out. */
export const bookedMatchers = (ranges: IsoRange[]) =>
  ranges.map((r) => ({ from: fromIso(r.from), to: addDays(fromIso(r.to), -1) }));

export const isNightBooked = (iso: string, ranges: IsoRange[]) =>
  ranges.some((r) => r.from <= iso && iso < r.to);

/** True if any night in [from, to) is booked. */
export const rangeHasBookedNight = (from: string, to: string, ranges: IsoRange[]) =>
  ranges.some((r) => from < r.to && r.from < to);

const noop = () => () => {};

/** Today's ISO date, only on the client (null during SSR/prerender). */
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => toIso(new Date()), () => null);
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
