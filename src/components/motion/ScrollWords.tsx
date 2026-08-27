"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useRef } from "react";
import clsx from "clsx";

/**
 * A passage whose words brighten one by one as the block scrolls through the
 * viewport. Each word owns 1/n of the scroll range; a ghost copy at 20% sits
 * underneath so the line is legible before it lights up.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={clsx("flex flex-wrap gap-x-[0.28em] gap-y-[0.1em]", className)}>
      {/* The clean string, once, for assistive tech. A visually-hidden span rather
          than aria-label, which is prohibited on a <p> without a role. */}
      <span className="sr-only">{text.replaceAll("*", "")}</span>
      {words.map((raw, i) => {
        const accent = raw.startsWith("*") && raw.replace(/[^*]/g, "").length >= 2;
        const w = raw.replaceAll("*", "");
        return (
          <Word key={i} word={w} accent={accent} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} reduced={!!reduced} />
        );
      })}
    </p>
  );
}

/**
 * The ghost is a ::before pseudo-element drawing `data-word`, so it sizes the
 * box but is not a text node: copy/paste and assistive tech see the lit copy
 * only, once. (The <p>'s visually-hidden span carries the clean string anyway.)
 */
function Word({ word, accent, progress, range, reduced }: { word: string; accent: boolean; progress: MotionValue<number>; range: [number, number]; reduced: boolean }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span
      aria-hidden="true"
      data-word={word}
      className={clsx("relative inline-block before:opacity-20 before:content-[attr(data-word)]", accent && "text-tangerine")}
    >
      <motion.span className="absolute inset-0" style={{ opacity: reduced ? 1 : opacity }}>
        {word}
      </motion.span>
    </span>
  );
}
