# Effort 002 — Flatten and personalise

| Field | Value |
|-------|-------|
| Ref | 002-flatten-and-personalise |
| Status | complete |
| Depth | standard |
| Opened | 2026-01-28 |
| Closed | 2026-01-28 |
| Baseline | aidlc-docs/inception/ |
| ADRs | docs/adr/0003-*.md, docs/adr/0006-*.md |
| Commits | `e3d7eea`, `e7a10c7`, `3df501a`, `c91a044` |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Move the vendored template from `template/src/**` to `src/**` at repo root so the project is a conventional Next.js app owned outright, then delete the template's demo content so nothing shipped that wasn't Harshdip's.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Not recorded. Reconstructed from the rename set and deletion set. |
| Functional design | Flat repo-root Next.js layout; `src/utils/meta.ts` centralises page metadata. |
| NFRs | Reduced deploy payload: a 3.5MB screenshot and unused image sets removed. |
| Code | 141 files relocated (git detected pure renames); 1,175 lines of demo content removed across 25 files; `src/utils/meta.ts` (34 lines) added. |
| Build & test | Build green after flatten; still no automated tests. |

## Units of work
- [x] Flatten `template/src/**` -> `src/**` — 141 files, pure renames
- [x] Delete template scaffolding — `template/README.md` (229 lines), `template/.github/FUNDING.yml`, `template/.vscode/`
- [x] Add metadata helper — `src/utils/meta.ts` (34 lines)
- [x] Remove demo blog posts — `fuzzy-monotonic-lightgbm` (151), `laptop-price-predictor` (437), `next-projectspace` (160), `reelspro` (422)
- [x] Remove demo imagery — `public/images/publications/` (incl. `korea.jpg`), `public/images/og/home.jpg`, 3.5MB reelspro screenshot
- [x] Disable the `/blog` route — routes config set to `false`

## Verification
Build succeeded post-flatten and the deployed site rendered with no demo content reachable. Rename fidelity confirmed by git reporting the move as renames rather than delete+add. No automated checks existed.

## Notes
- Flattening gave up the ability to cheaply rebase on upstream Magic Portfolio fixes. Accepted deliberately: the code is now owned, and upstream drift is not worth the indirection. Recorded in ADR 0003.
- Debt: `/blog` is still built but dark — the route and its components remain in the tree with the toggle off. Either populate it or delete it.
