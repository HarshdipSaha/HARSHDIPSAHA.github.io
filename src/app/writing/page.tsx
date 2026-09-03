import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow, Container, Label } from "@/components/ui";
import { writing } from "@/content/site";
import { getPosts } from "@/lib/writing";

export const metadata: Metadata = {
  title: writing.title,
  description: writing.description,
  alternates: { canonical: "/writing" },
};

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function WritingPage() {
  const posts = getPosts();
  return (
    <Container className="pb-28 pt-36 md:pt-40">
      <Reveal variant="blur-up">
        <Label>{writing.title}</Label>
        <h1 className="display mt-5 max-w-[14ch] text-[clamp(3rem,8vw,6.5rem)] text-paper">{writing.headline}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/65">{writing.intro}</p>
      </Reveal>

      <Reveal className="mt-16 md:mt-20">
        <ul className="hairline divide-y divide-white/10 border-t">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-[11rem_1fr_auto] md:gap-8 md:py-10">
                <div className="flex flex-wrap items-baseline gap-x-3 text-sm text-paper/55 md:flex-col md:gap-1">
                  <time dateTime={p.date}>{longDate(p.date)}</time>
                  {p.tag && <span className="label !text-[11px]">{p.tag}</span>}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-medium tracking-tight text-paper group-hover:underline group-hover:decoration-tangerine group-hover:underline-offset-4 md:text-3xl">
                    {p.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-relaxed text-paper/65">{p.summary}</p>
                </div>
                <Arrow className="hidden self-center text-paper/55 transition-transform duration-300 group-hover:translate-x-1 md:block" />
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </Container>
  );
}
