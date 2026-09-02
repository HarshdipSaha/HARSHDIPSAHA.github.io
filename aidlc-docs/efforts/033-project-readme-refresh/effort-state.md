# Effort 033 — Project README refresh + footer decluttering

| Field | Value |
|-------|-------|
| Status | complete |
| Depth | standard |
| Opened | 2026-09-02 |
| Closed | 2026-09-02 |
| Branch | `feat/project-readme-refresh` |

## Intent

Owner updated six of his repositories' READMEs in a prior session (from single-line
placeholders to full documentation). The corresponding case studies on the site were never
refreshed to match, so they still read as thin one-line summaries pointing at "the code" for
detail. Rewrite each from the current README, following the site's evidence rule (only state
what the source can support). Also close issue #41 ("remove footer"), which asks to remove the
footer's small-print colophon.

## Units of work

1. **Re-fetched all 20 project READMEs from GitHub** to find which case studies had gone stale
   against their source. Six repositories' READMEs had grown from single-line placeholders
   (326–1662 words) far past their case studies (37–93 words): `gui-CANSAT`,
   `alien_invasion_pygame`, `Object_tracking_tennis_game`, `youtubeproj_langchain`,
   `Tomato_disease_detection`, `Anime_Recommender`.
2. **Rewrote all six case studies** from their current READMEs:
   - `gui-CANSAT.mdx` — added the telemetry pipeline (CSV columns, preprocessing, hard-coded
     69s offset bug) and status/limitations.
   - `alien-invasion-pygame.mdx` — added screen/gameplay mechanics, module breakdown, the
     documented image-path mismatch bug.
   - `Object-tracking-tennis-game.mdx` — added the full detection pipeline (YOLOv8x player
     tracking, fine-tuned YOLOv5 ball detector, ResNet-50 court key-point regressor, mini-court
     projection), training provenance, and the known average-speed swap bug.
   - `youtubeproj-langchain.mdx` — the underlying repository was rewritten entirely into
     "YouTube Comment RAG", a consensus-weighted retrieval system with routing, opinion
     clustering, and answer verification; the case study (and its title) were rewritten from
     scratch to describe the actual current project, including its own published benchmark
     numbers against a naive top-k baseline.
   - `Tomato-disease-detection.mdx` — added the CNN architecture, training results (accuracy,
     loss), and dataset coverage limitation.
   - `Anime-Recommender.mdx` — added the collaborative-filtering pipeline (rating filters,
     pivot table dimensions, cosine similarity) and the exact-match lookup limitation.
3. **Closed issue #41** ("remove footer"). The issue's body asks to remove all three footer
   colophon lines. `AGENTS.md`'s existing rule says the ICBM 152 brain template's licence
   requires its copyright notice to stay in the footer — full removal would violate that.
   Resolved by removing the two decorative lines (font credit, "built with" blurb) and keeping
   only the legally required template attribution. This satisfies the issue's evident intent
   (a cluttered small-print block) without breaching the licence term already documented in
   `AGENTS.md` → Brain sequence.

## Verification

- `npm run typecheck` — clean
- `node evals/factuality/run.mjs` — 60 grounded, 9 baselined (one new entry for a
  `10.97 m` measurement split across a code span in the Object-tracking-tennis-game README,
  same pattern as the existing tinySafetyNet entries), 0 ungrounded, exit 0
- `node --test evals scripts` — 42/42 pass
- `npm run build` — 30 static pages, zero errors
- `npx playwright test` — 76/78 pass; 2 failures were Playwright "Target crashed" resource
  flakes under full-suite parallel load, both confirmed passing in isolation
- Footer verified in built `out/index.html`: ICBM licence notice present verbatim; "Set in
  Instrument Serif" and "Built with Next.js, Motion and Lenis" both absent (0 matches)
