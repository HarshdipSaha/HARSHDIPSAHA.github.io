# Requirements delta — Effort 053

## Added
- Optional `award` frontmatter on a case study; a project card with one shows it as a diagonal corner ribbon.
- VERDICT case study (AI Arena 3.0 winner) and Taaza Hawa case study (27/30, WeMakeDevs × AWS Environmental Hacks 2026).
- Smoke test: dropping a dragged skill bubble does not fire the click nudge.

## Changed
- SAAKSHYA and BrandDiffusion carry `award: "Winner"`.
- The bubble-drag smoke test grabs an uncovered point and measures during the drag, not after release.
- A drag on a /process skill bubble no longer ends in a random click nudge.
