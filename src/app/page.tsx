import Link from "next/link";
import dynamic from "next/dynamic";
import { BrainSequence } from "@/components/home/BrainSequence";
import { Closing } from "@/components/home/Closing";
import { Hero } from "@/components/home/Hero";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollWords } from "@/components/motion/ScrollWords";
import { Arrow, Container, Label } from "@/components/ui";
import { passage, selectedProjects, sequence, threads } from "@/content/site";
import { gallery, getProjectsBySlugs, projectImages } from "@/lib/projects";

// Below-fold home sections: dynamic-imported (ssr: true, the default) so their
// markup still prerenders into the export exactly as before, but their JS
// ships in separate chunks instead of the critical (above-the-fold) bundle.
// Effort 037 — pure code-splitting, no behavioural or visual change.
const CardStack = dynamic(() => import("@/components/home/CardStack").then((m) => m.CardStack));
const MatrixRibbon = dynamic(() => import("@/components/MatrixRibbon").then((m) => m.MatrixRibbon));
const Experience = dynamic(() => import("@/components/home/Experience").then((m) => m.Experience));
const ProjectGrid = dynamic(() => import("@/components/ProjectGrid").then((m) => m.ProjectGrid));

function resolveImage(ref: string): string {
  const [kind, key] = ref.split(":");
  if (kind === "gallery") return gallery[Number(key) - 1]?.src ?? gallery[0].src;
  return projectImages[key]?.src ?? gallery[0].src;
}

export default function Home() {
  const selected = getProjectsBySlugs(selectedProjects.slugs);
  const cards = threads.cards.map(({ image, ...c }) => ({ ...c, src: resolveImage(image) }));

  return (
    <>
      <Hero />

      <BrainSequence stages={sequence.stages} eyebrow={sequence.eyebrow} hint={sequence.hint} />

      <section className="pb-36 pt-16 md:pb-52 md:pt-20">
        <MatrixRibbon className="mb-24 md:mb-32" />
        <Container wide>
          <ScrollWords
            text={passage}
            className="mx-auto max-w-[1180px] text-[2.1rem] font-medium leading-[1.12] tracking-[-0.02em] sm:text-[3rem] md:text-[3.9rem] lg:text-[4.9rem]"
          />
        </Container>
        <MatrixRibbon className="mt-24 md:mt-32" />
      </section>

      <section className="pb-8 pt-8 text-center">
        <Container>
          <Reveal variant="blur-up">
            <Label>{threads.label}</Label>
            <h2 className="mx-auto mt-6 max-w-[16ch] text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-[1.02] tracking-tight text-paper">{threads.title}</h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-paper/70">{threads.body}</p>
          </Reveal>
        </Container>
      </section>

      <CardStack cards={cards} />

      <Experience />

      <section className="pb-28 md:pb-40">
        <Container>
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <Label>{selectedProjects.label}</Label>
              <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-paper/60 transition-colors hover:text-paper">
                {selectedProjects.allLabel} <Arrow />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12">
            <ProjectGrid projects={selected} />
          </div>
        </Container>
      </section>

      <Closing />
    </>
  );
}
