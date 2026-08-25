"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import clsx from "clsx";

/**
 * A passage whose words brighten one by one as the block scrolls through the
 * viewport. Each word owns 1/n of the scroll range; a ghost copy at 20% sits
 * underneath so the line is legible before it lights up.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.45"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={clsx("flex flex-wrap gap-x-[0.28em] gap-y-[0.1em]", className)} aria-label={text.replaceAll("*", "")}>
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

function Word({ word, accent, progress, range, reduced }: { word: string; accent: boolean; progress: MotionValue<number>; range: [number, number]; reduced: boolean }) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span aria-hidden="true" className={clsx("relative inline-block", accent && "text-tangerine")}>
      <span className="opacity-20">{word}</span>
      <motion.span className="absolute inset-0" style={{ opacity: reduced ? 1 : opacity }}>
        {word}
      </motion.span>
    </span>
  );
}
