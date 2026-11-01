// Shared data shapes (safe to import from client components).

/** Optional guest details. Empty string / null = not filled in. */
export type BookingDetails = {
  guestName: string;
  guestCountry: string;
  source: string; // Airbnb, Booking, Vrbo, Interhome, Direktno, Privatno or ""
  guests: number | null;
  phone: string;
  note: string; // free text
};

export type Booking = BookingDetails & {
  id: string;
  checkIn: string; // ISO date, first night
  checkOut: string; // ISO date, departure morning (not a booked night)
};

export const emptyDetails: BookingDetails = {
  guestName: "",
  guestCountry: "",
  source: "",
  guests: null,
  phone: "",
  note: "",
};

export type Season = {
  id: string;
  startsOn: string;
  endsOn: string; // inclusive
  priceEur: number | null; // null = "price on request"
  minNights: number;
};

export type SeasonInput = Omit<Season, "id"> & { id?: string };
