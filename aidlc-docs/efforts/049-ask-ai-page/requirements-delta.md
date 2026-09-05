# Requirements delta — Effort 049

## Added

- **`/ask-ai` route** (`src/app/ask-ai/page.tsx`) — introduces the live `harshdipsaha-mcp` server to
  site visitors: what it does, two capability highlights, a real example, and setup instructions.
- **`nav` entry** `{ label: "Ask AI", href: "/ask-ai" }` in `src/content/site.ts` — propagates to
  `Nav.tsx`, `Footer.tsx`, and `sitemap.ts` automatically (existing one-array convention).
- **`askAi` content export** in `src/content/site.ts` — all copy for the new page.
- **`src/components/ask-ai/CopySnippet.tsx`** — new client component, a copyable code block.
- **Two `tests/smoke.spec.ts` cases** under `ask AI page`.
- **`/ask-ai` in both `lighthouserc.*.json` route lists.**
- **This effort's own record** (`aidlc-docs/efforts/049-ask-ai-page/`).

## Not changed

- **No ADR.** Not an architectural decision; see effort 049's Notes.
- **No live client-side fetch to the deployed MCP server.** The page's demo is a static, baked
  example built from real (verified) data, not a live network call — see effort 049's Notes for why
  an interactive live-query box was considered and deferred.
- **The MCP server repo (`harshdipsaha-mcp`) itself** — untouched by this effort.
