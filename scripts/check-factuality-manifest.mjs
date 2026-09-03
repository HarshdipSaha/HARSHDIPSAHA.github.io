#!/usr/bin/env node
/**
 * Factuality manifest sync guard (effort 036).
 *
 * `src/data/factuality.json` is a generated, committed file — regenerate it
 * with `node evals/factuality/run.mjs --write-summary src/data/factuality.json`,
 * never by hand (see AGENTS.md "Boundaries — do not edit by hand"). This
 * script fails a PR whose committed copy has drifted from a fresh eval run,
 * the same way `scripts/check-aidlc-sync.mjs` guards the effort record.
 *
 * Usage:
 *   node scripts/check-factuality-manifest.mjs [reportPath] [manifestPath]
 *     reportPath   default .evals/factuality-report.json — the JSON report
 *                  `npm run eval:factuality` just wrote (its `site` field IS
 *                  the fresh manifest; no second network round-trip here).
 *     manifestPath default src/data/factuality.json — the committed copy.
 *
 * Run this AFTER a passing `npm run eval:factuality`, not instead of it:
 * `.github/workflows/evals.yml` runs them as two steps in that order.
 *
 * Exit codes:
 *   0  the committed manifest agrees with the fresh run (see the carve-out
 *      documented in scripts/lib/factuality-manifest.mjs)
 *   1  a real disagreement — regenerate and commit the manifest
 *   2  harness error — the report or the manifest could not be read
 */
import { readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { diffFactualityManifest } from "./lib/factuality-manifest.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

function repoRelative(p) {
  return relative(REPO_ROOT, p).split("\\").join("/");
}

function readJson(path, label) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    console.error(`check-factuality-manifest: cannot read ${label} (${repoRelative(path)}) — ${error.message}`);
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`check-factuality-manifest: ${label} (${repoRelative(path)}) is not valid JSON — ${error.message}`);
    return null;
  }
}

function main() {
  const reportPath = resolve(process.argv[2] ?? join(REPO_ROOT, ".evals", "factuality-report.json"));
  const manifestPath = resolve(process.argv[3] ?? join(REPO_ROOT, "src", "data", "factuality.json"));

  const report = readJson(reportPath, "factuality report");
  if (!report) {
    console.error(`Run \`npm run eval:factuality\` first — it writes this file as part of a normal run.`);
    return 2;
  }
  const manifest = readJson(manifestPath, "committed factuality manifest");
  if (!manifest) {
    console.error(
      `Generate it with \`node evals/factuality/run.mjs --write-summary ${repoRelative(manifestPath)}\` and commit it.`,
    );
    return 2;
  }

  if (typeof report.site !== "object" || report.site === null) {
    console.error(
      `check-factuality-manifest: ${repoRelative(reportPath)} has no "site" field — ` +
        `it wasn't written by evals/factuality/run.mjs, or is from a version before effort 036.`,
    );
    return 2;
  }
  if (typeof manifest.projects !== "object" || manifest.projects === null) {
    console.error(
      `check-factuality-manifest: ${repoRelative(manifestPath)} has no "projects" field — ` +
        `it wasn't written by \`--write-summary\`.`,
    );
    return 2;
  }

  const mismatches = diffFactualityManifest(manifest.projects, report.site);

  if (mismatches.length === 0) {
    console.log(
      `check-factuality-manifest: OK — ${repoRelative(manifestPath)} agrees with the fresh run ` +
        `(unverifiable-either-side slugs excluded by design; see scripts/lib/factuality-manifest.mjs).`,
    );
    return 0;
  }

  console.error(`check-factuality-manifest: FAIL — ${repoRelative(manifestPath)} has drifted from a fresh run.\n`);
  for (const m of mismatches) console.error(`  - ${m}`);
  console.error(
    `\nRegenerate and commit it:\n` +
      `  node evals/factuality/run.mjs --write-summary ${repoRelative(manifestPath)}\n` +
      `  git add ${repoRelative(manifestPath)}`,
  );
  return 1;
}

process.exitCode = main();
