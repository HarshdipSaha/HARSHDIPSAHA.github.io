import { Fragment } from "react";

interface ProbeTextProps {
  text: string;
  className?: string;
}

/**
 * Scroll-linked word illumination.
 *
 * Words start dim and brighten as the block crosses the viewport, so the
 * reader's own scroll position acts as the probe sweeping the passage. Adapted
 * from thine.com's scroll-linked highlight, but driven by native CSS
 * scroll-driven animation instead of a JS scroll listener.
 *
 * This is the one place a SCRUBBED animation is the right primitive. The
 * research flagged that `animation-timeline: view()` reverses when you scroll
 * back up — a defect for a one-shot entrance, but precisely the behaviour
 * wanted here. Each word gets a negative `animation-delay` derived from its
 * index, which offsets its position along the shared timeline and produces the
 * left-to-right sweep.
 *
 * No JS at all: this is a server component. Firefox has not shipped
 * scroll-driven animations, so the CSS sits behind `@supports` and words
 * simply render at full brightness there.
 */
export function ProbeText({ text, className }: ProbeTextProps) {
  const words = text.split(" ");
  return (
    <span className={["probe-text", className].filter(Boolean).join(" ")}>
      {words.map((word, i) => (
        // Fixed order, repeated words — index is the honest key.
        <Fragment key={`${word}-${i}`}>
          <span className="pw" style={{ ["--w" as string]: i * 26 }}>
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

export default ProbeText;
