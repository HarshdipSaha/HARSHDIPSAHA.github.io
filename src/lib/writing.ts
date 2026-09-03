import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";

/**
 * Writing posts — `content/writing/*.mdx`, one file per post. Mirrors
 * `src/lib/projects.ts`: slug = lowercased filename, newest first, body left
 * as raw MDX for `next-mdx-remote/rsc` to render.
 *
 * Posts differ from case studies in two ways that matter here: they carry a
 * `tag` instead of `images[]`/`link`, and they are first-person accounts with
 * no source repository to check them against, so they sit outside the
 * factuality gate (ADR 0016). Stale claims get a dated editor's note in the
 * MDX itself, never a silent rewrite.
 */
export type Post = {
  slug: string;
  title: string;
  date: string;
  year: string;
  summary: string;
  tag?: string;
  body: string;
};

const DIR = join(process.cwd(), "content/writing");

function toSlug(file: string) {
  return basename(file, ".mdx").toLowerCase();
}

export function getPosts(): Post[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(DIR, f), "utf8"));
      const date: string = data.publishedAt ?? "2024-01-01";
      return {
        slug: toSlug(f),
        title: data.title as string,
        date,
        year: date.slice(0, 4),
        summary: (data.summary as string) ?? "",
        tag: (data.tag as string | undefined) || undefined,
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}
