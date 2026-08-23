# Effort 004 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-016 | `gallery/` and `project_images/` are the drop-zone sources of truth for imagery | Add an image by dropping a file, not by editing paths |
| R-017 | `public/images/**` is generated output and must never be hand-edited | Hand edits are overwritten on the next sync |
| R-018 | All sync scripts run automatically via `predev` and `prebuild` hooks | Sync cannot be forgotten before a deploy |
| R-019 | Project images map source -> destination through an explicit `FILE_MAP` | Stable public URLs independent of source filenames |
| R-020 | Unmapped project images fall back to a kebab-case auto-rename | Avoids hard-failing a build on a missing map entry |
| R-021 | The root `me.jpg` drives both `public/images/me.jpg` and `public/images/og/home.jpg` | One profile photo, two consumers |

## CHANGED
| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| R-005 | Only `scripts/sync-gallery.mjs` existed, run manually | Three sync scripts, run automatically on every dev and build | Manual invocation meant stale images shipped |

## UNCHANGED but affected
- R-002 static export — synced images are part of the exported `out/` payload.
- R-003 GitHub Actions deploy — `prebuild` now executes inside CI as well as locally.

## Acceptance criteria
- [x] `scripts/sync-me.mjs` and `scripts/sync-project-images.mjs` exist and are idempotent
- [x] `predev` and `prebuild` invoke all three sync scripts
- [x] `FILE_MAP` renames are applied to mapped project images
- [x] Unmapped images are emitted under a kebab-case name rather than failing the build
- [x] `aquila.jpg` corrected and `gui-cansat.png` present in the generated tree
