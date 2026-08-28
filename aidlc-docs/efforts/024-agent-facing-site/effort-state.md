# Effort 024 — Agent-facing site: generated `llms.txt` and a capability-checked WebMCP tool

| Field | Value |
|-------|-------|
| Ref | 024-agent-facing-site |
| Status | complete |
| Depth | standard |
| Opened | 2026-08-28 |
| Closed | 2026-08-28 |
| Baseline | `main` @ `7f2a09e` (effort 021's quality gates, merged as PR #11) |
| ADRs | 0014 — an agent-facing surface: generated `llms.txt`, and WebMCP as progressive enhancement |
| Commits | branch `feat/agent-facing-site` |
| Reconstructed | no — recorded live |
| Closes | spec #13; tickets #18, #19, #20, #21 |

## Intent

Spec #13: the site is built for a human in a browser, and increasingly the visitor is not one. An
assistant answering "what has Harshdip built?" must fetch and parse twenty styled pages to recover
what fits on one page of plain text, and an agentic browser cannot *query* the site at all. Two
2025-era conventions address this — `llms.txt` and WebMCP — and Lighthouse 13 scores both in a new
**agentic-browsing** category where, on this site, every one of those audits reports `notApplicable`.

The owner's standing constraint applies throughout: **the rendered page for humans must not change,
and improving one score must not cost another.**

## Planning

The first thing done was not to write code but to read the audits, because the risk was asymmetric
and needed to be known exactly. From `lighthouse@13.4.1`:

| Audit | How it behaves | What that means here |
|---|---|---|
| `llms-txt` (`core/audits/agentic/llms-txt.js`) | Fetches `/llms.txt`. **4xx → score 1, `notApplicable`.** 2xx → score 1 only if the body has an H1 (`/^\s*#\s+.+/m`), a Markdown link (`/\[.+\]\(.+\)/`) and ≥ 50 characters; otherwise **score 0, a real failure**. | This is the only audit this change can make *worse*, and only by serving a malformed file. The generator makes all three properties structural, and a unit test asserts each. |
| `webmcp-registered-tools`, `webmcp-form-coverage`, `webmcp-schema-validity` | Each returns `{notApplicable: true, score: 1}` unless `artifacts.WebMCP.isSupported`. The gatherer (`core/gather/gatherers/webmcp.js`) sets that only when the page exposes `navigator.modelContext` **and** the `WebMCP.enable` CDP domain exists. | No shipping browser has either. Nothing this repo does can move these audits today — they cannot be made to fail, and they cannot be made to pass. |
| category `agentic-browsing` (`core/config/default-config.js`) | `categoryScoreDisplayMode: 'fraction'`; six equally-weighted refs: `agent-accessibility-tree`, the three `webmcp-*`, `cumulative-layout-shift`, `llms-txt`. | `notApplicable` audits are excluded from the fraction, so the pre-change 100 came from just two audits. The score cannot go above 100; the win is that a third audit now genuinely passes. |

A second finding shaped the verification plan: **the repository's pinned Lighthouse gate cannot see
this category at all.** `@lhci/cli@0.15.1` resolves `lighthouse@12.6.1`, whose `default-config.js`
declares only `performance`, `accessibility`, `best-practices` and `seo`. The before/after for
agentic-browsing therefore had to be measured with an ad-hoc `lighthouse@13.4.1` run against the same
`serve out` origin, on both presets, before and after — while the pinned gate was still run unchanged
to prove the four categories it *does* assert have not moved. Upgrading the gate was deliberately not
bundled into this change (ADR 0014, "Alternatives considered").

## Stages

| Stage | Outcome |
|-------|---------|
| Planning | Read all four agentic audits and both gatherers in `lighthouse@13.4.1`; read the WebMCP explainer for the current `registerTool` / `unregisterTool` / `{name, description, inputSchema, execute}` shape. Established the risk model above and the measurement plan. |
| Baseline | Built `main` unchanged, served it on `:3201`, ran `lighthouse@13.4.1` over six routes × two presets and recorded every category and the five agentic audit states. Saved `out/sitemap.xml` and `out/robots.txt` for comparison. |
| Ticket #18 | Pure renderer `scripts/lib/llms-txt.mjs` — `renderLlmsTxt(site, projects) -> {index, full}`, no I/O — with eight `node --test` cases and a new `npm run test:unit`. |
| Ticket #19 | `scripts/build-llms-txt.mjs` on `predev`/`prebuild` beside the image pipeline, writing two gitignored files into `public/`. |
| Ticket #20 | `src/components/agent/WebMcpTools.tsx` — one capability-checked `searchProjects` tool on `/projects`, rendering `null`, unregistering on unmount; plus `tests/webmcp.spec.ts`, which injects a `navigator.modelContext` stub and invokes the captured handler. |
| Ticket #21 | Re-ran the same twelve Lighthouse runs, both pinned gate presets, the smoke suite and the unit tests; wrote ADR 0014 and this record; synced `AGENTS.md`, `CONTEXT.md` and `README.md`. |

## Units of work

- [x] `scripts/lib/llms-txt.mjs` — the pure renderer. llmstxt.org shape: `# name`, `>` summary, then
      `## Site` / `## Projects` / `## Research` / `## Elsewhere` / `## Optional` sections of
      `- [Title](absolute-url): description` bullets. `full` adds every case-study body under an `###`
      per project, with the body's own headings demoted two levels so nothing competes with a section
      heading. All URLs built from `person.siteUrl`; no host literal anywhere in the module.
- [x] `scripts/llms-txt.test.mjs` — eight `node --test` cases (see Verification).
- [x] `scripts/build-llms-txt.mjs` — the I/O half. Loads `src/content/site.ts` by transpiling it in
      memory with the already-present `typescript` dev dependency and importing the result from a
      `data:` URL: the file is plain typed data with no imports, so this is exact and there is no
      second copy of the copy. Reads `content/projects/*.mdx` with `gray-matter` on the same rule as
      `src/lib/projects.ts` (slug = lowercased filename, newest first).
- [x] `package.json` — `predev`/`prebuild` now run both generators; new `npm run llms` and
      `npm run test:unit` (`node --test scripts`).
- [x] `.gitignore` — `/public/llms.txt`, `/public/llms-full.txt`.
- [x] `src/lib/agentProjects.ts` — `AgentProject` + `toAgentProject(project, siteUrl)`. Server-safe on
      purpose: the first attempt exported this from the `"use client"` component and the export failed
      with *"Attempted to call toAgentProject() from the server but toAgentProject is on the client"*.
      Keeping it in `src/lib/` is what lets the **server** component build the tool's data from the
      same `getProjects()` list it renders.
- [x] `src/components/agent/WebMcpTools.tsx` — returns `null`. Feature-checks
      `navigator.modelContext?.registerTool`, wraps registration in `try` + `Promise.resolve(...).catch()`
      so a draft API cannot put anything on the console, and unregisters in the effect's cleanup.
      Declares a JSON Schema for input (`query` required, `limit` 1–50) and for output
      (`{query, count, results[]}`); the handler returns `{content: [{type:"text", text}], structuredContent}`.
- [x] `src/app/projects/page.tsx` — two imports and one self-closing element that renders nothing.
      The only source change to a rendered route in this effort.
- [x] `tests/webmcp.spec.ts` — four Playwright cases on desktop and mobile.
- [x] `docs/adr/0014-*.md` + a row in `docs/adr/README.md`.
- [x] `AGENTS.md`, `CONTEXT.md`, `README.md` synced: the new generated artefacts, the two new
      commands, the new boundary rows, the new glossary terms.

## Verification

### Commands

| Check | Result |
|---|---|
| `npm run typecheck` | clean (no output) |
| `npm run build` | succeeds, 30 static pages, postbuild mirrored 25 prefetch payloads; `llms.txt: 20 projects, llms.txt 6831 chars, llms-full.txt 42005 chars` |
| `npm run test:unit` | 8 pass, 0 fail |
| `npm run test:smoke` | **64 passed** (desktop + Pixel 7), 1.6 min |
| `npm run lighthouse:desktop` | all assertions pass |
| `npm run lighthouse:mobile` | all assertions pass |
| `npm run check:aidlc` | OK |

### Generated output

| Claim | Evidence |
|---|---|
| Both files exist in `out/` and are non-empty | `out/llms.txt` 6831 bytes, `out/llms-full.txt` 42005 bytes |
| Well-formed for the audit | one H1, a `>` summary, 30+ Markdown links, far over the 50-character floor; asserted directly by `npm run test:unit` |
| Served correctly | `HTTP/1.1 200 OK`, `Content-Type: text/plain; charset=utf-8`, `Content-Length: 6831` from `serve out` — the same server both quality gates use |
| Neither is committed | absent from `git status`; `/public/llms.txt` and `/public/llms-full.txt` are gitignored |
| `robots.txt` unchanged | md5 `20a72aa963bb00aa9b2b360fad45d003` before and after — byte-identical |
| `sitemap.xml` unchanged | the `<loc>` set is byte-identical before and after, and contains no `llms` entry. The `<lastmod>` timestamps differ on every build regardless of this change (`sitemap.ts` uses `new Date()`), so the URL set is the meaningful comparison |

### Unit tests (`npm run test:unit`)

1. the index follows the llms.txt shape
2. the index satisfies what Lighthouse's `llms-txt` audit checks
3. every project appears in both variants
4. every URL is absolute on the canonical origin, and no host is hardcoded
5. only the full variant carries case-study body text
6. case-study headings are demoted so they nest under the project heading
7. adding a project changes only that project's lines
8. the renderer performs no I/O

### WebMCP tests (`tests/webmcp.spec.ts`, desktop + Pixel 7)

1. with no WebMCP support the projects page is inert — `"modelContext" in navigator` is `false`, the
   grid renders, and zero console errors, page errors or failed requests
2. registers exactly one tool with a valid schema — both declared schemas are objects with
   `properties` and a `required` array whose every key exists in `properties`
3. the handler answers a query in the declared output shape — and the slugs it returns are a subset of
   the `/projects/…` links the page renders, with an empty query returning exactly the page's count
4. navigating away and back leaves exactly one registration — via footer links (client-side
   navigation, so the stub's state survives): 2 registrations, 1 unregistration, 1 active tool

## Lighthouse

Two tools, for two different reasons.

**`lighthouse@13.4.1`, ad hoc, one run per route per preset** — the only version that has the
agentic-browsing category. Same `serve out` origin on `:3201`, same machine, before and after.

| Preset | Route | Perf | A11y | Best-pract. | SEO | **Agentic-browsing** |
|---|---|---|---|---|---|---|
| desktop | `/` | 0.90 → 0.96 | 1.00 | 1.00 | n/a | 1.00 |
| desktop | `/story` | 1.00 | 1.00 | 1.00 | n/a | 1.00 |
| desktop | `/projects` | 0.99 → 1.00 | 1.00 | 1.00 | n/a | 1.00 |
| desktop | `/projects/atomnet` | 1.00 | 1.00 | 1.00 | n/a | 1.00 |
| desktop | `/process` | 1.00 | 1.00 | 1.00 | n/a | 1.00 |
| desktop | `/gallery` | 0.97 → 0.98 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/` | 0.54 → 0.55 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/story` | 0.83 → 0.88 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/projects` | 0.88 → 0.72 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/projects/atomnet` | 0.90 → 0.75 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/process` | 0.83 → 0.90 | 1.00 | 1.00 | n/a | 1.00 |
| mobile | `/gallery` | 0.72 → 0.74 | 1.00 | 1.00 | n/a | 1.00 |

Every audit in the agentic-browsing category, before → after:

| Preset | Route | `llms-txt` | `webmcp-registered-tools` | `webmcp-form-coverage` | `webmcp-schema-validity` | `agent-accessibility-tree` | `cumulative-layout-shift` |
|---|---|---|---|---|---|---|---|
| desktop | `/` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| desktop | `/story` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| desktop | `/projects` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| desktop | `/projects/atomnet` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| desktop | `/process` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| desktop | `/gallery` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/story` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/projects` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/projects/atomnet` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/process` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |
| mobile | `/gallery` | `notApplicable` → **pass** | `notApplicable` | `notApplicable` | `notApplicable` | **pass** | **pass** |

`agent-accessibility-tree` and `cumulative-layout-shift` passed before and pass after; the three `webmcp-*` audits were `notApplicable` before and are `notApplicable` after, because headless Chrome exposes neither `navigator.modelContext` nor the `WebMCP.enable` CDP domain. `llms-txt` is the one audit that moved, and it moved from skipped to passing on all twelve runs.

These are **single runs on a developer laptop**, so the performance column is noisy — note that mobile `/projects/atomnet`, which contains none of this change's code, moved 0.90 → 0.75 in the same pass that mobile `/projects` moved 0.88 → 0.72. Total transferred bytes on mobile `/projects` went 795,508 → 797,931, i.e. **+2.4 KB**, which is the whole cost of the WebMCP module. The median-of-three gate below is the number to trust for performance.

**The pinned gate, unchanged** (`@lhci/cli@0.15.1` → `lighthouse@12.6.1`, median of three runs over
six routes, thresholds in `lighthouserc.*.json`) — the check CI actually runs on the PR:

| Preset | Route | Perf (median of 3) | A11y | Best-practices | SEO | Assertions |
|---|---|---|---|---|---|---|
| desktop | `/` | 0.98 | 1.00 | 1.00 | 1.00 | pass |
| desktop | `/story` | 1.00 | 1.00 | 1.00 | 1.00 | pass |
| desktop | `/projects` | 1.00 | 1.00 | 1.00 | 1.00 | pass |
| desktop | `/projects/atomnet` | 1.00 | 1.00 | 1.00 | 1.00 | pass |
| desktop | `/process` | 1.00 | 1.00 | 1.00 | 1.00 | pass |
| desktop | `/gallery` | 0.99 | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/` | 0.62 (runs 0.70 / 0.58 / 0.62) | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/story` | 0.89 | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/projects` | 0.81 | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/projects/atomnet` | 0.90 | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/process` | 0.86 | 1.00 | 1.00 | 1.00 | pass |
| mobile | `/gallery` | 0.69 (runs 0.68 / 0.79 / 0.69) | 1.00 | 1.00 | 1.00 | pass |

Both presets exited 0 with `All results processed!` and **zero** assertion failures
(`.lighthouseci/assertion-results.json` is empty). Accessibility, best-practices and SEO are 1.00 on
all twelve route x preset combinations, which is the pre-change value.

Two mobile routes deserve a caveat rather than a claim. `lhci` asserts on its **median run** (the run
whose metrics are median overall), not on the per-category median I tabulate above, which is why
mobile `/` shows 0.62 here and still passed its 0.70 floor. Both `/` and `/gallery` are pages this
change does not touch at all — no generated file is fetched by them and no WebMCP module is in their
bundle — and their spread across three runs (0.70/0.58/0.62 and 0.68/0.79/0.69) is wider than any
2.4 KB module could explain. This machine was running Chrome under load throughout. The safe reading
is: nothing regressed that this change could have regressed, and mobile home performance remains this
site's known weak point for the reasons effort 020 recorded (GitHub Pages cache headers, pinned
Motion/Lenis animations).

## Notes

- **The agentic-browsing score could not go up, and that is the honest result.** It is a fraction over
  non-`notApplicable` audits; before the change the fraction was 2/2, after it is 3/3. What improved
  is that a third of the category is now being *attempted and passing* rather than skipped — and the
  audit that could have gone to 0 did not.
- **The three `webmcp-*` audits are still `notApplicable` after the change, and that is expected.**
  Headless Chrome exposes neither `navigator.modelContext` nor the `WebMCP.enable` CDP domain, so the
  gatherer reports `isSupported: false` and all three short-circuit before looking at the page. The
  registration is therefore verified by stub injection, not by Lighthouse.
- **`lighthouse@13.4.1` reports `seo: null` on every route, before and after.** The `canonical` audit
  errors when the page's canonical URL points at `harshdipsaha.tech` while the page is served from
  `localhost`, which nulls the category. It is a property of running Lighthouse 13 against a local
  origin, not of this change — identical in both runs. SEO is asserted at 1.0 by the pinned gate,
  which is the number that matters.
- **The live check is pending deploy.** Ticket #21 also asks that
  `https://harshdipsaha.tech/llms.txt` and `/llms-full.txt` be verified as served by GitHub Pages with
  a text content type and a plausible length, and that the smoke assertions be run against the live
  origin. Neither can happen before merge. The pre-merge equivalent — the same two requests against
  `serve out`, the server both gates use and the closest local stand-in for Pages — is recorded above.
- **Lighthouse was not upgraded.** Moving the gate's version and changing the site in the same PR
  would make any score movement unattributable. That is its own effort.
