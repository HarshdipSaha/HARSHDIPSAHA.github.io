import { MorphLink } from "@/components/Morph";
import clsx from "clsx";
import { Group, Item } from "@/components/motion/Reveal";
import type { Project } from "@/lib/projects";

type Props = {
  projects: Project[];
  columns?: 2 | 3;
  /** Card title level. h3 under a section h2 (home); h2 when the grid follows the page h1 (/projects). */
  headingLevel?: "h2" | "h3";
};

export function ProjectGrid({ projects, columns = 3, headingLevel: Heading = "h3" }: Props) {
  return (
    <Group className={clsx("grid gap-x-8 gap-y-14 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")} stagger={0.07} amount={0.05}>
      {projects.map((p) => (
        <Item key={p.slug}>
          <MorphLink href={`/projects/${p.slug}`} name={`project-${p.slug}`} className="group hover-trigger relative block">
            <span aria-hidden="true" className="corners">
              <span /><span /><span /><span />
            </span>
            <div data-morph className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-ink-2">
              {p.image ? (
                <img
                  src={p.image.src}
                  alt=""
                  width={p.image.w}
                  height={p.image.h}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                />
              ) : (
                <div className="display flex h-full items-center justify-center text-4xl text-paper/45">{p.title.slice(0, 1)}</div>
              )}
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <Heading className="text-[1.15rem] font-medium leading-snug tracking-tight text-paper group-hover:text-white">{p.title}</Heading>
              <span className="shrink-0 text-sm text-paper/55 tabular-nums">{p.year}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-[0.98rem] leading-relaxed text-paper/60">{p.summary}</p>
          </MorphLink>
        </Item>
      ))}
    </Group>
  );
}
