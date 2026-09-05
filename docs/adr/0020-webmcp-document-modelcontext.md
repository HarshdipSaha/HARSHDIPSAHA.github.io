# 0020 — WebMCP: track `document.modelContext`, the real Chrome surface, not the explainer's `navigator.modelContext`

**Status:** Accepted · **Date:** 2026-09-05 · **Supersedes:** — (amends the WebMCP portion of [ADR 0014](0014-agent-facing-site-llms-txt-and-webmcp.md); that ADR's `llms.txt` decision is unaffected)

## Context

ADR 0014 (2026-08-28) adopted WebMCP as a capability-checked progressive enhancement, reasoning
from the 2025-era community explainer at `webmachinelearning.github.io/webmcp`: register a tool via
`navigator.modelContext.registerTool({name, description, inputSchema, execute})`, where `execute`
returns `{content: [{type: "text", text}], structuredContent}`. At the time, that ADR stated
**"no shipping browser implements it."**

That premise is now out of date, checked directly against Chrome's own developer documentation
(`developer.chrome.com/docs/ai/webmcp/imperative-api`, published 2026-05-18) rather than secondary
sources:

- The real global is **`document.modelContext`**, not `navigator.modelContext`. The
  `navigator`-based name from the explainer is deprecated.
- Chrome shipped this behind an **origin trial from Chrome 149** (announced at Google I/O 2026,
  2026-05-19), moving from Canary-only experimentation to production-testable infrastructure.
  Without this site's own trial token registered for `harshdipsaha.tech`, `document.modelContext`
  stays `undefined` in every real visitor's browser today regardless of Chrome version — it is not
  a flag flip away, and the owner has chosen not to register a token in this effort (it is a
  standing external action, tracked as future work, not a blocker to this fix).
- `execute`'s real return value is a **plain string** (Chrome's own examples: `return`
  \`Performed ${action} on layer: ${layer}\`\`). There is no `outputSchema` and no
  `{content, structuredContent}` wrapper — that shape was the explainer's, not the shipped one.
  Chrome's optional descriptor field is `annotations` (`readOnlyHint`, `consequentialHint`,
  `untrustedContentHint`), which the explainer-based implementation did not have.

The practical consequence: `src/components/agent/WebMcpTools.tsx` was checking a property name that
no longer matches any real implementation, and its `execute` returned a shape no real caller expects.
It was not merely unverifiable in the wild (as ADR 0014 concluded) — it had quietly become
permanently inert, independent of whether Chrome ever reaches general availability, because it was
feature-detecting the wrong surface.

## Decision

**Keep WebMCP, retarget the implementation at the real API, do not add a new tool or new
complexity.** Concretely:

1. Feature-detect `document.modelContext` first, falling back to `navigator.modelContext` for any
   implementation that still uses the old name. Both are optional; the component still renders
   `null` and no-ops when neither exists — the safety property ADR 0014 established is unchanged.
2. `execute` returns a plain string (the same human-readable line-per-project text the old
   `content[0].text` carried), matching Chrome's shipped contract exactly. `outputSchema` and
   `structuredContent` are removed — declaring an output shape the real API neither reads nor
   validates would assert a false contract.
3. Add `annotations: {readOnlyHint: true, consequentialHint: false}` — cheap, accurate (the tool is
   a read-only search), and part of the real descriptor shape.
4. `tests/webmcp.spec.ts` stubs `document.modelContext` (not `navigator.modelContext`) and asserts
   the string-return contract.
5. No origin trial token is registered in this effort. The component remains inert for every real
   visitor until either Chrome reaches general availability (no code change needed then — that is
   the point of feature detection) or the owner separately decides to register the trial.

## Consequences

- The component is no longer permanently dead by construction; it will activate the moment this
  origin ships a trial token, or the moment Chrome (or another browser) enables the real API by
  default — with zero further code change either way.
- `AGENTS.md` and `CONTEXT.md`'s WebMCP entries, which repeated ADR 0014's now-outdated "no shipping
  browser" claim, are corrected (docs-sync, not a new decision).
- ADR 0014 itself is left untouched, per this repo's append-only ADR convention — it remains an
  accurate record of the facts and reasoning available on 2026-08-28. This ADR is the place that
  records what changed and why.
- `llms.txt`/`llms-full.txt` are entirely unaffected; ADR 0014's decision there stands as written.
- We are again shipping a call site for a still-evolving surface (Chrome's own docs describe
  behavior changes as late as "Chrome 153"). The same mitigation applies: it is feature-detected,
  so a further rename or shape change makes the code inert again, not broken.

## What would reverse this

- Chrome's `document.modelContext` shape changing again before general availability — the fix is
  the same kind of small, isolated update this ADR itself is.
- A decision to register the origin-trial token — that is additive (a `<meta>` tag / header) and
  does not require reversing anything here.
- The WebMCP proposal being withdrawn entirely — reversal is deleting one component and one line in
  `src/app/projects/page.tsx`, as ADR 0014 already anticipated.

## Evidence

- `developer.chrome.com/docs/ai/webmcp/imperative-api` (fetched 2026-09-05): confirms
  `document.modelContext.registerTool(descriptor, options?)`, the descriptor shape
  (`name`, `description`, `inputSchema`, `execute`, optional `annotations`; `outputSchema` "not
  mentioned in documentation"), `execute` returning a string, and the origin-trial requirement
  (registration link `developer.chrome.com/origintrials/#/register_trial/4163014905550602241`).
  Two literal `registerTool` examples on that page both return a template-literal string from
  `execute`.
- Effort record: `aidlc-docs/efforts/044-webmcp-document-modelcontext/effort-state.md`.
