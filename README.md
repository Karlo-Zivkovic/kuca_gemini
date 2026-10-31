# Villa Gemini

Direct-booking website for **Villa Gemini**, Put Radonje 4, 21425 Selca, Brač, plus a phone-friendly admin app where the owner manages booked dates and prices.

- **Site** (`/hr`, `/en`, `/de`): hero, villa details, gallery, Vrbo rating, availability calendar + seasonal prices, map, FAQ, inquiry form, WhatsApp button, GA4 with cookie consent.
- **Admin** (`/admin`): password login, tap-to-block calendar, price periods. Installable on Android as an app (PWA).

Stack: Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Postgres (Neon) · Resend · react-day-picker.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000  → redirects to /hr, /en or /de
```

Without `DATABASE_URL`, data is stored in `.data/dev-db.json` (created automatically with placeholder price periods).
In dev the admin password defaults to `gemini`; set `ADMIN_PASSWORD` in `.env.local` to change it.
Without Resend keys, inquiries are printed to the server console instead of emailed.

See `.env.example` for all settings.

## Where to edit things

| What | File |
| --- | --- |
| Phone, email, address, check-in times, Vrbo score, links | `src/lib/config.ts` |
| All texts (HR / EN / DE) | `src/lib/i18n/{hr,en,de}.ts` |
| Photos and gallery order | `public/photos/` + `galleryPhotos` in `src/lib/config.ts` |
| Colours and fonts | `src/app/globals.css`, `src/app/[lang]/layout.tsx` |
| Booked dates and prices | the admin app (`/admin`), no code |

## Deploy (Vercel + Neon + Resend)

1. **Push to GitHub** and import the repo in [Vercel](https://vercel.com/new).
2. **Database:** in the Vercel project → *Storage* → *Create* → **Neon Postgres** → connect to the project. This sets `DATABASE_URL`.
   Then run the schema once: Neon console → *SQL Editor* → paste `db/schema.sql` → *Run*.
3. **Admin login:** add `ADMIN_PASSWORD` (mom's password) and `SESSION_SECRET` (`openssl rand -base64 48`).
4. **Email:** create a [Resend](https://resend.com) account, verify the domain, then set `RESEND_API_KEY`, `INQUIRY_TO_EMAIL` (mom's inbox, comma-separate several) and `INQUIRY_FROM_EMAIL`.
5. **Analytics:** create a GA4 property, set `NEXT_PUBLIC_GA_ID=G-…`. It loads only after a visitor accepts cookies.
6. **Domain:** add it in Vercel → *Domains*, set `NEXT_PUBLIC_SITE_URL=https://your-domain`, redeploy.
7. **Google:** add the site URL to the Google Business Profile ("Dodajte web-lokaciju") and submit `https://your-domain/sitemap.xml` in Google Search Console.

## Install the admin app on mom's Android phone

1. Open `https://your-domain/admin` in **Chrome** and log in (she stays logged in for a year).
2. Chrome menu **⋮** → **Add to Home screen** → **Install**.
3. "Gemini" now appears among her apps and opens full-screen, next to Airbnb/Vrbo.

How she uses it: tap the **arrival day**, then the **departure day**, pick the source (Airbnb, Booking…), tap **Označi kao zauzeto**. Tap a booked (orange) day to see or delete that booking. Prices live in the **Cijene** tab; an empty price shows "price on request". The public site updates within a few minutes.

## Booking date rules

A booking from 3 to 10 July blocks the **nights** of 3–9 July. 10 July stays free as an arrival day, so back-to-back Saturday changeovers work.

## Before going live: content to confirm

- [ ] Real public email (`NEXT_PUBLIC_CONTACT_EMAIL`)
- [ ] Map pin / coordinates in `src/lib/config.ts` match the Google Business Profile
- [ ] Distances in the Location section (taken from the listings)
- [ ] House rules and FAQ answers (pets, smoking, deposit and payment terms)
- [ ] Price periods and prices (admin → Cijene)
- [ ] Interior photos (bedrooms, kitchen, living room, bathrooms)
- [ ] Optional: real guest quotes for the reviews section
