import factuality from "@/data/factuality.json";

/** One project's row in the generated manifest — see evals/factuality/verdict.mjs `siteSummary`. */
export type FactualityCounts = { grounded: number; baselined: number; unverifiable: number };

const manifest = (factuality as { projects: Record<string, FactualityCounts> }).projects;

/** Where the eval that produced these counts actually lives. */
export const FACTUALITY_EVAL_HREF =
  "https://github.com/HARSHDIPSAHA/HARSHDIPSAHA.github.io/tree/main/evals/factuality";

export type FactualityBadge = { text: string; href: string };

/**
 * The one-sentence "verified" line a project page renders under its header
 * (effort 036). Pure function of the generated manifest and whether the
 * project states a source repository at all — no copy invented here that the
 * manifest and frontmatter don't support.
 *
 * A typed helper rather than `src/content/site.ts` on purpose: the sentence's
 * numbers are per-project counts read from a build-time-generated file, not
 * literal prose an author writes — the same reason `scripts/lib/llms-txt.mjs`
 * is a small renderer instead of copy in `site.ts`. Say why in the effort
 * record (aidlc-docs/efforts/036-factuality-badge/effort-state.md).
 *
 * Four states (per the spec):
 *   - no claims at all in the case study                -> nothing to show, returns null
 *   - grounded-only                                      -> "✓ N claims checked against the source repository"
 *   - grounded + baselined                                -> "... · K verified by certificate"
 *   - private-source (no `link` in frontmatter at all)    -> "Source repository is private — claims stated as written"
 *   - unverifiable but a `link` IS present (source unread) -> "Source repository could not be read — claims stated as written"
 *
 * A case study's `source` is fetched once for the whole file (evals/factuality/run.mjs), so a
 * project is either entirely unverifiable or has zero unverifiable claims — never a mix. That
 * invariant is what makes the four states exhaustive and mutually exclusive.
 */
export function factualityBadge(hasLink: boolean, counts: FactualityCounts | undefined): FactualityBadge | null {
  if (!counts) return null;
  const { grounded, baselined, unverifiable } = counts;
  const total = grounded + baselined + unverifiable;
  if (total === 0) return null;

  if (unverifiable > 0) {
    const text = hasLink
      ? "Source repository could not be read — claims stated as written"
      : "Source repository is private — claims stated as written";
    return { text, href: FACTUALITY_EVAL_HREF };
  }

  const checked = grounded + baselined;
  const claimWord = checked === 1 ? "claim" : "claims";
  let text = `✓ ${checked} ${claimWord} checked against the source repository`;
  if (baselined > 0) text += ` · ${baselined} verified by certificate`;
  return { text, href: FACTUALITY_EVAL_HREF };
}

/** Look up a project's manifest row by its URL slug. */
export function factualityCountsFor(slug: string): FactualityCounts | undefined {
  return manifest[slug];
}
