#!/usr/bin/env node
/**
 * Factuality eval — the gate.
 *
 *   npm run eval:factuality
 *
 * Reads every content/projects/*.mdx, extracts its quantitative claims, fetches
 * the source repository's README through the GitHub API, and classifies each
 * claim as grounded, baselined, ungrounded or unverifiable.
 *
 * Exit codes are the contract:
 *
 *   0  every claim is grounded, baselined or unverifiable
 *   1  a factuality failure — an ungrounded claim, a stale baseline entry, or a
 *      malformed baseline entry
 *   2  network exhaustion — GitHub could not be reached after retries. A
 *      deliberately distinct code so a red check is never ambiguous between
 *      "the network broke" and "you published a false claim".
 *   3  harness error — the suite itself is broken (bad JSON, missing content)
 *
 * Flags:
 *   --json <path>      where to write the machine-readable report
 *                      (default .evals/factuality-report.json)
 *   --write-baseline   rewrite the baseline from the current run's ungrounded
 *                      claims, preserving existing reasons. Entries created
 *                      this way carry a TODO reason and FAIL the gate until a
 *                      human writes a real one — the baseline is a record of
 *                      considered decisions, not a mute button.
 *   --no-judge         skip the optional LLM tier even if a key is present
 */

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

import {
  classifyCaseStudy,
  indexBaseline,
  redundantBaselineEntries,
  staleBaselineEntries,
  summarise,
} from "./verdict.mjs";
import { NetworkExhaustedError, fetchReadme, parseRepo, resolveToken } from "./sources.mjs";
import { judgeCaseStudy, judgeAvailable, judgeSkipReason } from "./judge.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");
const CONTENT_DIR = join(REPO_ROOT, "content", "projects");
const BASELINE_PATH = join(HERE, "baseline.json");

export const EXIT = { OK: 0, FACTUALITY: 1, NETWORK: 2, HARNESS: 3 };

const TODO_REASON = "TODO: state where this number actually comes from";

/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { json: join(REPO_ROOT, ".evals", "factuality-report.json"), writeBaseline: false, judge: true };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--json") args.json = resolve(argv[++i]);
    else if (a === "--write-baseline") args.writeBaseline = true;
    else if (a === "--no-judge") args.judge = false;
    else if (a === "--help" || a === "-h") args.help = true;
    else throw new Error(`unknown argument: ${a}`);
  }
  return args;
}

function repoRelative(p) {
  return relative(REPO_ROOT, p).split("\\").join("/");
}

/** ANSI only when the stream is a TTY; CI logs stay clean. */
const tty = process.stdout.isTTY;
const c = {
  dim: (s) => (tty ? `\u001b[2m${s}\u001b[0m` : s),
  red: (s) => (tty ? `\u001b[31m${s}\u001b[0m` : s),
  green: (s) => (tty ? `\u001b[32m${s}\u001b[0m` : s),
  yellow: (s) => (tty ? `\u001b[33m${s}\u001b[0m` : s),
  bold: (s) => (tty ? `\u001b[1m${s}\u001b[0m` : s),
};

/* ------------------------------------------------------------------ */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n/, ""));
    return EXIT.OK;
  }

  // --- load content -------------------------------------------------
  let files;
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx")).sort();
  } catch (error) {
    console.error(`factuality: cannot read ${repoRelative(CONTENT_DIR)} — ${error.message}`);
    return EXIT.HARNESS;
  }
  if (files.length === 0) {
    console.error(`factuality: no case studies found in ${repoRelative(CONTENT_DIR)}`);
    return EXIT.HARNESS;
  }

  // --- load baseline ------------------------------------------------
  let baselineDoc;
  try {
    baselineDoc = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") baselineDoc = { entries: [] };
    else {
      console.error(`factuality: ${repoRelative(BASELINE_PATH)} is not valid JSON — ${error.message}`);
      return EXIT.HARNESS;
    }
  }
  const { map: baseline, errors: baselineErrors } = indexBaseline(baselineDoc);

  // --- fetch sources and classify ------------------------------------
  const { token, origin } = resolveToken();
  console.log(c.bold("Factuality eval"));
  console.log(`${files.length} case studies · GitHub auth: ${origin}`);
  console.log("");

  const results = [];
  const presentKeys = [];
  const groundedKeys = [];
  const judgeInputs = [];

  for (const name of files) {
    const abs = join(CONTENT_DIR, name);
    const rel = repoRelative(abs);
    const { data, content } = matter(readFileSync(abs, "utf8"));

    const repo = parseRepo(data.link);
    let source = null;
    let sourceRef = null;
    let unverifiableReason = "";

    if (!repo) {
      unverifiableReason = data.link
        ? `\`link\` is not a GitHub repository URL (${String(data.link)})`
        : "no `link` in frontmatter — the source repository is private, so no README can be fetched";
    } else {
      const fetched = await fetchReadme(repo, { token, log: (m) => console.log(c.dim(m)) });
      if (fetched.ok) {
        source = fetched.text;
        sourceRef = fetched.ref;
      } else {
        unverifiableReason = fetched.reason;
      }
    }

    const result = classifyCaseStudy({
      file: rel,
      body: content,
      source,
      sourceRef,
      unverifiableReason,
      baseline,
    });
    results.push(result);
    presentKeys.push(...result.presentKeys);
    groundedKeys.push(...result.groundedKeys);
    if (source) judgeInputs.push({ file: rel, body: content, source });
  }

  const stale = staleBaselineEntries(baseline, presentKeys);
  const redundant = redundantBaselineEntries(baseline, groundedKeys);
  const summary = summarise(results, stale, baselineErrors);

  // --- optional judge tier -------------------------------------------
  /** @type {{ran: boolean, reason: string | null, results: unknown[]}} */
  const judge = { ran: false, reason: judgeSkipReason(), results: [] };
  if (!args.judge) {
    judge.reason = "--no-judge was passed";
  } else if (judgeAvailable()) {
    judge.ran = true;
    for (const input of judgeInputs) judge.results.push(await judgeCaseStudy(input));
    judge.reason = null;
  }

  // --- baseline authoring --------------------------------------------
  if (args.writeBaseline) {
    const existingReason = new Map(
      (baselineDoc.entries ?? []).map((e) => [`${e.file}::${e.claim}`, e.reason]),
    );
    const entries = [];
    for (const file of results) {
      for (const claim of file.claims) {
        const key = `${file.file}::${claim.normalised}`;
        const keep =
          claim.status === "ungrounded" ||
          claim.status === "baselined" ||
          // An unverifiable claim keeps any entry it already has: the source
          // was simply unreachable this run, and dropping the entry would lose
          // a written reason for no reason.
          (claim.status === "unverifiable" && existingReason.has(key));
        if (!keep) continue;
        entries.push({
          file: file.file,
          claim: claim.normalised,
          value: claim.value,
          kind: claim.kind,
          phrase: claim.phrase,
          reason: existingReason.get(key) ?? TODO_REASON,
        });
      }
    }
    writeFileSync(
      BASELINE_PATH,
      `${JSON.stringify({ $comment: BASELINE_COMMENT, entries }, null, 2)}\n`,
      "utf8",
    );
    console.log(c.yellow(`Rewrote ${repoRelative(BASELINE_PATH)} with ${entries.length} entries.`));
    const todos = entries.filter((e) => e.reason === TODO_REASON).length;
    if (todos > 0) {
      console.log(c.yellow(`${todos} entries need a written reason before this gate can pass.`));
    }
    console.log("");
  }

  // --- report ---------------------------------------------------------
  printReport(results, summary, judge, redundant);

  const report = {
    generatedAt: new Date().toISOString(),
    tool: "evals/factuality/run.mjs",
    auth: origin,
    counts: summary.counts,
    total: summary.total,
    ok: summary.ok,
    files: results.map((f) => ({
      file: f.file,
      source: f.source,
      unverifiableReason: f.unverifiableReason,
      counts: f.counts,
      claims: f.claims.map(({ index, ...rest }) => rest),
    })),
    failures: summary.failures.map(({ index, ...rest }) => rest),
    staleBaselineEntries: summary.stale,
    redundantBaselineEntries: redundant,
    baselineErrors: summary.baselineErrors,
    judge,
  };
  mkdirSync(dirname(args.json), { recursive: true });
  writeFileSync(args.json, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(c.dim(`Report written to ${repoRelative(args.json)}`));

  return summary.ok ? EXIT.OK : EXIT.FACTUALITY;
}

const BASELINE_COMMENT =
  "Accepted ungrounded claims. Every entry needs a reason naming where the number actually comes from. " +
  "Regenerate the skeleton with `node evals/factuality/run.mjs --write-baseline`, then write the reasons by hand. " +
  "An entry whose claim no longer appears in the content fails the gate as stale.";

/* ------------------------------------------------------------------ */

function printReport(results, summary, judge, redundant = []) {
  const { counts } = summary;

  for (const file of results) {
    const bits = [];
    if (file.counts.grounded) bits.push(`${file.counts.grounded} grounded`);
    if (file.counts.baselined) bits.push(`${file.counts.baselined} baselined`);
    if (file.counts.ungrounded) bits.push(c.red(`${file.counts.ungrounded} ungrounded`));
    if (file.counts.unverifiable) bits.push(c.yellow(`${file.counts.unverifiable} unverifiable`));
    const mark = file.counts.ungrounded ? c.red("×") : file.counts.unverifiable ? c.yellow("~") : c.green("✓");
    console.log(`${mark} ${file.file} ${c.dim(bits.length ? `— ${bits.join(", ")}` : "— no claims")}`);
    if (file.unverifiableReason && file.claims.length > 0) {
      console.log(`  ${c.dim(`unverifiable: ${file.unverifiableReason}`)}`);
    }
  }

  console.log("");
  console.log(
    `${c.bold("Totals")} — ${counts.grounded} grounded · ${counts.baselined} baselined · ` +
      `${counts.ungrounded} ungrounded · ${counts.unverifiable} unverifiable (${summary.total} claims)`,
  );

  if (summary.failures.length > 0) {
    console.log("");
    console.log(c.red(c.bold(`${summary.failures.length} ungrounded claim(s):`)));
    for (const f of summary.failures) {
      console.log("");
      console.log(`  ${c.bold(f.file)}`);
      console.log(`    claim:  ${c.red(f.value)}  ${c.dim(`(${f.kind})`)}`);
      console.log(`    where:  ${f.phrase}`);
      console.log(`    source: ${f.reason}`);
    }
    console.log("");
    console.log(
      "Fix the case study, or — if the number is true but comes from somewhere other than the\n" +
        "README — add it to evals/factuality/baseline.json with a reason naming its real source.",
    );
  }

  if (summary.stale.length > 0) {
    console.log("");
    console.log(c.red(c.bold(`${summary.stale.length} stale baseline entr(ies) — the claim is no longer in the content:`)));
    for (const e of summary.stale) console.log(`  - ${e.file} :: ${e.value ?? e.claim}`);
    console.log("  Remove them from evals/factuality/baseline.json.");
  }

  if (redundant.length > 0) {
    console.log("");
    console.log(c.yellow(`${redundant.length} redundant baseline entr(ies) — the claim is now grounded in its source:`));
    for (const e of redundant) console.log(`  - ${e.file} :: ${e.value ?? e.claim}`);
    console.log(c.dim("  Advisory only. Deleting them is a tidy-up, not a correction."));
  }

  if (summary.baselineErrors.length > 0) {
    console.log("");
    console.log(c.red(c.bold("Malformed baseline entries:")));
    for (const e of summary.baselineErrors) console.log(`  - ${e}`);
  }

  console.log("");
  if (judge.ran) {
    const withFindings = judge.results.filter((r) => r.ran && r.findings?.length);
    console.log(c.bold("Judge tier (advisory — does not affect the exit code)"));
    if (withFindings.length === 0) {
      console.log(c.dim("  no unsupported prose assertions reported"));
    }
    for (const r of withFindings) {
      console.log(`  ${r.file}`);
      for (const f of r.findings) console.log(`    [${f.verdict}] ${f.assertion} — ${f.why}`);
    }
  } else {
    console.log(`${c.bold("Judge tier skipped")} — ${judge.reason}`);
  }
  console.log("");
}

/* ------------------------------------------------------------------ */

try {
  process.exitCode = await main();
} catch (error) {
  if (error instanceof NetworkExhaustedError) {
    console.error("");
    console.error(c.red(`factuality: ${error.message}`));
    console.error(
      "This is a network failure, not a factuality failure — no claim was judged false.\n" +
        `Exit code ${EXIT.NETWORK} is reserved for exactly this case. Re-run when GitHub is reachable.`,
    );
    process.exitCode = EXIT.NETWORK;
  } else {
    console.error(c.red(`factuality: harness error — ${error?.stack ?? error}`));
    process.exitCode = EXIT.HARNESS;
  }
}
