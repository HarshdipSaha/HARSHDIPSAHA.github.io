"use client";

import { useEffect, useRef, type RefObject } from "react";
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
 */

/** Golden-angle phyllotaxis so the bubbles read as a loose cluster, not a grid. */
function layoutPosition(index: number, total: number) {
  const angle = index * 137.508;
  const radius = 8 + (index / Math.max(total - 1, 1)) * 38;
  const cx = 50 + radius * Math.cos((angle * Math.PI) / 180);
  const cy = 50 + radius * Math.sin((angle * Math.PI) / 180) * 0.65;
  return {
    left: `${Math.min(88, Math.max(12, cx))}%`,
    top: `${Math.min(84, Math.max(16, cy))}%`,
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
  const controls = useAnimationControls();
  const pos = layoutPosition(index, total);

  useEffect(() => {
    let cancelled = false;
    const driftX = 8 + ((index * 5) % 14);
    const driftY = 10 + ((index * 7) % 12);
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
  }, [controls, index]);

  function nudge() {
    const kick = 60 + Math.random() * 70;
    const angle = Math.random() * Math.PI * 2;
    controls.start({
      x: Math.cos(angle) * kick,
      y: Math.sin(angle) * kick,
      transition: { type: "spring", stiffness: 220, damping: 12 },
    });
  }

  return (
    <motion.button
      type="button"
      onClick={nudge}
      animate={controls}
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      dragElastic={0.6}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.05 }}
      style={{ left: pos.left, top: pos.top }}
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
      className="hairline relative h-[28rem] w-full overflow-hidden rounded-3xl border sm:h-[30rem]"
    >
      {skills.map((name, i) => (
        <Bubble key={name} name={name} index={i} total={skills.length} containerRef={containerRef} />
      ))}
    </div>
  );
}
