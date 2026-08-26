"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
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

/**
 * Illustrative segmentation: during the "RECAP-Net reads the pair" stage, a
 * soft tangerine outline grows and shrinks across ~40 slices over the right
 * parietal region, the way a tumour's cross-section appears and disappears as
 * you pass through it. It is drawn on a population-average template brain and
 * labelled as illustrative — there is no patient data anywhere on this site.
 */
const SEG = { from: 58, to: 102, u: 0.635, v: 0.42, r: 0.075 };
function drawSegmentation(ctx: CanvasRenderingContext2D, frame: number, x0: number, y0: number, s: number, dpr: number) {
  const t = (frame - SEG.from) / (SEG.to - SEG.from);
  if (t <= 0 || t >= 1) return;
  const a = Math.sin(Math.PI * t); // 0 → 1 → 0 across the slices
  const cx = x0 + s * SEG.u, cy = y0 + s * SEG.v, R = s * SEG.r * (0.35 + 0.65 * a);
  ctx.save();
  ctx.beginPath();
  for (let k = 0; k <= 72; k++) {
    const th = (k / 72) * Math.PI * 2;
    const r = R * (1 + 0.16 * Math.sin(3 * th + 1.3) + 0.09 * Math.sin(5 * th + 0.4) + 0.06 * Math.sin(7 * th + 2.1));
    const px = cx + Math.cos(th) * r, py = cy + Math.sin(th) * r * 0.92;
    k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.globalAlpha = Math.min(1, a * 1.6);
  ctx.fillStyle = "rgba(244, 151, 82, 0.14)";
  ctx.fill();
  ctx.shadowColor = "rgba(244, 151, 82, 0.9)";
  ctx.shadowBlur = 14 * dpr;
  ctx.strokeStyle = "#f49752";
  ctx.lineWidth = 1.75 * dpr;
  ctx.stroke();
  ctx.shadowBlur = 0;
  // Leader line + label, to the right of the outline.
  const lx = cx + R * 1.25, ly = cy - R * 0.9, ex = lx + 28 * dpr;
  ctx.strokeStyle = "rgba(244, 151, 82, 0.7)";
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath(); ctx.moveTo(cx + R * 0.7, cy - R * 0.55); ctx.lineTo(lx, ly); ctx.lineTo(ex, ly); ctx.stroke();
  ctx.font = `500 ${11 * dpr}px ui-monospace, Menlo, monospace`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(235, 229, 225, 0.85)";
  ctx.fillText("tumour region", ex + 6 * dpr, ly - 7 * dpr);
  ctx.fillStyle = "rgba(235, 229, 225, 0.5)";
  ctx.fillText("illustrative · template brain", ex + 6 * dpr, ly + 7 * dpr);
  ctx.restore();
}

const frameSrc = (tier: string, i: number) => `/brain/${tier}/${String(i).padStart(3, "0")}.webp`;

/**
 * A 160-slice pass through a brain, scrubbed by scroll. One sticky viewport,
 * a 450vh runway, and a canvas that always draws the nearest *loaded* frame,
 * so scrubbing works from the first decoded image instead of waiting for all
 * of them.
 */
export function BrainSequence({ stages, eyebrow, hint }: { stages: Stage[]; eyebrow: string; hint: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>(Array(FRAMES).fill(null));
  const current = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const reduced = useReducedMotionSafe();

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
    // Contain, with a touch of zoom so the brain fills a phone's width. In
    // landscape the brain sits at 63% of the width so the left column stays
    // clear for the stage copy; in portrait it is centred under a bottom scrim.
    const s = Math.min(w, h) * (w < h ? 1.12 : 1.02);
    const cx = w > h ? w * 0.63 : w / 2;
    ctx.drawImage(img, cx - s / 2, (h - s) / 2, s, s);
    drawSegmentation(ctx, want, cx - s / 2, (h - s) / 2, s, Math.min(window.devicePixelRatio || 1, 1.5));
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
      <section ref={ref} className="relative px-6 py-24 md:px-12">
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

        {/* Scrims: a bottom ramp under the overlay copy in portrait, a
            left-to-right ramp behind the copy column in landscape. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[62vh] bg-gradient-to-t from-ink via-ink/75 to-transparent md:landscape:hidden" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52vw] bg-gradient-to-r from-ink via-ink/70 to-transparent md:landscape:block" />

        {/* Viewer chrome: caption left, live slice readout right. */}
        <div className="pointer-events-none absolute inset-x-0 top-24 flex items-center justify-between gap-3 px-5 md:top-28 md:px-12">
          <span className="glass hidden items-center gap-2 rounded-full px-3.5 py-1.5 sm:inline-flex">
            <span className="label !text-[11px] !text-paper/60">{eyebrow}</span>
            <span aria-hidden="true" className="h-3 w-px bg-white/15" />
            <span className="label !text-[11px]">{hint}</span>
          </span>
          <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
            <span aria-hidden="true" className={pct < 100 ? "size-1.5 rounded-full bg-paper/40" : "size-1.5 rounded-full bg-tangerine"} />
            <span className="label !text-[11px] !text-paper/70 tabular-nums">
              {pct < 100 ? `loading ${pct}%` : <>slice <span ref={readoutRef}>001 / {FRAMES}</span></>}
            </span>
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
    // Portrait: bottom overlay above the scrim. Landscape (md+): a vertically
    // centred left column, 7vw in, at most 42vw wide so it never reaches the
    // brain drawn at 63%.
    <div className="pointer-events-none absolute inset-x-0 bottom-[8vh] px-6 md:landscape:inset-y-0 md:landscape:left-[7vw] md:landscape:right-auto md:landscape:flex md:landscape:w-[min(34rem,42vw)] md:landscape:items-center md:landscape:px-0">
      <motion.div style={{ opacity, y, filter }}>
        <StageCopy stage={stage} interactive />
      </motion.div>
    </div>
  );
}

function StageCopy({ stage, interactive }: { stage: Stage; interactive?: boolean }) {
  return (
    <div className={interactive ? "pointer-events-auto" : undefined}>
      <p className="label mb-4">{stage.kicker}</p>
      <h2 className="display text-[clamp(2.4rem,5.5vw,4.6rem)] text-paper">{stage.title}</h2>
      <p className="mt-5 max-w-[32rem] text-[1rem] leading-relaxed text-paper/85 md:text-[1.1rem]">{stage.body}</p>
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
