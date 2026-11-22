"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import clsx from "clsx";
import { motion, useAnimationControls } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * A drifting bubble cluster naming the Claude Skills actually used to build
 * this site (issue #27). Names only — never a skill's content or
 * instructions, per the owner's instruction. Every name is real DOM text on
 * a <button>, reachable to assistive tech regardless of the bubble layout.
 *
 * Idle motion is a small looping drift per bubble; clicking or dragging one
 * gives it a light spring-physics nudge — matching the site's existing small
 * physical interactions (the brain scrub, the corner-hover on project
 * cards). Under `prefers-reduced-motion` this renders as a plain wrapped
 * list of the same names instead, per the site's motion convention (Reveal,
 * TextAnimate, ScrollWords all do the same).
 *
 * Layout (effort 054): fixed percentage positions collided on phones — 19
 * overlapping pairs out of 15 bubbles on a 412px viewport, labels unreadable,
 * one clipped at the edge. Positions are now packed from each bubble's
 * measured size: seeded on the same golden-angle spiral, then relaxed apart
 * until no two overlap, growing the box if the spiral cannot fit.
 */

type Size = { w: number; h: number };
type Point = { x: number; y: number };
type Layout = { pos: Point[]; height: number; drift: number };

const EDGE = 8;
const MAX_ITERATIONS = 400;

/** Golden-angle phyllotaxis seed, as a fraction of the box: a loose cluster, not a grid. */
function seed(index: number, total: number): Point {
  const angle = (index * 137.508 * Math.PI) / 180;
  const radius = (8 + (index / Math.max(total - 1, 1)) * 38) / 46;
  return { x: 0.5 + 0.5 * radius * Math.cos(angle), y: 0.5 + 0.5 * radius * Math.sin(angle) };
}

/** Fallback position before measurement (and on the server): the spiral as percentages. */
function seedPercent(index: number, total: number) {
  const s = seed(index, total);
  return { left: `${Math.min(88, Math.max(12, s.x * 100))}%`, top: `${Math.min(84, Math.max(16, s.y * 100))}%` };
}

/**
 * Pack bubbles of the given sizes into a W×H box. Deterministic: same sizes
 * and box, same layout. Returns top-left positions and how many pairs still
 * overlap (0 unless the box is too small).
 */
export function packBubbles(sizes: Size[], W: number, H: number, gap: number): { pos: Point[]; overlaps: number } {
  const n = sizes.length;
  const c = sizes.map((s, i) => {
    const f = seed(i, n);
    return { x: EDGE + s.w / 2 + f.x * Math.max(0, W - s.w - 2 * EDGE), y: EDGE + s.h / 2 + f.y * Math.max(0, H - s.h - 2 * EDGE) };
  });
  const clamp = (i: number) => {
    const { w, h } = sizes[i];
    c[i].x = Math.min(Math.max(c[i].x, w / 2 + EDGE), W - w / 2 - EDGE);
    c[i].y = Math.min(Math.max(c[i].y, h / 2 + EDGE), H - h / 2 - EDGE);
  };

  for (let it = 0; it < MAX_ITERATIONS; it++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = c[j].x - c[i].x;
        const dy = c[j].y - c[i].y;
        const ox = (sizes[i].w + sizes[j].w) / 2 + gap - Math.abs(dx);
        const oy = (sizes[i].h + sizes[j].h) / 2 + gap - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        // Push apart along the axis that needs the smaller move.
        if (ox < oy) {
          const s = dx === 0 ? (i % 2 ? 1 : -1) : Math.sign(dx);
          c[i].x -= (s * ox) / 2;
          c[j].x += (s * ox) / 2;
        } else {
          const s = dy === 0 ? (i % 2 ? 1 : -1) : Math.sign(dy);
          c[i].y -= (s * oy) / 2;
          c[j].y += (s * oy) / 2;
        }
        clamp(i);
        clamp(j);
      }
    }
    if (!moved) break;
  }

  let overlaps = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ox = (sizes[i].w + sizes[j].w) / 2 - Math.abs(c[j].x - c[i].x);
      const oy = (sizes[i].h + sizes[j].h) / 2 - Math.abs(c[j].y - c[i].y);
      if (ox > 0 && oy > 0) overlaps++;
    }
  }
  return { pos: c.map((p, i) => ({ x: p.x - sizes[i].w / 2, y: p.y - sizes[i].h / 2 })), overlaps };
}

function Bubble({
  name,
  index,
  total,
  pos,
  drift: driftScale,
  containerRef,
  buttonRef,
}: {
  name: string;
  index: number;
  total: number;
  pos: Point | undefined;
  drift: number;
  containerRef: RefObject<HTMLDivElement | null>;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const controls = useAnimationControls();
  // A drag ends in a pointerup on the button, which the browser also reports
  // as a click. Without this flag that click fired `nudge()` and flung a
  // just-dropped bubble 60-130px in a random direction.
  const dragged = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Scaled down in a narrow box so neighbours packed a gap apart do not drift into each other.
    const driftX = (8 + ((index * 5) % 14)) * driftScale;
    const driftY = (10 + ((index * 7) % 12)) * driftScale;
    const duration = 7 + (index % 5);

    async function drift() {
      while (!cancelled) {
        try {
          await controls.start({
            x: [0, driftX, 0, -driftX, 0],
            y: [0, -driftY, 0, driftY, 0],
            transition: { duration, ease: "easeInOut" },
          });
        } catch {
          // interrupted by a click/drag nudge — loop again from wherever it landed
        }
      }
    }
    drift();
    return () => {
      cancelled = true;
    };
  }, [controls, index, driftScale]);

  function nudge() {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    const kick = 60 + Math.random() * 70;
    const angle = Math.random() * Math.PI * 2;
    controls.start({
      x: Math.cos(angle) * kick,
      y: Math.sin(angle) * kick,
      transition: { type: "spring", stiffness: 220, damping: 12 },
    });
  }

  const fallback = seedPercent(index, total);
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={nudge}
      onPointerDown={() => {
        dragged.current = false;
      }}
      onDragStart={() => {
        dragged.current = true;
      }}
      animate={controls}
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0.6}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.05 }}
      style={pos ? { left: pos.x, top: pos.y } : fallback}
      className={clsx(
        "glass hairline absolute cursor-grab touch-none rounded-full px-4 py-2.5 text-xs font-medium whitespace-nowrap text-paper/90 select-none active:cursor-grabbing",
        !pos && "-translate-x-1/2 -translate-y-1/2",
      )}
    >
      {name}
    </motion.button>
  );
}

function StaticSkillsList({ skills }: { skills: string[] }) {
  return (
    <ul className="flex flex-wrap gap-3">
      {skills.map((name) => (
        <li key={name} className="glass hairline rounded-full px-4 py-2 text-xs font-medium text-paper/90">
          {name}
        </li>
      ))}
    </ul>
  );
}

export function SkillsBubbles({ skills }: { skills: string[] }) {
  const reduced = useReducedMotionSafe();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const box = containerRef.current;
    if (!box) return;
    let lastWidth = -1;

    const place = (force = false) => {
      const W = box.clientWidth;
      if (!W || (!force && W === lastWidth)) return;
      lastWidth = W;
      const sizes = buttons.current.map((b) => ({ w: b?.offsetWidth ?? 0, h: b?.offsetHeight ?? 0 }));
      const drift = Math.min(1, W / 650);
      const gap = 8 + 12 * drift;
      const minH = parseFloat(getComputedStyle(box).minHeight) || box.clientHeight;
      // Grow the box in steps until the spiral packs with no overlap.
      let best = packBubbles(sizes, W, minH, gap);
      let H = minH;
      for (let h = minH + 32; best.overlaps > 0 && h <= minH * 2; h += 32) {
        best = packBubbles(sizes, W, h, gap);
        H = h;
      }
      setLayout({ pos: best.pos, height: H, drift });
    };

    place(true);
    // Web fonts change label widths after first paint; re-measure once they land.
    document.fonts?.ready.then(() => place(true)).catch(() => {});
    const ro = new ResizeObserver(() => place());
    ro.observe(box);
    return () => ro.disconnect();
  }, [reduced, skills]);

  if (reduced) return <StaticSkillsList skills={skills} />;

  return (
    <div
      ref={containerRef}
      style={layout ? { height: layout.height } : undefined}
      className="hairline relative min-h-[28rem] w-full overflow-hidden rounded-3xl border sm:min-h-[30rem]"
    >
      {skills.map((name, i) => (
        <Bubble
          key={name}
          name={name}
          index={i}
          total={skills.length}
          pos={layout?.pos[i]}
          drift={layout?.drift ?? 1}
          containerRef={containerRef}
          buttonRef={(el) => {
            buttons.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
