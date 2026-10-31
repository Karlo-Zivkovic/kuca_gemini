import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export const TAG_BOOKINGS = "bookings";
export const TAG_SEASONS = "seasons";

export type PublicRange = { from: string; to: string };

/** Booked ranges for the public calendar: dates only, notes never leave the server. */
export async function getPublicAvailability(): Promise<PublicRange[]> {
  "use cache";
  cacheTag(TAG_BOOKINGS);
  cacheLife("minutes");
  const bookings = await db.listBookings();
  return bookings.map((b) => ({ from: b.checkIn, to: b.checkOut }));
}

export async function getPublicSeasons() {
  "use cache";
  cacheTag(TAG_SEASONS);
  cacheLife("minutes");
  return db.listSeasons();
}
