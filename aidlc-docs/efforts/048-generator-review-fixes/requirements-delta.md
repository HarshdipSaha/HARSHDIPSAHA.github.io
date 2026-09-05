# Requirements delta — Effort 048

## Changed

- **`AGENTS.md`** — `npm run dev`'s comment corrected from "predev runs the three generators" to
  "the five generators", matching the already-correct `npm run build` line below it.
- **`scripts/build-llms-txt.mjs`**, **`scripts/build-agent-data.mjs`** — both now import
  `loadSite`/`loadProjects` from the new `scripts/lib/site-loader.mjs` instead of each carrying its
  own copy. `build-agent-data.mjs`'s project ordering changes from a year-string sort to the same
  full-date sort `build-llms-txt.mjs` already used — a real fix, not just deduplication (see effort
  048's Notes for the before/after ordering evidence).

## Added

- **`scripts/lib/site-loader.mjs`** — `loadSite(root)`, `loadProjects(root)`, extracted from the
  duplicated code effort 047's code review flagged.
- **This effort's own record** (`aidlc-docs/efforts/048-generator-review-fixes/`).

## Not changed

- **`scripts/lib/llms-txt.mjs`, `scripts/lib/agent-data.mjs`, and their test files** — the pure
  renderers and their tests are unaffected; this refactor only touches the I/O wrapper scripts.
- **The `harshdipsaha-mcp` repo's `limit`-clamping fix and stale README line** — same code-review
  pass surfaced these, but they apply to that repo, not this one; fixed there directly (commit
  `f80a253`), not part of this effort.
