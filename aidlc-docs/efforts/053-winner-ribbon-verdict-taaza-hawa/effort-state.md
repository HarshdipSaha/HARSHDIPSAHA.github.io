# Effort 053 — Winner ribbon; VERDICT and Taaza Hawa; bubble-drag test fixed

| Field | Value |
|-------|-------|
| Ref | 053-winner-ribbon-verdict-taaza-hawa |
| Status | complete |
| Depth | minimal |
| Opened | 2026-11-22 |
| Closed | 2026-11-22 |
| Baseline | `main` @ `3366278` (effort 052, PR #71, merged) |
| ADRs | none |
| Commits | branch `content/winner-ribbon` |
| Reconstructed | no — recorded live |

## Intent

The GitHub Actions billing lock (2026-11-15 to 2026-11-22) was lifted by the owner; re-running the
blocked runs deployed `3366278` and surfaced the one real failure behind the lock: the mobile
`dragging a bubble measurably changes its position` smoke test (`tests/skills-bubbles.spec.ts`),
6.87px against a > 8px bar, on both CI attempts. Owner asked to make it pass, then in the same
session: a diagonal winner tag on SAAKSHYA and BrandDiffusion, plus two new case studies, VERDICT
(`Cubix33/verdict`, winner of AI Arena 3.0) and Taaza Hawa (`Cubix33/taaza-hawa`, scored 27/30,
no live AWS links because the deployment is down).

## Units of work

- [x] **Bubble-drag test, root cause.** Probed with a Playwright script: on the Pixel 7 viewport the
      centre of the `brainstorming` bubble is covered by `dispatching-parallel-agents`
      (`elementFromPoint`), so the test dragged the wrong bubble and only ever measured idle drift;
      it passed while the drift happened to exceed 8px. On desktop it passed for a second wrong
      reason: the `pointerup` ending a drag also fired the click `nudge()`, flinging the bubble
      60–130px at random.
- [x] **Test rewritten** to grab an uncovered point on the bubble and measure while the pointer is
      still held (> 30px along the gesture; idle drift is ≤ 21px). New test: a drop must not fire the
      nudge (< 40px jump in the 300ms after release).
- [x] **Component fix** (`SkillsBubbles.tsx`): a `dragged` ref set on `onDragStart`, cleared on
      `onPointerDown`, suppresses the click nudge after a drag. A component edit because the defect is
      in behaviour, not copy.
- [x] **Winner ribbon.** Optional MDX frontmatter `award` → `Project.award` (`src/lib/projects.ts`) →
      a diagonal tangerine ribbon over the card image's top-right corner (`ProjectGrid.tsx`), outside
      `[data-morph]` so the view-transition morph carries the image only. The label text lives in the
      MDX file, not the component. Set on SAAKSHYA, BrandDiffusion and VERDICT.
- [x] `content/projects/Verdict.mdx` — from the `Cubix33/verdict` README only, including its stated
      limits (17.1% recall, pixel-conservative forgeries mostly missed, no LLM layer yet). Banner:
      the repo's own authentic receipt `002.jpg` beside `002__retype_amount.jpg`, the `labels.json`
      bbox outlined, composed with sharp. The README's poster was not used: a concept mock-up with
      invented figures (effort 052's rule).
- [x] `content/projects/Taaza-Hawa.mdx` — from the `Cubix33/taaza-hawa` README; no Amplify/live-site
      link. Banner: the repo's `docs/screenshots/home.jpg`.
- [x] `PROJECT_MAP` entries; `src/data/images.json`, `src/data/factuality.json` regenerated; one
      baseline entry (Taaza Hawa "27").
- [x] `AGENTS.md` — the frontmatter example documents the optional `award` field.

## Verification

| Check | Result |
|---|---|
| `npm run eval:factuality` | exit 0 — 140 grounded, 11 baselined, 0 ungrounded, 23 unverifiable |
| `npm run check:factuality-manifest` | OK |
| `node --test` (evals, scripts) | 60/60 |
| `npm run typecheck` | clean |
| `npm run build` | succeeds; `/projects/verdict`, `/projects/taaza-hawa` exported |
| `tests/skills-bubbles.spec.ts --repeat-each=10` | 100/100 (desktop + mobile) |
| `npx playwright test` (full smoke) | 102/102 |

## Notes

- **Winner claims are owner-supplied.** VERDICT's README says "WINNER OF THE HACKATHON AI ARENA -TOP
  50" with no edition or organiser; "3.0" is the owner's. The owner named an organiser ("merty");
  web searches for "AI Arena 3.0" found no event matching it, so the page names none rather than
  guess a spelling. Add it once the owner confirms the exact name.
- **Taaza Hawa's 27/30 is owner-supplied** — baselined with that reason.
- **Mobile bubbles still overlap.** The cluster's phyllotaxis layout stacks bubbles on the 412px
  viewport. Not fixed here: a layout change, out of this effort's scope.
