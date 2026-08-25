"use client";

import type React from "react";
import { Fragment } from "react";

interface ScanRevealProps {
  /** Plain text. Split per word so each can resolve on its own beat. */
  text: string;
  className?: string;
  /** Element to render. The hero uses this inside a Heading. */
  as?: "span" | "h1" | "h2";
  style?: React.CSSProperties;
}

/**
 * The site's focal moment: a line of text RECONSTRUCTING the way a scan does.
 *
 * Words start as blurred, near-invisible noise and resolve into focus in
 * sequence while a probe line sweeps down through them. This is not a generic
 * fade-and-rise dressed up — it is the product's own subject matter (a
 * segmentation viewer resolving a volume) used as the entrance, which is the
 * one thing that earns authored motion on this surface.
 *
 * Three constraints shape the implementation:
 *
 *  - **LCP safety.** The headline is the Largest Contentful Paint element, and
 *    Chrome does not treat an `opacity: 0` element as an LCP candidate. Words
 *    therefore start at a low but NON-ZERO opacity. Under a 12px blur that
 *    reads as scan noise, which is exactly the effect wanted, so the
 *    performance constraint and the design intent agree here.
 *  - **Accessibility.** Screen readers get one clean string from an `.sr-only`
 *    node; the animated fragments are `aria-hidden`, so nobody hears the
 *    headline read out one word at a time.
 *  - **No JS dependency.** The animation is pure CSS keyframes. If hydration
 *    never happens the markup is already there and the animation still runs.
 */
export function ScanReveal({ text, className, as = "span", style }: ScanRevealProps) {
  const words = text.split(" ");
  const Tag = as as React.ElementType;

  return (
    <Tag className={["scan-reveal", className].filter(Boolean).join(" ")} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="scan-reveal-words">
        {words.map((word, i) => (
          // The separating space MUST live outside the span. `display:
          // inline-block` trims trailing whitespace inside the box, which
          // silently welds the words together ("BuildingMLpipelines").
          // A text node between two inline-blocks still renders as a space.
          <Fragment key={`${word}-${i}`}>
            <span className="scan-word" style={{ ["--i" as string]: i }}>
              {word}
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

export default ScanReveal;
