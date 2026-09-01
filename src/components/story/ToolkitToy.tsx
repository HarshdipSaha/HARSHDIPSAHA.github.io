"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import clsx from "clsx";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const ACCENTS = ["bg-sunny", "bg-seafoam", "bg-cerulean"] as const;

function shuffled<T>(arr: readonly T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function ToolkitToy({ tools }: { tools: readonly string[] }) {
  const reduced = useReducedMotionSafe();
  const [order, setOrder] = useState<string[]>(() => [...tools]);
  const [active, setActive] = useState<string | null>(null);

  const onTap = useCallback((name: string) => {
    setOrder((prev) => shuffled(prev));
    setActive(name);
    window.setTimeout(() => setActive((cur) => (cur === name ? null : cur)), 550);
  }, []);

  if (reduced) {
    return (
      <ul className="mt-4 flex flex-wrap gap-2">
        {tools.map((name, i) => (
          <li
            key={name}
            className="hairline flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm text-paper/85"
          >
            <span aria-hidden="true" className={clsx("size-1.5 rounded-full", ACCENTS[i % ACCENTS.length])} />
            {name}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-4">
      <ul className="flex flex-wrap gap-2">
        {order.map((name, i) => (
          <motion.li key={name} layout transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.7 }}>
            <button
              type="button"
              onClick={() => onTap(name)}
              aria-pressed={active === name}
              className={clsx(
                "hairline flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm text-paper/85",
                "transition-colors duration-200 hover:bg-white/8",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangerine",
                active === name && "border-tangerine/70 text-paper",
              )}
            >
              <motion.span
                aria-hidden="true"
                className={clsx("size-1.5 rounded-full", ACCENTS[i % ACCENTS.length])}
                animate={active === name ? { scale: [1, 2, 1] } : { scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              {name}
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-paper/40">Tap a tool. Everything jumps to a new seat.</p>
    </div>
  );
}