"use client";

import { useEffect, useState } from "react";

/**
 * Like Motion's `useReducedMotion`, but `false` on the server AND on the first
 * client render, so hydration never compares two different trees. Flips after
 * mount for users who asked for less motion; the animated components then
 * swap to their static markup.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}
