#!/usr/bin/env node
/**
 * Write the agent-data.json export into public/.
 *
 *   src/content/site.ts + content/projects/*.mdx  ->  public/agent-data.json
 *
 * Runs on predev/prebuild, next to scripts/build-llms-txt.mjs, and follows
 * the same rule: generated into public/, gitignored, never hand-edited.
 *
 * This is the data source the future MCP server (issue #62, effort 045)
 * fetches over HTTP to back its `getProfile`/`searchProjects` tools — a
 * structured sibling to llms.txt's prose, not a second copy of the copy.
 *
 * The rendering itself lives in scripts/lib/agent-data.mjs, which is pure
 * and unit-tested (`npm run test:unit`). This file is only I/O.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import matter from "gray-matter";
import ts from "typescript";
import { renderAgentData } from "./lib/agent-data.mjs";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

/** Same loader build-llms-txt.mjs uses — see that file for why. */
async function loadSite() {
  const source = await readFile(join(ROOT, "src/content/site.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "site.ts",
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText, "utf8").toString("base64");
  return import(url);
}

/** Same read build-llms-txt.mjs performs: slug = lowercased MDX filename. */
async function loadProjects() {
  const dir = join(ROOT, "content/projects");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const projects = [];
  for (const f of files) {
    const { data } = matter(await readFile(join(dir, f), "utf8"));
    const date = data.publishedAt ?? "2024-01-01";
    projects.push({
      slug: basename(f, ".mdx").toLowerCase(),
      title: data.title,
      year: String(date).slice(0, 4),
      summary: data.summary ?? "",
      link: data.link,
    });
  }
  return projects.sort((a, b) => (a.year < b.year ? 1 : -1));
}

const site = await loadSite();
const projects = await loadProjects();
const data = renderAgentData({ person: site.person, story: site.story }, projects);

await mkdir(PUBLIC, { recursive: true });
await writeFile(join(PUBLIC, "agent-data.json"), JSON.stringify(data, null, 2), "utf8");

console.log(`agent-data.json: ${data.projects.length} projects, ${JSON.stringify(data).length} chars`);
