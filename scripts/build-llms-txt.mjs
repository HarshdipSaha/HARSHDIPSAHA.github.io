#!/usr/bin/env node
/**
 * Write the agent-facing documents into public/.
 *
 *   src/content/site.ts + content/projects/*.mdx  ->  public/llms.txt
 *                                                     public/llms-full.txt
 *
 * Runs on predev/prebuild, next to scripts/build-images.mjs, and follows the
 * same rule: generated into public/, gitignored, never hand-edited. A fresh
 * clone has neither file until the first build — exactly as public/img/ works.
 *
 * The rendering itself lives in scripts/lib/llms-txt.mjs, which is pure and
 * unit-tested (`npm run test:unit`). This file is only I/O — the loaders
 * themselves live in scripts/lib/site-loader.mjs, shared with
 * scripts/build-agent-data.mjs.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderLlmsTxt } from "./lib/llms-txt.mjs";
import { loadProjects, loadSite } from "./lib/site-loader.mjs";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

const site = await loadSite(ROOT);
const projects = await loadProjects(ROOT);
const { index, full } = renderLlmsTxt(
  { person: site.person, nav: site.nav, story: site.story, publication: site.publication },
  projects,
);

await mkdir(PUBLIC, { recursive: true });
await writeFile(join(PUBLIC, "llms.txt"), index, "utf8");
await writeFile(join(PUBLIC, "llms-full.txt"), full, "utf8");

console.log(
  `llms.txt: ${projects.length} projects, llms.txt ${index.length} chars, llms-full.txt ${full.length} chars`,
);
