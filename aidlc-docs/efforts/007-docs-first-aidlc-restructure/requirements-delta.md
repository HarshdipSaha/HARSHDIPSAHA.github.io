# Effort 007 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-032 | The repo carries a context layer at root: `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md` | Agents need standing project context without re-deriving it from diffs |
| R-033 | `docs/` is organised on Diataxis quadrants: tutorials, how-to, reference, explanation | Prevents the single-README dumping ground |
| R-034 | Every past architectural decision is recorded as an ADR — `docs/adr/0001`-`0008` | Efforts 001-004 shipped with zero recorded rationale |
| R-035 | `aidlc-docs/` holds a brownfield inception baseline plus one numbered effort folder per unit of work | AI-DLC lifecycle records; filesystem is the source of truth |
| R-036 | `aidlc-docs/registry.md` is a derived index rebuilt from per-effort state files | Single readable index without a second source of truth |
| R-037 | `aidlc-docs/audit.md` logs every approval-gate response | Gate decisions must be traceable and honest about gaps |
| R-038 | The site exposes a public `/process` route rendering the AI-DLC story | The methodology is itself portfolio content |
| R-039 | `evals/` holds behaviour checks for agent-facing content | Documentation claims should be checkable |
| R-040 | `README.md` is an AI-DLC showcase rather than a template readme | Front door should reflect how the repo is actually built |

## CHANGED
| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| R-026 | Rationale captured ad hoc in PR bodies (from effort 005 onward) | Rationale captured in ADRs and per-effort AI-DLC records; PRs remain the approval gate | PR bodies are not discoverable from the working tree |

## UNCHANGED but affected
- R-002 static export — `/process` must export statically like every other route.
- R-003 GitHub Actions deploy — unchanged, but must stay green through the restructure.
- R-010 `/blog` disabled — the routes config gains `/process` alongside it; `/blog` stays off.
- R-025 `npx tsc --noEmit` gate — reapplied to this effort.

## Acceptance criteria
- [ ] Context layer present: `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `AGENT_WORKFLOWS.md`
- [ ] ADRs `0001`-`0008` written under `docs/adr/`
- [ ] Inception baseline complete under `aidlc-docs/inception/`
- [ ] Efforts 001-007 recorded under `aidlc-docs/efforts/`
- [ ] `/process` route renders and is reachable from site nav
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds
