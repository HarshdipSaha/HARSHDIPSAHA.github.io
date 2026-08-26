"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * A thin strip of slowly drifting dot-matrix glyphs: a plasma field sampled on
 * a coarse grid and quantised to four square sizes. Deliberately throttled —
 * 15 fps, one cell per 10 css px, paused while off-screen — so it reads as
 * ambient texture, never as spectacle.
 */
export function MatrixRibbon({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 10;
    let w = 0, h = 0, cols = 0, rows = 0;
    const fit = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.round(r.width);
      h = Math.round(r.height);
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      frame(t0);
    };

    // Two rotated sine layers plus a slow drift give a plasma without noise tables.
    const field = (x: number, y: number, t: number) => {
      const a = Math.sin(x * 0.11 + t) + Math.sin(y * 0.37 - t * 0.7);
      const b = Math.sin((x * 0.05 + y * 0.09) * 1.7 + t * 0.4);
      const c = Math.sin(Math.hypot(x - cols * 0.35, y - rows * 0.5) * 0.12 - t * 0.9);
      return (a + b + c) / 6 + 0.5; // 0..1
    };

    const SIZES = [0, 1.5, 2.5, 4];
    const t0 = 0;
    let t = 0;
    const frame = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(235, 229, 225, 0.42)";
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const v = field(i, j, t);
          // Fade the strip out toward both horizontal edges.
          const edge = Math.min(1, Math.min(i, cols - i) / (cols * 0.18));
          const s = SIZES[Math.min(3, Math.floor(v * v * 4))] * edge;
          if (s <= 0) continue;
          ctx.fillRect(i * CELL + (CELL - s) / 2, j * CELL + (CELL - s) / 2, s, s);
        }
      }
    };

    let running = false;
    let timer = 0;
    const tick = () => {
      if (!running) return;
      frame(reduced ? 0 : 0.02);
      timer = window.setTimeout(() => requestAnimationFrame(tick), 1000 / 15);
    };
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting && !reduced;
      if (running) tick();
      else window.clearTimeout(timer);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();

    return () => {
      running = false;
      window.clearTimeout(timer);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden="true" className={`block h-[72px] w-full ${className}`} />;
}
