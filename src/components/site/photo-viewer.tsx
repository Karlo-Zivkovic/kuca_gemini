"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { gallerySrc, type Photo } from "@/lib/photos";

/**
 * Full-screen photo viewer (gallery and floor-plan rooms). The parent owns which photo is open:
 * `index` null = closed. Arrow keys and swipes move through `list`.
 */
export function PhotoViewer({
  list,
  index,
  onIndex,
  caption,
  t,
}: {
  list: Photo[];
  index: number | null;
  onIndex: (i: number | null) => void;
  caption: (p: Photo) => string;
  t: Dict["gallery"];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const total = list.length;
  const step = useCallback((d: number) => index !== null && onIndex((index + d + total) % total), [index, onIndex, total]);
  const close = () => dialogRef.current?.close();

  // Open the dialog when a photo is chosen (a modal <dialog> can only be opened from script).
  useEffect(() => {
    if (index !== null && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index !== null ? list[index] : null;

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onIndex(null)}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
      aria-label={current ? caption(current) : undefined}
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
            alt={caption(current)}
            width={current.w}
            height={current.h}
            sizes="100vw"
            className="max-h-[85dvh] w-auto max-w-full object-contain"
          />
          <p className="absolute inset-x-0 bottom-4 px-16 text-center text-sm text-white/80">
            {caption(current)} · {index + 1} {t.of} {total}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t.close}
            className="absolute right-3 top-3 rounded-full bg-white/10 p-2.5 hover:bg-white/20"
          >
            <X className="size-6" />
          </button>
          {total > 1 && (
            <>
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
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
