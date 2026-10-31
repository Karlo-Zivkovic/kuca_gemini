import "server-only";
import { formatDate, nightsBetween } from "./dates";

export type Inquiry = {
  name: string;
  email: string;
  phone: string;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  pets: boolean;
  message: string;
  lang: string;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Sends the inquiry to the owner (in Croatian), with one-tap reply links. */
export async function sendInquiryEmail(q: Inquiry): Promise<boolean> {
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Villa Gemini <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  const hasDates = q.arrival && q.departure;
  const dates = hasDates
    ? `${formatDate(q.arrival, "hr-HR")} – ${formatDate(q.departure, "hr-HR")} (${nightsBetween(q.arrival, q.departure)} noćenja)`
    : "nisu navedeni";
  const phoneDigits = q.phone.replace(/[^\d]/g, "");
  const waLink = phoneDigits ? `https://wa.me/${phoneDigits}` : "";
  const subject = `Novi upit: ${q.name}${hasDates ? `, ${formatDate(q.arrival, "hr-HR", { day: "numeric", month: "numeric" })}–${formatDate(q.departure, "hr-HR", { day: "numeric", month: "numeric", year: "numeric" })}` : ""}`;

  const rows: [string, string][] = [
    ["Ime", esc(q.name)],
    ["E-mail", `<a href="mailto:${esc(q.email)}">${esc(q.email)}</a>`],
    ["Telefon", q.phone ? `${esc(q.phone)}${waLink ? ` · <a href="${waLink}">WhatsApp</a>` : ""}` : "–"],
    ["Datumi", esc(dates)],
    ["Gosti", `${q.adults} odraslih, ${q.children} djece${q.pets ? ", dolaze sa psom 🐕" : ""}`],
    ["Jezik stranice", q.lang.toUpperCase()],
  ];

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2a2e;background:#f6f1e9;padding:24px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:24px">
    <h2 style="margin:0 0 16px;color:#0f4c5c">Novi upit za Villa Gemini</h2>
    <table style="border-collapse:collapse;width:100%;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5e6a6e;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${v}</td></tr>`).join("")}
    </table>
    ${q.message ? `<p style="margin:16px 0 0;padding:12px;background:#f6f1e9;border-radius:8px;white-space:pre-wrap">${esc(q.message)}</p>` : ""}
    <p style="margin:24px 0 0">
      <a href="mailto:${esc(q.email)}" style="display:inline-block;background:#0f4c5c;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Odgovori e-mailom</a>
      ${waLink ? `<a href="${waLink}" style="display:inline-block;background:#25d366;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;margin-left:8px">Odgovori na WhatsApp</a>` : ""}
    </p>
  </div></body></html>`;

  if (!apiKey || !to) {
    console.warn("[inquiry] RESEND_API_KEY or INQUIRY_TO_EMAIL not set; email not sent. Inquiry:", { ...q, subject });
    return process.env.NODE_ENV !== "production";
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), reply_to: q.email, subject, html }),
  });
  if (!res.ok) {
    console.error("[inquiry] Resend failed", res.status, await res.text());
    return false;
  }
  return true;
}
