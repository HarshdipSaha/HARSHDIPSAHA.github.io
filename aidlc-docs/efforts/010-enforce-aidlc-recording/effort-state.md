# Effort 010 — CI-enforced AI-DLC recording

| Field | Value |
|-------|-------|
| Ref | 010-enforce-aidlc-recording |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-23 |
| Closed | 2026-08-23 |
| Baseline | aidlc-docs/inception/ |
| ADRs | 0009 |
| Commits | see PR "Enforce AI-DLC recording in CI" |
| Reconstructed | no — recorded live |

## Intent
Make the AI-DLC recording rule self-enforcing so no AI tool (Claude or otherwise) can ship a
substantive change without its effort record again. Root cause of the misses (efforts 008-009
shipped unrecorded): the rule lived only in `CLAUDE.md`, was advisory, and had an undefined
"trivial" loophole.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | User-requested after discovering the drift fixed in effort 009. Scope: shared-contract rule + CI gate + PR template + narrow trivial definition + fix CONTEXT.md drift found en route. |
| Functional design | Three layers: (1) rule in `AGENTS.md` (read by all tools) as Change-lifecycle section + Definition-of-done item 7; (2) `scripts/check-aidlc-sync.mjs` run by `.github/workflows/aidlc-check.yml` on PRs — fails substantive diffs with no `aidlc-docs/` change, `[trivial]` PR-title escape hatch; (3) `.github/pull_request_template.md` checklist with "only if needed" guards on ADR/docs-sync. Decision recorded as ADR 0009. |
| NFRs | The gate must not force busywork: generated/drop-zone paths exempt; ADR and docs-sync steps conditional; `depth: minimal` accepted for small changes. |
| Code | Guard script, workflow, PR template, AGENTS.md/CLAUDE.md rule changes, ADR 0009 + README row, CONTEXT.md drift fix (`/process` live, 18 project MDX files, aidlc-check glossary entry). |
| Build & test | Guard script exercised locally against this branch's diff (fails without aidlc-docs, passes with; `TRIVIAL=1` skips). `npx tsc --noEmit` clean; `npm run build` succeeds (no `src/` changes, site unaffected). |

## Units of work
- [x] `scripts/check-aidlc-sync.mjs` — diff-shape guard with exempt/substantive path sets
- [x] `.github/workflows/aidlc-check.yml` — runs the guard on every PR to main
- [x] `.github/pull_request_template.md` — lifecycle checklist, conditional ADR/docs items
- [x] `AGENTS.md` — Change-lifecycle section + Definition-of-done item 7 (shared contract)
- [x] `CLAUDE.md` — invoke `ai-dlc` at change start; trivial loophole narrowed, deferred to AGENTS.md/ADR 0009
- [x] ADR 0009 + `docs/adr/README.md` row
- [x] `CONTEXT.md` drift fix + `aidlc-check` glossary entry

## Verification
`node scripts/check-aidlc-sync.mjs origin/main` on this branch: FAIL before the effort record
existed, OK after (the gate validated itself). `TRIVIAL=1` path returns skip. `npx tsc --noEmit
-p tsconfig.json` clean; `npm run build` succeeds.

## Notes
- The gate is diff-shape-based, not content-based — it removes the "forgot entirely" failure
  mode (the one that actually happened), not the low-quality-record failure mode. That stays
  on review.
- `[trivial]` is honor-system; tighten via a follow-up ADR if abused.
