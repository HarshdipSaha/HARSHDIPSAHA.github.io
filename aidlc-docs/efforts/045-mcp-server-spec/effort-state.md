# Effort 045 — MCP server ideation: a public, read-only Model Context Protocol server

| Field | Value |
|-------|-------|
| Ref | 045-mcp-server-spec |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `c45c5db` (effort 044, PR #61, merged) |
| ADRs | none |
| Commits | branch `docs/mcp-server-spec` |
| Reconstructed | no — recorded live |
| Closes | issue #62 |

## Intent

Following effort 044's WebMCP fix, a chat brainstorm explored a separate, genuinely new idea: a
real Model Context Protocol server (unrelated to WebMCP despite the name) exposing the site's
project/bio data to any MCP client — the owner's own Claude Code/Codex sessions on any machine, and
external clients like a recruiter's own AI tool. Brainstorming covered audience (public, not just
the owner), location (a new standalone repo — the portfolio's static-export architecture has no
server runtime, ADR 0002), scope (read-only mirror of what `llms.txt` already has, not a
write/contact tool), hosting (Cloudflare Workers, verified against Cloudflare's own current docs
rather than search summaries), and discovery (a future addition to the portfolio site itself).

Per the owner's explicit instruction (`/to-spec` then this docs-only effort), this pass captures
the design as a GitHub issue and a durable repo doc — it does **not** build the server. Building it
is a future effort against a new repository.

## Stages

| Stage | Outcome |
|-------|---------|
| Spec | Synthesized the brainstorm into the `/to-spec` template (Problem Statement, Solution, 18 user stories, Implementation Decisions, Testing Decisions, Out of Scope, Further Notes) and published it as issue #62, labeled `spec` + `ready-for-agent` — matching the precedent set by issue #24. |
| Docs | Wrote `docs/plans/2026-09-05-mcp-server-design.md` as the durable copy of the same spec, so the design survives independently of the issue once closed — the same pattern effort 031's ideation document already established for this repo. |
| Close | PR merged, issue #62 closed via the PR's `Closes #62`. |

## Units of work

- [x] `docs/plans/2026-09-05-mcp-server-design.md` — new.
- [x] Issue #62 — new, `spec` + `ready-for-agent` labels, closed by this PR's merge.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean — no source files touched |
| `npm run build` | succeeds (docs-only diff; build unaffected) |
| Scope | Docs-only diff: one new file under `docs/plans/`, this effort's own record, and the registry/audit rows. No `src/`, `scripts/`, or config changes. |

## Notes

- **No code was written and no new repository was created in this effort**, deliberately. The new
  MCP server itself is out of scope here — see the design doc's own "Out of scope" section and its
  "Notes for the implementing agent," which name the future effort's starting point.
- **No ADR.** No architectural decision is made *in this repo* by writing a plan for a different,
  not-yet-existing repo; effort 031 (the ideation document) set the same precedent.
