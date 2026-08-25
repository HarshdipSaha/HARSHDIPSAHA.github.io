# Effort 011 — Segmentation-overlay redesign

| Field | Value |
|-------|-------|
| Ref | 011-segmentation-overlay-redesign |
| Status | complete |
| Depth | comprehensive |
| Opened | 2026-08-25 |
| Closed | 2026-08-25 |
| Baseline | aidlc-docs/inception/ |
| ADRs | 0010 |
| Commits | see PR "Segmentation-overlay redesign" |
| Reconstructed | no — recorded live |

## Intent
Replace the site's visual system and fix the duplication the user reported ("project and work
are shown two times, two pages, one on home"). Redesign — not refinement — taking the old look
as evidence and anti-reference, with thine.com and lexsi.ai captured as craft references.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | User request. Interview run through impeccable `init` → `PRODUCT.md`. Answers: research-weighted audience, "break out where it matters" on Once UI, all routes in scope, monochrome base with a working theme toggle, iterate and verify improvement. |
| Direction | impeccable `concept-seed --scope direction --mode experience` (seed `5bc9e1e1`) assigned index 4 of seven grounded directions. Full hand presented; user chose **segmentation overlay** (candidate 1, IMPECCABLE'S PICK) over the assignment. Declined challengers donated two disciplines: an 11-step tonal ramp as the only tonal values, and a one-meaning legend. |
| Functional design | Ramp `--scan-00..10`; one mask accent meaning peer-reviewed/verifiable; Archivo + JetBrains Mono; hairline rules; slice-reveal motion on easings measured off the reference sites. Direction contract emitted as a real HTML comment in `<body>`. |
| NFRs | AA contrast in both themes; `prefers-reduced-motion` honoured; no content hidden behind animation timing; static export unaffected; typecheck and build clean. |
| Code | See units of work. |
| Build & test | `npx tsc --noEmit` clean; `npm run build` succeeds; impeccable `detect.mjs --json` returns `[]`; contrast measured in both themes; static-HTML content verified. |

## Units of work
- [x] `PRODUCT.md` — product truth captured via impeccable init
- [x] Design system — `src/resources/custom.css` rewritten around the ramp + mask
- [x] Motion — `src/components/motion/Reveal.tsx` (IntersectionObserver slice reveal)
- [x] Fonts — Geist → Archivo + JetBrains Mono
- [x] Direction contract — real HTML comment in `src/app/layout.tsx`, greppable in `out/`
- [x] Home rebuilt — research-first thesis viewport, no project cards above the fold
- [x] `ProjectCard` — de-client-ified, dead Carousel removed, `priority` now honoured
- [x] Publications moved from a hardcoded component block into `content.tsx`
- [x] `RouteGuard` — renders children during prerender instead of gating on mount
- [x] Light-mode fixes, `--radius-l` fix, dead SCSS deleted
- [x] Experience reordered — Optum, then IIT Madras, then Amazon (user request)
- [x] Nav label "Work" → "Projects" (user request); `/work` path unchanged so URLs still resolve
- [x] `/work` and `/gallery` visible headings switched from the meta title to the label
- [x] ADR 0010, registry, audit, `CONTEXT.md`

## Verification

Measured on the built export, before vs after:

| Metric | Before | After |
|---|---|---|
| Home page height | 16,489 px (20.6 screens) | 2,291 px (2.9 screens) |
| Home DOM nodes | 710 | 303 |
| Project cards site-wide | 324 | 63 |
| `<h2>` on home | 18 (all project titles) | 1 (the publication) |
| Research content in first viewport | none | rank, venue, publication link |
| Content in static HTML | nav + footer only | full page content |
| Mask plate contrast (dark) | n/a (rendered cyan, 1.39:1) | 10.83:1 |
| Mask plate contrast (light) | n/a | 5.43:1 |
| Mono readout contrast | 4.14:1 (below AA) | 6.06:1 dark / 5.39:1 light |
| `prefers-reduced-motion` handling | none | honoured |
| Legacy accent hexes in built CSS | 5 | 0 |
| Broken `--static-radius-l` uses | 2 | 0 |

`npx tsc --noEmit -p tsconfig.json` clean. `npm run build` succeeds, 29 static pages.
`node .github/skills/impeccable/scripts/detect.mjs --json` → `[]`.

## Notes
- **Defects found and fixed en route** (all pre-existing): every route rendered only a spinner
  in static HTML because `RouteGuard` gated children behind a mounted state — the site was
  effectively invisible to crawlers; `var(--static-radius-l)` does not exist in Once UI, so two
  card families rendered square; three stylesheets were hardcoded dark and broke light mode; the
  home `RevealFx` delay ladder ran the 17-card block 0.5 s *before* the single featured card.
- **Reference capture**: thine.com and lexsi.ai were read via the browser's CSSOM rather than
  screenshots — fonts, tokens, keyframes and easings extracted directly. Both converged on a
  serif/sans pairing, a warm accent, and near-black grounds; the easings
  `cubic-bezier(0.23, 1, 0.32, 1)` and `cubic-bezier(0.32, 0.72, 0, 1)` were taken from
  thine.com and are now `--ease-slice` / `--ease-probe`.
- **Screenshot tooling was unavailable** this session (`preview_snapshot` and `preview_resize`
  failed), so verification is measurement-based — computed contrast ratios, DOM and layout
  metrics, and static-HTML text extraction — rather than a visual side-by-side. The impeccable
  finish-review handoff, which expects screenshots, was therefore not run; that remains open.
- `.intro-cyan/amber/coral/emerald/violet` are retained as live selectors because `content.tsx`
  uses them heavily, but they now all resolve to one tonal emphasis. Migrating that copy to
  `.ink-strong` is follow-up work, not done here.
- The home headline was briefly rewritten to a research-first line and then restored, at the
  user's request, to "Building ML pipelines & enjoying life through backpropagation". The research
  now leads via the label plate and the publication section rather than the headline.
- `/work` and `/gallery` were rendering their **meta** titles as the visible `<h1>`, so the pages
  read "Projects – Harshdip Saha" and "Gallery – Harshdip Saha". They now render `label`.
- impeccable itself is gitignored (153 files, 3.5 MB); reinstall with `npx impeccable install`.

## Reference research (three parallel agents)

Delegated after the first pass, because the initial "research" was only a CSSOM scrape.
Findings that changed the build:

- **thine.com** is TanStack Start + Vite + React 19 on Vercel, Tailwind v4 + shadcn/ui, Motion
  (framer-motion), Lenis, and Rive on mobile. Its centrepiece is a **601-frame scroll-scrubbed
  WebP sequence costing 25-67 MB** depending on viewport — rejected here as indefensible for a
  portfolio. **Correction to my earlier work:** the two easings I read out of its stylesheets and
  attributed to its design are Radix/Vaul/sonner component defaults; its actual default is
  `ease-out-cubic [0.33, 1, 0.68, 1]`. The CSS comment now states this honestly. Adopted instead:
  its palette discipline (one tinted near-black, one accent, alpha-white neutrals — no grey ramp),
  fluid `clamp()` display type, and `text-box-trim`.
- **lexsi.ai** is Webflow, and the motion is **Webflow IX3 (GSAP-backed)** with no hand-written
  GSAP and **no smooth-scroll library at all**. Its entire site has **four** interactions. Adopted:
  the fluid-root lever, the accent-rationing rule (sub-6px marks, mono labels, ≤2px state
  indicators, `::selection`/`::marker`/`:focus-visible`, at most one filled element), the local
  theme-inversion island, and the full-height gutter hairlines.
- **Motion landscape.** Recommendation was to add **no library**: GSAP + ScrollTrigger measures
  45.2 kB gzip and is "proprietary free", not open source; Motion has a 34 kB floor. Native
  `animation-timeline: view()` is *not* a substitute for one-shot reveals — it **reverses on
  scroll-up**, and Firefox still has not shipped it. `@starting-style` is Baseline and was adopted
  for the hero.

Fixes that came directly out of that research:

- **The 2000ms Once UI `RevealFx` was still running**, wrapping `<Background>` in the root layout —
  `transition: all ease-in-out`, no reduced-motion guard. I had replaced the home page's copy and
  missed this one. Removed.
- **LCP hazard in my own reveal.** Chrome does not treat an `opacity: 0` element as an LCP
  candidate, and `<Reveal>` only flips after hydration. The hero no longer uses it; it uses
  `@starting-style`, which animates at first paint, and the `<h1>` carries `data-lcp` and is
  excluded from the hidden start state entirely.
- **The blanket `*` reduced-motion reset was wrong.** `prefers-reduced-motion` means remove
  vestibular triggers, not every visual change; the wildcard also killed colour transitions and
  focus rings and would have stomped `@starting-style`. Replaced with targeted rules.
- **One shared IntersectionObserver** instead of one per element, writing the attribute directly
  rather than through React state — removes N re-renders from the scroll path.
- **Stagger reconciled.** lexsi's 150ms applies to lines within one split heading; for independent
  sections the standard band is 30-80ms. Set to 80ms and capped at 4 steps, so nothing is
  uninteractive for more than 320ms.
