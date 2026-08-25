# 0010 — Segmentation-overlay design system, and a home page that is not the catalogue

**Status:** Superseded by [ADR 0011](0011-rebuild-from-scratch-on-thine-model.md) · **Date:** 2026-08-25 · **Supersedes:** —

## Context

Two problems, one structural and one visual.

**Structural.** The home page rendered `<Projects range={[1,1]} />` and `<Projects range={[2]} />`
— one card plus the other seventeen — while `/work` rendered the same eighteen. Home was not a
featured selection; it was the entire catalogue with a hero bolted on, split by a disabled blog
block. Every project page then rendered `range={[2]}` as "related projects", sixteen more cards
each. Total project cards across the site: **324**, every one wrapping a `<Carousel>` around a
single image, because all eighteen projects have exactly one. The home page measured 16,489 px,
20.6 screens, with eighteen `<h2>`s that were all project titles.

Meanwhile the first viewport of a *research* portfolio contained no research: a name, a nav, a
live clock, the headline "Building ML pipelines & enjoying life through backpropagation", and a
Resume button. The peer-reviewed MICCAI result — the single most valuable fact on the site — was
three screens down on a different page.

**Visual.** The system was the Once UI template default (Geist, cyan brand, five literal accent
hexes) with hand-rolled CSS layered on top. Three stylesheets were hardcoded dark and broke in
light mode, which is a first-class state because `style.theme` is `system` and a toggle ships.
`var(--static-radius-l)` was used twice and does not exist in Once UI, so those cards rendered
square. There was no `prefers-reduced-motion` handling anywhere.

## Decision

**1. Adopt a segmentation-overlay visual system.** Chosen by the user from a seven-candidate
grounded hand derived from the audience's own visual world (medical imaging and academic
publishing), presented against impeccable's `concept-seed` roll (seed `5bc9e1e1`, which assigned
a different candidate). Two disciplines were donated by challengers the direction beat:

- **An eleven-step tonal ramp is the only tonal palette.** `--scan-00..10`, inverted for light
  theme. No ad-hoc greys, no literal hex outside that block. Light is the same volume
  re-windowed, not a second palette.
- **One mask accent, one meaning.** `--mask` marks exactly one thing: a peer-reviewed or
  externally verifiable claim. It is never decoration.

Typography is Archivo (tabular figures, since ranks and metrics are content) with JetBrains Mono
for readouts and label plates. Motion is a "slice reveal" on easings measured off the reference
sites rather than invented.

**2. The home page is a thesis, not an index.** It opens with who, the verified result as a mask
label plate, one positioning line, and two actions. No project cards above the fold. It shows a
three-project selection and defers the catalogue to `/work`. Related-projects drops from sixteen
to three.

**3. Break out of Once UI where the design requires it, without leaving it.** Once UI keeps
supplying primitives, layout, and theming. Custom components and a real motion layer are
authorized on top. Full removal was considered and rejected as disproportionate.

**4. Content is prerendered.** `RouteGuard` computes route enablement during render instead of
after mount, so page content lands in the static HTML.

## Consequences

- The site is **indexable**. Before this change every route emitted a spinner and nothing else
  into `out/*.html`; all content lived in the client payload. A portfolio whose purpose is being
  found by supervisors was invisible to crawlers and to any client whose JS had not run.
  Home went from nav-and-footer only to 1,544 characters of real content.
- Home is **86 % shorter** (16,489 px → 2,291 px) and the research leads.
- Both themes now meet AA on measured samples. The mask plate previously inherited Once UI's link
  colour and rendered cyan at 1.39:1 — effectively invisible; it is now 10.83:1 dark, 5.43:1 light.
- `prefers-reduced-motion` is honoured, and the reveal's hidden start state is scoped to a
  `data-motion` flag that only JS sets, so content is never hidden behind animation timing.
- **Colour is no longer an emphasis tool.** The five `.intro-*` classes remain as live selectors
  because `content.tsx` uses them heavily, but they now all resolve to one tonal emphasis.
  That copy should migrate to `.ink-strong`; until it does, the class names lie about what they do.
- The mask's "one meaning" rule is a convention, not a mechanism. Nothing stops a future edit from
  spending it on decoration, and no test catches that.
- Two Google fonts are now fetched instead of one family. Both are `display: "swap"`.
- Verification for this change was **measurement-based, not visual** — the session's screenshot
  tooling was unavailable, so contrast, layout metrics and static-HTML extraction stand in for a
  side-by-side. The impeccable finish-review handoff was not run and remains open.

## Evidence

- `src/app/page.tsx` before this change: `<Projects range={[1,1]} />` at line 141 and
  `<Projects range={[2]} />` at line 167; `/work` rendering all eighteen.
- `src/app/work/[slug]/page.tsx:104`: `<Projects exclude={[post.slug]} range={[2]} />`.
- `var(--static-radius-l)` at `src/app/about/page.tsx:382` and `:434`; zero occurrences of
  `--static-radius` anywhere in `@once-ui-system/core`.
- Measured before/after table in `aidlc-docs/efforts/011-segmentation-overlay-redesign/`.
