// Central place for business facts. Edit here, not in components.

export const site = {
  name: "Villa Gemini",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  address: {
    street: "Put Radonje 4",
    postalCode: "21425",
    city: "Selca",
    island: "Brač",
    country: "HR",
  },
  // Approximate — verify against the Google Business Profile pin.
  geo: { lat: 43.2969, lng: 16.8497 },
  phone: "+385915276232",
  phoneDisplay: "+385 91 527 6232",
  whatsapp: "385915276232", // international format, digits only (wa.me)
  // Shown on the site (mailto links). Can switch to e.g. info@<domain> once the domain exists.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "fanica.zivkovic@gmail.com",
  checkIn: "16:00",
  checkOut: "10:00",
  maxGuests: 14,
  bedrooms: 8,
  bathrooms: 4,
  links: {
    googleMaps:
      "https://www.google.com/maps/search/?api=1&query=Villa+Gemini+Put+Radonje+4+21425+Selca",
    googleMapsEmbed:
      "https://maps.google.com/maps?q=Villa%20Gemini%2C%20Put%20Radonje%204%2C%2021425%20Selca&z=15&output=embed",
    vrbo: "https://www.vrbo.com/en-gb/p4364367",
    airbnb: "https://www.airbnb.com/rooms/1681296825413855210",
  },
  reviews: {
    vrbo: {
      score: 9.8,
      outOf: 10,
      count: 16,
      categories: {
        accuracy: 10,
        checkIn: 9.8,
        cleanliness: 9.6,
        communication: 9.6,
        location: 9.2,
      },
    },
  },
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

export type PhotoId =
  | "pool-dusk-house"
  | "pool-house-evening"
  | "house-blue-hour"
  | "pool-house-day"
  | "terrace-pool-sunset"
  | "pergola-pool-sunset"
  | "pergola-pool-night"
  | "hot-tub-lounge"
  | "hot-tub-playground"
  | "hot-tub-garden"
  | "lounge-sunset"
  | "terrace-stairs"
  | "terrace-flowers"
  | "dinner-party"
  | "breakfast-couple"
  | "dinner-couple"
  | "pool-sunset-dog"
  | "pool-dog-house"
  | "dog-pool-steps";

export const heroPhoto: PhotoId = "pool-dusk-house";

// Order shown in the gallery (keep the count a multiple of 5 for the mosaic).
// Interior photos get added here when they arrive.
export const galleryPhotos: PhotoId[] = [
  "pool-house-evening",
  "terrace-pool-sunset",
  "hot-tub-lounge",
  "pergola-pool-sunset",
  "dinner-party",
  "hot-tub-playground",
  "lounge-sunset",
  "pergola-pool-night",
  "breakfast-couple",
  "house-blue-hour",
  "terrace-stairs",
  "hot-tub-garden",
  "pool-sunset-dog",
  "dinner-couple",
  "pool-dog-house",
];

export const photoSrc = (id: PhotoId) => `/photos/${id}.webp`;
// All source photos are ~2.16:1.
export const PHOTO_W = 2144;
export const PHOTO_H = 992;
