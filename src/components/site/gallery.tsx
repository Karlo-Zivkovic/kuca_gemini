"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { gallerySrc, photos, subjectCategory, type PhotoCategory } from "@/lib/photos";
import { track } from "@/lib/consent";
import { PhotoViewer } from "./photo-viewer";

type Filter = "all" | PhotoCategory;
const filters: Filter[] = ["all", "outdoor", "living", "bedrooms", "bathrooms"];
const PREVIEW = 10; // photos shown before "show all" (two mosaic blocks of 5)

export function Gallery({ t }: { t: Dict["gallery"] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const list = filter === "all" ? photos : photos.filter((p) => subjectCategory[p.subject] === filter);
  const visible = expanded ? list : list.slice(0, PREVIEW);
  const label = (f: Filter) => (f === "all" ? t.all : t.categories[f]);
  const count = (f: Filter) => (f === "all" ? photos.length : photos.filter((p) => subjectCategory[p.subject] === f).length);

  const open = (i: number) => {
    setIndex(i);
    track("gallery_open", { photo: list[i].id });
  };

  // Mosaic in blocks of 5: one large tile + four small, large tile alternating left/right.
  const big = (i: number) => i % 5 === 0;
  const bigRight = (i: number) => big(i) && Math.floor(i / 5) % 2 === 1;

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

      <PhotoViewer list={list} index={index} onIndex={setIndex} caption={(p) => t.subjects[p.subject]} t={t} />
    </div>
  );
}
