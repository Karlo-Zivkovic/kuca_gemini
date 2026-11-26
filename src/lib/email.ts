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

/** "1 noćenje", "2 noćenja", "21 noćenje": Croatian plural rules. */
const nightsHr = (n: number) => `${n} ${new Intl.PluralRules("hr-HR").select(n) === "one" ? "noćenje" : "noćenja"}`;

/** "hrvatski", "poljski", … (a full name: Gmail translated the bare code "HR" as "Human Resources"). */
const languageName = (code: string) => {
  try {
    return new Intl.DisplayNames(["hr"], { type: "language" }).of(code === "no" ? "nb" : code) ?? code;
  } catch {
    return code;
  }
};

/**
 * Inquiry email, built for phones first: one column (label above value), long values wrap,
 * full-width buttons stacked. Marked as Croatian and "do not translate" (translate="no", notranslate)
 * so Gmail keeps the guest's message exactly as written.
 */
export function inquiryEmailHtml(q: Inquiry, dates: string, waLink: string) {
  const rows: [string, string][] = [
    ["Ime", esc(q.name)],
    ["E-mail", `<a href="mailto:${esc(q.email)}" style="color:#0f4c5c">${esc(q.email)}</a>`],
    ["Telefon", q.phone ? `${esc(q.phone)}${waLink ? ` · <a href="${waLink}" style="color:#0f4c5c">WhatsApp</a>` : ""}` : "–"],
    ["Datumi", esc(dates)],
    ["Gosti", `odrasli: ${q.adults}, djeca: ${q.children}${q.pets ? ", dolaze sa psom 🐕" : ""}`],
    ["Jezik stranice", esc(languageName(q.lang))],
  ];
  const wrap = "overflow-wrap:anywhere;word-break:break-word";
  const button = (href: string, bg: string, text: string) =>
    `<a href="${href}" style="display:block;background:${bg};color:#ffffff;padding:14px 16px;border-radius:10px;text-decoration:none;text-align:center;font-weight:bold;font-size:16px;margin-top:10px">${text}</a>`;

  return `<!doctype html>
<html lang="hr" translate="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Language" content="hr">
<meta name="google" content="notranslate">
<title>Novi upit za Villa Gemini</title>
</head>
<body style="margin:0;padding:0;background:#f6f1e9">
<div lang="hr" translate="no" class="notranslate" style="font-family:Arial,Helvetica,sans-serif;color:#1f2a2e;background:#f6f1e9;padding:12px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:20px;box-sizing:border-box">
    <h2 style="margin:0 0 12px;color:#0f4c5c;font-size:22px;line-height:1.25">Novi upit za Villa Gemini</h2>
    <table role="presentation" style="border-collapse:collapse;width:100%;font-size:16px;line-height:1.4">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 0;border-top:1px solid #eee7dc">` +
            `<div style="font-size:13px;color:#5e6a6e;margin-bottom:2px">${k}</div>` +
            `<div style="${wrap}">${v}</div></td></tr>`,
        )
        .join("")}
    </table>
    ${q.message ? `<div translate="no" class="notranslate" style="margin:12px 0 0;padding:12px 14px;background:#f6f1e9;border-radius:8px;white-space:pre-wrap;font-size:16px;line-height:1.45;${wrap}">${esc(q.message)}</div>` : ""}
    <div style="margin-top:14px">
      ${button(`mailto:${esc(q.email)}`, "#0f4c5c", "Odgovori e-mailom")}
      ${waLink ? button(waLink, "#1fa855", "Odgovori na WhatsApp") : ""}
    </div>
  </div>
</div>
</body>
</html>`;
}

/** Sends the inquiry to the owner (in Croatian), with one-tap reply links. */
export async function sendInquiryEmail(q: Inquiry): Promise<boolean> {
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL ?? "Villa Gemini <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY;

  const hasDates = q.arrival && q.departure;
  const dates = hasDates
    ? `${formatDate(q.arrival, "hr-HR")} – ${formatDate(q.departure, "hr-HR")} (${nightsHr(nightsBetween(q.arrival, q.departure))})`
    : "nisu navedeni";
  const phoneDigits = q.phone.replace(/[^\d]/g, "");
  const waLink = phoneDigits ? `https://wa.me/${phoneDigits}` : "";
  const subject = `Novi upit: ${q.name}${hasDates ? `, ${formatDate(q.arrival, "hr-HR", { day: "numeric", month: "numeric" })}–${formatDate(q.departure, "hr-HR", { day: "numeric", month: "numeric", year: "numeric" })}` : ""}`;

  const html = inquiryEmailHtml(q, dates, waLink);

  if (!apiKey || !to) {
    console.warn("[inquiry] RESEND_API_KEY or INQUIRY_TO_EMAIL not set; email not sent. Inquiry:", { ...q, subject });
    return process.env.NODE_ENV !== "production";
  }

  const send = (replyTo?: string) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
        headers: { "Content-Language": "hr" }, // tells Gmail it's Croatian, so it doesn't offer a translation
      }),
    });

  let res = await send(q.email);
  if (res.status === 422) {
    // Resend refused something, most likely the guest's address as Reply-To. Never lose the
    // inquiry over that: send it again without Reply-To (the address is still in the email).
    console.error("[inquiry] Resend 422, retrying without reply_to", await res.text());
    res = await send();
  }
  if (!res.ok) {
    console.error("[inquiry] Resend failed", res.status, await res.text());
    return false;
  }
  return true;
}
