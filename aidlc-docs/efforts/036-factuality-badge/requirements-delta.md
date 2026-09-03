# Requirements delta — 036-factuality-badge

Baseline: effort 023 (`aidlc-docs/efforts/023-factuality-evals/`), ADR 0013.

## NEW

- **R-FACT-1** `evals/factuality/run.mjs` must support `--write-summary <path>`, writing
  `{ $comment, projects: { <slug>: { grounded, baselined, unverifiable } } }` — one row per case
  study, keyed by the same slug `src/lib/projects.ts` derives (lowercased MDX basename) — but
  **only** when the run passes (`summary.ok`). A failing run must never publish counts a reader
  could mistake for a clean bill of health.
- **R-FACT-2** The report `run.mjs` always writes (`.evals/factuality-report.json`) must carry the
  same per-project summary as a `site` field, independent of `--write-summary` and independent of
  whether the run passed — so a CI check can read "what would the manifest be right now" without a
  second network round-trip.
- **R-FACT-3** A committed manifest (`src/data/factuality.json`) must be checked for staleness in
  CI: a PR whose committed copy disagrees with a fresh run must fail, **except** for any project
  reported `unverifiable` on either side of the comparison — this must never flap on the documented
  `pySdf` local-vs-CI token divergence (AGENTS.md's Evidence rule).
- **R-FACT-4** Every project page (`src/app/projects/[slug]/page.tsx`) must render one line under
  its header stating, from real per-project counts: how many claims were checked against the source
  repository; how many of those needed a written baseline reason ("verified by certificate"); or,
  when the source can't be read, that plainly — distinguishing a project with no `link` at all
  (private source) from one whose linked source could not be fetched. A project with zero
  quantitative claims renders no line. The line links to `evals/factuality/` on GitHub.
- **R-FACT-5** `src/data/factuality.json` is generated output — added to AGENTS.md's "Boundaries —
  do not edit by hand" table, same as `src/data/images.json`.

## CHANGED

- **R-023 (effort 023)** The factuality gate's job (`Evals / factuality` in
  `.github/workflows/evals.yml`) gains a third step after `npm run test:unit` and
  `npm run eval:factuality`: `npm run check:factuality-manifest`, gating on the manifest's freshness
  in addition to the claims' groundedness. The gate's existing two exit-code contracts
  (factuality failure vs. network exhaustion) are unchanged; the new step has its own three-way exit
  contract (0 in sync / 1 real drift / 2 harness error), matching `check-aidlc-sync.mjs`'s shape.

## UNCHANGED / constraints honoured

- No new production dependency. `scripts/lib/factuality-manifest.mjs` and
  `scripts/check-factuality-manifest.mjs` use only `node:fs`/`node:path`, matching
  `check-aidlc-sync.mjs`'s footprint.
- `output: "export"` is untouched — the badge is computed at build time from a committed JSON file,
  not fetched at request time (there is no request time).
- The evidence rule itself (effort 023, ADR 0013) is not renegotiated: this effort makes its output
  visible, it does not change what counts as grounded, baselined or unverifiable.
- `src/content/site.ts` gains no new export — the badge's copy is per-project computed text, not
  authored prose; see effort-state.md "Why no ADR" for why a typed helper (`src/lib/factuality.ts`)
  rather than `site.ts` is the right seam, following the precedent effort 024 set for
  `scripts/lib/llms-txt.mjs`.
