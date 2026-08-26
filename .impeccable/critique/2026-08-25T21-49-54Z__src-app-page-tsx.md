---
target: / home
total_score: 14
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-25T21-49-54Z
slug: src-app-page-tsx
---
⚠️ DEGRADED: single-context (two sub-agents were spawned for Assessment A/B but returned no results; re-run inline from screenshots .ref/before-home-*.png, before-home-m-*.png and detect.mjs output)

## Design Health Score — `/` (src/app/page.tsx)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Brain readout "slice 046 / 160" and "loading NN%" are good; current-route pill state is a faint 15% fill and there is no `aria-current` |
| 2 | Match System / Real World | 1 | "World Rank 3.", "BraTS Lighthouse 2025 Tumor Progression Challenge", "MICCAI", "Swin UNETR", "GAN-based class balancing", "RANO criteria", "longitudinal glioblastoma response classification" all unglossed; hero says nothing plain about what he does |
| 3 | User Control and Freedom | 2 | Way home is the wordmark only, which reads as a title; on mobile there is no Home entry in the menu |
| 4 | Consistency and Standards | 3 | Pills, labels, hairlines consistent; eyebrow/readout look like stray labels rather than viewer chrome |
| 5 | Error Prevention | n/a | No inputs or destructive actions on this surface |
| 6 | Recognition Rather Than Recall | 2 | Reader must already know what BraTS/MICCAI are to value the result |
| 7 | Flexibility and Efficiency | n/a | Portfolio (Experience surface) |
| 8 | Aesthetic and Minimalist Design | 3 | Strong; but desktop stage copy (bottom-left, 34rem) runs across the left hemisphere of the centred brain (see before-home-02/03/04) |
| 9 | Error Recovery | n/a | No error states |
| 10 | Help and Documentation | n/a | Portfolio |
| **Total** | | **14/24** | **Acceptable (58%)** |

## Design Specificity Verdict
Authored, not interchangeable: the scroll-scrubbed ICBM-152 brain, the italic-serif spread, one accent. The failure is comprehension, not identity.
Deterministic scan: 0 findings in owned components; 5 advisory DESIGN.md-ramp notes in globals.css `.prose` (1.5rem/1.2rem/1.35rem, SF Mono in `code`, radii) — expected, prose ramp not in frontmatter. Layout scope: clean. Browser overlay: skipped (no user-visible browser in this harness).

## Priority Issues
- [P1] Nobody can say what he does after the first viewport. Hero subline lists affiliations and a field name ("neuro-oncology imaging"). Fix: plain one-line descriptor + rewritten subline naming the outcome. → clarify
- [P1] "World Rank 3." unexplained; BraTS/MICCAI/RANO/Swin UNETR unglossed. Fix: gloss in place. → clarify
- [P1] Stage copy overlaps brain on desktop (text x 115–590px vs brain 440–1000px at 1440). Fix: offset brain to ~62% and give copy a left column with scrim. → layout
- [P2] No obvious way home on every route; mobile menu lacks Home. → onboard/clarify
- [P3] Eyebrow "ICBM 152 TEMPLATE · 160 AXIAL SLICES · SCROLL TO SECTION" and the readout read as stray labels. → polish

## Persona Red Flags
Jordan (first-timer): reads "World Rank 3" as unclear; "backpropagation" headline is fine as voice but nothing plain follows. Casey (mobile): stage copy sits over the lower brain at 390 (before-home-m-03); "Menu" has no Home. Sam (a11y): current pill not announced; wordmark link has aria-label (good). Priya (PI outside neuro-oncology): cannot judge the result's weight without knowing BraTS is a scored, hidden-test-set competition.

## Minor
Kickers above every heading (craft-floor default) — kept, incumbent world pinned by owner.
