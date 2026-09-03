# Effort 042 — Footer weight and hero-line entrance, per issue #55's council review

| Field | Value |
|-------|-------|
| Ref | 042-issue-55-footer-hero-feedback |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-03 |
| Closed | 2026-09-03 |
| Baseline | effort 041 (`main`) |
| ADRs | 0018 |
| Commits | branch `feedback/issue-55-footer-hero` |
| Reconstructed | no — recorded live |

## Intent

Issue #55 asked, in the owner's words, to run the `llm-council` skill on two pieces of visitor
feedback before deciding whether to act on either, with a fixed panel (frontend specialist, UX
specialist, three more chosen by the model):

1. "Lines become lighter, also as page loads where 'Building ML pipelines' is written, line should
   be removed" — ambiguous non-native phrasing, readable as either "tone down the fade-in
   animation on that line" or "delete that line of copy."
2. "Footer not looking like footer, it should give an ending impression" — the footer sits on the
   same `--color-ink` background as the CTA section above it, separated only by a 1px hairline.

Council composition: Frontend Specialist, UX Specialist, Contrarian, Executor, Performance/
Accessibility Engineer (the three AI-chosen seats, picked for the direct tension with this repo's
documented LCP-regression history on the exact component in question). Full five-advisor
responses, five anonymized peer reviews, and the chairman synthesis are posted verbatim as a
comment on issue #55.

**Council verdict, condensed:** address both, narrowly.
- Feedback 1 → animation only. `hero.left` ("Building ML pipelines") and `hero.right` ("& enjoying
  life through backpropagation") are a deliberate setup/punchline pair in `site.ts` — confirmed by
  reading the file, which is what separated the strongest advisor response from the rest in peer
  review — so deleting the line breaks the joke and was rejected. Soften the CSS entrance
  specifically on the left half instead.
- Feedback 2 → address, unanimous. Give the footer a solid, already-defined fill (`ink-2`) instead
  of leaning on a single hairline border to separate it from the identical-background CTA above,
  plus more breathing room.
- The one advisor who recommended no action on either point (the Contrarian) was flagged by all
  five peer reviewers as not having opened the code before concluding "n=1, ambiguous, leave it" —
  the council sided with the other four.

## Stages

| Stage | Outcome |
|-------|---------|
| Council | 5 advisors (parallel) → 5 anonymized peer reviews (parallel) → chairman synthesis. Posted to issue #55. |
| Code | `Footer.tsx`: `bg-ink-2` added to the `<footer>` class, `py-16`/`py-24` → `py-20`/`py-28`. `globals.css`: new `.word-in-soft` keyframe/class (blur-only, no rise, 350ms vs. 600ms) with its own `prefers-reduced-motion` override, sitting next to `.word-in`. `TextAnimate.tsx`: new `variant?: "default" \| "soft"` prop (mount-trigger path only; the `trigger="view"`/Motion path is untouched). `Hero.tsx`: `variant="soft"` passed to the `hero.left` `TextAnimate` instance only — `hero.right` and every other mount-triggered instance on the site keeps the original animation. |
| Verify | See Verification. |

## Units of work

- [x] Council run (5 advisors + 5 peer reviews + chairman synthesis), posted to issue #55
- [x] `Footer.tsx` — solid `ink-2` fill + more top padding, replacing hairline-only separation
- [x] `globals.css` — `.word-in-soft` variant (lighter blur, no rise, shorter duration) with reduced-motion override
- [x] `TextAnimate.tsx` — `variant` prop threading `.word-in` vs `.word-in-soft` on the mount path
- [x] `Hero.tsx` — `hero.left` opts into `variant="soft"`; `hero.left` copy itself left untouched
- [x] ADR 0018 written
- [x] Registry and audit updated

## Verification

```
npm run typecheck   # clean
npm run build        # blocked locally — see Notes
```

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | Blocked on this machine by a concurrent process holding a lock on `out/story.html` (`EPERM`/`ENOTEMPTY`, four consecutive attempts, always the same file) — the same class of contention this repo's own record already documents for shared local builds under sibling-agent load (efforts 034, 037, 038). No source change here touches `/story`. The repo's `Build` CI gate (`.github/workflows/quality-gates.yml`) runs `npm run build` in an isolated runner and is the authoritative check on the PR. |
| Scope of the diff | 4 files changed: `Footer.tsx` (1 line), `globals.css` (+21 lines, additive), `TextAnimate.tsx` (+3 lines, additive, backward compatible — `variant` defaults to `"default"`, so every existing call site is unaffected), `Hero.tsx` (1 line) |

## Notes

- Deliberately did **not** touch `hero.left`'s copy string. The council's reading — supported by
  the setup/punchline pairing with `hero.right` — was that deleting it was very likely not what the
  reporter meant, and getting that guess wrong on a personal-portfolio's headline is a much worse
  outcome than leaving the copy alone and stating the interpretation on the issue for the reporter
  to correct.
- `.word-in-soft` is scoped to `TextAnimate`'s `trigger="mount"` path only. The `trigger="view"`
  Motion path (`item` variant) is untouched — nothing below the fold uses `variant="soft"` and
  nothing needed to.
- `ink-2`/`ink-3` are pre-existing `@theme` tokens already used as solid fills elsewhere
  (`ProjectGrid.tsx`, `Gallery.tsx`, `CardStack.tsx`, `[slug]/page.tsx`) — this does not add a new
  color or violate the "no grey ramp" rule from `AGENTS.md`.
