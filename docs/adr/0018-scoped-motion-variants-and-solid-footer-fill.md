# 0018 — Scoped motion variants on `TextAnimate`, and a solid fill for the footer

**Status:** Accepted · **Date:** 2026-09-03 · **Supersedes:** none

## Context

Issue #55 raised two pieces of visitor feedback and asked for them to be run through the
`llm-council` skill before deciding whether to act: (1) the hero headline's entrance animation
reads as the text going "lighter" as the page loads, specifically on the "Building ML pipelines"
line, and (2) the footer doesn't read as a footer — it sits on the identical `--color-ink`
background as the CTA section above it, separated only by a 1px hairline border, giving no "ending
impression."

The council (frontend specialist, UX specialist, contrarian, executor, performance/accessibility
engineer — full transcript on issue #55) converged on two decisions that are each small in code
but set a pattern the rest of the site should follow, which is why this gets an ADR rather than
just an effort record:

1. `TextAnimate`'s `trigger="mount"` path had exactly one entrance animation (`.word-in`), shared
   by every above-the-fold instance. The council's resolution of feedback 1 — soften the entrance
   specifically on `hero.left`, because it's the line a first-time visitor (a recruiter or a PI)
   has to read fastest, while leaving `hero.right`'s slower, more decorative entrance alone —
   needed a way to vary the animation per-instance without touching the shared keyframe every
   mount-triggered line already depends on, and without reintroducing the JS/Motion path that
   effort 037's record shows cost 2.5s of LCP render delay on this exact component.
2. The design system's neutral palette is deliberately just `ink` / `ink-2` / `ink-3` plus paper at
   alpha — "no grey ramp, no ad-hoc hex" (`AGENTS.md`). The footer had never used `ink-2`/`ink-3` as
   a fill, only as a border/card background elsewhere (`ProjectGrid`, `Gallery`, `CardStack`,
   project pages) — so "make the footer look like a footer" needed to be answered from inside that
   existing three-step ink ramp, not a new color.

## Decision

- `TextAnimate` gains a `variant?: "default" | "soft"` prop, meaningful only on the `trigger="mount"`
  path (the `trigger="view"` Motion path is unaffected — it has its own, separate variant object).
  `variant="soft"` selects a new `.word-in-soft` CSS class instead of `.word-in`: same mechanism
  (a `both`-filled keyframe animation, per-word `animation-delay`, its own
  `prefers-reduced-motion` override), lighter blur (4px vs 10px), no vertical rise, shorter
  duration (350ms vs 600ms). `hero.left` is the first consumer; `hero.right` and every other
  mount-triggered line keeps `.word-in` by not passing the prop (default preserves existing
  behavior exactly).
- `Footer.tsx`'s `<footer>` gets `bg-ink-2` added to its class list (alongside the existing
  `hairline border-t`), plus more top/bottom padding. This is the first full-bleed use of `ink-2`
  as a page-section fill rather than a card/border color — establishing that the ink ramp is
  available for this purpose, not just for cards.

## Consequences

- Any future above-the-fold copy that needs a faster or gentler entrance than the default hero
  treatment has a named, reduced-motion-safe variant to reach for (`variant="soft"`) instead of a
  bespoke one-off class.
- The footer is now visually distinct from the section above it without introducing a new color —
  precedent for using `ink-2`/`ink-3` as section-level fills elsewhere on the site, if a similar
  "this doesn't read as its own region" problem comes up again.
- `.word-in` and `.word-in-soft` are two small, separately-tuned CSS keyframe blocks rather than a
  single parameterized one; kept that way deliberately — `globals.css`'s existing comment ties
  `.word-in`'s exact values to `TextAnimate`'s Motion `item` variant ("Values mirror TextAnimate's
  Motion variant exactly"), and `.word-in-soft` has no Motion counterpart to stay in sync with, so
  collapsing them into one parameterized keyframe would trade a small amount of duplication for a
  coupling that doesn't otherwise exist in this file.
- Neither change touches `hero.left`'s copy string, `hero`'s layout/grid, or any route/nav entry —
  no IA change, no new boundary-crossing generated file.

## Evidence

- Issue: [#55](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/issues/55) — full council
  transcript (5 advisors, 5 peer reviews, chairman synthesis) posted as a comment.
- Effort: [042-issue-55-footer-hero-feedback](../../aidlc-docs/efforts/042-issue-55-footer-hero-feedback/effort-state.md)
- The 2.5s LCP regression this decision deliberately avoids reintroducing is documented inline at
  `src/components/motion/TextAnimate.tsx` (the comment above the `trigger === "mount"` branch) and
  in effort 037's record.
