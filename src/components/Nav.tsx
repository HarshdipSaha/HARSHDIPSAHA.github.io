"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { nav, person } from "@/content/site";
import { Pill } from "./ui";

/** Eight stacked backdrop blurs, each masked to a band, so the blur ramps
 *  instead of stopping at a hard edge. */
function ProgressiveBlur() {
  const layers = [0.5, 1, 2, 4, 8, 16, 32, 64];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32">
      {layers.map((px, k) => {
        const a = k * 12.5;
        const mask = `linear-gradient(to top, transparent ${a}%, black ${a + 12.5}%, black ${a + 25}%, transparent ${a + 37.5}%)`;
        return (
          <div
            key={px}
            className="absolute inset-0"
            style={{ backdropFilter: `blur(${px}px)`, WebkitBackdropFilter: `blur(${px}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 to-transparent" />
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20">
      <ProgressiveBlur />
      <nav className="relative mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 md:px-8" aria-label="Primary">
        <ul className="hidden items-center gap-2 md:flex">
          {nav.map((n) => (
            <li key={n.href}>
              <Pill href={n.href} size="sm" className={clsx(pathname === n.href && "bg-white/15")}>
                {n.label}
              </Pill>
            </li>
          ))}
        </ul>

        <Link
          href="/"
          className="display text-[1.55rem] leading-none text-paper md:absolute md:left-1/2 md:-translate-x-1/2"
          aria-label={`${person.name} — home`}
        >
          {person.firstName}
          <span className="text-paper/45"> Saha</span>
        </Link>

        <div className="flex items-center gap-2">
          <Pill href={person.resume} variant="accent" size="sm" className="hidden sm:inline-flex">
            Résumé <span aria-hidden="true">↗</span>
          </Pill>
          <button
            type="button"
            className="glass rounded-full px-4 py-2 text-sm font-medium md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={clsx(
          "fixed inset-0 top-20 z-40 bg-ink/95 px-6 pt-8 backdrop-blur-xl transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ul className="flex flex-col gap-1">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="display block py-3 text-5xl text-paper">
                {n.label}
              </Link>
            </li>
          ))}
          <li className="pt-6">
            <Pill href={person.resume} variant="accent">
              Résumé <span aria-hidden="true">↗</span>
            </Pill>
          </li>
        </ul>
      </div>
    </header>
  );
}
