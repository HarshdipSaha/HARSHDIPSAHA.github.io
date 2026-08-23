# Effort 009 — RECAP-Net publication link fix and content reshuffle

| Field | Value |
|-------|-------|
| Ref | 009-recap-net-publication-cleanup |
| Status | complete |
| Depth | minimal |
| Opened | 2026-08-23 |
| Closed | 2026-08-23 |
| Baseline | aidlc-docs/inception/ |
| ADRs | none |
| Commits | `1f71772` (PR #5) |
| Reconstructed | no — recorded as part of this effort |

## Intent
Fix the RECAP-Net / BraTS publication card, which linked to a placeholder Overleaf draft instead
of the published paper; remove the duplicate BraTS project card from Projects now that the work
is represented under Publications; move Amazon ML Summer School out of Studies (it's a
work-adjacent program, not an institution) into Work Experience.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | User-requested content fix, scoped to three edits in `content.tsx` / `page.tsx`; no new architecture, so no ADR needed. |
| Code | Replaced the Overleaf link with `https://link.springer.com/10.1007/978-3-032-16370-7_23` on the Publications card in `src/app/about/page.tsx`; deleted `src/app/work/projects/brats-response-project.mdx`; moved the Amazon ML Summer School entry from `about.studies.institutions` to `about.work.experiences` in `src/resources/content.tsx`. |
| Build & test | `npx tsc --noEmit -p tsconfig.json` clean; `npm run build` succeeded — `/work/brats-response-project` route dropped, `/about` unaffected otherwise. |

## Units of work
- [x] Publication link fix (Overleaf → Springer)
- [x] Remove duplicate BraTS project card from Projects
- [x] Move Amazon ML Summer School from Studies to Work Experience

## Verification
`npx tsc --noEmit -p tsconfig.json` clean; `npm run build` succeeded. Reviewed and merged via GitHub PR #5.

## Notes
- During this effort, `aidlc-docs/registry.md` and `aidlc-docs/audit.md` were found stale: effort 007 was marked `in-progress` despite PR #3 (its actual deliverable) being merged, and effort 008 (PR #4) had no record at all. Both were backfilled/corrected as part of closing this effort out — see `aidlc-docs/registry.md` and `aidlc-docs/audit.md`.
