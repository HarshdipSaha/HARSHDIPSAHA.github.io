# Effort 054 — Phone audit: /process bubbles packed; `award` in the agent export; résumé update

| Field | Value |
|-------|-------|
| Ref | 054-phone-bubbles-award-export-resume |
| Status | complete |
| Depth | minimal |
| Opened | 2026-11-22 |
| Closed | 2026-11-22 |
| Baseline | `main` @ `84568b7` (effort 053, PR #72, merged) |
| ADRs | none |
| Commits | branch `fix/phone-bubbles-award-export` |
| Reconstructed | no — recorded live |

## Intent

Owner, after effort 053 shipped: "update the mcp too, and also playwright as phone, and fix on phone";
then, mid-effort: replace the résumé with a new PDF that adds the ETH Zurich collaboration.

## Units of work

- [x] **Phone audit.** Every route (`/`, `/story`, `/projects`, two case studies, `/gallery`,
      `/process`, `/ask-ai`, 404) at Pixel 7 (412px), iPhone SE (375px) and Galaxy S8 (360px), with and
      without reduced motion: horizontal overflow, elements past the viewport edge, console errors,
      full-page screenshots reviewed by eye. One defect: the `/process` skills cluster — at rest 19
      overlapping pairs of 15 bubbles at 412px, 23 at 375px, labels unreadable, `llm-council` clipped
      at the edge; 7 overlapping pairs on desktop too. Everything else passed.
- [x] **`SkillsBubbles.tsx` packing.** Fixed percentage positions replaced by `packBubbles`: seeded on
      the same golden-angle spiral, sized from each bubble's measured box, relaxed pairwise until no two
      overlap (deterministic), the box growing in 32px steps if the spiral cannot fit. Re-runs on width
      change and after web fonts load. Idle drift scales with box width (`min(1, W/650)`) so packed
      neighbours do not drift into each other on phones; desktop drift unchanged. Result: 0 overlaps at
      412px, 375px and desktop; the phone box grows 446→478px (542px at 375px).
- [x] **Smoke test** `at rest, no two bubbles overlap and none is clipped by the box` — reads
      `offset*` boxes so drift cannot make it flaky; runs on desktop and Pixel 7.
- [x] **`award` in the agent export.** `site-loader.mjs` reads frontmatter `award`; `agent-data.mjs`
      emits it only when set (unit-tested); `AgentProject` carries it; the WebMCP `searchProjects`
      matches on it and labels results `[Winner]`. The companion `harshdipsaha-mcp` repo gets the
      matching schema/search/format change in its own commit — it reads the live `agent-data.json`, so
      project content (VERDICT, Taaza Hawa) already reached it without a redeploy.
- [x] **Résumé.** `resume.pdf` and `public/resume.pdf` replaced with the owner's new PDF (adds "LLM
      Safety Research Collaborator — research collaboration with ETH Zurich faculty", real Optum
      bullets; drops the AI Loan Assistant project). The two factuality baseline reasons that quote
      the résumé (APT "top 30", pySdf "INCAM 2026") were checked against the new text: both lines
      are still present.

## Verification

| Check | Result |
|---|---|
| `node --test` (evals, scripts) | 61/61 |
| `npm run typecheck` | clean |
| `npm run build` | succeeds |
| `tests/skills-bubbles.spec.ts --repeat-each=5` | 60/60 (desktop + mobile) |
| `npx playwright test` (full smoke) | 104/104 |
| Phone audit (3 sizes × 9 routes × motion/reduced) | no overflow, no off-screen elements; bubble overlaps 0 |

## Notes

- Site copy (`experience` in `site.ts`) does not yet mention the ETH Zurich collaboration; only the
  résumé PDF changed, as asked.
