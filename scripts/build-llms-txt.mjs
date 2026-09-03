#!/usr/bin/env node
/**
 * Write the agent-facing documents into public/.
 *
 *   src/content/site.ts + content/projects/*.mdx
 *   + content/writing/*.mdx                        ->  public/llms.txt
 *                                                       public/llms-full.txt
 *
 * Runs on predev/prebuild, next to scripts/build-images.mjs, and follows the
 * same rule: generated into public/, gitignored, never hand-edited. A fresh
 * clone has neither file until the first build — exactly as public/img/ works.
 *
 * The rendering itself lives in scripts/lib/llms-txt.mjs, which is pure and
 * unit-tested (`npm run test:unit`). This file is only I/O.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import matter from "gray-matter";
import ts from "typescript";
import { renderLlmsTxt } from "./lib/llms-txt.mjs";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

/**
 * Load src/content/site.ts — the site's single source of copy — without a
 * build step of its own. It is plain typed data with no imports, so
 * transpiling it to ESM and importing the result is exact: there is no second
 * copy of the copy, which is what makes drift structurally impossible.
 */
async function loadSite() {
  const source = await readFile(join(ROOT, "src/content/site.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "site.ts",
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText, "utf8").toString("base64");
  return import(url);
}

/**
 * The same read that src/lib/projects.ts performs for the rendered pages:
 * slug = lowercased MDX filename, newest first. Images are not needed here.
 */
async function loadProjects() {
  const dir = join(ROOT, "content/projects");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const projects = [];
  for (const f of files) {
    const { data, content } = matter(await readFile(join(dir, f), "utf8"));
    const date = data.publishedAt ?? "2024-01-01";
    projects.push({
      slug: basename(f, ".mdx").toLowerCase(),
      title: data.title,
      date,
      year: String(date).slice(0, 4),
      summary: data.summary ?? "",
      link: data.link,
      body: content,
    });
  }
  return projects.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * The same read that src/lib/writing.ts performs for the rendered pages:
 * slug = lowercased MDX filename, newest first.
 */
async function loadPosts() {
  const dir = join(ROOT, "content/writing");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const posts = [];
  for (const f of files) {
    const { data, content } = matter(await readFile(join(dir, f), "utf8"));
    const date = data.publishedAt ?? "2024-01-01";
    posts.push({
      slug: basename(f, ".mdx").toLowerCase(),
      title: data.title,
      date,
      year: String(date).slice(0, 4),
      summary: data.summary ?? "",
      tag: data.tag,
      body: content,
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

const site = await loadSite();
const projects = await loadProjects();
const posts = await loadPosts();
const { index, full } = renderLlmsTxt(
  { person: site.person, nav: site.nav, story: site.story, publication: site.publication },
  projects,
  posts,
);

await mkdir(PUBLIC, { recursive: true });
await writeFile(join(PUBLIC, "llms.txt"), index, "utf8");
await writeFile(join(PUBLIC, "llms-full.txt"), full, "utf8");

console.log(
  `llms.txt: ${projects.length} projects, ${posts.length} writing posts, llms.txt ${index.length} chars, llms-full.txt ${full.length} chars`,
);
