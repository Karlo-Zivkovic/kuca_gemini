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
  minNights: 5, // minimum stay, all year
  maxGuests: 14,
  bedrooms: 8,
  bathrooms: 4,
  links: {
    googleMaps:
      "https://www.google.com/maps/search/?api=1&query=Villa+Gemini+Put+Radonje+4+21425+Selca",
    googleMapsEmbed:
      "https://maps.google.com/maps?q=Villa%20Gemini%2C%20Put%20Radonje%204%2C%2021425%20Selca&z=15&output=embed",
    vrbo: "https://www.vrbo.com/en-gb/p4364367",
    airbnb: "https://www.airbnb.com/rooms/16154620",
    // Same listings, opened on the reviews. Vrbo has no working deep link (it drops the
    // parameter), so it opens the listing, which shows "See all reviews" near the top.
    vrboReviews: "https://www.vrbo.com/en-gb/p4364367",
    airbnbReviews: "https://www.airbnb.com/rooms/16154620/reviews",
    ferryTickets: "https://www.jadrolinija.hr/hr/pretrazite-kupite-kartu",
  },
  reviews: {
    airbnb: {
      score: 4.96,
      outOf: 5,
      count: 23,
    },
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

// Hero photo (top of the page and social previews). Gallery photos live in src/lib/photos.ts.
export const heroSrc = "/photos/pool-dusk-house.webp";
export const HERO_W = 2144;
export const HERO_H = 992;
