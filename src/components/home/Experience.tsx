import { Reveal } from "@/components/motion/Reveal";
import { Container, Label } from "@/components/ui";
import { experience } from "@/content/site";

export function Experience() {
  return (
    <section className="py-28 md:py-40">
      <Container>
        <Reveal>
          <Label>{experience.label}</Label>
        </Reveal>
        <div className="hairline mt-10 border-t">
          {experience.items.map((it) => (
            <Reveal key={it.company} amount={0.2}>
              <article className="hairline grid gap-4 border-b py-10 md:grid-cols-[200px_1fr] md:gap-10 md:py-14">
                <p className="text-sm text-paper/50 tabular-nums md:pt-2">{it.when}</p>
                <div>
                  <h3 className="text-[1.6rem] font-medium leading-tight tracking-tight text-paper md:text-[2rem]">{it.company}</h3>
                  <p className="mt-1.5 text-paper/60">{it.role}</p>
                  <ul className="mt-6 flex max-w-2xl flex-col gap-3 text-[1.02rem] leading-relaxed text-paper/80">
                    {it.points.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-tangerine" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
