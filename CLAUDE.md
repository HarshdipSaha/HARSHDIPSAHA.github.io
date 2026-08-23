# CLAUDE.md

@AGENTS.md

Everything above is the shared contract. Below is Claude-specific only.

## Skills worth reaching for

| Situation | Skill |
|---|---|
| Any non-trivial change | `ai-dlc` |
| Fuzzy request, unclear scope | `brainstorming` before touching code |
| 2+ independent units of work | `agent-swarm` / `dispatching-parallel-agents` |
| UI, layout, component polish | `frontend-design` |
| Docs drifted from code | `documentation-bot` |
| Before shipping | `code-review`, then `verification-before-completion` |
| Stress-testing a decision | `grilling`, then `oracle` |
| Unused/oversized assets in drop-zones | `asset-reviewer` |

## AI-DLC rule

Every non-trivial change becomes a numbered effort under `aidlc-docs/efforts/NNN-<ref>/`:

```
aidlc-docs/efforts/008-add-search/
  effort-state.md        status, depth, stages, units of work, verification
  requirements-delta.md  NEW / CHANGED requirements vs the baseline
```

The baseline lives in `aidlc-docs/inception/`. Record the approval gate in `aidlc-docs/audit.md`, then rebuild `aidlc-docs/registry.md` — it is a derived view, so regenerate it from the per-effort state files rather than hand-editing. Full procedure: [`docs/how-to/run-an-aidlc-effort.md`](./docs/how-to/run-an-aidlc-effort.md). Trivial changes (typo, one-line copy fix in `content.tsx`) skip the effort — edit, type-check, done.

## Rules of engagement

- Never claim done without pasting real output of `npx tsc --noEmit -p tsconfig.json` and `npm run build`. `verification-before-completion` enforces this.
- Architectural or IA decisions get an ADR in `docs/adr/NNNN-*.md` and a `CONTEXT.md` update — not a comment in code.
- Prefer editing `src/resources/content.tsx` over any component. If a change forces a component edit, say why in the effort.
- Read `CONTEXT.md` for domain vocabulary before writing an effort or ADR.

## Named recipes

Multi-skill chains for this repo live in `AGENT_WORKFLOWS.md` — use those before improvising a sequence.
