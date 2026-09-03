#!/usr/bin/env node
/**
 * Count the record and write src/data/process-stats.json.
 *
 *   aidlc-docs/efforts/NNN-<ref>/   -> efforts, firstEffort, lastEffort
 *   docs/adr/NNNN-<slug>.md         -> adrs, firstAdr, lastAdr
 *   docs/adr/README.md              -> superseded, supersededAdrs (rows whose Status says "Superseded")
 *   .github/workflows/<name>.yml    -> prWorkflows (files with a `pull_request` trigger)
 *
 * Runs on predev/prebuild, next to build-images.mjs and build-llms-txt.mjs.
 * The manifest is committed, like src/data/images.json, so `tsc` has
 * something to import in a fresh clone; /process reads every number it shows
 * from it, and src/content/site.ts keeps only the label templates. A page
 * whose pitch is "the record can't drift" must not carry hand-maintained
 * counts — before this script the four numbers drifted three times.
 *
 * Guard: the record is append-only (efforts are never deleted, ADRs are
 * superseded rather than removed), so a count that went *down* against the
 * committed manifest means something was deleted. The script exits 1 in that
 * case and names the count. A deliberate removal can pass it once with
 * ALLOW_STATS_DECREASE=1.
 *
 * Note on gates: quality-gates.yml carries two of the four gates the page
 * draws (Build + Smoke, Lighthouse), so "PR gates" is not "PR workflows".
 * The page takes the gate count from `process.gates.length` in site.ts — the
 * same array the pipeline diagram renders — and this file records
 * `prWorkflows` as the repo-side number for anyone checking the two agree.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const MANIFEST = join(ROOT, "src/data/process-stats.json");

// Effort directories: `NNN-<ref>`, zero-padded to three digits. Anything else
// under aidlc-docs/efforts/ is not a record and is ignored.
const effortDirs = (await readdir(join(ROOT, "aidlc-docs/efforts"), { withFileTypes: true }))
  .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
  .map((d) => d.name)
  .sort();
const effortNumbers = effortDirs.map((d) => d.slice(0, 3));

// ADR files: `NNNN-<slug>.md`. README.md is the index, not a record.
const adrFiles = (await readdir(join(ROOT, "docs/adr")))
  .filter((f) => /^\d{4}-.*\.md$/.test(f))
  .sort();
const adrNumbers = adrFiles.map((f) => f.slice(0, 4));

// Superseded decisions: the ADR index has one table row per record with a
// Status column; a row whose status begins "Superseded" is a replaced decision.
const adrIndex = await readFile(join(ROOT, "docs/adr/README.md"), "utf8");
const supersededAdrs = [];
for (const line of adrIndex.split("\n")) {
  const m = line.match(/^\|\s*\[(\d{4})\]\([^)]*\)\s*\|[^|]*\|\s*([^|]*?)\s*\|/);
  if (m && /^superseded/i.test(m[2])) supersededAdrs.push(m[1]);
}
supersededAdrs.sort();

// Workflows that run on pull requests. A `pull_request:` (or
// `pull_request_target:`) key under `on:`, or an inline list `on: [.., pull_request]`.
const workflowDir = join(ROOT, ".github/workflows");
const workflowFiles = (await readdir(workflowDir)).filter((f) => /\.ya?ml$/.test(f)).sort();
const prWorkflows = [];
for (const f of workflowFiles) {
  const text = await readFile(join(workflowDir, f), "utf8");
  if (/^\s{1,4}pull_request(_target)?:/m.test(text) || /^on:\s*\[[^\]]*\bpull_request\b/m.test(text)) {
    prWorkflows.push(f);
  }
}

const stats = {
  efforts: effortDirs.length,
  firstEffort: effortNumbers[0] ?? null,
  lastEffort: effortNumbers.at(-1) ?? null,
  adrs: adrFiles.length,
  firstAdr: adrNumbers[0] ?? null,
  lastAdr: adrNumbers.at(-1) ?? null,
  superseded: supersededAdrs.length,
  supersededAdrs,
  prWorkflows: prWorkflows.length,
};

// Append-only guard: no count may fall below the committed manifest.
const previous = await readFile(MANIFEST, "utf8").then(JSON.parse).catch(() => null);
if (previous) {
  const decreased = ["efforts", "adrs", "superseded", "prWorkflows"].filter(
    (k) => typeof previous[k] === "number" && stats[k] < previous[k],
  );
  if (decreased.length) {
    const detail = decreased.map((k) => `${k} ${previous[k]} -> ${stats[k]}`).join(", ");
    if (process.env.ALLOW_STATS_DECREASE === "1") {
      console.warn(`process-stats: count decreased (${detail}) — allowed by ALLOW_STATS_DECREASE=1`);
    } else {
      console.error(
        `process-stats: FAIL — a count went down against the committed src/data/process-stats.json: ${detail}.\n` +
          `The record is append-only: an effort directory or an ADR was deleted, or an ADR index row was ` +
          `un-superseded. Restore it, or if the removal is deliberate, rerun once with ALLOW_STATS_DECREASE=1.`,
      );
      process.exit(1);
    }
  }
}

await mkdir(join(MANIFEST, ".."), { recursive: true });
await writeFile(MANIFEST, JSON.stringify(stats, null, 2) + "\n");
console.log(
  `process-stats: ${stats.efforts} efforts (${stats.firstEffort}–${stats.lastEffort}), ` +
    `${stats.adrs} ADRs (${stats.firstAdr}–${stats.lastAdr}), ${stats.superseded} superseded, ` +
    `${stats.prWorkflows} PR workflows`,
);
