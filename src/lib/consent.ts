"use client";

import { useSyncExternalStore } from "react";

export type Consent = "granted" | "denied" | null;

const KEY = "vg-consent";
const EVENT = "vg-consent-change";

function read(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<Consent, null> | null) {
  try {
    if (value) localStorage.setItem(KEY, value);
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: choice lasts for this page view only */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** "Cookie settings" link: show the banner again. */
export const reopenConsent = () => setConsent(null);

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** `undefined` during SSR / before hydration, so nothing flashes. */
export function useConsent(): Consent | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

type Gtag = (...args: unknown[]) => void;

/** Fire a GA4 event if analytics is loaded (i.e. the visitor consented). */
export function track(event: string, params?: Record<string, string | number | boolean>) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  gtag?.("event", event, params ?? {});
}
