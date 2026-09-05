# Requirements delta — Effort 047

## Added

- **`scripts/lib/agent-data.mjs`** — pure renderer, `renderAgentData(site, projects) -> {profile, projects}`.
- **`scripts/agent-data.test.mjs`** — 7 `node --test` cases.
- **`scripts/build-agent-data.mjs`** — I/O wrapper, writes `public/agent-data.json`.
- **`npm run agent-data`** — rebuild the export without starting dev, mirroring `npm run llms`.
- **`public/agent-data.json`** (gitignored, generated) — structured `{profile, projects[]}` export.

## Changed

- **`package.json`** — `predev`/`prebuild` gain a fourth generator call (now five total, including
  `build-process-stats.mjs`).
- **`.gitignore`** — new entry for `/public/agent-data.json`.
- **`AGENTS.md`** — "the three generators" corrected to "the five generators" (this repo's own
  script list had already grown past "three" before this effort; corrected while touching the same
  line); new paragraph documenting `agent-data.json`; new boundary-table row.
- **`CONTEXT.md`** — content-pipeline diagram gains a row; IA table gains an `/agent-data.json` row;
  glossary gains an entry. All three explicitly note the MCP server (issue #62/effort 045) as the
  not-yet-built consumer.

## Not changed

- **`src/lib/agentProjects.ts` / `WebMcpTools.tsx`** — untouched; `agent-data.json`'s project shape
  matches `AgentProject` by convention, not by importing it (the build script is plain Node/ESM,
  `agentProjects.ts` is a TypeScript module meant for the Next.js app; keeping them independent but
  shape-identical avoids adding a build-time TS import for no behavioral gain).
- **The MCP server itself** — not built. Out of scope, per the design doc.
- **The portfolio site's discoverability of the future server** — also out of scope, unchanged from
  effort 045's scoping.
