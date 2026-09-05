# Effort 046 — "What's different here": swap the factuality-gate fact for a WebMCP one

| Field | Value |
|-------|-------|
| Ref | 046-whats-different-webmcp-swap |
| Status | complete |
| Depth | minimal |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `c45c5db` (effort 044, PR #61, merged) |
| ADRs | none |
| Commits | branch `content/whats-different-webmcp` |
| Reconstructed | no — recorded live |

## Intent

Owner asked to remove the first entry of `process.facts` ("Every number on this site is checked
against its source," the factuality-gate claim) and replace it with something about WebMCP/the new
MCP server. Flagged before implementing: the new MCP server (issue #62, effort 045, not yet built)
can't honestly appear in this list — `facts` is exactly the evidence-linked, present-tense-verified
section the removed claim itself described, and claiming a not-yet-deployed server as a "fact" would
repeat the failure mode that section exists to avoid. Owner confirmed via AskUserQuestion: WebMCP
only for now (real, shipped, tested today); the MCP server gets its own fact once it's actually
built and deployed, not before.

Numbered **046**, not 045 — effort 045 (the MCP server spec/docs PR, issue #62) was still open as
PR #63 when this effort started, so its number was already claimed. Same pattern as the 042/043 gap
recorded in `registry.md`.

## Stages

| Stage | Outcome |
|-------|---------|
| Locate | Confirmed the exact string lives in `src/content/site.ts`'s `facts` array (rendered by `src/app/process/page.tsx` under `factsLabel: "What's different here"`) and nowhere else load-bearing — README.md's similar-sounding line describes the still-real `npm run eval:factuality` script and was correctly left untouched; grepped `tests/` and confirmed no test depends on the exact copy. |
| Edit | Replaced the factuality-gate entry with a WebMCP one, same claim/evidence/href shape as its four siblings. |
| Verify | `npm run typecheck`, `npm run build`, `npx playwright test tests/smoke.spec.ts` — see below. |

## Units of work

- [x] `src/content/site.ts` — `process.facts[0]` replaced: claim "The /projects page is callable, not
      just readable."; evidence names the WebMCP tool, `document.modelContext`, and states plainly
      it's inert until a browser ships it; `href` points at ADR 0020 (the current, accurate record).

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 pages |
| `npx playwright test tests/smoke.spec.ts` | 68/68 passed (desktop + mobile) |
| Scope | Single-entry change inside `site.ts`; no component, test, or config touched |

## Notes

- The `gates` array's separate "Factuality" row (`process.gates`, "What a PR has to pass") and every
  README/CI mention of the factuality eval are **unchanged** — those describe the still-real,
  still-running gate, and the owner's request was specifically about the "What's different here"
  facts list, not the gate itself.
- No ADR: this is a copy change inside an existing, already-decided section (ADR from effort 030's
  `/process` rework), not a new architectural or IA decision.
