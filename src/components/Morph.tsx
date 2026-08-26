"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

declare global {
  interface Window {
    __morphReady?: () => void;
  }
}

const supported = () =>
  typeof document !== "undefined" &&
  "startViewTransition" in document &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shared-element morph, done with the native View Transitions API.
 *
 * On click the thumbnail (marked `data-morph`) is given the transition name,
 * the browser snapshots it, the route changes, and <MorphTarget> on the new
 * page — which carries the same name — reports when it has mounted so the
 * browser can animate old → new. Modifier-clicks and reduced motion fall
 * through to a normal <Link>.
 */
export function MorphLink({ href, name, className, children }: { href: string; name: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLAnchorElement>(null);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !supported()) return;
    e.preventDefault();
    const el = ref.current?.querySelector<HTMLElement>("[data-morph]");
    if (el) el.style.viewTransitionName = name;
    document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          const done = () => {
            window.__morphReady = undefined;
            resolve();
          };
          window.__morphReady = done;
          // Safety: never hold the old snapshot longer than this.
          window.setTimeout(done, 1200);
          router.push(href);
        }),
    );
  };

  return (
    <Link ref={ref} href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

/** The other end of the morph: names its child and reports mount. */
export function MorphTarget({ name, className, children }: { name: string; className?: string; children: ReactNode }) {
  useEffect(() => {
    // Two frames: one for layout, one for paint, so the new snapshot is real.
    const id = requestAnimationFrame(() => requestAnimationFrame(() => window.__morphReady?.()));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className={className} style={{ viewTransitionName: name }}>
      {children}
    </div>
  );
}
