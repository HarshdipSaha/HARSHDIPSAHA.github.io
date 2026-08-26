# Effort 016 — Additive motion and craft details from the lexsi.ai teardown

| Field | Value |
|-------|-------|
| Ref | 016-lexsi-additions |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-26 |
| Closed | 2026-08-26 |
| Baseline | effort 015 (branch `extremechange`) |
| ADRs | none — additive refinement inside ADR 0011's world |
| Commits | branch `extremechange` |
| Reconstructed | no — recorded live |

## Intent

Owner: "the current UI is great; from the lexsi.ai research, add its animations here if they make
it better — add, don't remove anything." Source: the lexsi.ai build teardown produced in effort 011
(Webflow + IX3; four interactions in total; the craft is mostly CSS).

## What was taken, and why

| lexsi technique | Here | Why it fits |
|---|---|---|
| Persistent 1px gutter lines at the container edges, full page height | `src/components/Gutters.tsx`, fixed overlay under the nav, 1200px box, `white/7`, desktop only | Frames the brain viewer and the card photographs like a drawing sheet's margin lines; ~6 lines of code |
| Ambient dot-matrix ribbon (UnicornStudio WebGL, 15 fps, half-res) bracketing the research prose | `src/components/MatrixRibbon.tsx` — 2D canvas, 10 px cells, four glyph sizes, 15 fps, pauses off-screen, static under reduced motion; placed above and below the scroll-lit passage | Same role as on lexsi: texture around the one block of dense prose. 0 KB of library |
| Group hover through `--on/--off` custom properties + `color-mix()`; expanding corner marks | `.hover-trigger` / `.corners` in `globals.css`; project cards get four L-shaped corners that step outward and turn seafoam on hover | Their second-accent rule: tangerine stays identity/primary action, seafoam is reserved for hover feedback — our seafoam token finally has a job |
| Closing-image settle: `scale 1.1 → 1`, 3 s, `power3.out`, once | `CardStack` photos via `motion.img` `whileInView` | The site's one deliberately slow moment; the card stack is where a photo first fills the viewport |
| `text-wrap: pretty` on body copy | `.prose p`, `.measure p` | Two declarations, better rag |

## Not taken

Fluid root font-size (changes every size on the site — owner asked to keep the UI), the
non-sticky nav (ours is the progressive-blur nav the owner likes), IBM Plex Serif / Geist Mono role
split (would replace the type system), the light-theme island (no charts here), the sticky numbered
rail (no long index).

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | 28 pages |
| Ribbon frame cost | 15 fps by timer; IntersectionObserver stops it off-screen |
| Reduced motion | ribbon draws one static frame; card settle is a Motion `whileInView` and the `CardStack` static path renders `Card` unchanged (initial scale applies once, no animation) |
| Screenshots | `.ref/lx-ribbon.png`, `lx-card-early.png` / `lx-card-settled.png`, `lx-hover.png` |
