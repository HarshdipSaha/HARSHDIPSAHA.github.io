import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Label, Pill } from "@/components/ui";
import { process } from "@/content/site";

export const metadata: Metadata = {
  title: "Process",
  description: "How this site is built: AI-DLC efforts, architecture decision records, and a docs-first repo.",
  alternates: { canonical: "/process" },
};

export default function ProcessPage() {
  return (
    <article className="mx-auto flex max-w-[44rem] flex-col gap-16 px-6 pb-24 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <Label>{process.title}</Label>
        <h1 className="display mt-5 text-[clamp(3rem,8vw,5.5rem)] text-paper">How this site is made.</h1>
        <p className="prose mt-8">{process.headline}</p>
      </Reveal>

      <Reveal>
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {process.stats.map((s) => (
            <div key={s.label}>
              <dd className="display text-5xl text-paper">{s.value}</dd>
              <dt className="mt-2 text-sm leading-snug text-paper/55">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <section>
          <Label>Repository layers</Label>
          <ul className="hairline mt-4 divide-y divide-white/10 border-y">
            {process.layers.map((l) => (
              <li key={l.name} className="grid gap-2 py-5 md:grid-cols-[9rem_1fr]">
                <p className="font-medium text-paper">{l.name}</p>
                <div>
                  <p className="text-paper/75">{l.purpose}</p>
                  <p className="mt-2 font-mono text-[12.5px] text-paper/45">{l.paths.join("  ·  ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>Decisions</Label>
          <ol className="hairline mt-4 divide-y divide-white/10 border-y">
            {process.decisions.map((d) => (
              <li key={d.id} className="flex items-baseline gap-5 py-3.5">
                <span className="font-mono text-[12.5px] text-paper/45 tabular-nums">{d.id}</span>
                <span className="flex-1 text-paper/85">{d.title}</span>
                <span className={d.status === "Accepted" ? "text-xs text-seafoam" : "text-xs text-paper/40"}>{d.status}</span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-3">
          <Pill href={process.repo} variant="accent">
            Read the repository ↗
          </Pill>
          <Pill href={`${process.repo}/tree/main/docs/adr`}>All ADRs ↗</Pill>
          <Pill href={`${process.repo}/tree/main/aidlc-docs`}>Effort records ↗</Pill>
        </div>
      </Reveal>
    </article>
  );
}
