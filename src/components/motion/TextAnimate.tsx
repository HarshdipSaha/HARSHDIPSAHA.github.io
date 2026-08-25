"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
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
 * Per-word blur-in. Screen readers get the string once via aria-label; the
 * animated fragments are hidden from them.
 */
export function TextAnimate({ text, as: Tag = "p", className, duration = 0.9, delay = 0, trigger = "view" }: Props) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  if (reduced) return <Tag className={className}>{text}</Tag>;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: duration / words.length, delayChildren: delay } },
  };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        className="inline"
        initial="hidden"
        {...(trigger === "mount" ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.4 } })}
        variants={container}
      >
        {words.map((w, i) => (
          <Fragment key={i}>
            <motion.span className="inline-block will-change-[transform,filter,opacity]" variants={item}>
              {w}
            </motion.span>{" "}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
