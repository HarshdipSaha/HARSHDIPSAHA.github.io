# Effort 014 — Scroll performance, passage copy, hydration-safe reduced motion

| Field | Value |
|-------|-------|
| Ref | 014-scroll-performance |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-25 |
| Closed | 2026-08-25 |
| Baseline | effort 013 (branch `extremechange`) |
| ADRs | none — no architectural decision; tuning within ADR 0011 |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

The owner reported that the home page lagged while scrolling, and that copying the scroll-lit
passage produced every word twice. Separately, the passage copy was rewritten to a general
statement about research and products rather than a brain-specific one.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Two defects (frame drops, doubled copy text) and one content change. Delegated the performance work to an agent with a measure-first brief. |
| Diagnosis | Playwright harness sampling `requestAnimationFrame` deltas during a continuous wheel scroll, plus CDP tracing and CSS-injection bisection. Every long frame sat in the card-stack region (scrollY ≈ 6000–8500). Trace over 9.2 s: GPU raster 7.3 s across 147 tasks. Hiding `.over-photo` alone took the region from p95 383 ms to 33 ms. Root cause: the four-layer 40/80 px blurred `text-shadow` on card titles, re-rasterised every frame because the JS-driven `scale` had no compositor layer. The nav's eight backdrop-blur layers, the 46 per-word motion values and the brain canvas were each measured and cleared. |
| Fix | `.over-photo` cut to two shadow layers; `will-change: transform` on the scaled card; card photos decoded one viewport early via IntersectionObserver instead of `loading="lazy"`; permanent `will-change` removed from the 35 hero word spans (compositor layers 35 → 3). `.glass` reordered so Lightning CSS keeps the unprefixed `backdrop-filter` — the pills had silently never been frosted. |
| Doubled copy | `ScrollWords` ghost copy moved to a `::before { content: attr(data-word) }` pseudo-element, so the lit span is the only text node. Copying the passage now yields each word once. |
| Hydration | Motion's `useReducedMotion` reads `matchMedia` synchronously on the client, so under `prefers-reduced-motion: reduce` the first client render differed from the server tree (React #418). Replaced with `src/lib/useReducedMotionSafe.ts`: `false` on the server and first render, flips after mount. Used by `Reveal`, `TextAnimate`, `ScrollWords`, `CardStack`, `BrainSequence`. |
| Content | `passage` in `src/content/site.ts` replaced with the owner's chosen option (#1 of four). |
| Build & test | `npm run typecheck` clean; `npm run build` succeeds. Frame-time harness re-run in the production build. |

## Verification

Continuous wheel scroll (120 px / 16 ms), 1440 × 900, DPR 1.5, production build, three runs each.

| Metric | Before | After |
|---|---|---|
| Mean frame time | 46.8 / 47.5 / 46.5 ms | 17.4 / 17.4 / 17.5 ms |
| p95 | 250 / 300 / 300 ms | **17.1 ms** |
| p99 | 617 / 583 / 566 ms | 33 / 50 / 50 ms |
| Frames > 33 ms | 77 / 82 / 89 | 18 / 16 / 21 |
| Frames > 50 ms | 65 / 71 / 70 | 5 / 4 / 3 |
| Words copied from the passage | each twice | each once (51) |
| Console errors under `prefers-reduced-motion: reduce` | React #418 hydration mismatch | 0 |

Remaining 3–5 frames of 50–83 ms per full scroll are single GPU raster tasks: first raster of the
card layers entering pre-raster range, and the entrance blur of the Experience / project grid.
Judged diminishing returns.

## Notes

- Measurements were taken with window-occlusion throttling disabled after early runs showed
  exact 1016 ms frames that were Chrome throttling a background window, not page cost.
- The nav's progressive blur was a prime suspect and was cleared by measurement; it is unchanged.
- `.glass` had been emitting only `-webkit-backdrop-filter`, which Chromium and Firefox ignore.
  Fixing the declaration order made the pills genuinely frosted at no measured cost.
