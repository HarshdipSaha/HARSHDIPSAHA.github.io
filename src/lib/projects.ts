import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import matter from "gray-matter";
import images from "@/data/images.json";

export type ImageMeta = { src: string; w: number; h: number };

export type Project = {
  slug: string;
  title: string;
  date: string;
  year: string;
  summary: string;
  link?: string;
  image?: ImageMeta;
  body: string;
};

const DIR = join(process.cwd(), "content/projects");

function toSlug(file: string) {
  return basename(file, ".mdx").toLowerCase();
}

function imageFor(paths: string[] | undefined): ImageMeta | undefined {
  const first = paths?.[0];
  if (!first) return undefined;
  const key = basename(first, ".webp");
  return (images.projects as Record<string, ImageMeta>)[key];
}

export function getProjects(): Project[] {
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
        link: data.link as string | undefined,
        image: imageFor(data.images as string[] | undefined),
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectsBySlugs(slugs: string[]): Project[] {
  const all = getProjects();
  return slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));
}

export const gallery = images.gallery as (ImageMeta & { thumb: string })[];
export const projectImages = images.projects as Record<string, ImageMeta>;
export const portrait = images.me as ImageMeta;
