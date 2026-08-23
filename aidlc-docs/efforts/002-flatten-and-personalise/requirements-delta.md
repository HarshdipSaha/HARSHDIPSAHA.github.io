# Effort 002 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-007 | The app lives at repo root (`src/**`), not in a nested `template/` directory | Conventional Next.js layout; the code is owned, not vendored |
| R-008 | No upstream template demo content ships in the repo | Everything served must be Harshdip's own |
| R-009 | Page metadata is produced by a single helper, `src/utils/meta.ts` | One place to change titles/OG data |
| R-010 | The `/blog` route is disabled until there is real content | Empty sections read worse than absent ones |

## CHANGED
| ID | Was | Now | Rationale |
|----|-----|-----|-----------|
| R-001 | Template vendored under `template/` and tracked as upstream code | Template flattened into `src/**` and owned outright | Nested layout fought Next.js conventions; upstream rebase abandoned as not worth the indirection (ADR 0003) |

## UNCHANGED but affected
- R-002 static export — unchanged, but all export paths shift with the flatten.
- R-003 GitHub Actions deploy — workflow paths revalidated against the new root.
- R-005 gallery sync — script paths now resolve from repo root.

## Acceptance criteria
- [x] `template/` no longer exists; `src/**` is at repo root
- [x] Git records the move as renames (141 files), not delete + add
- [x] All four demo blog posts and their images are gone (1,175 lines across 25 files)
- [x] `public/images/og/home.jpg` and `public/images/publications/` removed
- [x] `/blog` toggle set to `false` and the route is unreachable
- [x] Site builds and deploys after the flatten
