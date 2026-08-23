# 0007 — One MDX file per project

Status: Accepted   Date: 2026-01-27   Supersedes: —

## Context
Projects are long-form: a case study with headings, code, images and a link out. This is a
different shape of content from the site's structured copy (ADR 0004), which is short, uniform
and rendered into fixed slots. The template arrived with an MDX-per-project model already
wired; the question was whether to keep it or collapse everything into one content system.

Options considered:

- **Project entries in `content.tsx`.** One content system instead of two, fully typed. Lost
  because multi-paragraph case studies with embedded images and code do not belong inside a
  TypeScript literal — the escaping is hostile, diffs are unreadable, and prose review becomes
  code review.
- **A headless CMS for the long-form pieces.** Rejected for the same reasons as ADR 0004:
  external account, build-time network dependency, schema outside the repo.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
Each project is a single `.mdx` file under `src/app/work/projects/` with frontmatter — `title`,
`publishedAt`, `summary`, `images[]`, `link` — collected at build time by `getPosts` in
`src/utils/utils.ts` via gray-matter.

## Consequences
Adding a project is a file drop plus its images: no code change, no route registration. The
trade-off is two content systems in one repo — structured copy in `content.tsx`, long-form in
MDX — so a contributor must know which lives where, and frontmatter is validated by convention
rather than by the type system that guards `content.tsx`. This split is accepted and documented
rather than papered over.

## Evidence
- `ce54d2a` (2026-01-27) — `src/utils/utils.ts` and `formatDate.ts` arrive with the template's
  MDX reader.
- `c91a044` (2026-01-28) — the template's demo `.mdx` posts removed while the model was kept
  (see ADR 0006).
- `1cde09f` (2026-08-23) — AtoM-Net added as MDX plus an architecture diagram: a file drop, no
  code change.
