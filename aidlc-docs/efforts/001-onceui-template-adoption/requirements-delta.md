# Effort 001 — Requirements delta

Baseline: `aidlc-docs/inception/requirements.md`

## NEW
| ID | Requirement | Rationale |
|----|-------------|-----------|
| R-001 | The site is built on the Once UI / Magic Portfolio Next.js template rather than a bespoke design system | Fastest path to a credible portfolio; design work is not the point of the project |
| R-002 | The site must build as a fully static export (`out/`) with no server runtime | GitHub Pages serves static files only |
| R-003 | Every push to the default branch deploys via GitHub Actions to GitHub Pages | Removes manual deploy steps |
| R-004 | Build toolchain pinned to Node 20 | Template's Next.js 16 / React 19 stack requires a modern LTS |
| R-005 | Gallery images are synced into `public/images/**` by a build-time script, not hand-copied | `scripts/sync-gallery.mjs` |
| R-006 | A downloadable `resume.pdf` is served from the site | Portfolio requirement |

## CHANGED
_None._ — this is the first effort; there was no prior state to change.

## UNCHANGED but affected
- Repository hosts a personal portfolio for Harshdip Saha (project purpose, untouched).
- Content authored in MDX (inherited from the template rather than chosen here).

## Acceptance criteria
- [x] `template/` contains the vendored Once UI template and builds locally
- [x] `.github/workflows/deploy.yml` completes green and publishes `out/`
- [x] The GitHub Pages URL renders the site
- [x] `project_images/` and `resume.pdf` are present in the repo
- [x] `scripts/sync-gallery.mjs` populates the gallery from the drop-zone directory
