"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import clsx from "clsx";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const SPRING = { stiffness: 300, damping: 22, mass: 0.5 } as const;
const REACH = 22; // px a word can drift toward the cursor
const NUDGE = 9; // px a tap-nudge moves on touch

/**
 * One wordmark that leans toward the cursor when a fine pointer is nearby,
 * or gives a quick directional nudge on tap for touch. Text itself never
 * moves out of the DOM or hides behind the animation — the transform is a
 * cosmetic offset on top of a fully readable, always-present word.
 */
function TechWord({ name, reduced }: { name: string; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);

  if (reduced) {
    return <span className="text-lg text-paper/80 md:text-xl">{name}</span>;
  }

  const nudgeToward = (clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy) || 1;
    const pull = Math.min(REACH, dist * 0.35);
    rawX.set((dx / dist) * pull);
    rawY.set((dy / dist) * pull);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const tap = () => {
    const rect = ref.current?.getBoundingClientRect();
    const seed = rect ? rect.left + rect.top : 0;
    const angle = (seed * 0.037) % (Math.PI * 2);
    rawX.set(Math.cos(angle) * NUDGE);
    rawY.set(Math.sin(angle) * NUDGE);
    window.setTimeout(reset, 220);
  };

  return (
    <motion.span
      ref={ref}
      className="inline-block cursor-default text-lg text-paper/80 transition-colors duration-200 ease-out hover:text-tangerine md:text-xl"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        nudgeToward(e.clientX, e.clientY);
      }}
      onMouseLeave={reset}
      onPointerUp={(e) => {
        if (e.pointerType === "touch") tap();
      }}
      tabIndex={0}
      onBlur={reset}
    >
      {name}
    </motion.span>
  );
}

/**
 * The revived tech-stack strip: a loose, flowing field of wordmarks (no icon
 * package in this repo, so text carries the identity) rather than the old
 * component's dark boxed icon grid. Fine pointers get a magnetic lean toward
 * the cursor; touch gets a tap-triggered nudge, since hover doesn't exist
 * there. Every name is plain DOM text at all times — the motion is a purely
 * cosmetic transform layered on top, so a screen reader or a
 * reduced-motion visitor sees the same content, just standing still.
 */
export function TechField({ items, className }: { items: readonly string[]; className?: string }) {
  const reduced = useReducedMotionSafe();
  return (
    <div className={clsx("flex flex-wrap items-baseline gap-x-7 gap-y-4", className)}>
      {items.map((name) => (
        <TechWord key={name} name={name} reduced={reduced} />
      ))}
    </div>
  );
}
