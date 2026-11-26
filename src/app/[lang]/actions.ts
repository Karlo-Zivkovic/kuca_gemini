"use server";

import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { sendInquiryEmail } from "@/lib/email";
import { isIsoDate, nightsBetween } from "@/lib/dates";
import { site } from "@/lib/config";
import { getPublicAvailability } from "@/lib/data";
import { hasLocale } from "@/lib/i18n";
import { isValidEmail, normalizePhone } from "@/lib/inquiry-validation";

export type InquiryState = {
  status: "idle" | "success" | "error" | "invalid";
  fields?: string[];
};

const str = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const int = (fd: FormData, key: string, min: number, max: number) => {
  const n = Number(fd.get(key));
  return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : min;
};

export async function sendInquiry(_prev: InquiryState, fd: FormData): Promise<InquiryState> {
  // Spam guards: hidden honeypot field, and no human submits within 2 s of page load.
  const startedAt = Number(fd.get("startedAt"));
  if (str(fd, "vg_hp") || !startedAt || Date.now() - startedAt < 2000) {
    return { status: "success" }; // pretend success so bots don't retry
  }

  const lang = str(fd, "lang", 5);

  // Phone is optional, but if given it must be a real number with its country code (+ or 00),
  // because the owner's "reply on WhatsApp" button dials exactly this number.
  const rawPhone = str(fd, "phone", 40);
  const parsedPhone = rawPhone ? parsePhoneNumberFromString(normalizePhone(rawPhone).replace(/^00/, "+")) : undefined;
  const phoneOk = !rawPhone || Boolean(parsedPhone?.isValid());
  const q = {
    name: str(fd, "name", 100),
    email: str(fd, "email", 200),
    phone: parsedPhone?.isValid() ? parsedPhone.formatInternational() : "", // e.g. "+385 95 582 3724"
    arrival: str(fd, "arrival", 10),
    departure: str(fd, "departure", 10),
    adults: int(fd, "adults", 1, 14),
    children: int(fd, "children", 0, 13),
    pets: fd.get("pets") === "on",
    message: str(fd, "message", 3000),
    lang: hasLocale(lang) ? lang : "en",
  };

  const bad: string[] = [];
  if (q.name.length < 2) bad.push("name");
  if (!isValidEmail(q.email)) bad.push("email");
  if (!phoneOk) bad.push("phone");
  if (q.arrival || q.departure) {
    if (!isIsoDate(q.arrival) || !isIsoDate(q.departure)) bad.push("datesIncomplete");
    else if (
      // The calendar already prevents this; re-check in case a booking was added while the page was open.
      q.departure <= q.arrival ||
      nightsBetween(q.arrival, q.departure) < site.minNights ||
      (await getPublicAvailability()).some((r) => q.arrival < r.to && r.from < q.departure)
    )
      bad.push("dates");
  }
  if (fd.get("privacy") !== "on") bad.push("privacy");
  if (bad.length) return { status: "invalid", fields: bad };

  try {
    const ok = await sendInquiryEmail(q);
    return { status: ok ? "success" : "error" };
  } catch (err) {
    console.error("[inquiry]", err);
    return { status: "error" };
  }
}
