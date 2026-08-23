# Effort 007 — Docs-first AI-DLC restructure

| Field | Value |
|-------|-------|
| Ref | 007-docs-first-aidlc-restructure |
| Status | in-progress |
| Depth | standard |
| Opened | 2026-08-23 |
| Closed | — |
| Baseline | aidlc-docs/inception/ |
| ADRs | docs/adr/0008-*.md |
| Commits | pending |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Adopt the Agent-Repo Structure Playbook layout and the AI-DLC methodology across the repo, and surface the result publicly as a `/process` page — so that decisions are recorded going forward instead of being reverse-engineered from diffs.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Scope approved 2026-08-23: "Docs structure + a live /process page", depth `standard`. See `aidlc-docs/audit.md`. |
| Functional design | Four layers: context files at root, Diataxis-quadrant `docs/`, `aidlc-docs/` lifecycle records, and a rendered `/process` route. |
| NFRs | `npx tsc --noEmit` clean; `npm run build` succeeds; no regression to existing routes. |
| Code | In progress. |
| Build & test | Pending. |

## Units of work
- [ ] Context layer — `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md`
- [ ] Knowledge layer — `docs/` on Diataxis quadrants (tutorials, how-to, reference, explanation) plus `docs/adr/0001`-`0008` backfilled
- [ ] Lifecycle layer — `aidlc-docs/`: brownfield inception baseline, efforts 001-007 backfilled, `registry.md`, `audit.md`
- [ ] Public `/process` page — new route rendering the AI-DLC story; requires both the routes toggle in `src/resources/once-ui.config.ts` and a nav entry in `src/components/Header.tsx`
- [ ] Behaviour checks — `evals/`
- [ ] `README.md` rewritten as an AI-DLC showcase

## Verification
Pending. Planned gates: `npx tsc --noEmit` clean, `npm run build` succeeds, `/process` renders and is reachable from the site nav.

## Notes
- Motivation: the repo's first ~20 commits carry messages like "lets see", "hmmm", "okays", "soz" attached to 12,000-line diffs, with zero recorded rationale. Every structural decision in efforts 001-004 had to be reverse-engineered from diffs during this backfill.
- Efforts 001-007 in `aidlc-docs/efforts/` are reconstructions, not contemporaneous records. They are marked as such in each `effort-state.md`.
- The `/process` route needs two edits, not one — a missed nav entry in `src/components/Header.tsx` yields a page that builds but is unreachable.
- Ownership split during this effort: `aidlc-docs/README.md` and `aidlc-docs/inception/**` are owned by a separate agent and are not written here.
