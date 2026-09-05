# Effort 047 — `agent-data.json`: a structured export for the future MCP server

| Field | Value |
|-------|-------|
| Ref | 047-agent-data-export |
| Status | complete |
| Depth | standard |
| Opened | 2026-09-05 |
| Closed | 2026-09-05 |
| Baseline | `main` @ `127f3db` (effort 046, PR #64, merged) |
| ADRs | none |
| Commits | branch `feat/agent-data-export` |
| Reconstructed | no — recorded live |

## Intent

Ticket 1 of the MCP server design doc's suggested breakdown (`docs/plans/2026-09-05-mcp-server-design.md`,
issue #62, effort 045): the portfolio's existing build gains one more generated export,
`public/agent-data.json`, so the future MCP server has a single structured source to fetch instead
of parsing `llms.txt`'s prose or duplicating project/bio content by hand. This effort builds only
the export — the MCP server itself remains a separate, not-yet-started project.

## Stages

| Stage | Outcome |
|-------|---------|
| Read | `scripts/build-llms-txt.mjs` + `scripts/lib/llms-txt.mjs` + their test file, and `src/lib/agentProjects.ts` (the `AgentProject` shape WebMCP already uses), to mirror the established generator pattern exactly rather than invent a new one. |
| TDD | Wrote `scripts/agent-data.test.mjs` first (7 cases) against a not-yet-existing `renderAgentData`; ran it to confirm red (`ERR_TEST_FAILURE` — module not found); implemented `scripts/lib/agent-data.mjs`; ran again to confirm green (7/7). |
| Wire | `scripts/build-agent-data.mjs` (I/O wrapper, same site.ts-transpile + MDX-frontmatter loaders `build-llms-txt.mjs` uses); added to `predev`/`prebuild` in `package.json`; new `npm run agent-data` convenience script; `.gitignore` entry. |
| Docs sync | `AGENTS.md` ("three generators" → "five"; new paragraph on `agent-data.json`; boundary-table row) and `CONTEXT.md` (pipeline diagram row, IA-table row, glossary entry) updated — all reference issue #62/effort 045 as the not-yet-built consumer, so a reader doesn't infer a live server exists. |
| Verify | See below. |

## Units of work

- [x] `scripts/lib/agent-data.mjs` — pure renderer, `renderAgentData(site, projects) -> {profile, projects}`.
      `profile`: name, role, location, `bio` (whitespace-collapsed description), email, github,
      linkedin, absolute `resume`/`siteUrl`, `skills` (`story.skills`). `projects`: same shape as
      `src/lib/agentProjects.ts`'s `AgentProject` (slug, title, summary, year, url, `code?` only when
      a link exists) — one project shape shared across `llms.txt`, WebMCP, and this export.
- [x] `scripts/agent-data.test.mjs` — 7 `node --test` cases (see Verification).
- [x] `scripts/build-agent-data.mjs` — the I/O half; writes `public/agent-data.json`.
- [x] `package.json` — `predev`/`prebuild` run the new generator; new `npm run agent-data`.
- [x] `.gitignore` — `/public/agent-data.json`.
- [x] `AGENTS.md`, `CONTEXT.md` synced.

## Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | succeeds, 30 pages; `agent-data.json: 20 projects, 7045 chars` |
| `npm run test:unit` | 60/60 passed (53 prior + 7 new) |
| Generated output | `public/agent-data.json` inspected directly: correct absolute URLs (`https://harshdipsaha.tech/...`), 20 projects, profile fields all present |

### Unit tests (`scripts/agent-data.test.mjs`)

1. the profile carries the expected fields, bio collapsed to one line
2. resume and siteUrl are absolute, built from `person.siteUrl`
3. every project maps to slug/title/summary/year/url, `code` only when a link exists
4. no project body text leaks into the output
5. every URL is absolute on the canonical origin, and no host is hardcoded
6. adding a project changes only that project's entry
7. the renderer performs no I/O

## Notes

- **No MCP server code was written.** This effort is scoped to the export only, per the design
  doc's own ticket order. Tickets 2-4 (the new repo, its tools, the portfolio's discoverability
  addition) are separate future work.
- **No ADR.** This is an additive generator following an already-decided pattern (ADR 0014's
  "generated at build time into `public/`, gitignored" rule), not a new architectural decision.
