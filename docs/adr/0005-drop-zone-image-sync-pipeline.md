# 0005 — Drop-zone image directories synced into `public/` by build hooks

Status: Accepted   Date: 2026-01-28   Supersedes: —

## Context
The site carries three kinds of image: a portrait, a photo gallery, and per-project screenshots
and diagrams. The originals arrive from cameras, screenshots and design tools with arbitrary
names — spaces, mixed case, inconsistent extensions — and `next/image` optimization is
unavailable under static export (ADR 0002), so whatever lands in `public/` is what ships.

Options considered:

- **Commit images straight into `public/`.** Simplest possible thing, no scripts. Rejected: no
  normalization step, so filenames with spaces and capitals leak directly into public URLs, and
  the gallery index would have to be hand-maintained in lockstep with the directory.
- **A CDN or a real asset pipeline (imgix, Cloudinary, a bundler plugin).** Proper
  transformation and delivery, but it reintroduces an external account and API key into the
  build and breaks the zero-ops, zero-cost property that ADR 0002 exists to protect. Overkill
  for a few dozen static assets.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
`gallery/` and `project_images/` are drop zones and the source of truth; `scripts/sync-me.mjs`,
`scripts/sync-gallery.mjs` and `scripts/sync-project-images.mjs` copy and normalize them into
`public/` and generate `src/data/gallery.json`, wired to `predev` and `prebuild` so they run
before every dev server and every build.

## Consequences
`public/images/**` and `src/data/gallery.json` are generated artifacts and must never be
hand-edited — an edit there is silently overwritten on the next build. Adding a project image
requires an entry in the explicit `FILE_MAP` in `sync-project-images.mjs`, not just a file drop.
The sync must run before the build, which is exactly why it hangs off npm lifecycle hooks rather
than a documented manual step.

## Evidence
- `43c3e5c` (2026-01-27) — `scripts/sync-gallery.mjs` (49 lines), `custom.css`, gallery images;
  removed `src/app/favicon.ico`.
- `0814927` (2026-01-28, "pic") — `scripts/sync-me.mjs` (26 lines) and
  `scripts/sync-project-images.mjs` (74 lines, with an explicit `FILE_MAP`); `predev`/`prebuild`
  hooks added to `package.json` to run all three.
