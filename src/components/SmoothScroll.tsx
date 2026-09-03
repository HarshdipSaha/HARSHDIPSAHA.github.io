"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Lenis smooths the wheel on top of native scroll: the scrollbar, keyboard
 * and anchors all keep working. Disabled for users who asked for less motion.
 *
 * Initialised lazily, on the first scroll-intent event (`wheel`, `touchstart`
 * or `keydown`) rather than on hydration: native scroll behaves identically
 * either way, so a visitor who never scrolls never pays for the Lenis
 * instance or its rAF loop, which keeps it off the work that gates first
 * paint / TBT.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion || started) return;
    const begin = () => setStarted(true);
    const opts: AddEventListenerOptions = { passive: true, once: true };
    window.addEventListener("wheel", begin, opts);
    window.addEventListener("touchstart", begin, opts);
    window.addEventListener("keydown", begin, opts);
    return () => {
      window.removeEventListener("wheel", begin, opts);
      window.removeEventListener("touchstart", begin, opts);
      window.removeEventListener("keydown", begin, opts);
    };
  }, [reducedMotion, started]);

  if (reducedMotion || !started) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9, syncTouch: false }}>
      {children}
    </ReactLenis>
  );
}
