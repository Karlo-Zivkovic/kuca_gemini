"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, LoaderCircle, Mail, Phone } from "lucide-react";
import { sendInquiry, type InquiryState } from "@/app/[lang]/actions";
import { site } from "@/lib/config";
import { track } from "@/lib/consent";
import type { Dict, Locale } from "@/lib/i18n";
import { useStay } from "./booking-context";
import { WhatsAppLink } from "./whatsapp";

const input =
  "mt-1.5 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-sea focus:ring-2 focus:ring-sea/20 aria-[invalid=true]:border-terracotta aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-terracotta/20";

/** How long the thank-you message stays before the empty form comes back. */
const SUCCESS_MS = 8000;

export function ContactForm({ t, lang }: { t: Dict; lang: Locale }) {
  const { setStay } = useStay();
  const [sent, setSent] = useState(false);
  // Changing the key remounts the form, giving a fresh, empty form and action state.
  const [round, setRound] = useState(0);

  const reset = () => {
    setSent(false);
    setRound((r) => r + 1);
    setStay({ arrival: "", departure: "" });
  };

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(reset, SUCCESS_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border border-line bg-paper p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-olive" strokeWidth={1.5} />
        <p className="mt-4 text-lg font-medium">{t.contact.success}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-stone"
        >
          {t.contact.sendAnother}
        </button>
      </div>
    );
  }

  return <InquiryForm key={round} t={t} lang={lang} onSent={() => setSent(true)} />;
}

function InquiryForm({ t, lang, onSent }: { t: Dict; lang: Locale; onSent: () => void }) {
  const c = t.contact;
  const { arrival, departure, setStay } = useStay();
  const [state, action, pending] = useActionState<InquiryState, FormData>(sendInquiry, { status: "idle" });
  // When the form appeared; the server drops submissions made within 2 s of page load (bots).
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;
    track("inquiry_submitted", { has_dates: Boolean(arrival && departure) });
    onSent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const invalid = (f: string) => (state.status === "invalid" && state.fields?.includes(f) ? true : undefined);

  return (
    <form
      // Submit manually so React doesn't reset the fields when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("startedAt", String(startedAt.current));
        startTransition(() => action(fd));
      }}
      className="rounded-2xl border border-line bg-paper p-5 sm:p-7"
      noValidate
    >
      <input type="hidden" name="lang" value={lang} />
      {/* Honeypot: hidden from people, bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.name} className="sm:col-span-2">
          <input name="name" required autoComplete="name" className={input} aria-invalid={invalid("name")} />
        </Field>
        <Field label={c.email}>
          <input name="email" type="email" required autoComplete="email" className={input} aria-invalid={invalid("email")} />
        </Field>
        <Field label={c.phone} hint={c.phoneHint}>
          <input name="phone" type="tel" autoComplete="tel" className={input} aria-invalid={invalid("phone")} />
        </Field>
        <Field label={c.arrival}>
          <input
            name="arrival"
            type="date"
            value={arrival}
            onChange={(e) => setStay({ arrival: e.target.value, departure })}
            className={input}
            aria-invalid={invalid("arrival")}
          />
        </Field>
        <Field label={c.departure}>
          <input
            name="departure"
            type="date"
            value={departure}
            min={arrival || undefined}
            onChange={(e) => setStay({ arrival, departure: e.target.value })}
            className={input}
            aria-invalid={invalid("departure")}
          />
        </Field>
        <Field label={c.adults}>
          <input name="adults" type="number" min={1} max={14} defaultValue={2} inputMode="numeric" className={input} />
        </Field>
        <Field label={c.children}>
          <input name="children" type="number" min={0} max={13} defaultValue={0} inputMode="numeric" className={input} />
        </Field>
        <label className="flex items-center gap-3 sm:col-span-2">
          <input name="pets" type="checkbox" className="size-5 accent-sea" />
          <span>{c.pets}</span>
        </label>
        <Field label={c.message} className="sm:col-span-2">
          <textarea name="message" rows={4} placeholder={c.messagePlaceholder} className={input} />
        </Field>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input name="privacy" type="checkbox" required className="mt-0.5 size-5 shrink-0 accent-sea" aria-invalid={invalid("privacy")} />
          <span className={invalid("privacy") ? "text-terracotta-dark" : "text-muted"}>
            {c.privacy}{" "}
            <Link href={`/${lang}/privacy`} className="underline underline-offset-2" target="_blank">
              {c.privacyLink}
            </Link>
          </span>
        </label>
      </div>

      {(state.status === "invalid" || state.status === "error") && (
        <p role="alert" className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-dark">
          {state.status === "invalid" ? c.invalid : c.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-6 py-3.5 text-base font-semibold text-white hover:bg-terracotta-dark disabled:opacity-70 sm:w-auto"
      >
        {pending && <LoaderCircle className="size-5 animate-spin" />}
        {pending ? c.sending : c.submit}
      </button>
    </form>
  );
}

function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function DirectContact({ t }: { t: Dict }) {
  const c = t.contact;
  const row = "flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 transition hover:border-sea/40 hover:shadow-sm";
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">{c.orReach}</p>
      <WhatsAppLink message={t.whatsapp.greeting} forWord={t.whatsapp.forDates} source="contact" className={`${row} [&>svg]:size-6 [&>svg]:text-whatsapp`}>
        <span>
          <span className="block font-semibold">{c.whatsapp}</span>
          <span className="text-sm text-muted">{site.phoneDisplay}</span>
        </span>
      </WhatsAppLink>
      <a href={`tel:${site.phone}`} className={row} onClick={() => track("phone_click")}>
        <Phone className="size-6 text-sea" />
        <span>
          <span className="block font-semibold">{c.call}</span>
          <span className="text-sm text-muted">{site.phoneDisplay}</span>
        </span>
      </a>
      <a href={`mailto:${site.email}`} className={row} onClick={() => track("email_click")}>
        <Mail className="size-6 text-sea" />
        <span>
          <span className="block font-semibold">{c.emailUs}</span>
          <span className="text-sm text-muted">{site.email}</span>
        </span>
      </a>
      <p className="pt-2 text-sm text-muted">{c.responseTime}</p>
    </div>
  );
}
