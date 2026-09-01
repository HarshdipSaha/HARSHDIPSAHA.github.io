#!/usr/bin/env node
/**
 * AI-DLC sync guard.
 *
 * Fails (exit 1) when a diff contains substantive changes but no matching
 * update under aidlc-docs/efforts/. This is the enforcement layer behind
 * the rule in AGENTS.md ("Change lifecycle"): effort records are not
 * optional paperwork — they are part of the change itself.
 *
 * Usage:
 *   node scripts/check-aidlc-sync.mjs [baseRef]
 *     baseRef defaults to env BASE_REF, then "origin/main".
 *
 * Escape hatch (genuinely trivial changes — typo, one-line copy fix):
 *   - PR title contains "[trivial]"  (env PR_TITLE, set by CI), or
 *   - env TRIVIAL=1 for local runs.
 * ADR 0009 defines what qualifies as trivial. Deleting a file, adding a
 * route, or changing more than a few lines of copy does NOT qualify.
 */
import { execSync } from "node:child_process";

const baseRef = process.argv[2] || process.env.BASE_REF || "origin/main";
const prTitle = process.env.PR_TITLE || "";

if (process.env.TRIVIAL === "1" || /\[trivial\]/i.test(prTitle)) {
  console.log("aidlc-check: skipped — change marked [trivial].");
  console.log("If this change deletes files, adds routes, or alters structure, it is NOT trivial: remove the marker and record an effort.");
  process.exit(0);
}

const diffOutput = execSync(`git diff --name-only ${baseRef}...HEAD`, {
  encoding: "utf8",
});
const changed = diffOutput.split("\n").filter(Boolean);

// Generated or drop-zone paths — never substantive on their own.
const exempt = [
  /^public\//,
  /^out\//,
  /^src\/data\/images\.json$/,
  /^gallery\//,
  /^project_images\//,
  /^me\.jpg$/,
];

// Paths whose change means "the site or its tooling changed".
const substantive = [
  /^src\//,
  /^scripts\//,
  /^package(-lock)?\.json$/,
  /^next\.config\./,
  /^tsconfig\.json$/,
  /^postcss\.config\./,
  /^content\//,
  /^resume\//,
  /^\.github\/workflows\//,
];

const substantiveChanges = changed.filter(
  (p) => substantive.some((re) => re.test(p)) && !exempt.some((re) => re.test(p)),
);

const effortTouched = changed.some((p) => p.startsWith("aidlc-docs/"));

if (substantiveChanges.length === 0) {
  console.log("aidlc-check: OK — no substantive changes in this diff.");
  process.exit(0);
}

if (effortTouched) {
  console.log("aidlc-check: OK — substantive changes are accompanied by an aidlc-docs update.");
  process.exit(0);
}

console.error("aidlc-check: FAIL — substantive changes with no aidlc-docs record.\n");
console.error("Changed files that require an effort record:");
for (const p of substantiveChanges) console.error(`  - ${p}`);
console.error(`
This repo runs AI-DLC. Every substantive change must ship WITH its record
in the same PR (see AGENTS.md "Change lifecycle" and
docs/how-to/run-an-aidlc-effort.md):

  1. aidlc-docs/efforts/NNN-<ref>/effort-state.md  — intent, stages, verification
  2. aidlc-docs/registry.md                        — regenerated from effort-state files
  3. aidlc-docs/audit.md                           — approval-gate rows for this effort
  4. docs/adr/NNNN-*.md                            — only if an architectural/IA decision was made
  5. CONTEXT.md / docs/                            — only if facts stated there drifted

Genuinely trivial (typo-level) change? Add "[trivial]" to the PR title.`);
process.exit(1);
