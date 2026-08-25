# ADR 0011 — Rebuild the site from scratch on the thine.com model

**Status:** Accepted · **Date:** 2026-08-25 · **Supersedes:** [0001](0001-onceui-nextjs-portfolio-template.md), [0010](0010-segmentation-overlay-design-system.md)

## Context

Two redesign rounds on top of the Once UI template (ADR 0010 and the reverted anatomical-plate
attempt) kept running into the same ceiling: every visual decision was a negotiation with a
design system built for a different site. The owner's brief on 2026-08-25 was explicit — a new
branch, remove the current site entirely, and build a portfolio *like* https://www.thine.com/,
with no obligation to keep the static-export constraint or any existing style.

thine.com was torn down from its shipped bytes in the previous effort (011). What makes it feel
the way it does is a short list: one tinted near-black with alpha-white neutrals and a single
accent; an italic serif for display against a humanist sans for everything else; pill-only
buttons; a fixed nav behind a progressive blur; a scroll-scrubbed image sequence as the
centrepiece; a per-word text reveal; a scroll-linked word highlight; a sticky scaling card
stack; and a long-form page at a hard 640px measure. Its stack is TanStack Start + Tailwind v4 +
Motion + Lenis.

## Decision

1. **Delete `src/` and every build script, and rebuild on Next.js 16 + Tailwind v4 + Motion +
   Lenis.** Next.js stays because the deploy pipeline, MDX handling and the owner's familiarity
   are all already paid for; Tailwind, Motion and Lenis are adopted because they are what the
   reference is built with and each does one job the site needs (tokens, scroll-driven motion,
   smoothed wheel).
2. **Keep the static export.** The brief released the constraint; nothing in the design needed
   it released. `output: "export"` costs the design nothing and keeps GitHub Pages deploying
   unchanged, so it stays until a feature actually requires a server.
3. **Adopt thine's palette *discipline*, not its palette.** One ink (`#171519`), one paper
   (`#ebe5e1`), one accent (`#f49752`); every other neutral is paper or white at an alpha. No
   grey ramp. The accent is spent on the primary pill and small marks only.
4. **Instrument Serif italic + Commissioner** as the type pair. thine's IM Fell is bound to its
   name (an archaic pronoun set in a 17th-century face); copying it would be costume. Instrument
   Serif gives the same display/text contrast with edges that suit an imaging portfolio.
5. **A scroll-scrubbed brain replaces thine's 601-frame product sequence.** 160 axial slices of
   the ICBM 152 Nonlinear Symmetric 2009a T1 template, rendered once by
   `scripts/render-brain-frames.py` and committed under `public/brain/` (3.9 MB across two size
   tiers, against thine's 25–67 MB). The template's licence permits redistribution with the
   copyright notice, which the footer carries. Overlays at three scroll depths tell the
   RECAP-Net story — problem, method, result — over the slices.
6. **Content stays code.** Copy moves from `src/resources/content.tsx` (JSX-typed) to
   `src/content/site.ts` (plain data). Project case studies stay MDX, relocated from
   `src/app/work/projects/` to `content/projects/`, and render at `/projects/<lowercase-slug>`.
   Drop-zones (`gallery/`, `project_images/`, `me.jpg`) are unchanged; one `sharp` script
   replaces the four that published them.
7. **Every animation has a reduced-motion path** that renders the same content statically, and
   the scroll-driven overlays keep all `useTransform` inputs inside `[0, 1]`, which Motion 13
   requires because it binds them to native scroll timelines.

## Consequences

- ADR 0001 (Once UI template) and ADR 0010 (segmentation-overlay system) are superseded. The
  `--scan-*` ramp, `--mask`, the direction contract, `RouteGuard`, `ResponsiveImage`, the AVIF
  ladder and the responsive manifest are all gone with the code they belonged to.
- `/about` becomes `/story`, `/work` becomes `/projects`, and project URLs change from
  `/work/<FileName>` to `/projects/<filename-lowercased>`. GitHub Pages has no redirects; old
  deep links 404. Accepted: the site has no meaningful inbound link graph yet.
- The blog posts survive as `content/writing/*.mdx` but are not rendered. `/blog` was already
  disabled; this records that state honestly instead of shipping a dormant route.
- The repository's agent documentation (`AGENTS.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md`,
  `docs/`) had to be rewritten in the same effort, since nearly every path it named no longer
  exists. The AI-DLC process itself is unchanged.
- `public/brain/` adds ~3.9 MB of committed binaries. Regenerating them needs Python with
  nibabel/numpy/Pillow and a 63 MB template download, which is why they are committed rather than
  built in CI.
- Three dependencies carry the visual identity (`tailwindcss`, `motion`, `lenis`). The home page
  ships roughly 100 KB more JavaScript than the previous build. Accepted in exchange for the
  scroll-driven sequence, which was the point of the brief.

## Evidence

Effort record: `aidlc-docs/efforts/013-rebuild-on-thine-model/`. Reference teardown of
thine.com: notes section of `aidlc-docs/efforts/011-segmentation-overlay-redesign/effort-state.md`.
