/**
 * Factuality evals — pure classification layer.
 *
 * Takes already-fetched text and an already-loaded baseline and decides the
 * verdict for every claim. Like `claims.mjs` it imports nothing: no filesystem,
 * no network. That keeps the pass/fail decision — including baseline handling
 * and the stale-entry rule — testable offline (spec #12, "Testing Decisions").
 */

import { extractClaims, isGrounded } from "./claims.mjs";

/**
 * @typedef {"grounded" | "baselined" | "ungrounded" | "unverifiable"} Status
 */

/**
 * @typedef {object} BaselineEntry
 * @property {string} file    Repo-relative path of the case study.
 * @property {string} claim   The claim's normalised form.
 * @property {string} [value] The claim as written, for humans reading the diff.
 * @property {string} reason  Mandatory: where the number actually comes from.
 */

/** Key under which a baseline entry is looked up. */
export function baselineKey(file, normalisedClaim) {
  return `${file}::${normalisedClaim}`;
}

/**
 * Build a lookup map from a baseline document, rejecting malformed entries
 * loudly rather than silently ignoring them.
 *
 * @param {{entries?: BaselineEntry[]}} baseline
 * @returns {{map: Map<string, BaselineEntry>, errors: string[]}}
 */
export function indexBaseline(baseline) {
  const map = new Map();
  const errors = [];
  const entries = baseline?.entries ?? [];
  for (const [i, entry] of entries.entries()) {
    if (!entry || typeof entry.file !== "string" || !entry.file) {
      errors.push(`baseline entry ${i}: missing "file"`);
      continue;
    }
    if (typeof entry.claim !== "string" || !entry.claim) {
      errors.push(`baseline entry ${i} (${entry.file}): missing "claim"`);
      continue;
    }
    if (typeof entry.reason !== "string" || entry.reason.trim().length === 0) {
      errors.push(
        `baseline entry ${i} (${entry.file} :: ${entry.claim}): empty "reason" — ` +
          `every baselined claim must say where the number actually comes from`,
      );
      continue;
    }
    // The `--write-baseline` skeleton leaves this placeholder. Accepting it
    // would turn the baseline into a mute button, which is the one thing it
    // must never be.
    if (/^\s*TODO\b/i.test(entry.reason)) {
      errors.push(
        `baseline entry ${i} (${entry.file} :: ${entry.claim}): reason is still the TODO placeholder — ` +
          `write where the number actually comes from, or fix the case study`,
      );
      continue;
    }
    const key = baselineKey(entry.file, entry.claim);
    if (map.has(key)) {
      errors.push(`baseline entry ${i}: duplicate of an earlier entry (${key})`);
      continue;
    }
    map.set(key, entry);
  }
  return { map, errors };
}

/**
 * Classify one case study.
 *
 * @param {object} input
 * @param {string} input.file        Repo-relative path, e.g. "content/projects/AtomNet.mdx".
 * @param {string} input.body        MDX body.
 * @param {string | null} input.source  Source text (README) or null when there is none.
 * @param {string | null} [input.sourceRef]  Human name of the source, e.g. "HARSHDIPSAHA/APT#README".
 * @param {string} [input.unverifiableReason]  Why there is no source.
 * @param {Map<string, BaselineEntry>} input.baseline
 * @returns {{
 *   file: string,
 *   source: string | null,
 *   unverifiableReason: string | null,
 *   claims: Array<{value: string, normalised: string, kind: string, phrase: string, status: Status, reason: string | null}>,
 *   counts: Record<Status, number>,
 *   usedBaselineKeys: string[]
 * }}
 */
export function classifyCaseStudy({
  file,
  body,
  source,
  sourceRef = null,
  unverifiableReason = "",
  baseline,
}) {
  const extracted = extractClaims(body);
  const counts = { grounded: 0, baselined: 0, ungrounded: 0, unverifiable: 0 };
  const usedBaselineKeys = [];

  const claims = extracted.map((claim) => {
    const key = baselineKey(file, claim.normalised);
    const entry = baseline?.get(key);

    // No source at all: every claim in the file is unverifiable, and that is
    // reported by name rather than skipped silently (spec #12, user story 5).
    if (source === null || source === undefined) {
      counts.unverifiable += 1;
      return {
        ...claim,
        status: /** @type {Status} */ ("unverifiable"),
        reason: unverifiableReason || "no source available",
      };
    }

    if (isGrounded(claim, source)) {
      // A grounded claim needs no baseline entry. If one exists it is stale in
      // spirit, but not an error: the content may have been corrected to match
      // the source. It is simply not "used", so the stale-entry check will
      // flag it — which is the behaviour we want.
      counts.grounded += 1;
      return { ...claim, status: /** @type {Status} */ ("grounded"), reason: sourceRef };
    }

    if (entry) {
      usedBaselineKeys.push(key);
      counts.baselined += 1;
      return { ...claim, status: /** @type {Status} */ ("baselined"), reason: entry.reason };
    }

    counts.ungrounded += 1;
    return {
      ...claim,
      status: /** @type {Status} */ ("ungrounded"),
      reason: sourceRef ? `not found in ${sourceRef}` : "not found in source",
    };
  });

  return {
    file,
    source: sourceRef,
    unverifiableReason: source === null || source === undefined ? unverifiableReason || "no source available" : null,
    claims,
    counts,
    usedBaselineKeys,
  };
}

/**
 * Baseline entries that no live claim matched.
 *
 * A baseline is a record of accepted exceptions; an entry whose claim has been
 * deleted from the content is a lie waiting to be reused. Reporting it as an
 * error is what stops the baseline rotting (ticket #16).
 *
 * @param {Map<string, BaselineEntry>} baseline
 * @param {Iterable<string>} usedKeys
 * @returns {BaselineEntry[]}
 */
export function staleBaselineEntries(baseline, usedKeys) {
  const used = new Set(usedKeys);
  const stale = [];
  for (const [key, entry] of baseline) {
    if (!used.has(key)) stale.push(entry);
  }
  return stale;
}

/**
 * Roll per-file results into the suite verdict.
 *
 * @param {ReturnType<typeof classifyCaseStudy>[]} files
 * @param {BaselineEntry[]} stale
 * @param {string[]} baselineErrors
 */
export function summarise(files, stale, baselineErrors) {
  const counts = { grounded: 0, baselined: 0, ungrounded: 0, unverifiable: 0 };
  for (const f of files) {
    for (const k of /** @type {Status[]} */ (Object.keys(counts))) counts[k] += f.counts[k];
  }
  const failures = files.flatMap((f) =>
    f.claims.filter((c) => c.status === "ungrounded").map((c) => ({ file: f.file, ...c })),
  );
  return {
    counts,
    total: counts.grounded + counts.baselined + counts.ungrounded + counts.unverifiable,
    failures,
    stale,
    baselineErrors,
    ok: failures.length === 0 && stale.length === 0 && baselineErrors.length === 0,
  };
}
