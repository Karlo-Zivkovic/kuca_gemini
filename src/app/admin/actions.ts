"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TAG_BOOKINGS, TAG_PRICES } from "@/lib/data";
import { fromIso, isIsoDate, nightsBetween, rangesOverlap, toIso } from "@/lib/dates";
import type { Booking, BookingDetails, BookingKind, DayPrice } from "@/lib/types";

/* ---------------------------------- Login ---------------------------------- */

export async function login(_prev: { error: string }, fd: FormData) {
  // Small delay makes password guessing slower.
  await new Promise((r) => setTimeout(r, 600));
  if (!checkPassword(String(fd.get("password") ?? ""))) {
    return { error: "Pogrešna lozinka." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/**
 * Every admin action first checks the login. An expired session is reported as `expired: true`
 * (the app then opens the login page) instead of a redirect, so the app can tell it apart from
 * a failed save.
 */
const expired = <T,>(empty: T) => ({ ok: false, expired: true as const, ...empty });

const isUuid = (s: unknown) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/** Fresh bookings and prices, e.g. when the app comes back to the foreground. */
export async function loadAdminData(): Promise<{ ok: boolean; expired?: true; bookings: Booking[]; prices: DayPrice[] }> {
  if (!(await isAdmin())) return expired({ bookings: [], prices: [] });
  const [bookings, prices] = await Promise.all([db.listBookings(), db.listDayPrices()]);
  return { ok: true, bookings, prices };
}

/* --------------------------------- Bookings -------------------------------- */

export type BookingsResult = { ok: boolean; expired?: true; error?: string; bookings: Booking[] };

/** Trim and cap the optional guest fields; anything invalid becomes empty. */
function cleanDetails(d: Partial<BookingDetails>): BookingDetails {
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const guests = Number(d.guests);
  return {
    guestName: text(d.guestName, 100),
    guestCountry: text(d.guestCountry, 60),
    source: text(d.source, 40),
    guests: Number.isInteger(guests) && guests >= 1 && guests <= 50 ? guests : null,
    phone: text(d.phone, 40),
    note: text(d.note, 500),
  };
}

export async function addBooking(
  checkIn: string,
  checkOut: string,
  details: Partial<BookingDetails> = {},
  kind: BookingKind = "booking",
): Promise<BookingsResult> {
  if (!(await isAdmin())) return expired({ bookings: [] });
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut <= checkIn) {
    return { ok: false, error: "Neispravni datumi.", bookings: await db.listBookings() };
  }
  const existing = await db.listBookings();
  const clash = existing.find((b) => rangesOverlap(checkIn, checkOut, b.checkIn, b.checkOut));
  if (clash) {
    return {
      ok: false,
      error: `Termin se preklapa s postojećom rezervacijom (${clash.checkIn} – ${clash.checkOut}).`,
      bookings: existing,
    };
  }
  const clean = cleanDetails(details);
  // A closed period has no guest: keep only the note.
  const stored = kind === "blocked" ? { ...cleanDetails({}), note: clean.note } : clean;
  await db.addBooking({ checkIn, checkOut, kind: kind === "blocked" ? "blocked" : "booking", ...stored });
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

/** Edit the optional guest details of a booking (dates stay as they are). */
export async function updateBookingDetails(id: string, details: Partial<BookingDetails>): Promise<BookingsResult> {
  if (!(await isAdmin())) return expired({ bookings: [] });
  const found = isUuid(id) && (await db.updateBookingDetails(id, cleanDetails(details)));
  if (!found) {
    return { ok: false, error: "Ta rezervacija više ne postoji (obrisana je na drugom uređaju).", bookings: await db.listBookings() };
  }
  // Guest details are never shown publicly, so the public calendar cache stays valid.
  return { ok: true, bookings: await db.listBookings() };
}

export async function deleteBooking(id: string): Promise<BookingsResult> {
  if (!(await isAdmin())) return expired({ bookings: [] });
  if (isUuid(id)) await db.deleteBooking(id); // already gone = the dates are free anyway
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

/* ---------------------------------- Prices --------------------------------- */

export type PricesResult = { ok: boolean; expired?: true; error?: string; prices: DayPrice[] };

/** Every day from `from` to `to`, both inclusive (max ~2 years). */
function daysBetween(from: string, to: string): string[] | null {
  if (!isIsoDate(from) || !isIsoDate(to) || to < from || nightsBetween(from, to) > 800) return null;
  const days: string[] = [];
  for (let d = fromIso(from); toIso(d) <= to; d.setDate(d.getDate() + 1)) days.push(toIso(d));
  return days;
}

/** Set one price per night on every day from `from` to `to`. */
export async function setPrices(from: string, to: string, priceEur: number): Promise<PricesResult> {
  if (!(await isAdmin())) return expired({ prices: [] });
  const days = daysBetween(from, to);
  if (!days) return { ok: false, error: "Neispravni datumi.", prices: await db.listDayPrices() };
  if (!Number.isInteger(priceEur) || priceEur <= 0 || priceEur > 100_000) {
    return { ok: false, error: "Upišite cijenu u eurima (cijeli broj).", prices: await db.listDayPrices() };
  }
  await db.setDayPrices(days, priceEur);
  updateTag(TAG_PRICES);
  return { ok: true, prices: await db.listDayPrices() };
}

/** Remove prices from every day from `from` to `to`: those days become "price on request". */
export async function clearPrices(from: string, to: string): Promise<PricesResult> {
  if (!(await isAdmin())) return expired({ prices: [] });
  const days = daysBetween(from, to);
  if (!days) return { ok: false, error: "Neispravni datumi.", prices: await db.listDayPrices() };
  await db.clearDayPrices(days);
  updateTag(TAG_PRICES);
  return { ok: true, prices: await db.listDayPrices() };
}
