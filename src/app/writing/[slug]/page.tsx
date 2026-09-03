import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow, Container, Label } from "@/components/ui";
import { getPost, getPosts } from "@/lib/writing";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/writing/${p.slug}` },
  };
}

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function WritingPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const all = getPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const p = all[idx];
  const next = all[(idx + 1) % all.length];
  const date = longDate(p.date);

  return (
    <article className="pb-24 pt-36 md:pt-40">
      <Container className="max-w-[880px]">
        <Reveal variant="blur-up">
          <Link href="/writing" className="label inline-flex items-center gap-2 hover:text-paper">
            <Arrow className="rotate-180" /> Writing
          </Link>
          <h1 className="display mt-6 text-[clamp(2.5rem,6.5vw,5.25rem)] text-paper">{p.title}</h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-paper/70">{p.summary}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {p.tag && <span className="label !text-[11px]">{p.tag}</span>}
            <time dateTime={p.date} className="text-sm text-paper/55">
              {date}
            </time>
          </div>
        </Reveal>
      </Container>

      <Container className="mt-16 max-w-[880px]">
        <div className="prose measure mx-auto">
          <MDXRemote source={p.body} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </Container>

      {all.length > 1 && (
        <Container className="mt-24 max-w-[880px]">
          <div className="hairline border-t pt-10">
            <Label>Next post</Label>
            <Link
              href={`/writing/${next.slug}`}
              className="group mt-4 inline-flex items-center gap-3 text-2xl font-medium tracking-tight text-paper md:text-3xl"
            >
              {next.title}
              <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      )}
    </article>
  );
}
