"use server";

import { sendInquiryEmail } from "@/lib/email";
import { isIsoDate } from "@/lib/dates";
import { hasLocale } from "@/lib/i18n";

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
  if (str(fd, "company") || !startedAt || Date.now() - startedAt < 2000) {
    return { status: "success" }; // pretend success so bots don't retry
  }

  const lang = str(fd, "lang", 5);
  const q = {
    name: str(fd, "name", 100),
    email: str(fd, "email", 200),
    phone: str(fd, "phone", 40),
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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email)) bad.push("email");
  if (q.phone && !/^[+\d][\d\s()./-]{5,}$/.test(q.phone)) bad.push("phone");
  if (q.arrival && !isIsoDate(q.arrival)) bad.push("arrival");
  if (q.departure && (!isIsoDate(q.departure) || q.departure <= q.arrival)) bad.push("departure");
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
