# Requirements delta — Effort 046

## Changed

- **`src/content/site.ts`** — `process.facts[0]` (rendered on `/process` under "What's different
  here"): the factuality-gate claim is replaced by a WebMCP claim. Old: "Every number on this site
  is checked against its source" / evidence naming the factuality gate / linked to
  `evals/factuality/run.mjs`. New: "The /projects page is callable, not just readable" / evidence
  naming the `searchProjects` WebMCP tool and `document.modelContext`, stated honestly as inert
  until a browser ships it / linked to ADR 0020.

## Not changed

- **`process.gates`'s "Factuality" row** and every other mention of the factuality eval (README.md,
  `AGENTS.md`, `evals/factuality/`, `.github/workflows/evals.yml`) — the eval itself still runs,
  still gates PRs, and is unrelated to this list's copy.
- **The new MCP server (issue #62, effort 045)** is deliberately not referenced here — it is not yet
  built or deployed, and this list only carries present-tense, evidence-linked claims. Add it once
  it's live.
