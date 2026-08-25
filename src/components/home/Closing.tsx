import { Reveal } from "@/components/motion/Reveal";
import { Container, Pill } from "@/components/ui";
import { closing, person } from "@/content/site";

export function Closing() {
  return (
    <section className="py-32 text-center md:py-48">
      <Container>
        <Reveal variant="blur-up">
          <h2 className="display mx-auto max-w-[14ch] text-[clamp(3rem,9vw,8.5rem)] text-paper">{closing.title}</h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-paper/70">{closing.body}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Pill href={`mailto:${person.email}`} variant="accent">
              Email me
            </Pill>
            <Pill href={person.resume}>Résumé ↗</Pill>
            <Pill href={person.github}>GitHub ↗</Pill>
            <Pill href={person.linkedin}>LinkedIn ↗</Pill>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
