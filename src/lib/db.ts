import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

/**
 * Storage for bookings (blocked dates) and seasonal prices.
 *
 * - Production: Postgres (Neon, via the Vercel integration) via DATABASE_URL. Schema: db/schema.sql
 * - Local dev without DATABASE_URL: a JSON file in .data/dev-db.json
 *
 * Dates are ISO strings "YYYY-MM-DD". A booking occupies the nights from
 * `checkIn` up to (not including) `checkOut`, so the check-out day can be
 * another guest's check-in day.
 */

import type { Booking, Season, SeasonInput } from "./types";
export type { Booking, Season, SeasonInput };

interface Store {
  listBookings(): Promise<Booking[]>;
  addBooking(b: Omit<Booking, "id">): Promise<void>;
  deleteBooking(id: string): Promise<void>;
  listSeasons(): Promise<Season[]>;
  saveSeason(s: SeasonInput): Promise<void>;
  deleteSeason(id: string): Promise<void>;
}

/* ---------------------------------- Postgres --------------------------------- */

function postgresStore(url: string): Store {
  const globalForSql = globalThis as unknown as { __sql?: postgres.Sql };
  const sql =
    globalForSql.__sql ??
    postgres(url, { prepare: false, max: 3, idle_timeout: 20 });
  globalForSql.__sql = sql;

  return {
    async listBookings() {
      const rows = await sql<{ id: string; check_in: string; check_out: string; note: string | null }[]>`
        select id, to_char(check_in, 'YYYY-MM-DD') as check_in,
               to_char(check_out, 'YYYY-MM-DD') as check_out, note
        from bookings order by check_in`;
      return rows.map((r) => ({ id: r.id, checkIn: r.check_in, checkOut: r.check_out, note: r.note ?? "" }));
    },
    async addBooking(b) {
      await sql`insert into bookings (check_in, check_out, note)
                values (${b.checkIn}, ${b.checkOut}, ${b.note})`;
    },
    async deleteBooking(id) {
      await sql`delete from bookings where id = ${id}`;
    },
    async listSeasons() {
      const rows = await sql<{ id: string; starts_on: string; ends_on: string; price_eur: number | null; min_nights: number }[]>`
        select id, to_char(starts_on, 'YYYY-MM-DD') as starts_on,
               to_char(ends_on, 'YYYY-MM-DD') as ends_on, price_eur, min_nights
        from seasons order by starts_on`;
      return rows.map((r) => ({
        id: r.id,
        startsOn: r.starts_on,
        endsOn: r.ends_on,
        priceEur: r.price_eur,
        minNights: r.min_nights,
      }));
    },
    async saveSeason(s) {
      if (s.id) {
        await sql`update seasons set starts_on = ${s.startsOn}, ends_on = ${s.endsOn},
                  price_eur = ${s.priceEur}, min_nights = ${s.minNights} where id = ${s.id}`;
      } else {
        await sql`insert into seasons (starts_on, ends_on, price_eur, min_nights)
                  values (${s.startsOn}, ${s.endsOn}, ${s.priceEur}, ${s.minNights})`;
      }
    },
    async deleteSeason(id) {
      await sql`delete from seasons where id = ${id}`;
    },
  };
}

/* ------------------------------ JSON file (dev) ------------------------------ */

type FileData = { bookings: Booking[]; seasons: Season[] };

const DEV_FILE = path.join(process.cwd(), ".data", "dev-db.json");

const seed: FileData = {
  bookings: [],
  // Placeholder seasons; mom fills in real prices from the admin app.
  seasons: [
    { id: randomUUID(), startsOn: "2027-05-01", endsOn: "2027-06-11", priceEur: null, minNights: 5 },
    { id: randomUUID(), startsOn: "2027-06-12", endsOn: "2027-07-02", priceEur: null, minNights: 7 },
    { id: randomUUID(), startsOn: "2027-07-03", endsOn: "2027-08-27", priceEur: null, minNights: 7 },
    { id: randomUUID(), startsOn: "2027-08-28", endsOn: "2027-09-24", priceEur: null, minNights: 7 },
    { id: randomUUID(), startsOn: "2027-09-25", endsOn: "2027-10-31", priceEur: null, minNights: 5 },
  ],
};

function fileStore(): Store {
  async function load(): Promise<FileData> {
    try {
      return JSON.parse(await readFile(DEV_FILE, "utf8")) as FileData;
    } catch {
      await save(seed);
      return structuredClone(seed);
    }
  }
  async function save(data: FileData) {
    await mkdir(path.dirname(DEV_FILE), { recursive: true });
    await writeFile(DEV_FILE, JSON.stringify(data, null, 2));
  }
  const byDate = <T,>(key: (x: T) => string) => (a: T, b: T) => key(a).localeCompare(key(b));

  return {
    async listBookings() {
      return (await load()).bookings.sort(byDate((b) => b.checkIn));
    },
    async addBooking(b) {
      const data = await load();
      data.bookings.push({ id: randomUUID(), ...b });
      await save(data);
    },
    async deleteBooking(id) {
      const data = await load();
      data.bookings = data.bookings.filter((b) => b.id !== id);
      await save(data);
    },
    async listSeasons() {
      return (await load()).seasons.sort(byDate((s) => s.startsOn));
    },
    async saveSeason(s) {
      const data = await load();
      if (s.id) {
        data.seasons = data.seasons.map((x) => (x.id === s.id ? { ...x, ...s, id: x.id } : x));
      } else {
        data.seasons.push({ ...s, id: randomUUID() });
      }
      await save(data);
    },
    async deleteSeason(id) {
      const data = await load();
      data.seasons = data.seasons.filter((s) => s.id !== id);
      await save(data);
    },
  };
}

export const db: Store = process.env.DATABASE_URL
  ? postgresStore(process.env.DATABASE_URL)
  : fileStore();
