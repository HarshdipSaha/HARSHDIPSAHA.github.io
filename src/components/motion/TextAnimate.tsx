"use client";

import { motion, type Variants } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { Fragment, type ElementType } from "react";

const EASE = [0.33, 1, 0.68, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
};

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Total time for the whole string, so long lines don't take longer. */
  duration?: number;
  delay?: number;
  /** "mount" animates on first paint (above the fold); "view" waits for scroll. */
  trigger?: "mount" | "view";
};

/**
 * Per-word blur-in. Screen readers get the string once from a visually-hidden
 * copy; the animated fragments are hidden from them. (Not `aria-label`: that
 * attribute is prohibited on <p>/<span> without a role — axe `aria-prohibited-attr`
 * — and it left the accessibility tree malformed.)
 */
export function TextAnimate({ text, as: Tag = "p", className, duration = 0.9, delay = 0, trigger = "view" }: Props) {
  const reduced = useReducedMotionSafe();
  const words = text.split(" ");
  if (reduced) return <Tag className={className}>{text}</Tag>;

  if (trigger === "mount") {
    // Above-the-fold copy is animated by CSS (`.word-in` in globals.css), not
    // Motion: a CSS animation starts at first paint, whereas Motion's starts
    // after the bundle loads and hydrates. That wait was 95 % of the home
    // page's Largest Contentful Paint (2.6 s, of which 2.5 s was render delay
    // on a hero word). Same curve, distance, blur and stagger as the Motion
    // variant below; prefers-reduced-motion is honoured in the stylesheet.
    const step = duration / words.length;
    return (
      <Tag className={className}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true" className="inline">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="word-in inline-block" style={{ animationDelay: `${(delay + i * step).toFixed(3)}s` }}>
                {w}
              </span>{" "}
            </Fragment>
          ))}
        </span>
      </Tag>
    );
  }

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: duration / words.length, delayChildren: delay } },
  };

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className="inline"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={container}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <motion.span className="inline-block" variants={item}>
              {w}
            </motion.span>{" "}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
