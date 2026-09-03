# Effort 036 — Factuality badge on every project page

| Field | Value |
|-------|-------|
| Ref | 036-factuality-badge |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Baseline | effort 023 (factuality evals, ADR 0013) |
| ADRs | none — see "Why no ADR" below |
| Commits | branch `feat/factuality-badge` |
| Reconstructed | no — recorded live |

## Intent

Idea 3 of the site-improvement ideation doc (`docs/plans/2026-09-01-site-improvement-ideas.md`,
effort 031): the factuality gate (effort 023, ADR 0013) is the single most unusual thing this site
has, and it was invisible on the pages it protects. This effort makes it visible: one quiet line
under every case study's header stating how many claims were checked against the source repository,
how many needed a written baseline reason, or that the source can't be read — with a link to the
eval code. No shields, no drama, real counts, per project.

A previous agent session started this effort and was interrupted after finishing only the eval side
(`evals/factuality/run.mjs`'s `--write-summary` flag and `evals/factuality/verdict.mjs`'s
`siteSummary`/`slugOf`, plus their tests). This session reviewed that work, found it correct and
complete on its own terms, and finished the rest: the stale-manifest CI check the run.mjs doc
comment already promised (`scripts/check-factuality-manifest.mjs`), the page rendering, and this
record.

## Stages

| Stage | Outcome |
|-------|---------|
| Review of interrupted work | Read `evals/factuality/run.mjs`, `verdict.mjs`, `verdict.test.mjs`'s diff. `--write-summary <path>` writes `{ $comment, projects: {slug: {grounded, baselined, unverifiable}} }` only on a passing run (`summary.ok`); `siteSummary()`/`slugOf()` are pure, sorted, and match `src/lib/projects.ts`'s slug derivation exactly (lowercased MDX basename). 2 new tests (`slugOf`, `siteSummary`) already present and passing. Verdict: correct, no changes needed. |
| Manifest generation | Ran `node evals/factuality/run.mjs --write-summary src/data/factuality.json` — real GitHub API run via the owner's `gh` token (`npm ci` already done in this worktree). 60 grounded, 9 baselined, 0 ungrounded, 41 unverifiable, exit 0. Committed the real manifest, not a fixture. |
| Stale-manifest CI check | `scripts/lib/factuality-manifest.mjs` (pure `diffFactualityManifest(committed, fresh)`) + `scripts/check-factuality-manifest.mjs` (I/O: reads `.evals/factuality-report.json`'s `site` field as "fresh" and `src/data/factuality.json`'s `projects` field as "committed" — no second network round-trip). Carve-out: any slug `unverifiable > 0` on **either** side is excluded from the count comparison, so `pySdf`'s documented local-vs-CI 404 divergence (AGENTS.md's Evidence rule, `verdict.mjs`'s staleness comment) can never flap this gate — same shape as the ticket #16 fix `staleBaselineEntries` already made for the baseline itself. 9 new `node --test` cases. Wired into `.github/workflows/evals.yml` as a step immediately after `Factuality eval`, and `package.json` gained `check:factuality-manifest`. Verified the check actually catches drift: hand-corrupted a count in the committed file, confirmed exit 1 naming the exact slug and both values, restored, confirmed exit 0. |
| Page rendering | `src/lib/factuality.ts`: pure `factualityBadge(hasLink, counts)` deriving the four spec states (grounded-only / grounded+baselined / private-source / unverifiable-with-link) plus a fifth degenerate case (zero claims -> render nothing, e.g. `AquilaOptimiserOptimised`/`BrandDiffusion`). `src/app/projects/[slug]/page.tsx` renders the line under the date, linking to `evals/factuality/` on GitHub, sized to match `.label`'s 13px/500-weight without inheriting its uppercase/letter-spacing (a full sentence in small caps read as shouting, contradicting the spec's own "quiet line"). |
| Docs + verification | `AGENTS.md`: boundaries table row for `src/data/factuality.json`, a new "evidence rule is visible" convention paragraph, `evals.yml`'s description updated, `check:factuality-manifest` added to the commands block. `tests/smoke.spec.ts` gained a `factuality badge` block asserting real rendered text (not invented expectations) on a grounded+baselined project and the private-source copy on `BrainwavesFinland`. This record. |

## Units of work

- [x] `evals/factuality/run.mjs` — `--write-summary` flag (already done by the interrupted session; reviewed, unchanged)
- [x] `evals/factuality/verdict.mjs` — `slugOf`, `siteSummary` (already done; reviewed, unchanged)
- [x] `evals/factuality/verdict.test.mjs` — 2 tests for the above (already done; reviewed, unchanged)
- [x] `src/data/factuality.json` — generated, committed, real counts from a live run
- [x] `scripts/lib/factuality-manifest.mjs` — pure `diffFactualityManifest`
- [x] `scripts/check-factuality-manifest.mjs` — CLI wrapper, 3 exit codes
- [x] `scripts/factuality-manifest.test.mjs` — 9 cases, including the pySdf carve-out both directions
- [x] `.github/workflows/evals.yml` — new step after `Factuality eval`
- [x] `package.json` — `check:factuality-manifest` script
- [x] `src/lib/factuality.ts` — `factualityBadge`, `factualityCountsFor`
- [x] `src/app/projects/[slug]/page.tsx` — renders the line under the date
- [x] `tests/smoke.spec.ts` — `factuality badge` block, 2 tests x 2 form factors
- [x] `AGENTS.md` — boundaries table, evidence-rule paragraph, CI description, commands block

## Why the manifest is compared to a report field, not a second live run

`npm run eval:factuality` (no flag) never writes `src/data/factuality.json` — only an explicit
`--write-summary <path>` does, and only on a passing run. `check-factuality-manifest.mjs` reads the
"fresh" side from `.evals/factuality-report.json`'s `site` field, which `run.mjs` always populates
(win or lose) as a byproduct of the same run that already wrote the report. This matters: if the npm
script itself passed `--write-summary` by default, CI's checked-out `src/data/factuality.json` would
get overwritten by the same run before the comparison, and the check would trivially pass against
itself every time — silently defeating the entire point of the gate. Keeping `--write-summary`
explicit (a human runs it locally, commits the result) is what makes "does the committed copy still
agree with a fresh run" a real question in CI.

## Why no ADR

Two judgment calls in this effort could look architectural; neither is new architecture:

1. **The stale-check carve-out** (exclude any slug unverifiable on either side from the count
   comparison) is the same fix ADR 0013 already made for `staleBaselineEntries` — keying staleness
   on token-independent facts, not on values that differ by which `GITHUB_TOKEN` fetched them —
   applied to a second generated artifact. It documents a decision, but it is ADR 0013's decision
   restated for a new file, not a new one.
2. **A typed helper (`src/lib/factuality.ts`) instead of copy in `src/content/site.ts`.** AGENTS.md's
   "content is code" rule is about literal prose; every existing `site.ts` export is a plain object
   with no interpolation. This badge's text is computed per-project from a generated data file
   (pluralization, a conditional clause, a lookup by slug) — a renderer, not authored copy. Effort
   024 already established that exact seam for computed site text: `scripts/lib/llms-txt.mjs` is a
   small pure renderer, not `site.ts` prose, for the same reason (real per-project data, not literal
   words an author chose). This is that established pattern reapplied, not a new one.

Neither rises to "architectural or IA decision" under the Change lifecycle rule's own bar (route
change, storage change, structural change). If a reviewer disagrees, ADR 0013 or a small addendum to
it is the right place, since both calls extend its reasoning rather than start new reasoning.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean, exit 0 |
| `npm run build` | succeeds — 30 static pages, prebuild reported `20 projects` for llms.txt, postbuild mirrored 25 prefetch payloads |
| `npm run test:unit` | 53 tests, 53 pass, 0 fail (`node --test evals scripts`) — 44 pre-existing + 9 new (`factuality-manifest.test.mjs`) |
| `npm run eval:factuality` | exit 0 — 60 grounded · 9 baselined · 0 ungrounded · 41 unverifiable (110 claims); `pySdf` read grounded+baselined locally (owner's `gh` token), as AGENTS.md documents |
| `npm run check:factuality-manifest` | exit 0 — committed `src/data/factuality.json` agrees with the fresh run |
| Gate proved to gate | Hand-edited `atomnet`'s committed `grounded` count to `99`: exit 1, named `atomnet`, printed both count sets. Restored: exit 0 again. |
| `npm run check:aidlc` | passes once this record is committed (verified pre-commit that it correctly reports nothing to check against an unmodified `origin/main`-based HEAD) |
| `npm run test:smoke` | 80/82 passing (both `desktop`/`mobile` projects); the 2 failures were `renders / without errors` and reduced-motion home, both known-flaky under full-parallel load (same pattern noted in efforts 028, 032, 033) — reran both alone: 2/2 pass. The 4 new `factuality badge` tests passed on both form factors in every run. |
| Real rendered output spot-checked in `out/` | `object-tracking-tennis-game.html`: "8 claims checked against the source repository · 1 verified by certificate" (7 grounded + 1 baselined). `youtubeproj-langchain.html`: "13 claims checked against the source repository" (grounded-only, no baseline clause). `atomnet.html`: "1 claim checked against the source repository · 1 verified by certificate" (singular form). `brainwavesfinland.html`: "Source repository is private — claims stated as written". `aquilaoptimiseroptimised.html` / `branddiffusion.html`: no line at all (0 claims — nothing to check). |
| The "unverifiable but has a link" state | Has no live example among the current 20 case studies (a file's `source` is fetched once per file, so a project is either entirely unverifiable or has zero unverifiable claims — see `evals/factuality/run.mjs`). Verified by code inspection: it shares `factualityBadge`'s `unverifiable > 0` branch with the private-source case, differing only in the `hasLink` ternary already exercised by the private-source Playwright test. Not independently smoke-tested for lack of a real fixture; flagged here rather than silently assumed correct. |

## Notes

- `src/data/images.json` showed as modified after `npm run build` (line-ending only —
  `git diff` reports zero content changes; `.gitattributes` normalizes it to CRLF on touch). Left
  out of this effort's commit; it is generated output effort 036 did not intend to change.
- The badge copy's "N verified by certificate" phrase is the spec's own literal wording (idea 3 /
  the task brief), used even though not every baselined reason literally cites a certificate — some
  cite a résumé line, an effort record, or a README config literal split across a code span (see
  `evals/factuality/baseline.json`). The phrase groups all baseline-accepted claims under one
  reader-facing label; a reader who wants the specific reason follows the link to
  `evals/factuality/baseline.json` itself.
- Per AGENTS.md's own documented divergence, this manifest was generated with the owner's `gh` token
  (`pySdf`: 2 grounded, 1 baselined). A regeneration in CI, or by someone without that token, would
  see `pySdf` as fully unverifiable instead — exactly the case `check-factuality-manifest.mjs`'s
  carve-out exists to not flag as drift.
