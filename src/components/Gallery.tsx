"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Group, Item } from "@/components/motion/Reveal";
import type { ImageMeta } from "@/lib/projects";

type Photo = ImageMeta & { thumb: string };

export function Gallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = () => {
    dialog.current?.close();
    setIndex(null);
  };
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

  const current = index === null ? null : photos[index];

  return (
    <>
      <Group className="columns-2 gap-4 md:columns-3 md:gap-5" stagger={0.06} amount={0.05}>
        {photos.map((p, i) => (
          <Item key={p.src} className="mb-4 break-inside-avoid md:mb-5">
            <button
              type="button"
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-2 text-left"
              aria-label={`Open photograph ${i + 1} of ${photos.length}`}
            >
              <img
                src={p.thumb}
                alt={`Photograph ${i + 1}`}
                width={p.w}
                height={p.h}
                loading="lazy"
                decoding="async"
                className="w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                style={{ aspectRatio: `${p.w} / ${p.h}` }}
              />
            </button>
          </Item>
        ))}
      </Group>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/90 backdrop:backdrop-blur-md"
        data-lenis-prevent
      >
        {current && (
          <div className="flex h-full w-full items-center justify-center p-4 pb-20 md:p-10 md:pb-20">
            <img
              src={current.src}
              alt={`Photograph ${(index ?? 0) + 1}`}
              width={current.w}
              height={current.h}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3">
              <button type="button" onClick={() => step(-1)} className="glass rounded-full px-4 py-2 text-sm text-paper" aria-label="Previous">
                ←
              </button>
              <span className="label !text-[11px] tabular-nums">
                {(index ?? 0) + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => step(1)} className="glass rounded-full px-4 py-2 text-sm text-paper" aria-label="Next">
                →
              </button>
            </div>
            <button type="button" onClick={close} className="glass absolute right-5 top-5 rounded-full px-4 py-2 text-sm text-paper" aria-label="Close">
              Close
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
