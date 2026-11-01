import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export const TAG_BOOKINGS = "bookings";
export const TAG_PRICES = "prices";

export type PublicRange = { from: string; to: string };

/** Booked ranges for the public calendar: dates only, notes never leave the server. */
export async function getPublicAvailability(): Promise<PublicRange[]> {
  "use cache";
  cacheTag(TAG_BOOKINGS);
  cacheLife("minutes");
  const bookings = await db.listBookings();
  return bookings.map((b) => ({ from: b.checkIn, to: b.checkOut }));
}

/** Per-night prices for the public calendar. Days without a price are "on request". */
export async function getPublicDayPrices() {
  "use cache";
  cacheTag(TAG_PRICES);
  cacheLife("minutes");
  return db.listDayPrices();
}
