"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin } from "lucide-react";
import { photoSrc, site } from "@/lib/config";
import { useConsent } from "@/lib/consent";

/** Google Maps iframe, loaded only after cookie consent or an explicit click. */
export function MapEmbed({ showLabel, note, title }: { showLabel: string; note: string; title: string }) {
  const consent = useConsent();
  const [clicked, setClicked] = useState(false);
  const load = consent === "granted" || clicked;

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-stone sm:aspect-[16/10]">
      {load ? (
        <iframe
          src={site.links.googleMapsEmbed}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <>
          <Image src={photoSrc("house-blue-hour")} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover opacity-40 blur-[2px]" />
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <button
                type="button"
                onClick={() => setClicked(true)}
                className="inline-flex items-center gap-2 rounded-full bg-sea px-5 py-3 font-semibold text-white shadow-lg hover:bg-sea-dark"
              >
                <MapPin className="size-5" /> {showLabel}
              </button>
              <p className="mt-3 text-xs text-ink/80">{note}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
