"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motion, useMotionValue, animate, type AnimationPlaybackControls } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * A drifting bubble cluster naming the Claude Skills actually used to build
 * this site (issue #27). Names only — never a skill's content or
 * instructions, per the owner's instruction. Every name is real DOM text on
 * a <button>, reachable to assistive tech regardless of the bubble layout.
 *
 * Idle motion is a small looping drift per bubble, anchored to wherever it
 * currently sits (never a hard reset to a fixed origin); clicking or
 * dragging one pauses the drift and gives it a light spring-physics nudge,
 * then drift resumes from the new resting position — matching the site's
 * existing small physical interactions (the brain scrub, the corner-hover
 * on project cards). Under `prefers-reduced-motion` this renders as a plain
 * wrapped list of the same names instead, per the site's motion convention
 * (Reveal, TextAnimate, ScrollWords all do the same).
 */

/** Golden-angle phyllotaxis so the bubbles read as a loose cluster, not a grid. */
function layoutPosition(index: number, total: number) {
  const angle = index * 137.508;
  const radius = 6 + (index / Math.max(total - 1, 1)) * 32;
  const cx = 50 + radius * Math.cos((angle * Math.PI) / 180);
  const cy = 50 + radius * Math.sin((angle * Math.PI) / 180) * 0.72;
  return {
    left: `${Math.min(90, Math.max(10, cx))}%`,
    top: `${Math.min(86, Math.max(14, cy))}%`,
  };
}

function Bubble({
  name,
  index,
  total,
  containerRef,
}: {
  name: string;
  index: number;
  total: number;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pos = layoutPosition(index, total);
  const activeAnimations = useRef<AnimationPlaybackControls[]>([]);

  const driftX = 8 + ((index * 5) % 14);
  const driftY = 10 + ((index * 7) % 12);
  const duration = 7 + (index % 5);

  function stopAll() {
    for (const a of activeAnimations.current) a.stop();
    activeAnimations.current = [];
  }

  function startDrift() {
    stopAll();
    // Anchored to the current value, not a fixed origin — mirrors back and
    // forth so restarting (after a click/drag) never snaps the bubble.
    const cx = animate(x, [x.get(), x.get() + driftX, x.get(), x.get() - driftX, x.get()], {
      duration,
      ease: "easeInOut",
      repeat: Infinity,
    });
    const cy = animate(y, [y.get(), y.get() - driftY, y.get(), y.get() + driftY, y.get()], {
      duration,
      ease: "easeInOut",
      repeat: Infinity,
    });
    activeAnimations.current = [cx, cy];
  }

  useEffect(() => {
    startDrift();
    return stopAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nudge() {
    stopAll();
    const kick = 70 + Math.random() * 70;
    const angle = Math.random() * Math.PI * 2;
    const targetX = x.get() + Math.cos(angle) * kick;
    const targetY = y.get() + Math.sin(angle) * kick;
    const sx = animate(x, targetX, { type: "spring", stiffness: 220, damping: 12 });
    const sy = animate(y, targetY, { type: "spring", stiffness: 220, damping: 12, onComplete: startDrift });
    activeAnimations.current = [sx, sy];
  }

  return (
    <motion.button
      type="button"
      onClick={nudge}
      onDragStart={stopAll}
      onDragEnd={startDrift}
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0.15}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.05 }}
      style={{ left: pos.left, top: pos.top, x, y }}
      className="glass hairline absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full px-4 py-2.5 text-xs font-medium whitespace-nowrap text-paper/90 select-none active:cursor-grabbing"
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

  if (reduced) return <StaticSkillsList skills={skills} />;

  return (
    <div
      ref={containerRef}
      className="hairline relative h-[22rem] w-full overflow-hidden rounded-3xl border sm:h-[26rem]"
    >
      {skills.map((name, i) => (
        <Bubble key={name} name={name} index={i} total={skills.length} containerRef={containerRef} />
      ))}
    </div>
  );
}
