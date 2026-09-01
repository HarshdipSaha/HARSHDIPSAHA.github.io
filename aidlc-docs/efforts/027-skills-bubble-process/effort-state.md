# Effort 027 — Skills bubble cluster on /process

| Field | Value |
|-------|-------|
| Ref | 027-skills-bubble-process |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-01 |
| Closed | 2026-09-01 |
| Baseline | effort 025 (`main`, 304de89) — effort 026 (ADR 0015, PR #31) was open/unmerged when this started |
| ADRs | none |
| Commits | branch `feat/skills-bubble-process-v2` |
| Reconstructed | no — recorded live |

## Intent

Issue #27 ("Skillls section"): add an interactive bubble cluster on `/process` naming the Claude
Skills actually used to build this site — names only, never a skill's content or instructions
(the owner's explicit instruction, repeated three times in the issue). The issue's own spec (drafted
via `/to-spec`) asks for: drift-then-nudge physics using Motion (already a dependency, no new
physics engine), a real static reduced-motion fallback, every name reachable as ordinary DOM text
for assistive tech, and the list itself sourced as a new typed array in `src/content/site.ts`
(content-is-code), not invented for effect.

Registry said "next effort number: 026" but PR #31 (open, unmerged at start) already claims 026 for
an ADR 0015 crawler-policy change. 027 is the next number with no open or merged claim on it.

## Sourcing the skill list — method, not assertion

Two grounding passes, per the issue's own instruction to read `CLAUDE.md`'s skills table *and* grep
the repo for actual citations, then reconcile:

1. **`CLAUDE.md`'s "Skills worth reaching for" table** — the repo's own list of skills it reaches
   for by situation: `ai-dlc`, `brainstorming`, `agent-swarm` / `dispatching-parallel-agents`,
   `frontend-design`, `documentation-bot`, `code-review`, `verification-before-completion`,
   `asset-reviewer`, `grilling`/`oracle`. Excluded `asset-reviewer` and `grilling`/`oracle`: no
   citation anywhere in `aidlc-docs/` or `docs/` ties either to an actual invocation, only to the
   table's "situation -> skill" mapping, and the issue explicitly warns "don't pad the list."
2. **Direct-citation grep** — `grep -rn` across `aidlc-docs/efforts/*/effort-state.md`,
   `aidlc-docs/audit.md`, `docs/adr/*.md` for skill names by name, cross-checked against GitHub
   issue bodies (`gh api .../issues/N`) for `/to-spec` markers:
   - `impeccable` — named directly in effort 011 (`concept-seed`, `detect.mjs`, `init` — segmentation
     overlay redesign, shipped) and effort 015 (critique scores, `.github/skills/impeccable/`).
   - `ui-ux-pro-max` — named directly in effort 015 ("UI/UX Pro Max skill installed locally").
   - `frontend-design` — audit.md effort 016: "User request (chat, `/frontend-design`)".
   - `documentation-bot` — effort 025: "Issue #26 ('Use document bot skill')".
   - `to-spec` — issue #24 (`## Spec (via /to-spec)`) became effort 024 (agent-facing site), shipped
     and merged; issues #27 and #28 also carry the marker, so the pattern recurs.
   - `verification-before-completion` — not cited by slash-command anywhere, but CLAUDE.md names it
     as the rule *actually enforced* on every effort's Definition of Done ("Never claim done without
     pasting real output of `npm run typecheck` and `npm run build`"), and every single audit.md
     Construction row carries exactly that evidence. Kept: the practice is universal, even where the
     slash command itself isn't logged.
   - `code-review`, `brainstorming`, `agent-swarm`, `dispatching-parallel-agents` — no direct
     per-effort citation found, but all four are named in `CLAUDE.md`'s table (source 1) as the
     situational skills this repo's own process document says it reaches for, and effort 015's
     "two parallel agents with disjoint file ownership" is a real instance of the
     agent-swarm/dispatching-parallel-agents pattern in this repo's own history. Kept, since the
     issue explicitly sanctions the table as one of the two grounding sources.
   - Explicitly **excluded** the issue's seed-list entries `subagent-driven-development`,
     `to-tickets`, `triage`, `ask-matt`: zero occurrences anywhere in `CLAUDE.md`,
     `AGENT_WORKFLOWS.md`, `aidlc-docs/`, `docs/`, or any issue body. No evidence at all — including
     them would be exactly the "quietly become a marketing list" failure mode issue #27 itself warns
     against.

Final list (11): `ai-dlc`, `brainstorming`, `agent-swarm`, `dispatching-parallel-agents`,
`frontend-design`, `documentation-bot`, `code-review`, `verification-before-completion`,
`impeccable`, `ui-ux-pro-max`, `to-spec`. Subject to the owner's correction in review, as the issue
anticipates.

## Stages

| Stage | Outcome |
|-------|---------|
| Grounding | Two-source method above; list settled at 11 names, 4 excluded from the issue's own seed list for zero evidence. |
| Build | New `process.skills: string[]` + `process.skillsLabel` + `process.skillsNote` in `src/content/site.ts` (no skill content in any of the three — names and a generic description of the interaction only). New `src/components/process/SkillsBubbles.tsx`: golden-angle-spiral bubble layout, each name a real `<button>` (DOM text, no canvas, no image), idle drift via a looping `useAnimationControls` sequence, click/drag both apply a spring-physics nudge (`drag` + an `onClick` impulse), `useReducedMotionSafe()` swaps the whole cluster for a plain wrapped `<ul>`/`<li>` list of the same names — same pattern as `Reveal`/`TextAnimate`/`ScrollWords`. One new `<Reveal>` section appended to `/process` after the existing "why" paragraph; nothing else on the page touched. |
| Verify | See table below. |

## Units of work

- [x] `src/content/site.ts` — `process.skills`, `process.skillsLabel`, `process.skillsNote`
- [x] `src/components/process/SkillsBubbles.tsx` — new client component (drift + click/drag nudge + reduced-motion fallback)
- [x] `src/app/process/page.tsx` — one new `<Reveal>` section, no existing content moved or resized
- [x] `tests/skills-bubbles.spec.ts` — new Playwright spec: every skill name present as DOM text, a click measurably changes a bubble's `transform`, a drag measurably moves a bubble's bounding box, reduced-motion renders the same names as a static list with zero console errors

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 static pages incl. `/process` |
| `npm run check:aidlc` | `aidlc-check: OK` (run again after this record was added) |
| `npx playwright test tests/skills-bubbles.spec.ts` (local port 3417, not 3100/3200/3201) | 4/4 passed |
| `npx playwright test` (full suite, same local port) | 36/36 passed — no regression on the existing smoke/WebMCP coverage |
| `/process` visual diff | every prior section (title, stats, flow, decisions, why, repo pills) unchanged; the new section is appended after "why", before the repo-links pills |

`npm run lighthouse:desktop`/`:mobile` and `npm run test:smoke` (the repo's fixed-port 3100 config)
were **not** run directly, per instruction to avoid ports 3100/3200/3201 while other agents may be
using them concurrently — a local Playwright run against a temporary config on port 3417 covered the
same assertions (see above), and CI's *Quality gates* workflow runs the real fixed-port suite plus
both Lighthouse presets on the PR.

## Notes

- No skill *content* anywhere in this diff — not in `site.ts` copy, not in component comments, not
  in the Playwright test. Only names.
- `src/data/images.json` was regenerated by `npm run build` (mtime/pipeline touch only) but has no
  content diff against `main` — not part of this effort's substantive change, not committed as an
  edit.
