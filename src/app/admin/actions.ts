"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { checkPassword, createSession, destroySession, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TAG_BOOKINGS, TAG_SEASONS } from "@/lib/data";
import { isIsoDate, rangesOverlap } from "@/lib/dates";
import type { Booking, Season } from "@/lib/types";

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

export async function addBooking(checkIn: string, checkOut: string, note: string): Promise<BookingsResult> {
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
  await db.addBooking({ checkIn, checkOut, note: note.trim().slice(0, 200) });
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

export async function deleteBooking(id: string): Promise<BookingsResult> {
  await guard();
  await db.deleteBooking(id);
  updateTag(TAG_BOOKINGS);
  return { ok: true, bookings: await db.listBookings() };
}

/* --------------------------------- Seasons --------------------------------- */

export type SeasonsResult = { ok: boolean; error?: string; seasons: Season[] };

export async function saveSeason(input: {
  id?: string;
  startsOn: string;
  endsOn: string;
  priceEur: number | null;
  minNights: number;
}): Promise<SeasonsResult> {
  await guard();
  const { startsOn, endsOn, priceEur, minNights } = input;
  if (!isIsoDate(startsOn) || !isIsoDate(endsOn) || endsOn < startsOn) {
    return { ok: false, error: "Neispravni datumi.", seasons: await db.listSeasons() };
  }
  if (priceEur !== null && (!Number.isInteger(priceEur) || priceEur <= 0 || priceEur > 100_000)) {
    return { ok: false, error: "Neispravna cijena.", seasons: await db.listSeasons() };
  }
  if (!Number.isInteger(minNights) || minNights < 1 || minNights > 60) {
    return { ok: false, error: "Minimalan broj noćenja mora biti između 1 i 60.", seasons: await db.listSeasons() };
  }
  await db.saveSeason({ id: input.id, startsOn, endsOn, priceEur, minNights });
  updateTag(TAG_SEASONS);
  return { ok: true, seasons: await db.listSeasons() };
}

export async function deleteSeason(id: string): Promise<SeasonsResult> {
  await guard();
  await db.deleteSeason(id);
  updateTag(TAG_SEASONS);
  return { ok: true, seasons: await db.listSeasons() };
}
