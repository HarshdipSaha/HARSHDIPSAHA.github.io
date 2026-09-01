# Effort 028 — Story Tools, made interactive

| Field | Value |
|-------|-------|
| Ref | 028-story-tools-interactive |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | effort 027 (`main`) |
| ADRs | none |
| Commits | branch `feat/story-tools-interactive` |
| Reconstructed | no — recorded live |

## Intent

Issue #28: `/story`'s "Tools" section was a static pill row; the owner wanted the old
`TechStackStrip.tsx` cursor-reactive micro-interaction (deleted at the effort-013 rebuild)
revived in the current design language, without disturbing anything else already working on
the page. Because "good taste" here has no self-check, the issue mandated the `agent-swarm`
debate pattern: two independent prototype proposals, then a synthesis, then a fourth pass — this
effort — that builds the winner for real.

**Proposals (prior art, not part of this diff):**
- `prototype/story-tech-revival-a2` — magnetic hover-lean (desktop) + tap-nudge (touch), plain
  text wordmarks, new "Stack" section added *above* the existing static Tools pills.
- `prototype/story-tech-revival-b2` — click/tap-to-reshuffle (one mechanism, both input types),
  pill-styled to match the existing Tools section, new "Toolkit" section added *below* it.

Both independently duplicated the existing static Tools list instead of resolving it — the same
tools appeared twice on the page. The synthesis (issue #28 comment,
[#28](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/issues/28)) picked Proposal B's
click/tap-to-reshuffle interaction (owner's own description was "moves when you click"; B uses
one mechanism across desktop and touch where A splits into two; B's pill styling already matches
the page) and directed that it **replace** the static Tools pills in place rather than sit beside
them — the actual fix for "static badge row" is making the existing list interactive, not adding
a second one.

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | This record, opened alongside the code since the debate/synthesis already ran on the issue |
| Functional design | Adapt proposal B's `ToolkitToy` component (`useState` + Fisher–Yates shuffle on click, Motion `layout` spring reflow, `useReducedMotionSafe` static fallback) to replace `story/page.tsx`'s Tools `<ul>` in place |
| NFRs | Every tool name stays real DOM text (button label, not canvas/image); reduced motion renders the identical static list; `.glass` pill styling kept (already the page's Tools treatment, closer match than B's `.hairline`) |
| Code | `src/components/story/ToolkitToy.tsx` (new), `src/app/story/page.tsx` (Tools `<ul>` replaced with `<ToolkitToy tools={story.skills} />`) |
| Build & test | `npm run typecheck`, `npm run build`, extended `tests/smoke.spec.ts` with 3 new cases (see Verification) |

## Units of work

- [x] `src/components/story/ToolkitToy.tsx` — click/tap-to-reshuffle pill list, reduced-motion static branch
- [x] `src/app/story/page.tsx` — Tools section now renders `<ToolkitToy tools={story.skills} />` instead of a static `<ul>`; nothing else on the page touched
- [x] `tests/smoke.spec.ts` — `story Tools toy` describe block: every `story.skills` name present as DOM text, a click measurably reorders the list, reduced-motion fallback renders the same names statically with zero console errors
- [x] This effort record + registry + audit rows

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean — `tsc --noEmit -p tsconfig.json` exits 0 |
| `npm run build` | succeeds; `out/story/index.html` present; 30 static pages generated |
| `npx playwright test tests/smoke.spec.ts -g "story Tools toy"` | 3 passed — DOM-text presence, measurable reshuffle (order changes, same multiset), reduced-motion static fallback with zero console errors |
| `npx playwright test tests/smoke.spec.ts` (full suite) | 30/31 passed; the one failure (`renders / without errors`, a 30s timeout) reproduced as flaky local resource contention — passed cleanly in isolation on rerun, unrelated to `/story` or this change |

## Notes

- `story.skills` (`src/content/site.ts`) is unchanged — no new content, no new export. This is a
  presentation-layer change only.
- Kept `.glass` pill styling (matching the pre-existing Tools treatment) rather than proposal B's
  `.hairline`, per the issue's explicit judgement call once this is the page's only Tools
  treatment (no longer sitting next to a duplicate to distinguish itself from).
- Nothing else on `/story` was touched — verified by reading the full file before editing.
