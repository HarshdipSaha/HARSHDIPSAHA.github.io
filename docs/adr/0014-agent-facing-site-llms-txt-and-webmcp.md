# 0014 — An agent-facing surface: generated `llms.txt`, and WebMCP as progressive enhancement

**Status:** Accepted · **Date:** 2026-08-28 · **Supersedes:** —

## Context

This site is built for a human reading it in a browser. Increasingly the visitor is not one.
A chat assistant answering "what has Harshdip built?" has to fetch and parse twenty HTML pages
wrapped in Tailwind classes, Motion wrappers and a canvas scroll sequence to recover information
that fits in one page of plain text. An agentic browser has no way to *query* the site at all —
it can only read what a page happens to render.

Two 2025-era conventions address exactly this, and they sit at very different levels of maturity:

- **`llms.txt`** (llmstxt.org) is a community convention, not a standards body's work: a curated
  Markdown index at the site root, plus an optional full-text variant. It is inert — a static file
  that costs nothing to serve and breaks nothing if no one reads it.
- **WebMCP** (`navigator.modelContext`) is a W3C-track proposal from Google and Microsoft that lets
  a page register callable tools an agent can invoke. It is **unratified and implemented by no
  shipping browser.** The proposal's own surface has already changed shape more than once.

Lighthouse 13 added an **agentic-browsing** category that scores both: an `llms-txt` audit and three
`webmcp-*` audits. Reading the audit sources (`core/audits/agentic/llms-txt.js`,
`core/audits/webmcp-*.js` in `lighthouse@13.4.1`) makes the risk profile concrete:

- `llms-txt` fetches `/llms.txt`. A 4xx scores 1 and is marked `notApplicable`. A 2xx that lacks an
  H1, lacks a Markdown link, or is under 50 characters scores **0 — a real failure**. Attempting the
  convention badly is strictly worse than not attempting it.
- All three `webmcp-*` audits short-circuit to `notApplicable` unless the gatherer finds
  `navigator.modelContext` *and* the `WebMCP.enable` CDP domain. On every browser that exists today
  they cannot be made to fail by anything this repo does.

The owner's standing constraint applies: improving one score must not cost another.

## Decision

**1. Both agent-facing documents are generated at build time into `public/`, and gitignored.**
`scripts/build-llms-txt.mjs` runs on `predev`/`prebuild` beside `scripts/build-images.mjs`, writing
`public/llms.txt` and `public/llms-full.txt`. This is the repository's existing rule for generated
artefacts (ADR 0005), not a second convention. The consequence — absent from a fresh clone until the
first build — is already true of every published image.

**2. The documents are rendered from the site's own content, by a pure function.**
`scripts/lib/llms-txt.mjs` exports `renderLlmsTxt(site, projects) -> { index, full }` and performs no
I/O; the build script does the reading and writing. Copy comes from `src/content/site.ts` (loaded by
transpiling it in memory — it is plain typed data with no imports, so there is no second copy of the
copy) and from `content/projects/*.mdx`. Adding a project updates both files on the next build with
no manual step. Absolute URLs are built from `person.siteUrl`, never a literal host, so the `.tech`
correction stays authoritative in one place. A unit test asserts the URLs are absolute and that no
host string is hardcoded.

**3. The documents are excluded from `sitemap.xml`.** The sitemap is a search-engine artefact and
these are not pages. Its contract is unchanged.

**4. WebMCP is adopted as progressive enhancement behind a capability check — never as a dependency.**
`src/components/agent/WebMcpTools.tsx` is a client component that renders `null`. In an effect it
reads `navigator.modelContext`, returns immediately when it is absent, and swallows any throw or
rejection so nothing reaches the console (the smoke gate fails on a single console error). It
unregisters on unmount, because this app is client-side routed and without cleanup navigating away
and back would register the tool twice.

**5. Exactly one tool, on `/projects` only.** `searchProjects` answers the question an agent visiting
a portfolio actually has. Its data is the project list the page itself renders, passed down from the
server component, so the tool cannot answer with a different set of projects than the page shows.
Input and output are declared as JSON Schema. A speculative suite of tools would multiply the surface
that must stay correct for no gain.

**6. The agentic-browsing category is measured before and after, on both presets, with
`lighthouse@13.4.1` run ad hoc.** The repository's pinned gate (`@lhci/cli@0.15.1` →
`lighthouse@12.6.1`) predates the category and cannot see it; that gate is still run, unchanged, to
prove the four categories it does assert have not moved. Lighthouse is **not** upgraded as part of
this change — moving the gate's version and changing the site in one step would make a regression
impossible to attribute.

## Consequences

- An agent can retrieve the whole site in one request (`/llms-full.txt`) or decide what to fetch from
  a short index (`/llms.txt`), instead of parsing twenty styled pages.
- The `llms-txt` audit moves from `notApplicable` to **passing** on every route and preset. The
  category score cannot rise above the 100 it already reported — it is a fraction, and
  `notApplicable` audits are excluded from it — so the honest description of the win is *three
  quarters of the category is now being attempted, and one more audit now passes*.
- The three `webmcp-*` audits remain `notApplicable`, because no browser implements the API. The
  registration is therefore unverifiable in the wild today; it is verified instead by injecting a stub
  of `navigator.modelContext` in Playwright and invoking the captured handler.
- `/projects` carries a small amount of extra client JavaScript that does nothing in every current
  browser. Measured cost: see the effort record's Lighthouse table — performance did not fall.
- The generated files are invisible in a fresh clone and in the diff. A reader who greps the
  repository for `llms.txt` finds the generator, not the artefact. This is the same trade already
  accepted for `public/img/`.
- We are now shipping a call site for an API whose shape may change. If the proposal renames
  `registerTool`/`execute`, the feature check simply stops matching and the code goes back to being
  inert — it cannot break the page.

## Alternatives considered

- **A Next.js route handler (`src/app/llms.txt/route.ts`) instead of a build script.** Rejected:
  AGENTS.md states this app has no route handlers, and the repo already has exactly one place where
  "things the build generates" lives. Two conventions for one job is the cost.
- **Committing the two files.** Rejected: they are derived from `site.ts` and the MDX, so a committed
  copy is a drift surface — the class of defect the generated-image pipeline was introduced to remove.
- **One file instead of two.** Rejected: the index and the full text serve different consumers — an
  agent deciding what to fetch, and a large-context agent that would rather pay one request. Both are
  in the llms.txt convention.
- **Registering several tools** (`getProject`, `listSkills`, `contact`). Rejected: each is a schema
  that must stay correct against a moving proposal, and none answers a question an agent on a
  portfolio actually asks that `searchProjects` plus the page's own links do not.
- **Adding WebMCP to every route.** Rejected: the tool is about projects; registering it on `/gallery`
  would be noise, and more unmount paths to get right.
- **Upgrading `@lhci/cli` so the PR gate asserts agentic-browsing.** Deferred, deliberately. It is a
  separate decision with its own risk (a Lighthouse major bump re-scores four gated categories) and
  belongs in its own effort, not bundled with the change it would be measuring.
- **Doing nothing.** Rejected: `llms.txt` is inert and cheap, and the audit evidence above shows the
  only way to make the category worse is to serve a malformed file — which the generator's structure
  and its unit tests prevent.

## What would reverse this

- The `llms.txt` convention being abandoned, or Lighthouse's `llms-txt` audit changing its
  requirements such that the generated file fails rather than passes. Reversal is deleting one script
  and two `.gitignore` lines; nothing else depends on it.
- The WebMCP proposal being withdrawn, or shipping with a shape incompatible enough that the
  registration would need real maintenance rather than a feature check. Reversal is deleting one
  component and one line in `src/app/projects/page.tsx`.
- Any measurement showing the extra client JavaScript on `/projects` costs a Lighthouse category.
  The tool would come out; the `llms.txt` half is independent and would stay.

## Evidence

- Audit behaviour quoted above read from `lighthouse@13.4.1`: `core/audits/agentic/llms-txt.js`
  (H1 / link / at least 50 chars; 4xx → `notApplicable`), `core/audits/webmcp-registered-tools.js`,
  `core/audits/webmcp-schema-validity.js`, `core/audits/webmcp-form-coverage.js` (all gated on
  `artifacts.WebMCP.isSupported`), `core/gather/gatherers/webmcp.js` (`isSupported` requires both
  `navigator.modelContext` and the `WebMCP.enable` CDP domain), and the `agentic-browsing` category
  in `core/config/default-config.js` (`categoryScoreDisplayMode: 'fraction'`, six equally weighted
  audit refs).
- WebMCP API surface taken from the proposal's explainer
  (https://webmachinelearning.github.io/webmcp/docs/proposal.html): `registerTool(descriptor)`,
  `unregisterTool(name)`, descriptor `{name, description, inputSchema, execute}`, handler returning
  `{content: [{type: "text", text}]}`.
- Effort record: `aidlc-docs/efforts/024-agent-facing-site/effort-state.md`.
