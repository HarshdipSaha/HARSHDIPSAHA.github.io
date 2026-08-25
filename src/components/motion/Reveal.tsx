"use client";

import type React from "react";
import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger index. Multiplied by --stagger, then capped (see MAX_STAGGER_STEPS). */
  index?: number;
  /** Explicit delay in ms. Overrides `index` when set. */
  delayMs?: number;
  as?: "div" | "section" | "li" | "article";
  className?: string;
  style?: React.CSSProperties;
}

/** 80ms per step — the top of the 30-80ms band that still reads as a sequence. */
const STAGGER_MS = 80;

/**
 * Nothing waits more than 4 steps (320ms). Stagger is decorative, and an
 * element sitting at opacity 0 is an element whose links cannot be clicked.
 */
const MAX_STAGGER_STEPS = 4;

/**
 * One IntersectionObserver for the whole page, not one per element.
 *
 * Previously each <Reveal> allocated its own observer plus a React state cell,
 * so a page with 30 reveals did 30 re-renders on the scroll path. This writes
 * the attribute straight onto the node, so revealing costs no React work.
 */
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "in";
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
  }
  return sharedObserver;
}

/**
 * The scroll entrance for BELOW-the-fold content.
 *
 * Above-the-fold content must not use this: it starts hidden and only reveals
 * after hydration, which delays Largest Contentful Paint (Chrome does not
 * treat an `opacity: 0` element as an LCP candidate). The hero uses the CSS
 * `.hero-enter` / `@starting-style` path instead, which animates on first
 * paint with no JS at all.
 *
 * Content is visible by default — the hidden start state is scoped to
 * `[data-motion="on"]`, which an inline script sets only when JS is running
 * and motion is not reduced.
 */
export function Reveal({
  children,
  index = 0,
  delayMs,
  as = "div",
  className,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const observer = getObserver();

    // Reduced motion, no observer support, or already on screen: show it now.
    if (reduced || !observer) {
      node.dataset.reveal = "in";
      return;
    }
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      node.dataset.reveal = "in";
      return;
    }

    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  const Tag = as as React.ElementType;
  const delay = delayMs ?? Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS;

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
