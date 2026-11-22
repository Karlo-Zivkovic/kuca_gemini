"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import { LanguagePicker } from "./language-picker";

const sections = [
  ["house", "#villa"],
  ["floorPlan", "#floor-plan"],
  ["gallery", "#gallery"],
  ["availability", "#availability"],
  ["location", "#location"],
  ["contact", "#contact"],
] as const;

const HEADER_HEIGHT = 64; // h-16
const GAP = 16; // space left between the header and the section heading

// Scroll so the section starts right under the fixed header. Content above the target can still
// change height while the smooth scroll runs (calendar, images), so re-check once it settles.
function scrollToSection(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  const el = document.getElementById(hash.slice(1));
  if (!el) return; // not on the home page: let the browser navigate
  e.preventDefault();
  const targetTop = () => {
    const style = getComputedStyle(el);
    const extra = parseFloat(style.scrollMarginTop) || 0;
    // Skip most of the section's own top padding so the heading sits just under the header.
    const skip = Math.max(0, (parseFloat(style.paddingTop) || 0) - GAP);
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - extra + skip);
  };
  window.scrollTo({ top: targetTop(), behavior: "smooth" });
  history.replaceState(null, "", hash);

  let lastY = -1;
  const settle = window.setInterval(() => {
    if (window.scrollY !== lastY) {
      lastY = window.scrollY;
      return;
    }
    window.clearInterval(settle);
    const top = targetTop();
    if (Math.abs(top - window.scrollY) > 2) window.scrollTo({ top, behavior: "smooth" });
  }, 150);
  window.setTimeout(() => window.clearInterval(settle), 4000);
}

export function Header({ t, lang, alwaysSolid = false }: { t: Dict["nav"]; lang: Locale; alwaysSolid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = alwaysSolid || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solid ? "bg-paper/95 text-ink shadow-sm backdrop-blur" : "bg-transparent text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${lang}`} className="font-serif text-2xl font-semibold tracking-wide" onClick={() => setOpen(false)}>
          Villa Gemini
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium lg:flex" aria-label={t.mainMenu}>
          {sections.map(([key, href]) => (
            <a key={key} href={`/${lang}${href}`} onClick={(e) => scrollToSection(e, href)} className="opacity-90 hover:opacity-100 hover:underline underline-offset-4">
              {t[key]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker lang={lang} onLight={solid} label={t.language} />
          <a
            href={`/${lang}#contact`}
            onClick={(e) => scrollToSection(e, "#contact")}
            className="hidden rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-terracotta-dark sm:inline-block"
          >
            {t.inquire}
          </a>
          <button
            type="button"
            className="rounded-full p-2 lg:hidden"
            aria-label={open ? t.close : t.menu}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper px-4 pb-6 pt-2 lg:hidden" aria-label={t.menu}>
          {sections.map(([key, href]) => (
            <a
              key={key}
              href={`/${lang}${href}`}
              onClick={(e) => {
                setOpen(false);
                scrollToSection(e, href);
              }}
              className="block border-b border-line py-3 text-lg">
              {t[key]}
            </a>
          ))}
          <div className="mt-4">
            <a
              href={`/${lang}#contact`}
              onClick={(e) => {
                setOpen(false);
                scrollToSection(e, "#contact");
              }}
              className="block rounded-full bg-terracotta px-4 py-3 text-center font-semibold text-white"
            >
              {t.inquire}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
