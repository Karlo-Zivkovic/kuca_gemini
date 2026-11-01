import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

/**
 * Storage for bookings (blocked dates) and per-night prices.
 *
 * - Production: Postgres (Neon, via the Vercel integration) via DATABASE_URL. Schema: db/schema.sql
 * - Local dev without DATABASE_URL: a JSON file in .data/dev-db.json
 *
 * Dates are ISO strings "YYYY-MM-DD". A booking occupies the nights from
 * `checkIn` up to (not including) `checkOut`, so the check-out day can be
 * another guest's check-in day.
 */

import { emptyDetails, type Booking, type BookingDetails, type DayPrice } from "./types";
export type { Booking, BookingDetails, DayPrice };

interface Store {
  listBookings(): Promise<Booking[]>;
  addBooking(b: Omit<Booking, "id">): Promise<void>;
  updateBookingDetails(id: string, d: BookingDetails): Promise<void>;
  deleteBooking(id: string): Promise<void>;
  listDayPrices(): Promise<DayPrice[]>;
  /** Set the same price on each of these days. */
  setDayPrices(days: string[], priceEur: number): Promise<void>;
  /** Remove the price from these days ("price on request"). */
  clearDayPrices(days: string[]): Promise<void>;
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
      const rows = await sql<
        {
          id: string;
          check_in: string;
          check_out: string;
          note: string | null;
          guest_name: string | null;
          guest_country: string | null;
          source: string | null;
          guests: number | null;
          phone: string | null;
        }[]
      >`
        select id, to_char(check_in, 'YYYY-MM-DD') as check_in,
               to_char(check_out, 'YYYY-MM-DD') as check_out,
               note, guest_name, guest_country, source, guests, phone
        from bookings order by check_in`;
      return rows.map((r) => ({
        id: r.id,
        checkIn: r.check_in,
        checkOut: r.check_out,
        note: r.note ?? "",
        guestName: r.guest_name ?? "",
        guestCountry: r.guest_country ?? "",
        source: r.source ?? "",
        guests: r.guests,
        phone: r.phone ?? "",
      }));
    },
    async addBooking(b) {
      await sql`insert into bookings (check_in, check_out, note, guest_name, guest_country, source, guests, phone)
                values (${b.checkIn}, ${b.checkOut}, ${b.note}, ${b.guestName}, ${b.guestCountry},
                        ${b.source}, ${b.guests}, ${b.phone})`;
    },
    async updateBookingDetails(id, d) {
      await sql`update bookings set note = ${d.note}, guest_name = ${d.guestName},
                guest_country = ${d.guestCountry}, source = ${d.source}, guests = ${d.guests}, phone = ${d.phone}
                where id = ${id}`;
    },
    async deleteBooking(id) {
      await sql`delete from bookings where id = ${id}`;
    },
    async listDayPrices() {
      const rows = await sql<{ day: string; price_eur: number }[]>`
        select to_char(day, 'YYYY-MM-DD') as day, price_eur from day_prices order by day`;
      return rows.map((r) => ({ day: r.day, priceEur: r.price_eur }));
    },
    async setDayPrices(days, priceEur) {
      if (days.length === 0) return;
      const rows = days.map((day) => ({ day, price_eur: priceEur }));
      await sql`insert into day_prices ${sql(rows, "day", "price_eur")}
                on conflict (day) do update set price_eur = excluded.price_eur, updated_at = now()`;
    },
    async clearDayPrices(days) {
      if (days.length === 0) return;
      await sql`delete from day_prices where day in ${sql(days)}`;
    },
  };
}

/* ------------------------------ JSON file (dev) ------------------------------ */

type FileData = { bookings: Booking[]; dayPrices?: DayPrice[] };

const DEV_FILE = path.join(process.cwd(), ".data", "dev-db.json");

const seed: FileData = { bookings: [], dayPrices: [] };

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
      // Older dev files have bookings without the guest fields: fill in defaults.
      return (await load()).bookings.map((b) => ({ ...emptyDetails, ...b })).sort(byDate((b) => b.checkIn));
    },
    async addBooking(b) {
      const data = await load();
      data.bookings.push({ id: randomUUID(), ...b });
      await save(data);
    },
    async updateBookingDetails(id, d) {
      const data = await load();
      data.bookings = data.bookings.map((b) => (b.id === id ? { ...b, ...d } : b));
      await save(data);
    },
    async deleteBooking(id) {
      const data = await load();
      data.bookings = data.bookings.filter((b) => b.id !== id);
      await save(data);
    },
    async listDayPrices() {
      return ((await load()).dayPrices ?? []).sort(byDate((p) => p.day));
    },
    async setDayPrices(days, priceEur) {
      const data = await load();
      const set = new Set(days);
      data.dayPrices = [
        ...(data.dayPrices ?? []).filter((p) => !set.has(p.day)),
        ...days.map((day) => ({ day, priceEur })),
      ];
      await save(data);
    },
    async clearDayPrices(days) {
      const data = await load();
      const set = new Set(days);
      data.dayPrices = (data.dayPrices ?? []).filter((p) => !set.has(p.day));
      await save(data);
    },
  };
}

if (!process.env.DATABASE_URL && process.env.VERCEL) {
  throw new Error(
    "DATABASE_URL is missing. In Vercel: Storage → create a Neon database → connect it to this project, then redeploy.",
  );
}

export const db: Store = process.env.DATABASE_URL
  ? postgresStore(process.env.DATABASE_URL)
  : fileStore();
