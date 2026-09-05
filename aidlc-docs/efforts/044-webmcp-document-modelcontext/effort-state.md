# Effort 044 — WebMCP: track `document.modelContext`, the real Chrome surface

| Field | Value |
|-------|-------|
| Ref | 044-webmcp-document-modelcontext |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `6911b77` |
| ADRs | 0020 — WebMCP: track `document.modelContext`, the real Chrome surface, not the explainer's `navigator.modelContext` |
| Commits | branch `fix/webmcp-document-modelcontext` |
| Reconstructed | no — recorded live |
| Closes | chat discussion (no issue/ticket): owner asked why ADR 0014's WebMCP was worth keeping given research showing `llms.txt` has low general-crawler adoption, and separately asked to verify WebMCP against current reality rather than the ADR's 2026-08-28 snapshot |

## Intent

The owner asked, after reviewing ADR 0014: "why not WebMCP... shouldn't we do it" plus web research
suggesting `llms.txt` is barely used by AI crawlers generally (true, but not by this site's actual
agent audience — IDE/MCP tooling does fetch it, per the same research). WebMCP was already
implemented (ADR 0014, 2026-08-28), so the real question was whether it still does anything.

Checking Chrome's own developer docs (`developer.chrome.com/docs/ai/webmcp/imperative-api`, not
secondary blog summaries) found the spec moved since ADR 0014 was written eight days earlier: the
global renamed `navigator.modelContext` → `document.modelContext`, an origin-trial token is required
(Chrome 149+), and `execute` returns a plain string, not the `{content, structuredContent}` object
the explainer described. `src/components/agent/WebMcpTools.tsx` was checking the old global, so it
had quietly become permanently inert — not "unverifiable until browsers ship it" as ADR 0014
concluded, but dead regardless of what ships, because it targets a name nothing implements.

Owner decision (via AskUserQuestion, this session): fix it on a new branch off `main` rather than
the in-flight `feedback/issue-55-footer-hero` work; do not pursue Chrome's origin-trial token
registration in this effort (that is the owner's own external action against their Google account,
tracked as optional future work, not a blocker).

## Stages

| Stage | Outcome |
|-------|---------|
| Effort planning | Read ADR 0014 and `WebMcpTools.tsx`; fetched `developer.chrome.com/docs/ai/webmcp/imperative-api` directly (twice, for the descriptor shape and for literal `registerTool` code examples) to ground every claim in the primary source rather than search snippets. |
| Functional design | Decided: keep the tool, retarget the global, drop `outputSchema`/`structuredContent` (not part of the real contract), add `annotations`, no origin-trial token this effort. |
| Code | `WebMcpTools.tsx` rewritten; `tests/webmcp.spec.ts` rewritten to stub `document.modelContext` and assert the string contract; `AGENTS.md`/`CONTEXT.md` docs-synced (ADR 0014 itself left untouched — append-only). |
| Build & test | `npm run typecheck`, `npm run build`, `npx playwright test` (full suite), `node scripts/check-aidlc-sync.mjs` — see Verification. |

## Units of work

- [x] `src/components/agent/WebMcpTools.tsx` — feature-check `document.modelContext` with a
      `navigator.modelContext` fallback; `execute` returns a plain string; `outputSchema`,
      `structuredContent`, `ToolResult`, `PROJECT_ITEM_SCHEMA`, `OUTPUT_SCHEMA` all removed as
      dead weight against the real API; added `annotations: {readOnlyHint: true,
      consequentialHint: false}`. `inputSchema` and `searchProjects()` unchanged.
- [x] `tests/webmcp.spec.ts` — stub installed on `document`, not `navigator`; "inert" test checks
      both globals are absent; schema test drops `outputSchema` assertions, adds an `annotations`
      assertion; the output test rewritten around a string return (line-count instead of
      `structuredContent.count`, a literal no-match string, URL-pathname membership check against
      the page's own links).
- [x] `docs/adr/0020-webmcp-document-modelcontext.md` + row in `docs/adr/README.md`. Marked as
      amending ADR 0014's WebMCP portion, not superseding it — the `llms.txt` decision in 0014 is
      unaffected and ADR 0014's text is left as a historical record (append-only convention).
- [x] `AGENTS.md`, `CONTEXT.md` — WebMCP passages corrected from "no shipping browser implements
      it" to the real origin-trial/`document.modelContext` facts, citing ADR 0020 alongside 0014.

## Requirements delta

See `requirements-delta.md`.

## Verification

### Commands

| Check | Result |
|---|---|
| `npm run typecheck` | clean (no output) |
| `npm run build` | succeeds; `llms.txt: 20 projects, llms.txt 6960 chars, llms-full.txt 50944 chars`; `process-stats: 42 efforts (001-043), 19 ADRs (0001-0020), 3 superseded, 3 PR workflows` |
| `npx playwright test tests/webmcp.spec.ts` | 8/8 passed (desktop + mobile), 20.3s |
| `npx playwright test` (full suite) | 84/84 passed, 1.5min — no regression anywhere else in the site |
| `node scripts/check-aidlc-sync.mjs` | `OK — no substantive changes in this diff` — this compares committed `origin/main...HEAD`; nothing is committed yet in this working tree, so this is not yet a meaningful pass. Re-run after committing, before opening a PR. |

### WebMCP tests (`tests/webmcp.spec.ts`, desktop + Pixel 7)

1. with no WebMCP support the projects page is inert — neither `document.modelContext` nor
   `navigator.modelContext` exist, the grid renders, zero console/page errors or failed requests
2. registers exactly one tool with a valid input schema and the expected `annotations`
3. the handler answers a query with a plain string — line count bounded by `limit`, every line
   mentions the query term, every embedded URL's path is one the page actually renders; the
   no-match case returns the literal message; an empty query returns one line per project on the page
4. navigating away and back leaves exactly one registration (2 registrations, 1 unregistration, 1 active)

## Notes

- **Branched, not worktree-switched.** `fix/webmcp-document-modelcontext` was created from local
  `main` at `6911b77` via `git branch ... main && git checkout ...` rather than `git checkout main`
  directly, because `main` was already checked out in a sibling worktree, `wt-engineering-skills-table`.
- **Registry reconciliation is a known follow-up, not a gap.** `aidlc-docs/registry.md`'s row for
  this effort records the branch name; the real squash-merge SHA can be filled in by a small future
  sync commit once merged, matching this repo's own historical pattern (PR #6,
  `sync-aidlc-registry-009`) — recording the branch first and reconciling the SHA later is normal
  here, not a shortcut.
- **Unrelated dirty state was stashed, not touched.** Before branching, `feedback/issue-55-footer-hero`
  had uncommitted changes (`src/data/images.json`, `src/data/process-stats.json` — build-regenerated
  data — and an untracked `.scratch/`) unrelated to this effort. These were stashed
  (`git stash push -u -m "WIP unrelated to effort 043: footer/hero issue-55 generated-data diffs +
  scratch"`) rather than discarded or carried onto this branch. The owner should `git stash pop` on
  `feedback/issue-55-footer-hero` to get them back; this branch never had them.
- **`registry.md` regeneration and `audit.md` gate row are still pending** — deliberately deferred
  until the owner decides how/whether to commit this work, since both are meant to reflect the real
  commit history (SHAs, PR number), not a hypothetical one. Do this before opening a PR.
- **No origin-trial token was registered.** `document.modelContext` therefore remains `undefined` in
  every real browser hitting this site today; the fix makes the code correct against the real API,
  not immediately observable. This was an explicit, deliberate scope decision (AskUserQuestion),
  not an oversight — see ADR 0020.
- **ADR 0014 was deliberately left unedited.** This repo treats ADRs as append-only historical
  records (`docs/adr/README.md`: "to reverse one, write a new ADR and mark the old one superseded").
  Since this isn't a reversal of the decision to adopt WebMCP — only a correction to the API surface
  it targets — a new ADR (0020) was written rather than editing or superseding 0014.
