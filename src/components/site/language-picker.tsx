"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n";
import { track } from "@/lib/consent";

const names: Record<Locale, string> = { hr: "Hrvatski", en: "English", de: "Deutsch" };

function saveLangCookie(l: Locale) {
  document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
}

export function LanguagePicker({ lang, onLight }: { lang: Locale; onLight: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (l: Locale) => {
    setOpen(false);
    if (l === lang) return;
    saveLangCookie(l);
    track("language_change", { language: l });
    // Stay at the same spot on the page, just in the other language.
    router.replace(pathname.replace(/^\/(hr|en|de)(?=\/|$)/, `/${l}`), { scroll: false });
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${names[lang]}`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold uppercase transition ${
          onLight ? "hover:bg-stone" : "hover:bg-white/15"
        }`}
      >
        <Globe className="size-4" />
        {lang}
        <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-line bg-paper py-1 text-ink shadow-lg"
        >
          {locales.map((l) => (
            <li key={l} role="option" aria-selected={l === lang}>
              <button
                type="button"
                onClick={() => choose(l)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-sand ${
                  l === lang ? "font-semibold" : ""
                }`}
              >
                {names[l]}
                {l === lang && <Check className="size-4 text-sea" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
