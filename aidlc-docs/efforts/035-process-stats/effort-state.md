# Effort 035 — Compute the /process stats from the repo at build time

| Field | Value |
|-------|-------|
| Ref | 035-process-stats |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Branch | `feat/process-stats` |
| Baseline | aidlc-docs/inception/ |
| ADRs | none (see Notes) |
| Commits | pending — filled at PR open |
| Reconstructed | no |

## Intent

Idea 2 from the improvement ideation doc (effort 031, PR #43): the four stat numbers on
`/process` ("32 changes", "15 decisions", "2 superseded", "4 gates") and the two pill labels
("All 15 decisions ↗", "All 32 change records ↗") were typed literally into `src/content/site.ts`
and had already drifted three times (efforts 021, 029/030, and parallel-merge reconciliations).
A page whose entire pitch is "the record can't drift" should not carry hand-maintained counts.
This effort makes every one of those numbers a build-time count of the repo's own record, with a
guard against the count ever going backward.

## Units of work

1. **`scripts/build-process-stats.mjs`** — new generator, run on `predev`/`prebuild` alongside
   `build-images.mjs` and `build-llms-txt.mjs`. Counts `aidlc-docs/efforts/NNN-*/` directories,
   `docs/adr/NNNN-*.md` files, rows in `docs/adr/README.md` whose Status starts "Superseded", and
   `.github/workflows/*.yml` files carrying a `pull_request`/`pull_request_target` trigger. Writes
   `src/data/process-stats.json`. Guard: if any count (`efforts`, `adrs`, `superseded`,
   `prWorkflows`) is lower than the value already committed, the build fails with a named diff —
   the record is append-only, so a decrease means a deleted effort/ADR or an un-superseded row.
   `ALLOW_STATS_DECREASE=1` overrides it once for a deliberate removal.
2. **`src/data/process-stats.json`** — committed generated manifest (same reasoning as
   `images.json`: `tsc`/`next build` need something to import in a fresh clone).
3. **`src/lib/process-stats.ts`** — reads the JSON, exposes `processCounts` (adds `gates` from
   `process.gates.length` in `site.ts` — the same array the gate-pipeline diagram renders, so the
   headline count and the diagram can never disagree), `fillCounts()` (replaces `{placeholder}`
   tokens, throws on an unknown one so a renamed field fails the build instead of shipping a
   literal `{typo}`), `processStats` and `processLinks` (the filled arrays the page renders).
4. **`src/content/site.ts`** — `process.stats` values/labels and the two pill entries (now
   `process.links`, `{label, path}`) rewritten as `{placeholder}` templates; no literal counts
   remain.
5. **`src/app/process/page.tsx`** — stat grid now maps `processStats` (was `process.stats`); the
   two hardcoded pill `<Pill>` elements replaced with a `processLinks.map(...)`.
6. **`scripts/check-aidlc-sync.mjs`** — added `^src\/data\/process-stats\.json$` to the exempt-path
   list, mirroring the existing `images.json` exemption: a generated, committed manifest should not
   itself trip the "substantive change with no effort record" gate.
7. **`package.json`** — `predev`/`prebuild` call the new script third; new `npm run stats` alias
   (mirrors `images`/`llms`).
8. **`AGENTS.md`** — "three generators" (was "two") in the command comments, a new prose paragraph
   under Conventions explaining the build-time stats (mirrors the existing `images.json`/
   `llms.txt` paragraphs), a new boundaries-table row for `process-stats.json`, and the
   hand-edit-prohibited-paths list extended.
9. **`CONTEXT.md`** (this session) — the `/process` IA-table row now names `process-stats.json`
   and `process-stats.ts` instead of only `process` in `site.ts`; new glossary entry for
   `process-stats.json`, matching the existing `images.json` entry's shape.

## Verification

```
$ npm run typecheck
> tsc --noEmit -p tsconfig.json
(clean, no output)

$ npm run build
> prebuild: build-images.mjs && build-llms-txt.mjs && build-process-stats.mjs
images: 15 gallery, 21 projects, 0 encoded
llms.txt: 20 projects, llms.txt 6960 chars, llms-full.txt 50944 chars
process-stats: 32 efforts (001–033), 15 ADRs (0001–0015), 2 superseded, 3 PR workflows
> next build
✓ Compiled successfully in 12.9s
✓ Generating static pages using 11 workers (30/30)
> postbuild: postbuild-segments.mjs
segments: mirrored 25 prefetch payload(s) under dotted names

$ node --test evals scripts    (npm run test:unit)
# tests 42
# pass 42
# fail 0

$ npx playwright test   (npm run test:smoke, temp local config on port 3535 —
                          3100/3200/3201 were held by concurrent sibling-worktree
                          agents; same workaround effort 027 used on port 3417)
77 passed, 1 failed (desktop "renders / without errors", 30s timeout under
6-worker parallel load) — re-ran that single test alone: passed in 12s.
Same pre-existing flake documented in efforts 028 ("30/31... reproduced-flaky
local timeout") and 032 ("77 passed, 1 flaky") — not a regression from this
effort; /process (the route this effort touches) passed cleanly both runs.

$ npm run check:aidlc   (run again after `git add`)
aidlc-check: OK — substantive changes are accompanied by an aidlc-docs update.
```

Manual check on the built output (`out/process.html`): all four `<dd>` stat values (32, 15, 2, 4)
and both pill labels ("All 15 decisions ↗", "All 32 change records ↗") are the live counts, not
literals in the diff — `git grep` for `"32"` / `"15"` / `"29"` as literal stat values in
`src/content/site.ts` after this change returns nothing; every count in that file is now a
`{placeholder}` template.

## Notes

**Why `check-aidlc-sync.mjs` needed no ADR.** Adding `process-stats.json` to the exempt-path list
is a mechanical extension of the pattern the gate already applies to `images.json` (a generated,
committed manifest whose own diff shouldn't need its own effort record) — not a new rule or a
change in what "substantive" means. No new architectural or IA decision was made, so this effort
carries no ADR; the file already documents the exemption's *reasoning* in its own comment.

**`gates` is intentionally not repo-counted.** `quality-gates.yml` is one workflow file carrying
two of the four gates the page shows (Build + Smoke, Lighthouse, in one job graph); counting PR
*workflows* would read "3", not "4". `processCounts.gates` instead reads
`process.gates.length` — the same array `GatePipeline` renders — so the number and the diagram can
never disagree, at the cost of that one count not being independently repo-derived the way the
other three are. This was an explicit call in the ideation doc's scope (idea 2) and is documented
inline in both `src/lib/process-stats.ts` and `AGENTS.md`.

**`src/data/images.json` showed as modified in `git status` with an empty diff** — a
`core.autocrlf=true` line-ending artifact from the interrupted prior session, not a real content
change (`git diff`, `--stat`, and `--numstat` all report nothing). Left untouched; not staged.
