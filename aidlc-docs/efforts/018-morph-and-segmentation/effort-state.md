# Effort 018 — Shared-element morph and illustrative segmentation

| Field | Value |
|-------|-------|
| Ref | 018-morph-and-segmentation |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-26 |
| Closed | 2026-08-26 |
| Baseline | effort 017 (branch `extremechange`) |
| ADRs | none — two additive features inside ADR 0011 |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner picked two items from the improvement list: (1) project thumbnails should morph into the
case-study hero on navigation; (2) the brain sequence should *show* segmentation during the
"RECAP-Net reads the pair" stage rather than describe it.

## Units of work

- [x] `src/components/Morph.tsx` — `MorphLink` names the clicked thumbnail (`data-morph`) and wraps `router.push` in `document.startViewTransition`; `MorphTarget` names the case-study hero and reports mount. Native View Transitions API; falls through to a plain link on modifier-click or reduced motion.
- [x] `globals.css` — `.morph` group at 420 ms on the expo ease with a 3 px mid-flight blur; all view
  transitions disabled under `prefers-reduced-motion`
- [x] `BrainSequence.tsx` — `drawSegmentation()`: across frames 58–102 (the stage-2 window) a soft
  tangerine outline over the right parietal region grows then shrinks like a tumour's cross-section
  through successive slices; leader line and a two-line mono label "tumour region / illustrative ·
  template brain". Drawn on canvas each frame, so it costs nothing when outside the window.

## Honesty note

The outline is illustrative. The brain is the ICBM 152 population template — no patient data — and
the label says so on the canvas itself. Position and shape were chosen to be plausible for a
glioblastoma cross-section, not derived from any case.

## Verification

- `npm run typecheck` clean; `npm run build` succeeds.
- Playwright: clicking a project card from `/projects` navigates with `document.startViewTransition`
  available; screenshots of the brain at frames 60 / 80 / 100 show the outline growing then fading.

## Why not React's `<ViewTransition>`

Tried first, per the Next 16 guide. Next's vendored React DOM does handle the element type, and the
router marks navigations as transitions, but React never called `document.startViewTransition`
during a navigation in either dev or the production export (verified by patching
`Document.prototype.startViewTransition` and by CDP `Animation.animationStarted` — a raw
`startViewTransition` in the same page did animate). Rather than chase the runtime, the morph uses
the native API directly, which is observable and verified below.

## Static-export prefetch fix (found on the way)

Next writes segment prefetch payloads as nested folders (`__next.projects/$d$slug/__PAGE__.txt`)
but the client requests them with dots (`__next.projects.$d$slug.__PAGE__.txt`) — a 404 on every
static host, so every route prefetch failed silently. `scripts/postbuild-segments.mjs` (wired as
`postbuild`) mirrors each payload under its dotted name: 23 files, all prefetches now 200 and a click
navigates from cache with no fetch.
