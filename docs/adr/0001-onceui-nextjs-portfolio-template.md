# 0001 — Adopt the Once UI "Magic Portfolio" Next.js template

Status: Accepted   Date: 2026-01-27   Supersedes: —

## Context
The repo sat dormant for over two years behind a single empty `gittt.html`. Restarting it meant
choosing a foundation for a personal portfolio that had to ship quickly and still look
deliberate.

Options considered:

- **Build from scratch on Next.js.** Full control, but every layout primitive, theme token,
  MDX pipeline and content type would be hand-rolled. Lost on time-to-first-deploy for a site
  whose value is its content, not its framework code.
- **A static site generator (Hugo / Astro).** Faster builds and less JavaScript, but the
  React/TypeScript ecosystem is the one this portfolio is meant to demonstrate, and the
  available portfolio themes were markdown-only with no typed content contract.
- **A hosted builder (Framer, Squarespace, Webflow).** Zero engineering, but the site is itself
  a work sample; a no-code portfolio undercuts that, and it forecloses the git-native workflow.

The Once UI template won on four concrete properties: typed content contracts shipped in the
box (`src/types/config.types.ts`, `src/types/content.types.ts`), MDX-backed project pages,
dark/light theming driven by `once-ui.config.ts`, and Next.js App Router.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
Vendor the Once UI "Magic Portfolio" Next.js template as the site's foundation rather than
building the shell or adopting a non-React generator.

## Consequences
The site inherits the template's structural opinions — its routing layout, its resource/config
split, and its component vocabulary. The site also takes a hard dependency on the
`@once-ui-system/core` API surface, so a major Once UI version bump becomes a migration
project, not a `npm update`. Accepted in exchange for a working, typed, themed portfolio on
day one.

## Evidence
- `d9e0d8a` (2026-01-27) — first real content: `project_images/`, `resume.pdf`, a `template/` directory.
- `ce54d2a` (2026-01-27) — 137 files / 12,517 insertions: the full template under `template/`,
  including `src/resources/once-ui.config.ts` (225 lines), `config.types.ts` (184),
  `content.types.ts` (240), `src/utils/utils.ts`, `formatDate.ts`, `tsconfig`.
