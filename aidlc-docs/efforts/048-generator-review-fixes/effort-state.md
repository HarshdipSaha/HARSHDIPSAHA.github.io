# Effort 048 — Fix findings from effort 047's code review

| Field | Value |
|-------|-------|
| Ref | 048-generator-review-fixes |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `9dc2d31` (effort 047, PR #65, merged) |
| ADRs | none |
| Commits | branch `fix/generator-count-and-loader-dedup` |
| Reconstructed | no — recorded live |

## Intent

Per the `implement` skill's own process, a two-axis code review (Standards + Spec sub-agents) ran
against effort 047 (`agent-data.json`) and the new `harshdipsaha-mcp` repo's initial scaffold after
both landed. Two real findings on the Standards axis applied to this repo:

1. `AGENTS.md` has two near-identical lines about the generator pipeline (`npm run dev` and
   `npm run build`); effort 047 updated only the second ("three generators" → "five") when `predev`
   changed identically to `prebuild`. `aidlc-docs/efforts/047-agent-data-export/requirements-delta.md`
   claimed this correction was made — true for one of the two occurrences, not both.
2. `scripts/build-agent-data.mjs`'s `loadSite()`/`loadProjects()` were verbatim copies of
   `scripts/build-llms-txt.mjs`'s — the code comments even said so directly ("Same loader
   build-llms-txt.mjs uses"). No shared helper existed despite the pattern now appearing twice.

(A third Standards finding and a Spec-axis finding about `limit` clamping applied to the
`harshdipsaha-mcp` repo, not this one — fixed there directly, commit `f80a253`, not part of this
effort.)

## Stages

| Stage | Outcome |
|-------|---------|
| Fix #1 | `AGENTS.md`'s `npm run dev` comment corrected to "the five generators", matching the line below it. |
| Fix #2 | Extracted `scripts/lib/site-loader.mjs` (`loadSite(root)`, `loadProjects(root)`) from the verbatim-duplicated code in both build scripts; `build-llms-txt.mjs` and `build-agent-data.mjs` now both import it. |
| Verify | Confirmed the refactor is behavior-preserving for `llms.txt` and is a genuine correctness improvement for `agent-data.json` — see Notes. Full verification below. |

## Units of work

- [x] `AGENTS.md` — one-line fix.
- [x] `scripts/lib/site-loader.mjs` — new, shared `loadSite`/`loadProjects`.
- [x] `scripts/build-llms-txt.mjs` — now imports the shared loader; own `loadSite`/`loadProjects` removed, along with the now-unused `readdir`/`readFile`/`matter`/`ts`/`basename` imports.
- [x] `scripts/build-agent-data.mjs` — same.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 pages |
| `npm run test:unit` | 60/60 passed — unaffected, since both pure renderers (`llms-txt.mjs`, `agent-data.mjs`) are tested directly with fixture data, never through the loader |
| `npx playwright test` (full suite) | 84/84 passed |
| Ordering consistency (see Notes) | `public/llms.txt`'s and `public/agent-data.json`'s project order now byte-for-byte identical (both derive from the same shared, date-sorted `loadProjects()`) |

## Notes

- **The refactor is not purely mechanical — it fixes a latent inconsistency.** Before this effort,
  `build-agent-data.mjs`'s own `loadProjects()` sorted by `year` (a 4-character string) while
  `build-llms-txt.mjs`'s sorted by the full `publishedAt` date. Two projects published in the same
  year could therefore appear in a different relative order between `llms.txt` and
  `agent-data.json`. The shared loader sorts by full date for both, so the two agent-facing exports
  now agree on ordering — verified directly (see Verification table) rather than assumed.
- **No test changes were needed.** `scripts/llms-txt.test.mjs` and `scripts/agent-data.test.mjs`
  both exercise the pure renderers (`renderLlmsTxt`, `renderAgentData`) with inline fixture data,
  never through the loader — so this I/O-only refactor has no test surface of its own beyond
  `npm run build` producing correct output, which is the same verification standard every other
  build-*.mjs script in this repo uses.
- **No ADR.** This is a same-day correction to an already-decided, already-shipped generator
  pattern (ADR 0014), not a new architectural decision.
