/**
 * Pure comparison logic for the factuality site-manifest sync guard (effort 036).
 *
 * `evals/factuality/run.mjs --write-summary src/data/factuality.json` writes the
 * committed manifest that `src/app/projects/[slug]/page.tsx` renders its
 * "verified" line from. CI's `Evals / factuality` job regenerates the same
 * summary on every PR (it's always computed as the report's `site` field,
 * win or lose); this module decides whether that fresh summary and the
 * committed file still agree.
 *
 * The one deliberate carve-out: `pySdf.mdx`'s source (`ComPhysGroup/PyAMorph`)
 * reads fine with the owner's local `gh` token but 404s to CI's workflow
 * token (AGENTS.md's Evidence rule; `evals/factuality/verdict.mjs`'s own
 * staleness comment tells the same story for the baseline). That makes a
 * project's counts *legitimately* differ between the manifest committed
 * locally and a fresh CI run whenever its source is unreadable on one side —
 * comparing those counts as a regression would flap this gate on every PR
 * that touches this repo, which is exactly the ticket #16 bug ADR 0013 fixed
 * for `staleBaselineEntries`. So: any slug reported unverifiable (`unverifiable > 0`)
 * by EITHER side is excluded from the count comparison entirely. Membership
 * (does the manifest still know about this slug at all) is still checked
 * for every other slug — that is not token-dependent, and its absence means
 * a project was added, removed or renamed without regenerating the manifest.
 */

/** @typedef {{grounded: number, baselined: number, unverifiable: number}} Counts */

/**
 * @param {Record<string, Counts>} committed  `src/data/factuality.json`'s `projects` field
 * @param {Record<string, Counts>} fresh       a fresh run's `site` field (same shape)
 * @returns {string[]} human-readable mismatch descriptions; empty means in sync
 */
export function diffFactualityManifest(committed, fresh) {
  const mismatches = [];
  const allSlugs = new Set([...Object.keys(committed ?? {}), ...Object.keys(fresh ?? {})]);

  for (const slug of [...allSlugs].sort()) {
    const c = committed?.[slug];
    const f = fresh?.[slug];
    const excluded = (c?.unverifiable ?? 0) > 0 || (f?.unverifiable ?? 0) > 0;
    if (excluded) continue;

    if (!c) {
      mismatches.push(`${slug}: present in the fresh run but missing from the committed manifest`);
      continue;
    }
    if (!f) {
      mismatches.push(`${slug}: present in the committed manifest but missing from the fresh run`);
      continue;
    }
    if (c.grounded !== f.grounded || c.baselined !== f.baselined || c.unverifiable !== f.unverifiable) {
      mismatches.push(
        `${slug}: committed {grounded: ${c.grounded}, baselined: ${c.baselined}, unverifiable: ${c.unverifiable}} != ` +
          `fresh {grounded: ${f.grounded}, baselined: ${f.baselined}, unverifiable: ${f.unverifiable}}`,
      );
    }
  }

  return mismatches;
}
