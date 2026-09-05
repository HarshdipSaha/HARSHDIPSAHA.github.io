# Requirements delta — Effort 044

## Changed

- **`src/components/agent/WebMcpTools.tsx`** — the WebMCP tool now feature-checks
  `document.modelContext` (Chrome's real, shipped global) before falling back to
  `navigator.modelContext` (the deprecated name from the 2025 explainer ADR 0014 originally
  targeted). `execute` returns a plain string instead of `{content: [...], structuredContent}`;
  `outputSchema` is removed (Chrome's descriptor has no such field); a new `annotations:
  {readOnlyHint: true, consequentialHint: false}` field is added, matching Chrome's real optional
  descriptor properties. `inputSchema`, `searchProjects()`, and the component's render-`null` /
  capability-check / unmount-cleanup behavior are all unchanged.
- **`tests/webmcp.spec.ts`** — the stub now installs on `document`, not `navigator`; the "inert"
  test checks both globals are absent; the schema test drops `outputSchema` assertions and adds an
  `annotations` assertion; the output test asserts a string return (bounded line count, per-line
  query-term and URL checks, a literal no-match string, and an all-projects line count) instead of
  a `{content, structuredContent}` object.
- **`AGENTS.md`** ("WebMCP is a capability-checked no-op" paragraph) and **`CONTEXT.md`** (WebMCP
  glossary row) — corrected from "no shipping browser implements it" / `navigator.modelContext` to
  the current facts: Chrome ships `document.modelContext` behind an origin trial from Chrome 149,
  requires this origin's own trial token to activate for real visitors, and `execute` returns a
  plain string. Both now cite ADR 0020 alongside ADR 0014.

## Added

- **ADR 0020** — records why the WebMCP implementation changed (the real Chrome API surface,
  verified against `developer.chrome.com/docs/ai/webmcp/imperative-api` directly, differs from the
  2025 community explainer ADR 0014 was written against), what changed, and what didn't. Explicitly
  scoped as amending ADR 0014's WebMCP portion only — ADR 0014's `llms.txt` decision, and ADR 0014's
  text itself, are both left untouched.
- **This effort's own record** (`aidlc-docs/efforts/044-webmcp-document-modelcontext/`).

## Not changed

- **`llms.txt` / `llms-full.txt`** — explicitly out of scope per the owner's instruction ("leave
  llms.txt as it is"). Nothing under `scripts/build-llms-txt.mjs` or `scripts/lib/llms-txt.mjs`
  was touched.
- **No Chrome origin-trial token was registered** for `harshdipsaha.tech`. That is an action against
  the owner's own Google account (Chrome's origin-trial console), not something this effort could
  do on the owner's behalf, and the owner chose not to pursue it now — the fix stands on its own via
  feature detection regardless. Tracked as optional future work in ADR 0020.
- **The real squash-merge commit SHA in `aidlc-docs/registry.md`** — the row records the branch name;
  the final SHA is filled in by a small reconciliation commit after merge, matching this repo's own
  historical pattern (PR #6, `sync-aidlc-registry-009`).
