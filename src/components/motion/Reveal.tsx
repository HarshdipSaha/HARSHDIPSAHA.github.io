"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger index — multiplied by --stagger (60ms). Prefer this over raw ms. */
  index?: number;
  /** Explicit delay in ms. Overrides `index` when set. */
  delayMs?: number;
  /** Fraction of the element that must be visible before it slices in. */
  threshold?: number;
  /** Render as a different element. Defaults to a plain div. */
  as?: "div" | "section" | "li" | "article";
  className?: string;
  style?: React.CSSProperties;
}

const STAGGER_MS = 60;

/**
 * The slice reveal — this site's one entrance motion.
 *
 * Content is sliced in the way a volume is scrubbed: a clip-path wipe up the
 * scan axis plus a short lift. Not a fade, and emphatically not the 2s
 * blur-wipe this replaced.
 *
 * Everything is visible by default if JS never runs or motion is reduced:
 * the observer only ever ADDS the revealed state, and `prefers-reduced-motion`
 * short-circuits to visible on mount.
 */
export function Reveal({
  children,
  index = 0,
  delayMs,
  threshold = 0.15,
  as = "div",
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    // Already in view on mount (above the fold) — reveal without waiting.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const Tag = as as React.ElementType;
  const delay = delayMs ?? index * STAGGER_MS;

  return (
    <Tag
      ref={ref}
      data-reveal={revealed ? "in" : ""}
      className={className}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
