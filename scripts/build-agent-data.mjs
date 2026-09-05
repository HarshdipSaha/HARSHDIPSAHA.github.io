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
 * and unit-tested (`npm run test:unit`). This file is only I/O — the loaders
 * themselves live in scripts/lib/site-loader.mjs, shared with
 * scripts/build-llms-txt.mjs.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { renderAgentData } from "./lib/agent-data.mjs";
import { loadProjects, loadSite } from "./lib/site-loader.mjs";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

const site = await loadSite(ROOT);
const projects = await loadProjects(ROOT);
const data = renderAgentData({ person: site.person, story: site.story }, projects);

await mkdir(PUBLIC, { recursive: true });
await writeFile(join(PUBLIC, "agent-data.json"), JSON.stringify(data, null, 2), "utf8");

console.log(`agent-data.json: ${data.projects.length} projects, ${JSON.stringify(data).length} chars`);
