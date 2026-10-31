"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PHOTO_H, PHOTO_W, photoSrc, type PhotoId } from "@/lib/config";
import { track } from "@/lib/consent";

type Labels = { close: string; prev: string; next: string; of: string; alts: Record<PhotoId, string> };

export function Gallery({ photos, t }: { photos: PhotoId[]; t: Labels }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
    track("gallery_open", { photo: photos[i] });
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

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

  return (
    <>
      <div className="grid grid-flow-row-dense auto-rows-[9rem] grid-cols-2 gap-2 sm:auto-rows-[11rem] sm:gap-3 md:grid-cols-4">
        {photos.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => open(i)}
            className={`group relative overflow-hidden rounded-xl bg-stone focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sea ${
              big(i) ? `col-span-2 row-span-2 ${bigRight(i) ? "md:col-start-3" : ""}` : ""
            }`}
          >
            <Image
              src={photoSrc(id)}
              alt={t.alts[id]}
              fill
              sizes={big(i) ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        aria-label={index !== null ? t.alts[photos[index]] : undefined}
      >
        {index !== null && (
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
              key={photos[index]}
              src={photoSrc(photos[index])}
              alt={t.alts[photos[index]]}
              width={PHOTO_W}
              height={PHOTO_H}
              sizes="100vw"
              className="max-h-[85dvh] w-auto max-w-full object-contain"
            />
            <p className="absolute inset-x-0 bottom-4 px-16 text-center text-sm text-white/80">
              {t.alts[photos[index]]} · {index + 1} {t.of} {photos.length}
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
    </>
  );
}
