"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TAG_BOOKINGS, TAG_PRICES } from "@/lib/data";
import { fromIso, isIsoDate, nightsBetween, rangesOverlap, toIso } from "@/lib/dates";
import type { Booking, BookingDetails, DayPrice } from "@/lib/types";

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

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/* --------------------------------- Bookings -------------------------------- */

export type BookingsResult = { ok: boolean; error?: string; bookings: Booking[] };

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
): Promise<BookingsResult> {
  await guard();
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
  await db.addBooking({ checkIn, checkOut, ...cleanDetails(details) });
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

/** Edit the optional guest details of a booking (dates stay as they are). */
export async function updateBookingDetails(id: string, details: Partial<BookingDetails>): Promise<BookingsResult> {
  await guard();
  await db.updateBookingDetails(id, cleanDetails(details));
  // Guest details are never shown publicly, so the public calendar cache stays valid.
  return { ok: true, bookings: await db.listBookings() };
}

export async function deleteBooking(id: string): Promise<BookingsResult> {
  await guard();
  await db.deleteBooking(id);
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

/* ---------------------------------- Prices --------------------------------- */

export type PricesResult = { ok: boolean; error?: string; prices: DayPrice[] };

/** Every day from `from` to `to`, both inclusive (max ~2 years). */
function daysBetween(from: string, to: string): string[] | null {
  if (!isIsoDate(from) || !isIsoDate(to) || to < from || nightsBetween(from, to) > 800) return null;
  const days: string[] = [];
  for (let d = fromIso(from); toIso(d) <= to; d.setDate(d.getDate() + 1)) days.push(toIso(d));
  return days;
}

/** Set one price per night on every day from `from` to `to`. */
export async function setPrices(from: string, to: string, priceEur: number): Promise<PricesResult> {
  await guard();
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
  await guard();
  const days = daysBetween(from, to);
  if (!days) return { ok: false, error: "Neispravni datumi.", prices: await db.listDayPrices() };
  await db.clearDayPrices(days);
  updateTag(TAG_PRICES);
  return { ok: true, prices: await db.listDayPrices() };
}
