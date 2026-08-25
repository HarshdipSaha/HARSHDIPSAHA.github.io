"use client";

import { cubicBezier, motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useEffect, useRef } from "react";
import { Pill } from "@/components/ui";

export type StackCard = {
  title: string;
  body: string;
  href: string;
  cta: string;
  src: string;
};

/**
 * Three full-height cards that pin in turn. As the next one arrives, the one
 * beneath scales down a notch so the stack reads as depth rather than a swap.
 */
export function CardStack({ cards }: { cards: StackCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Decode the three photos one viewport before the stack arrives. Left to the
  // browser, a 1200x1600 image decodes at first paint, which lands as a 50-80ms
  // frame right as the first card scrolls in.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        for (const img of el.querySelectorAll("img")) img.decode().catch(() => {});
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced) {
    return (
      <div className="flex flex-col gap-8 px-4 md:px-8">
        {cards.map((c) => (
          <Card key={c.title} card={c} />
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative" style={{ height: `${cards.length * 100}vh` }}>
      {cards.map((c, i) => (
        <StickyCard key={c.title} card={c} index={i} total={cards.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}

const ease = cubicBezier(0.42, 0, 0.58, 1);

function StickyCard({ card, index, total, progress }: { card: StackCard; index: number; total: number; progress: MotionValue<number> }) {
  const target = 1 - (total - 1 - index) * 0.06;
  const scale = useTransform(progress, [index / total, 1], [1, target], { ease });
  return (
    <div className="sticky top-0 flex h-screen items-center justify-center px-4 md:px-8" style={{ top: `${index * 28}px` }}>
      <motion.div style={{ scale }} className="w-full max-w-[1240px] origin-top will-change-transform">
        <Card card={card} />
      </motion.div>
    </div>
  );
}

function Card({ card }: { card: StackCard }) {
  return (
    <article className="relative h-[76vh] max-h-[820px] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-2">
      <img src={card.src} alt="" className="absolute inset-0 h-full w-full object-cover" decoding="async" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-7 md:p-12">
        <h3 className="over-photo text-[2.6rem] font-semibold leading-none tracking-tight text-white md:text-[3.25rem]">{card.title}</h3>
        <p className="over-photo mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/85 md:text-lg">{card.body}</p>
        <div className="mt-6">
          <Pill href={card.href}>
            {card.cta} <span aria-hidden="true">→</span>
          </Pill>
        </div>
      </div>
    </article>
  );
}
