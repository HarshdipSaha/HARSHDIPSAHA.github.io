# 0004 — Content as code, typed against a schema

Status: Accepted   Date: 2026-01-28   Supersedes: —

## Context
Site copy — bio, work experience, studies, research interests, tech stack, social links — needed
a home. The static-export constraint (ADR 0002) means nothing can be fetched at request time,
so any source of content must resolve at build time.

Options considered:

- **A headless CMS (Contentful / Sanity).** A friendly editing UI and content/code separation.
  Lost on fit: it adds an account, an API key in CI, and a network dependency in the build for a
  single-author site whose "editor" is the same person as the developer. It also puts the schema
  in a vendor's UI rather than in the repo.
- **Loose JSON or YAML files.** No build-time dependency and trivially editable, but no
  compile-time guarantees — a renamed field or a missing `timeframe` surfaces as an undefined
  render in production, and refactors become string search.

*Reconstructed retroactively on 2026-08-23 from commit diffs; the original commits recorded no rationale.*

## Decision
All site copy lives in `src/resources/content.tsx`, typed against `src/types/content.types.ts`,
compiled into the bundle at build time.

## Consequences
A malformed experience or study entry fails `tsc` at build, not in production, and renames are
type-guided across the whole site. The costs: every content edit needs a rebuild and a deploy,
the editor must be TypeScript-literate, and because content is `.tsx` it can carry JSX — accent
spans such as `.intro-cyan` — which couples copy to styling in a way plain data would not. The
type file is expected to grow alongside the content rather than being fixed up front.

## Evidence
- `ce54d2a` (2026-01-27) — `src/types/content.types.ts` (240 lines) arrives with the template.
- `11c1782`, `faf40ff` (2026-01-27) — `content.tsx` trimmed alongside About page rewrites.
- `7eba8fd` (2026-01-28) — `content.types.ts` extended by 8 lines and `content.tsx` by 31 to
  carry hand-written research-interest and tech-stack data: the schema evolves with the copy.
- `6799e4b`, `1cde09f` (2026-08-23) — Optum AI-DLC experience and LLM Safety + Alignment
  interests added purely as typed entries; `work.display` flipped to true.
