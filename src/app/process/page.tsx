import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Label, Pill } from "@/components/ui";
import { process } from "@/content/site";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How this site is made: every change is planned, approved, built, checked and recorded, and every structural decision is written down. The site is the worked example.",
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
          <Label>{process.flowLabel}</Label>
          <ol className="hairline mt-4 divide-y divide-white/10 border-y">
            {process.flow.map((f, i) => (
              <li key={f.step} className="grid gap-2 py-5 md:grid-cols-[9rem_1fr]">
                <p className="font-medium text-paper">
                  <span aria-hidden="true" className="mr-3 font-mono text-[12.5px] text-paper/55 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {f.step}
                </p>
                <div>
                  <p className="text-paper/75">{f.body}</p>
                  <p className="mt-2 font-mono text-[12.5px] text-paper/55 [overflow-wrap:anywhere]">{f.artefact}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>{process.decisionsLabel}</Label>
          <ol className="hairline mt-4 divide-y divide-white/10 border-y">
            {process.decisions.map((d) => (
              <li key={d.id} className="flex items-baseline gap-5 py-4">
                <span className="font-mono text-[12.5px] text-paper/55 tabular-nums">{d.id}</span>
                <p className="flex-1 leading-relaxed">
                  <span className="text-paper/85">{d.title}</span>
                  <span className="text-paper/55"> — {d.why}</span>
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-paper/55">{process.decisionsNote}</p>
        </section>
      </Reveal>

      <Reveal>
        <p className="prose">{process.why}</p>
      </Reveal>

      <Reveal>
        <div className="flex flex-wrap gap-3">
          <Pill href={process.repo} variant="accent">
            Open the repository ↗
          </Pill>
          <Pill href={`${process.repo}/tree/main/docs/adr`}>All 12 decisions ↗</Pill>
          <Pill href={`${process.repo}/tree/main/aidlc-docs/efforts`}>All 22 change records ↗</Pill>
        </div>
      </Reveal>
    </article>
  );
}
