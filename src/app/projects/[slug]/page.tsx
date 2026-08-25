import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow, Container, Label, Pill } from "@/components/ui";
import { getProject, getProjects } from "@/lib/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: p.image ? { images: [{ url: p.image.src, width: p.image.w, height: p.image.h }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const all = getProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const p = all[idx];
  const next = all[(idx + 1) % all.length];
  const date = new Date(p.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <article className="pb-24 pt-36 md:pt-40">
      <Container className="max-w-[880px]">
        <Reveal variant="blur-up">
          <Link href="/projects" className="label inline-flex items-center gap-2 hover:text-paper">
            <Arrow className="rotate-180" /> Projects
          </Link>
          <h1 className="display mt-6 text-[clamp(2.5rem,6.5vw,5.25rem)] text-paper">{p.title}</h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-paper/70">{p.summary}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {p.link && (
              <Pill href={p.link} variant="accent" size="sm">
                Repository ↗
              </Pill>
            )}
            <span className="text-sm text-paper/50">{date}</span>
          </div>
        </Reveal>
      </Container>

      {p.image && (
        <Container className="mt-14 max-w-[1100px]">
          <Reveal variant="fade">
            <img
              src={p.image.src}
              alt=""
              width={p.image.w}
              height={p.image.h}
              className="w-full rounded-[1.5rem] border border-white/10 bg-ink-2 object-cover"
            />
          </Reveal>
        </Container>
      )}

      <Container className="mt-16 max-w-[880px]">
        <div className="prose measure mx-auto">
          <MDXRemote source={p.body} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </Container>

      <Container className="mt-24 max-w-[880px]">
        <div className="hairline border-t pt-10">
          <Label>Next project</Label>
          <Link href={`/projects/${next.slug}`} className="group mt-4 inline-flex items-center gap-3 text-2xl font-medium tracking-tight text-paper md:text-3xl">
            {next.title}
            <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </article>
  );
}
