# Effort 001 — Once UI template adoption

| Field | Value |
|-------|-------|
| Ref | 001-onceui-template-adoption |
| Status | complete |
| Depth | standard |
| Opened | 2026-01-27 |
| Closed | 2026-01-27 |
| Baseline | aidlc-docs/inception/ |
| ADRs | docs/adr/0001-*.md, docs/adr/0002-*.md, docs/adr/0007-*.md |
| Commits | `d9e0d8a`, `ce54d2a`, `b39a13d`, `50be3ad`, `43c3e5c`, `11c1782`, `faf40ff` |
| Reconstructed | yes — backfilled 2026-08-23 from commit diffs |

## Intent
Vendor the Once UI / Magic Portfolio Next.js template into the repo under `template/` and get a static export deploying to GitHub Pages, so a working site existed before any personalisation.

## Stages
| Stage | Outcome |
|-------|---------|
| Effort planning | Not recorded — commit messages were "lets see". Reconstructed from diffs. |
| Functional design | Not recorded. Design was inherited wholesale from the upstream template. |
| NFRs | Implicit: static export only (GitHub Pages has no server runtime); Node 20 build. |
| Code | 137 files / 12,517 insertions vendored under `template/`; `scripts/sync-gallery.mjs` (49 lines); `custom.css`; assets. |
| Build & test | `.github/workflows/deploy.yml` required two corrective commits before the Pages job succeeded. No test suite existed. |

## Units of work
- [x] Vendor Once UI / Magic Portfolio template — `template/**` (137 files, 12,517 insertions)
- [x] Add media assets — `project_images/` (17 images), `resume.pdf`
- [x] Stand up GitHub Pages CI/CD — `.github/workflows/deploy.yml` (Node 20, `npm install`, `npm run build`, upload `out/`, `deploy-pages@v4`); two corrective commits
- [x] First gallery sync script — `scripts/sync-gallery.mjs` (49 lines)
- [x] Initial about-page pass — `src/app/about/page.tsx` (one commit rewrote 124 lines, net -10)
- [x] Site-level style overrides — `custom.css`

## Verification
The deployed GitHub Pages URL rendered. That was the entire verification: no automated tests, no type-check gate, no lint gate existed in the repo at this point.

## Notes
- Two follow-up commits to `.github/workflows/deploy.yml` are direct evidence the CI contract was not right first try (static-export output path and action versions).
- No rationale was recorded at the time; commit messages ("lets see") carry zero decision content. ADRs 0001, 0002 and 0007 were written retroactively in effort 007.
- Debt created: template lives under `template/`, one directory below repo root, which fights Next.js conventions. Resolved in effort 002.
