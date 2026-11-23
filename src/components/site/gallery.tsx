"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { gallerySrc, photos, subjectCategory, type PhotoCategory } from "@/lib/photos";
import { track } from "@/lib/consent";

type Filter = "all" | PhotoCategory;
const filters: Filter[] = ["all", "outdoor", "living", "bedrooms", "bathrooms"];
const PREVIEW = 10; // photos shown before "show all" (two mosaic blocks of 5)

export function Gallery({ t }: { t: Dict["gallery"] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const list = filter === "all" ? photos : photos.filter((p) => subjectCategory[p.subject] === filter);
  const visible = expanded ? list : list.slice(0, PREVIEW);
  const alt = (i: number) => t.subjects[list[i].subject];
  const label = (f: Filter) => (f === "all" ? t.all : t.categories[f]);
  const count = (f: Filter) => (f === "all" ? photos.length : photos.filter((p) => subjectCategory[p.subject] === f).length);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
    track("gallery_open", { photo: list[i].id });
  };
  const close = () => dialogRef.current?.close();
  const total = list.length;
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + total) % total)), [total]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  // Mosaic in blocks of 5: one large tile + four small, large tile alternating left/right.
  const big = (i: number) => i % 5 === 0;
  const bigRight = (i: number) => big(i) && Math.floor(i / 5) % 2 === 1;

  const current = index !== null ? list[index] : null;

  return (
    <div ref={rootRef}>
      <div role="tablist" aria-label={t.title} className="mb-6 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => {
              setFilter(f);
              setExpanded(false);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f ? "bg-sea text-white shadow" : "bg-stone/70 text-ink hover:bg-stone"
            }`}
          >
            {label(f)} <span className={filter === f ? "text-white/70" : "text-muted"}>{count(f)}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-flow-row-dense auto-rows-[9rem] grid-cols-2 gap-2 sm:auto-rows-[11rem] sm:gap-3 md:grid-cols-4">
        {visible.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(i)}
            className={`group relative overflow-hidden rounded-xl bg-stone focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sea ${
              big(i) ? `col-span-2 row-span-2 ${bigRight(i) ? "md:col-start-3" : ""}` : ""
            }`}
          >
            <Image
              src={gallerySrc(p.id)}
              alt={t.subjects[p.subject]}
              fill
              sizes={big(i) ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {list.length > PREVIEW && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              if (expanded) rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              setExpanded((e) => !e);
            }}
            className="rounded-xl border border-ink px-6 py-3 font-semibold transition hover:bg-ink/5"
          >
            {expanded ? t.showLess : t.showAll.replace("{n}", String(list.length))}
          </button>
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        aria-label={index !== null ? alt(index) : undefined}
      >
        {current && index !== null && (
          <div
            className="relative flex h-full w-full items-center justify-center"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <Image
              key={current.id}
              src={gallerySrc(current.id)}
              alt={alt(index)}
              width={current.w}
              height={current.h}
              sizes="100vw"
              className="max-h-[85dvh] w-auto max-w-full object-contain"
            />
            <p className="absolute inset-x-0 bottom-4 px-16 text-center text-sm text-white/80">
              {alt(index)} · {index + 1} {t.of} {list.length}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="absolute right-3 top-3 rounded-full bg-white/10 p-2.5 hover:bg-white/20"
            >
              <X className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t.prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 hover:bg-white/20 sm:left-4"
            >
              <ChevronLeft className="size-7" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t.next}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 hover:bg-white/20 sm:right-4"
            >
              <ChevronRight className="size-7" />
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
