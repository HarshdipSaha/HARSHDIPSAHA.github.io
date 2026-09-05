# MCP server design: a public, read-only Model Context Protocol server for portfolio context

**Status:** spec'd, not built. Tracked as [issue #62](https://github.com/HarshdipSaha/HARSHDIPSAHA.github.io/issues/62) (`spec`, `ready-for-agent`). This document is the durable copy of that spec.

## Problem

Today, an AI tool that wants to know "who is Harshdip Saha and what has he built" has exactly one
path: fetch `llms.txt`/`llms-full.txt` (ADR 0014) and read prose. That works for tools that can
fetch a URL, but it's a one-shot text dump, not something an agent can query ("find his
medical-imaging work"), or something a recruiter can add to their own AI tool as a standing
connection. There's no way for a Claude Code (or Codex, or any real MCP client) session — the
owner's own, or someone else's, like a recruiter's — to pull structured, queryable context about
the owner on demand, the way it would query any other MCP tool server.

**Not to be confused with WebMCP.** WebMCP (`document.modelContext`, ADR 0014/ADR 0020) is a
browser API consumed by an agent embedded in a browser tab. This document is about the real Model
Context Protocol, consumed by external clients like Claude Code/Codex over a network connection.
The two share a name and nothing else.

## Solution

A small, standalone, public, read-only remote MCP server hosted on Cloudflare Workers, exposing two
tools (`searchProjects`, `getProfile`) backed by the exact same data the portfolio site already
publishes. Anyone — the owner on a new machine, or a recruiter/interviewer with their own
MCP-capable client — adds one URL to their MCP config and gets instant, structured, always-current
answers instead of re-deriving context from scratch or scraping the site.

## Decisions

- **New standalone repository**, not a subdirectory of `HARSHDIPSAHA.github.io`. The portfolio repo
  has zero server runtime by explicit architectural constraint (ADR 0002, `output: "export"`); a
  live Worker doesn't fit there.
- **Hosting: Cloudflare Workers**, `createMcpHandler` (the current recommended pattern for a new,
  stateless server — the MCP spec's 2026-07-28 revision made the protocol fully stateless, so the
  older `McpAgent`/Durable-Objects pattern isn't needed here), Streamable HTTP transport, **no
  authentication** — deliberately public and read-only over already-public data.
- **Data source: one new generated export from the portfolio's existing build**, not a second
  hand-maintained copy. Extend `scripts/build-llms-txt.mjs` (or add a small sibling script) to also
  emit a structured `public/agent-data.json`, built from the same in-memory `AgentProject[]` list
  (`src/lib/agentProjects.ts`) and `person`/`story` data (`src/content/site.ts`) already assembled
  for `llms.txt` and `WebMcpTools.tsx`. This is the only change this spec requires against the
  portfolio repo.
- The Worker fetches `https://harshdipsaha.tech/agent-data.json` per request, edge-cached with a
  short TTL (~10 minutes) — near-live data, no repeated hits on the GitHub Pages origin.
- **Two tools**, matching the existing WebMCP tool's minimal-surface philosophy (ADR 0014's "exactly
  one tool" reasoning, applied again):
  - `searchProjects(query, limit?)` — same matching semantics as `searchProjects` in
    `src/components/agent/WebMcpTools.tsx`.
  - `getProfile()` — bio, skills, contact, resume URL, site URL.
- Exact Cloudflare package/scaffold names are **not pinned here** — confirm against
  `developers.cloudflare.com/agents/model-context-protocol/guides/remote-mcp-server/` directly at
  build time. Same lesson just learned fixing WebMCP (effort 044, ADR 0020): verify a fast-moving
  external API surface right before writing code, not from a spec written days or weeks earlier.

## Testing

- Prior art: `tests/webmcp.spec.ts` and `scripts/llms-txt.test.mjs` are the closest analogues.
- Portfolio repo: `agent-data.json`'s generator gets a pure-function test, same pattern as
  `scripts/lib/llms-txt.mjs`.
- New repo: `searchProjects`/`getProfile` tested as pure functions, independent of the Worker/HTTP
  layer. An integration test against a real running Worker asserts `initialize` + `tools/list` +
  `tools/call` all return the declared shape — the class of bug effort 044 found (a contract that
  looks right in isolation but doesn't match the real transport) is exactly what this catches.

## Out of scope (this pass)

- Any write/contact/message tool.
- The portfolio site's own discoverability change (a footer link or `/mcp` section) — a later
  ticket, once the server has a real URL.
- Auth of any kind; anything beyond what's already public on the site.
- **Building the server.** This document and issue #62 capture the design only, by the owner's own
  instruction — a future effort, against a new repo, does the build.

## Notes for the implementing agent

- Read issue #62 in full, `src/components/agent/WebMcpTools.tsx` + `src/lib/agentProjects.ts`, and
  ADR 0014 + ADR 0020 before starting.
- Suggested ticket order: (1) `agent-data.json` export + tests in this repo; (2) new repo scaffold +
  the two tools as pure functions + tests, deployed with no auth; (3) integration test against the
  deployed Worker; (4) this site's discoverability addition.
