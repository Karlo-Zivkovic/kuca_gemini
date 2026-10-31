"use client";

import { reopenConsent } from "@/lib/consent";

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={reopenConsent} className="text-left hover:text-white">
      {label}
    </button>
  );
}
