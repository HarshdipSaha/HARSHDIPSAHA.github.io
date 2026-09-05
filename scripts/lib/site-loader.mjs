/**
 * Shared I/O for the agent-facing generators (scripts/build-llms-txt.mjs and
 * scripts/build-agent-data.mjs): both need the same site.ts data and the same
 * project list. Extracted here so the two generators don't carry two copies
 * of the same loader — code review on effort 047 flagged the duplication.
 *
 * Not itself unit-tested: it's pure I/O (filesystem + a TS transpile), the
 * same shape as every other build-*.mjs script in this repo. Correctness is
 * verified by `npm run build` producing the expected output.
 */
import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import matter from "gray-matter";
import ts from "typescript";

/**
 * Load src/content/site.ts — the site's single source of copy — without a
 * build step of its own. It is plain typed data with no imports, so
 * transpiling it to ESM and importing the result is exact: there is no second
 * copy of the copy, which is what makes drift structurally impossible.
 *
 * @param {string} root — repo root (process.cwd() in the calling script)
 */
export async function loadSite(root) {
  const source = await readFile(join(root, "src/content/site.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "site.ts",
  });
  const url = "data:text/javascript;base64," + Buffer.from(outputText, "utf8").toString("base64");
  return import(url);
}

/**
 * The same read src/lib/projects.ts performs for the rendered pages:
 * slug = lowercased MDX filename, newest first (by publish date, falling
 * back to 2024-01-01 for anything missing it — matching every other
 * generator's convention).
 *
 * @param {string} root — repo root (process.cwd() in the calling script)
 */
export async function loadProjects(root) {
  const dir = join(root, "content/projects");
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
