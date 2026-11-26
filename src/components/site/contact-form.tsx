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
import { DatesField } from "./dates-field";
import { checkField, inquiryFields, type InquiryField } from "@/lib/inquiry-validation";
import type { IsoRange } from "@/lib/calendar";
import type { DayPrice } from "@/lib/types";

const input =
  "mt-1.5 block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-sea focus:ring-2 focus:ring-sea/20 aria-[invalid=true]:border-terracotta aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-terracotta/20";

/** How long the thank-you message stays before the empty form comes back. */
const SUCCESS_MS = 8000;

type Errors = Partial<Record<InquiryField, string>>;

type Availability = { booked: IsoRange[]; prices: DayPrice[] };

export function ContactForm({ t, lang, booked, prices }: { t: Dict; lang: Locale } & Availability) {
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

  return <InquiryForm key={round} t={t} lang={lang} booked={booked} prices={prices} onSent={() => setSent(true)} />;
}

function InquiryForm({
  t,
  lang,
  booked,
  prices,
  onSent,
}: { t: Dict; lang: Locale; onSent: () => void } & Availability) {
  const c = t.contact;
  const { arrival, departure } = useStay();
  const form = useRef<HTMLFormElement>(null);
  const message: Record<InquiryField, string> = {
    name: c.nameRequired,
    email: c.emailInvalid,
    phone: c.phoneInvalid,
    dates: c.datesIncomplete,
    privacy: c.privacyRequired,
  };

  // One message per field, shown right under it. A dates error remembers which dates it was
  // about and disappears as soon as the guest picks other dates.
  const [errors, setErrors] = useState<Errors>({});
  const stayKey = `${arrival}|${departure}`;
  const [datesErrorFor, setDatesErrorFor] = useState("");
  const errorOf = (f: InquiryField) => (f === "dates" && datesErrorFor !== stayKey ? undefined : errors[f]);
  // The summary next to the button only after a send attempt, not while the guest is still typing.
  const [triedSend, setTriedSend] = useState(false);
  const hasErrors = triedSend && inquiryFields.some((f) => errorOf(f));

  const show = (next: Errors) => {
    setErrors(next);
    setDatesErrorFor(stayKey);
    // Bring the first wrong field into view, so nobody has to hunt for it.
    const first = inquiryFields.find((f) => next[f]);
    if (!first) return;
    requestAnimationFrame(() => {
      const el = first === "dates" ? document.getElementById("dates-button") : (form.current?.elements.namedItem(first) as HTMLElement | null);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
    });
  };

  type FieldEvent = { currentTarget: { form: HTMLFormElement | null } };
  /** Leaving a field: say right away if something is wrong with it. */
  const checkNow = (f: InquiryField, { currentTarget: { form } }: FieldEvent) => {
    if (!form) return;
    const ok = checkField(f, form);
    setErrors((prev) => (Boolean(prev[f]) === !ok ? prev : { ...prev, [f]: ok ? undefined : message[f] }));
  };
  /** Typing: only clear an error once it's fixed (no nagging halfway through typing). */
  const clearWhenFixed = (f: InquiryField, { currentTarget: { form } }: FieldEvent) => {
    if (errors[f] && form && checkField(f, form)) setErrors((prev) => ({ ...prev, [f]: undefined }));
  };

  const [state, action, pending] = useActionState<InquiryState, FormData>(async (prev, fd) => {
    let result: InquiryState;
    try {
      result = await sendInquiry(prev, fd);
    } catch {
      // No connection, or the site was updated while this page was open (the old page can't reach
      // the new server). Show the "try again / WhatsApp" message and keep what the guest typed,
      // instead of crashing the page.
      return { status: "error" };
    }
    if (result.status === "invalid") {
      // The server checks more (full phone number, dates still free): show its findings per field too.
      const next: Errors = {};
      for (const f of result.fields ?? []) {
        if (f === "dates") next.dates = c.datesTaken;
        else if (f === "datesIncomplete") next.dates = c.datesIncomplete;
        else if ((inquiryFields as readonly string[]).includes(f)) next[f as InquiryField] = message[f as InquiryField];
      }
      show(next);
    }
    return result;
  }, { status: "idle" });
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

  return (
    <form
      // Submit manually so React doesn't reset the fields when validation fails.
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        setTriedSend(true);
        // Check everything in the browser first: instant, and points at the exact field.
        const next: Errors = {};
        for (const f of inquiryFields) if (!checkField(f, e.currentTarget)) next[f] = message[f];
        if (Object.keys(next).length) return show(next);
        setErrors({});
        const fd = new FormData(e.currentTarget);
        fd.set("startedAt", String(startedAt.current));
        startTransition(() => action(fd));
      }}
      className="rounded-2xl border border-line bg-paper p-5 sm:p-7"
      noValidate
    >
      <input type="hidden" name="lang" value={lang} />
      {/* Honeypot: hidden from people, bots fill it in. Deliberately not called "company" or similar:
          browser autofill would fill that in for real guests and their inquiry would be dropped. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Leave this empty <input type="text" name="vg_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={c.name} className="sm:col-span-2" error={errorOf("name")}>
          <input
            name="name"
            required
            autoComplete="name"
            className={input}
            aria-invalid={errorOf("name") ? true : undefined}
            onBlur={(e) => checkNow("name", e)}
            onChange={(e) => clearWhenFixed("name", e)}
          />
        </Field>
        <Field label={c.email} error={errorOf("email")}>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={input}
            aria-invalid={errorOf("email") ? true : undefined}
            onBlur={(e) => checkNow("email", e)}
            onChange={(e) => clearWhenFixed("email", e)}
          />
        </Field>
        <Field label={c.phone} hint={errorOf("phone") ? undefined : c.phoneHint} error={errorOf("phone")}>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={c.phonePlaceholder}
            className={input}
            aria-invalid={errorOf("phone") ? true : undefined}
            onBlur={(e) => checkNow("phone", e)}
            onChange={(e) => clearWhenFixed("phone", e)}
          />
        </Field>
        <DatesField
          booked={booked}
          prices={prices}
          t={t}
          lang={lang}
          error={errorOf("dates")}
        />
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
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              name="privacy"
              type="checkbox"
              required
              className="mt-0.5 size-5 shrink-0 accent-sea"
              aria-invalid={errorOf("privacy") ? true : undefined}
              aria-describedby={errorOf("privacy") ? "privacy-error" : undefined}
              onChange={(e) => checkNow("privacy", e)}
            />
            <span className={errorOf("privacy") ? "text-terracotta-dark" : "text-muted"}>
              {c.privacy}{" "}
              <Link href={`/${lang}/privacy`} className="underline underline-offset-2" target="_blank">
                {c.privacyLink}
              </Link>
            </span>
          </label>
          {errorOf("privacy") && (
            <span id="privacy-error" className="mt-1 ml-8 block text-xs font-medium text-terracotta-dark">
              {errorOf("privacy")}
            </span>
          )}
        </div>
      </div>

      {(hasErrors || state.status === "error") && (
        <p role="alert" className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta-dark">
          {hasErrors ? c.invalid : c.error}
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

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-terracotta-dark">{error}</span>}
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
