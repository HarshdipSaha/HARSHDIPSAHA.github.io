# Requirements delta — Effort 045

## Added

- **`docs/plans/2026-09-05-mcp-server-design.md`** — design for a future, separate MCP server
  project (public, read-only, Cloudflare Workers, mirrors `llms.txt`'s data via two tools). Durable
  copy of the spec published as issue #62.
- **This effort's own record** (`aidlc-docs/efforts/045-mcp-server-spec/`).

## Not changed

- **No code, config, or existing content changed.** This is a docs-only effort; nothing under
  `src/`, `scripts/`, or `content/` was touched.
- **The new MCP server itself is not built.** Explicitly out of scope for this pass — see the design
  doc. A future effort, against a new repository, builds it.
- **The portfolio site's discoverability of the future server** (a footer link or `/mcp` section) —
  also out of scope; the design doc defers it to a later ticket, once the server has a real URL.
