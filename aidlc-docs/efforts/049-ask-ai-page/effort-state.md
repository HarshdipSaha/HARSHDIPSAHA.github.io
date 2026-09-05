# Effort 049 — `/ask-ai`: introduce the MCP server on the site itself

| Field | Value |
|-------|-------|
| Ref | 049-ask-ai-page |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `286d4f7` (effort 048, PR #66, merged) |
| ADRs | none |
| Commits | branch `feat/ask-ai-page` |
| Reconstructed | no — recorded live |
| Closes | ticket 4 of `docs/plans/2026-09-05-mcp-server-design.md` (issue #62 / effort 045) |

## Intent

Ticket 4 of the MCP server design doc, deliberately deferred until the server existed and was
deployed: a discoverability page on the portfolio site pointing at the now-live
`harshdipsaha-mcp` server (deployed by the owner directly, `wrangler deploy`, live at
`https://harshdipsaha-mcp.harshdipsaha-mcp.workers.dev/mcp`, verified end-to-end in production).

Owner's explicit constraints for this pass: not technical, beginner-friendly copy (no "MCP",
"protocol", "Cloudflare", "JSON-RPC" in visible text), not overcrowded with text, and "creative and
beautiful" — a real design opportunity, not a bolted-on link. Scoped via `AskUserQuestion` (new
`/ask-ai` page, not a section on an existing page or a bare footer link) and built via the
`frontend-design` skill, working within this site's existing design system (ADR 0011) rather than
inventing a new one for a single page. Copy drafted and run through the `copydesk-write` review
gate at the owner's explicit request.

## Stages

| Stage | Outcome |
|-------|---------|
| Verify the "bug report" | Owner asked why the live MCP URL returned a `Method not allowed` JSON-RPC error. Confirmed via a plain `curl -i` GET request: the server correctly rejects GET (it only accepts POST `tools/call`/`initialize`), so a browser visit to the bare URL was never going to work — not a defect. |
| Scope | `AskUserQuestion`: dedicated `/ask-ai` page (over a section on an existing page, or a minimal footer link). |
| Copy | Drafted 6 short pieces (headline, subline, two capability blocks, setup intro, footnote) against the `harshdip-casual` register's `site-copy` mode; ran both `prose-review` and `craft-review` agents in parallel per the `copydesk-write` process. No hard fails (no banned phrases, no em dashes, no fatal pattern). Applied the advisory fixes: removed "everything"/"all" echo across the two capability cards, gave capability 1 a punchier closing fragment, replaced the vague "under a minute" with a concrete "30 seconds". |
| Build | New route, new content block in `site.ts`, new `CopySnippet` client component, `nav` entry (auto-propagates to `Nav.tsx`/`Footer.tsx`/`sitemap.ts` per the existing one-array convention). |
| Verify | See below — typecheck, build, full smoke suite (2 new dedicated tests plus the auto-discovered route check), desktop Lighthouse. |

## Units of work

- [x] `src/content/site.ts` — new `askAi` export (headline, subline, a real baked example Q&A drawn
      from a genuine `searchProjects` result — not invented copy, the same real project data the
      live server actually returns for the query "brain" — two capability blocks, setup copy, the
      live server URL, the new repo's URL); `nav` gains `{ label: "Ask AI", href: "/ask-ai" }`.
- [x] `src/components/ask-ai/CopySnippet.tsx` — new client component: a code block with a copy
      button, clipboard failure swallowed silently (matches `WebMcpTools.tsx`'s "never show a
      visitor a console error" rule), `aria-live` region announcing the copy for screen readers.
- [x] `src/app/ask-ai/page.tsx` — new route: hero, a static "Q/A" demo block (question + the real
      baked answer, revealed with `TextAnimate`, matching the site's existing motion idiom), two
      capability cards, a setup section with the `.mcp.json` snippet and a link to the new repo.
- [x] `lighthouserc.desktop.json`, `lighthouserc.mobile.json` — `/ask-ai` added to both route lists.
- [x] `tests/smoke.spec.ts` — two new cases under `ask AI page`: the example Q&A renders with the
      real project data; the copy button copies the exact, valid JSON to the clipboard (asserted
      directly via `navigator.clipboard.readText()`, permission granted via
      `context.grantPermissions`).

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 31 pages (`/ask-ai` confirmed present in `out/`) |
| `npx playwright test tests/smoke.spec.ts -g "ask AI page"` | 4/4 passed (desktop + mobile) |
| `npx playwright test` (full suite) | 90/90 passed |
| `npm run lighthouse:desktop` | 21/21 runs (7 routes × 3) passed every assertion, `/ask-ai` included |
| Live browser check (Playwright MCP) | Navigated to the built page, confirmed the full accessibility-tree snapshot matches the intended content exactly (nav entry, hero, Q&A demo with real data, both capability cards, setup snippet, footnote link); clicked the real Copy button and confirmed the visible state changed to "Copied" with zero console errors |

## Notes

- **The demo answer is real data, not written copy.** `askAi.demo.answer`'s two lines are the exact
  `searchProjects("brain", …)` result the live server returns today (verified against the deployed
  Worker during this same session, before this effort started) — not paraphrased or invented. If
  the underlying project list changes, this baked example can drift from what the live server
  actually returns; accepted as a cheap, static, CI-safe demo rather than a live client-side fetch
  to an external service on every page load (see next note).
- **No live network call from the browser.** The demo is a static example, not an interactive
  client-side fetch to the deployed Worker. Considered and rejected: an always-on live fetch would
  make the page's correctness depend on an external service's uptime, and would need to be
  carefully excluded from Playwright's automated page-load checks to avoid flaking CI on network
  conditions. A future effort could add an optional, user-triggered "try your own query" box (a
  real fetch, but only on explicit interaction, with mocked-network tests) — out of scope here.
- **No ADR.** A new content page with a nav entry is not an architectural or IA decision on its own
  (same precedent as every other route addition in this repo); it links to, but does not change,
  the already-decided WebMCP/MCP-server architecture (ADR 0014, 0020).
