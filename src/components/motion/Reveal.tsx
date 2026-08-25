"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import type { ReactNode } from "react";

const EASE = [0.33, 1, 0.68, 1] as const;

/**
 * Enter-on-view. Blur clears while the block slides in from up-left; the
 * default everywhere on the site so that every section arrives the same way.
 */
const container = (stagger: number, delay: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

const VARIANTS: Record<string, Variants> = {
  "blur-diagonal": {
    hidden: { opacity: 0, filter: "blur(6px)", x: -16, y: -16 },
    show: { opacity: 1, filter: "blur(0px)", x: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
  },
  "blur-up": {
    hidden: { opacity: 0, filter: "blur(8px)", y: 24 },
    show: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.8, ease: EASE } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
  },
};

type Props = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
  delay?: number;
  stagger?: number;
  amount?: number;
  once?: boolean;
};

export function Reveal({ children, className, variant = "blur-diagonal", delay = 0, stagger = 0.08, amount = 0.15, once = true }: Props) {
  const reduced = useReducedMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={container(stagger, delay)}
    >
      <motion.div variants={VARIANTS[variant]} className="contents">
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Direct children of a <Reveal> that should cascade instead of arriving together. */
export function Item({ children, className, variant = "blur-diagonal" }: { children: ReactNode; className?: string; variant?: keyof typeof VARIANTS }) {
  return (
    <motion.div variants={VARIANTS[variant]} className={className}>
      {children}
    </motion.div>
  );
}

/** A group whose Items stagger. Unlike <Reveal>, the group itself doesn't animate. */
export function Group({ children, className, delay = 0, stagger = 0.1, amount = 0.15 }: Omit<Props, "variant">) {
  const reduced = useReducedMotionSafe();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount }} variants={container(stagger, delay)}>
      {children}
    </motion.div>
  );
}
