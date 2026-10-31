"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/consent";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { useStay } from "./booking-context";

/** Builds "Hello! I'm interested in Villa Gemini for 3.7.–10.7.2027." */
function useMessage(greeting: string, forWord?: string) {
  const { arrival, departure } = useStay();
  if (!arrival || !departure || !forWord) return `${greeting}.`;
  const fmt = (s: string) => s.split("-").reverse().map(Number).join(".");
  return `${greeting} ${forWord} ${fmt(arrival)} – ${fmt(departure)}.`;
}

export function WhatsAppLink({
  message,
  forWord,
  source,
  className,
  children,
}: {
  message: string;
  forWord?: string;
  source: string;
  className?: string;
  children: ReactNode;
}) {
  const text = useMessage(message, forWord);
  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener"
      onClick={() => track("whatsapp_click", { source })}
      className={className}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

export function WhatsAppFloat({ greeting, forWord, label }: { greeting: string; forWord: string; label: string }) {
  const text = useMessage(greeting, forWord);
  return (
    <a
      href={whatsappLink(text)}
      target="_blank"
      rel="noopener"
      aria-label={label}
      title={label}
      onClick={() => track("whatsapp_click", { source: "floating" })}
      className="fixed bottom-4 right-4 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-lg ring-4 ring-white/60 transition hover:scale-105"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
