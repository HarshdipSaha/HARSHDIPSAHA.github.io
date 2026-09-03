# Effort 035 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-041 | Every count shown on `/process` (efforts, ADRs, superseded ADRs, PR gates, and the two pill labels) is computed from the repo's own record at build time, never typed as a literal in `site.ts` | The page's pitch is "the record can't drift"; the counts had already drifted three times (efforts 021, 029/030, parallel-merge reconciliations) because they were hand-maintained |
| R-042 | `scripts/build-process-stats.mjs` runs on `predev`/`prebuild` and writes the committed manifest `src/data/process-stats.json`, counting `aidlc-docs/efforts/NNN-*/` directories, `docs/adr/NNNN-*.md` files, `Superseded` rows in `docs/adr/README.md`, and workflow files with a `pull_request`/`pull_request_target` trigger | Follows the existing `build-images.mjs`/`build-llms-txt.mjs` generator pattern (predev/prebuild hook, committed manifest for `images.json`) rather than inventing a new one |
| R-043 | The build fails if any of `efforts`, `adrs`, `superseded`, or `prWorkflows` is lower than the value already committed in `process-stats.json`, unless `ALLOW_STATS_DECREASE=1` is set | The record is append-only (efforts aren't deleted, ADRs are superseded not removed); a decrease almost always means something was deleted by mistake |
| R-044 | An unknown `{placeholder}` token in a `process.stats`/`process.links` template throws at build time | A renamed field should fail `next build`, not silently render the literal string `{typo}` on a live page |

## CHANGED

| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| C-1 | `process.stats` in `site.ts` held four literal `{value, label}` pairs with hardcoded numbers (`"32"`, `"15"`, `"2"`, `"4"`) and embedded literal ranges in the label strings | Holds four `{value, label}` pairs where `value` and every number inside `label` is a `{placeholder}` token, filled by `src/lib/process-stats.ts` | Removes the last hand-maintained numbers from the page |
| C-2 | The two "All N decisions/change records" pill links were written directly in `src/app/process/page.tsx` as `<Pill href={...}>All 15 decisions ↗</Pill>` / `...29 change records...` | `process.links` (new export, `{label, path}[]`) in `site.ts`, rendered by mapping `processLinks` in the page component | Content-as-code rule (AGENTS.md): copy lives in `site.ts`, not hardcoded JSX; also removes the second drift point for the same numbers |
| C-3 | `scripts/check-aidlc-sync.mjs`'s exempt-path list covered only `src/data/images.json` among generated JSON manifests | Also exempts `^src\/data\/process-stats\.json$` | The new manifest is generated and committed for the same reason `images.json` is (so `tsc` works in a fresh clone); its own diff should not itself trip the "substantive change with no effort record" gate |

## UNCHANGED but affected

- The gate-pipeline diagram (`GatePipeline`, `process.gates` — added in effort 030) is unchanged;
  `processCounts.gates` now reads `process.gates.length` instead of the page needing a separate
  hardcoded "4".
- `AGENTS.md`'s command list, Conventions section, and boundaries table — extended with the third
  generator, following the shape already established for `build-images.mjs` and
  `build-llms-txt.mjs`.
- `CONTEXT.md`'s `/process` IA-table row and glossary — updated to name the new generated file,
  following the shape already established for `images.json`.
- Effort 027's skills-bubble section and effort 032's story-page changes on `/process` /
  `/story` — untouched; this effort only touches the four-stat grid and the two repo-link pills.

## Acceptance criteria

- [x] `scripts/build-process-stats.mjs` exists, runs on `predev` and `prebuild`, and has an
      `npm run stats` alias
- [x] `src/data/process-stats.json` is committed and regenerates identically on a clean build
- [x] `src/content/site.ts`'s `process.stats` and `process.links` contain zero literal numbers —
      every count is a `{placeholder}`
- [x] `/process` renders the correct live counts (verified against `out/process.html`: 32, 15, 2,
      4, "All 15 decisions ↗", "All 32 change records ↗")
- [x] The build-time guard rejects a count decrease (script logic reviewed; guard fires by
      comparing against the committed manifest, `ALLOW_STATS_DECREASE=1` escape hatch present)
- [x] `AGENTS.md` boundaries table and `npm run` list updated
- [x] `npm run typecheck` clean; `npm run build` succeeds; `npm run test:unit` 42/42;
      `npm run test:smoke` 77/78 (1 pre-existing flake, unrelated route, passes in isolation)
