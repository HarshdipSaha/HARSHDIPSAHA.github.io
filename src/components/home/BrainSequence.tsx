"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Pill } from "@/components/ui";

const FRAMES = 160;
const CHUNK = 40;
const BG = "#171519";

type Stage = {
  kicker: string;
  title: string;
  body: string;
  links?: { label: string; href: string; accent?: boolean }[];
};

/** Scroll windows for the three overlays, as fractions of the section. */
const WINDOWS: [number, number][] = [
  [0.1, 0.3],
  [0.4, 0.6],
  [0.72, 0.96],
];

const frameSrc = (tier: string, i: number) => `/brain/${tier}/${String(i).padStart(3, "0")}.webp`;

/**
 * A 160-slice pass through a brain, scrubbed by scroll. One sticky viewport,
 * a 450vh runway, and a canvas that always draws the nearest *loaded* frame,
 * so scrubbing works from the first decoded image instead of waiting for all
 * of them.
 */
export function BrainSequence({ stages, eyebrow }: { stages: Stage[]; eyebrow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>(Array(FRAMES).fill(null));
  const current = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dim = useTransform(scrollYProgress, [0, 0.12, 0.7, 1], [0, 0.3, 0.55, 0.6]);

  // Draw whatever is nearest to the wanted frame.
  const draw = (want: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let img: HTMLImageElement | null = null;
    for (let d = 0; d < FRAMES && !img; d++) {
      img = frames.current[want - d] ?? frames.current[want + d] ?? null;
    }
    if (!img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    // Contain, with a touch of zoom so the brain fills a phone's width.
    const s = Math.min(w, h) * (w < h ? 1.12 : 1.02);
    ctx.drawImage(img, (w - s) / 2, (h - s) / 2, s, s);
    if (readoutRef.current) readoutRef.current.textContent = `${String(want + 1).padStart(3, "0")} / ${FRAMES}`;
  };

  // Load frames in chunks, two chunks in flight, first chunk first.
  useEffect(() => {
    const tier = window.innerWidth <= 768 ? "640" : "1080";
    let cancelled = false;
    let done = 0;
    const loadChunk = (c: number) =>
      new Promise<void>((resolve) => {
        const start = c * CHUNK;
        const end = Math.min(FRAMES, start + CHUNK);
        let pending = end - start;
        for (let i = start; i < end; i++) {
          const img = new Image();
          img.decoding = "async";
          img.onload = img.onerror = () => {
            if (cancelled) return;
            if (img.naturalWidth) frames.current[i] = img;
            done++;
            setLoaded(done);
            if (i === current.current || (done === 1 && i === 0)) draw(current.current);
            if (--pending === 0) resolve();
          };
          img.src = frameSrc(tier, i);
        }
      });
    (async () => {
      const chunks = Math.ceil(FRAMES / CHUNK);
      await loadChunk(0);
      for (let c = 1; c < chunks; c += 2) {
        await Promise.all([loadChunk(c), c + 1 < chunks ? loadChunk(c + 1) : Promise.resolve()]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Size the canvas to its box (capped DPR: the frames are 1080px anyway).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw(current.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.max(0, Math.min(FRAMES - 1, Math.floor(v * (FRAMES - 1))));
    if (i !== current.current) {
      current.current = i;
      requestAnimationFrame(() => draw(i));
    }
  });

  if (reduced) {
    return (
      <section className="relative px-6 py-24 md:px-12">
        <img src={frameSrc("1080", 84)} alt="Axial MRI slice through the ICBM 152 template brain" className="mx-auto w-full max-w-2xl rounded-2xl" width={1080} height={1080} />
        <div className="mx-auto mt-16 grid max-w-5xl gap-14 md:grid-cols-3">
          {stages.map((s) => (
            <StageCopy key={s.title} stage={s} />
          ))}
        </div>
      </section>
    );
  }

  const pct = Math.round((loaded / FRAMES) * 100);

  return (
    <section ref={ref} className="relative h-[450vh]" aria-label="Brain MRI sequence with research summary">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <motion.div aria-hidden="true" className="absolute inset-0 bg-black" style={{ opacity: dim }} />

        {/* Viewer chrome */}
        <div className="pointer-events-none absolute inset-x-0 top-24 flex items-start justify-between px-6 md:top-28 md:px-12">
          <span className="label hidden !text-[11px] sm:block">{eyebrow}</span>
          <span className="label !text-[11px] tabular-nums">
            {pct < 100 ? `loading ${pct}%` : <>slice <span ref={readoutRef}>001 / {FRAMES}</span></>}
          </span>
        </div>

        {stages.map((s, i) => (
          <Overlay key={s.title} stage={s} progress={scrollYProgress} window={WINDOWS[i]} />
        ))}
      </div>
    </section>
  );
}

function Overlay({ stage, progress, window: [a, b] }: { stage: Stage; progress: MotionValue<number>; window: [number, number] }) {
  // Motion drives these with a native scroll timeline, so every input offset
  // must stay inside [0, 1].
  const fade = 0.06;
  const range = [Math.max(0, a - fade), a, b, Math.min(1, b + fade)];
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, range, [28, 0, 0, -28]);
  const filter = useTransform(progress, range, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(8px)"]);
  return (
    <motion.div style={{ opacity, y, filter }} className="absolute inset-x-0 bottom-[10vh] px-6 md:bottom-[14vh] md:left-[8vw] md:right-auto md:max-w-[34rem] md:px-0">
      <StageCopy stage={stage} interactive />
    </motion.div>
  );
}

function StageCopy({ stage, interactive }: { stage: Stage; interactive?: boolean }) {
  return (
    <div className={interactive ? "pointer-events-auto" : undefined}>
      <p className="label mb-4">{stage.kicker}</p>
      <h2 className="display text-[clamp(2.4rem,5.5vw,4.6rem)] text-paper">{stage.title}</h2>
      <p className="mt-5 max-w-[30rem] text-[1.05rem] leading-relaxed text-paper/80 md:text-lg">{stage.body}</p>
      {stage.links && (
        <div className="mt-7 flex flex-wrap gap-3">
          {stage.links.map((l) => (
            <Pill key={l.href} href={l.href} variant={l.accent ? "accent" : "glass"}>
              {l.label} <span aria-hidden="true">↗</span>
            </Pill>
          ))}
        </div>
      )}
    </div>
  );
}
