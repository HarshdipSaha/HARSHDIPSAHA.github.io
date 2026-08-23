# Effort 004 — Drop-zone image sync pipeline

| Field | Value |
|-------|-------|
| Ref | 004-drop-zone-image-sync-pipeline |
| Status | complete |
| Depth | standard |
| Opened | 2026-01-28 |
| Closed | 2026-01-28 |
| Baseline | aidlc-docs/inception/ |
| ADRs | docs/adr/0005-*.md |
| Commits | `0814927` |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Make `gallery/` and `project_images/` the drop-zone sources of truth for imagery and `public/images/**` pure generated output, by adding sync scripts and running them automatically before every dev and build.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Not recorded. Reconstructed from the single commit diff. |
| Functional design | Three scripts, one concern each: profile photo, project images, gallery. Explicit `FILE_MAP` for project images; kebab-case auto-rename fallback for anything unmapped. |
| NFRs | Idempotent — re-running a sync produces the same `public/images/**` tree. |
| Code | `scripts/sync-me.mjs` (26 lines), `scripts/sync-project-images.mjs` (74 lines); `predev`/`prebuild` npm hooks. |
| Build & test | Verified by running dev and build and inspecting the generated `public/images/**` tree. |

## Units of work
- [x] Profile photo sync — `scripts/sync-me.mjs` (26 lines): root `me.jpg` -> `public/images/me.jpg` and `public/images/og/home.jpg`
- [x] Project image sync — `scripts/sync-project-images.mjs` (74 lines) with explicit `FILE_MAP` (`"source name.png"` -> `"kebab-dest.png"`)
- [x] npm lifecycle wiring — `predev` and `prebuild` run all three sync scripts (incl. `scripts/sync-gallery.mjs` from effort 001)
- [x] Asset fixes — corrected `aquila.jpg`; added `gui-cansat.png`

## Verification
`npm run dev` and `npm run build` both triggered the sync hooks; the generated `public/images/**` tree was inspected and matched the drop-zone sources including the `FILE_MAP` renames. No automated tests.

## Notes
- Foot-gun: images without a `FILE_MAP` entry fall through to a kebab-case auto-rename. The generated filename is then whatever the source name kebab-cases to, which may not match what MDX/content references. Forgetting a `FILE_MAP` entry is the main failure mode — it later bit effort 006 (benignly).
- Consequence of ADR 0005: `public/images/**` must not be hand-edited; edits there are silently overwritten on the next build.
