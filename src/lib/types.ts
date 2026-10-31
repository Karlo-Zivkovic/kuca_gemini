// Shared data shapes (safe to import from client components).

export type Booking = {
  id: string;
  checkIn: string; // ISO date, first night
  checkOut: string; // ISO date, departure morning (not a booked night)
  note: string;
};

export type Season = {
  id: string;
  startsOn: string;
  endsOn: string; // inclusive
  priceEur: number | null; // null = "price on request"
  minNights: number;
};

export type SeasonInput = Omit<Season, "id"> & { id?: string };
