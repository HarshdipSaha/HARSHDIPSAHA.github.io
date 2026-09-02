import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ToolkitToy } from "@/components/story/ToolkitToy";
import { Label, Pill } from "@/components/ui";
import { person, publication, story } from "@/content/site";
import { portrait } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Story",
  description: person.description,
  alternates: { canonical: "/story" },
};

export default function StoryPage() {
  return (
    <article className="measure mx-auto flex flex-col gap-16 px-6 pb-24 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <header>
          <Label>{story.title}</Label>
          <h1 className="display mt-5 text-[clamp(3rem,9vw,5.5rem)] text-paper">{person.name}</h1>
          <p className="mt-4 text-lg text-paper/60">
            {person.role} · {person.location}
          </p>
        </header>
      </Reveal>

      <Reveal variant="fade">
        <img
          src={portrait.src}
          alt={`${person.name}, portrait`}
          width={portrait.w}
          height={portrait.h}
          className="aspect-[4/5] w-full rounded-2xl border border-white/10 object-cover"
        />
      </Reveal>

      <Reveal>
        <div className="prose">
          {story.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>

      <Reveal variant="blur-up">
        <p className="display text-[clamp(1.75rem,4.5vw,2.6rem)] leading-[1.2] tracking-[-0.015em] text-paper">{story.statement}</p>
      </Reveal>

      <Reveal>
        <div className="prose">
          {story.more.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <section>
          <Label>Publication</Label>
          <h2 className="mt-4 text-2xl font-medium leading-snug tracking-tight text-paper">{publication.title}</h2>
          <p className="mt-2 text-paper/60">{publication.venue}</p>
          <p className="mt-1 text-tangerine">{publication.result}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {publication.links.map((l) => (
              <Pill key={l.href} href={l.href} size="sm">
                {l.label} ↗
              </Pill>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>Education</Label>
          <ol className="mt-6 flex flex-col">
            {story.education.map((e, i) => (
              <li key={e.name} className="relative flex gap-5 pb-8 last:pb-0">
                {i < story.education.length - 1 && (
                  <span className="absolute left-[5px] top-4 bottom-0 w-px bg-white/10" aria-hidden="true" />
                )}
                <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full bg-tangerine" aria-hidden="true" />
                <div>
                  <p className="label text-paper/55">{e.when}</p>
                  <p className="mt-1 font-medium text-paper">{e.name}</p>
                  <p className="mt-0.5 text-sm text-paper/60">{e.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>Achievements</Label>
          <ul className="mt-4 flex flex-col gap-6">
            {story.achievements.map((a) => (
              <li key={a.title}>
                <a href={a.href} target="_blank" rel="noopener noreferrer" className="group block">
                  <p className="text-lg font-medium text-paper group-hover:underline group-hover:decoration-tangerine group-hover:underline-offset-4">
                    {a.title} <span aria-hidden="true" className="text-paper/40">↗</span>
                  </p>
                  <p className="mt-1 leading-relaxed text-paper/65">{a.body}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>Tools</Label>
          <ToolkitToy tools={story.skills} />
        </section>
      </Reveal>

      <Reveal>
        <section>
          <Label>Interests</Label>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {story.interests.map((interest, i) => (
              <li
                key={interest}
                className="glass hairline rounded-full px-4 py-2 text-sm text-paper/85"
              >
                <span
                  className={`mr-1.5 inline-block size-1.5 rounded-full ${
                    ["bg-tangerine", "bg-sunny", "bg-seafoam", "bg-cerulean"][i % 4]
                  }`}
                  aria-hidden="true"
                />
                {interest}
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal variant="fade">
        <div className="hairline mx-auto w-[97%] border-t pt-8 text-paper/60">
          <p className="display text-3xl text-paper">{story.colophon.word}</p>
          <p className="mt-2 tabular-nums">{story.colophon.ipa}</p>
          <p className="mt-1 italic">{story.colophon.gloss}</p>
        </div>
      </Reveal>
    </article>
  );
}
