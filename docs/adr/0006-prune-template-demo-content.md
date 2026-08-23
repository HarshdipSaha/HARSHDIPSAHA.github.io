# 0006 — Delete the template's demo content and dark the `/blog` route

Status: Accepted   Date: 2026-01-28   Supersedes: —

## Context
The vendored template (ADR 0001) shipped with a full set of demo artifacts: four sample blog
posts, a publications section with images, and assorted placeholder media — over a thousand
lines of prose and several megabytes of screenshots belonging to someone else's portfolio.

Options considered:

- **Keep them as worked examples.** They document the MDX frontmatter conventions and give the
  layout something to render. Rejected: a portfolio that ships another person's demo content
  reads as unfinished, and the posts would be indexed, diluting the site's SEO against pages
  that actually represent its author.
- **Hide them via the routes config only.** A one-line change and reversible. Rejected on its
  own: the files still sit in the repo and in the build, carrying a 3.5MB screenshot and a
  thousand lines of unowned prose through every clone and every CI run.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
Delete the demo blog posts, the publications section and their images outright, and set the
`/blog` route to `false` rather than shipping placeholder writing.

## Consequences
`/blog` stays dark until there is real writing to put behind it — the site is smaller and
honest, but currently has no writing surface. Re-enabling it is a two-line change: flip the
route flag and restore the Header nav entry. The MDX conventions that the demo posts documented
now live only in ADR 0007 and in the remaining real project files.

## Evidence
- `c91a044` (2026-01-28, "okays") — 1,175 deletions across 25 files: `fuzzy-monotonic-lightgbm`
  (151), `laptop-price-predictor` (437), `next-projectspace` (160), `reelspro` (422);
  `public/images/publications/` and a 3.5MB reelspro screenshot removed; `/blog` set to false.
- `e7a10c7`, `3df501a` (2026-01-28) — `public/images/og/home.jpg` and
  `public/images/publications/korea.jpg` deleted.
